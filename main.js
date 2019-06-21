/**
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI
  This is the main.js script for Club Koala. This script manages the whole game: allowing the user
  to make actions, retrieving events from the server, and rendering the game.
*/

(function() {
  'use strict';
  const SRC_SPRITE_WIDTH = 135;
  const DST_SPRITE_WIDTH = 128;
  const GAME_HEIGHT = 600;
  const GAME_WIDTH = 800;
  const DIR_NONE = 'none';
  const DIR_FORWARD = 'forward';
  const DIR_BACKWARD = 'backward';
  const DIR_LEFT = 'left';
  const DIR_RIGHT = 'right';
  const MOVE_SPEED = 100; // px per second
  const CANVAS_FONT_SIZE = 16;
  const FETCH_EVENTS_FREQUENCY = 1000; // ms
  const ANIMATION_ALT_TIME = 0.08; // sec
  const CHAT_HIDE_TIME = 5; // sec
  const DIR_TO_SPRITE_MAP = {
    [DIR_NONE]: 0,
    [DIR_LEFT]: 1,
    [DIR_RIGHT]: 2,
    [DIR_FORWARD]: 3,
    [DIR_BACKWARD]: 4
  };

  let dances;
  const players = {};

  const playerId = window.location.search.split('=')[1];
  let waitingForEventsResponse = false;
  let latestProcessed = '';
  let lastTick = 0;
  const loaded = {
    window: false,
    spriteMap: false,
    background: false
  };
  let ctx;

  const sprites = new Image();
  const background = new Image();

  /**
   * Callback for when window loads. Sets up canvas and click listener.
   */
  function onWindowLoad() {
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('click', onCanvasClick);

    /*
      Note: it is necessary to set width/height through JS here.
      Setting <canvas> width/height in CSS changes how it is displayed, but not the actual
      dimensions of the drawable area.
    */
    canvas.setAttribute('width', GAME_WIDTH);
    canvas.setAttribute('height', GAME_HEIGHT);

    ctx = canvas.getContext('2d');
    ctx.font = `${CANVAS_FONT_SIZE}px Arial`;
    loaded.window = true;
    onLoadComplete();
  }

  /** Send ping to analytics endpoint and display current view counter. */
  function trackPageView() {
    fetch('analytics.php')
      .then(checkStatus)
      .then(numViews => {
        const content = `You are number ${numViews} to play this game!`
        document.getElementById('view-counter').innerText = content;
      })
      .catch(showError);
  }

  /** Load sprite map. */
  function loadSpriteMap() {
    sprites.addEventListener('load', onLoadSpriteMap);
    sprites.src = 'assets/ksprite.png';
  }

  /** Callback for when sprite map is loaded. */
  function onLoadSpriteMap() {
    loaded.spriteMap = true;
    sprites.removeEventListener('load', onLoadSpriteMap);
    onLoadComplete();
  }

  /** Load background. */
  function loadBackground() {
    background.addEventListener('load', onLoadBackground);
    background.src = 'assets/scene1.png';
  }

  /** Callback for when background is loaded. */
  function onLoadBackground() {
    loaded.background = true;
    background.removeEventListener('load', onLoadBackground);
    onLoadComplete();
  }

  /**
   * Callback for when sprite map, window, or background is loaded. When all three have been
   * loaded, begin sending requests to server, and begin render loop.
   */
  function onLoadComplete() {
    if (loaded.spriteMap && loaded.window && loaded.background) {
      fetchEvents(true);
      window.requestAnimationFrame(tick);
      setInterval(fetchEvents, FETCH_EVENTS_FREQUENCY);
    }
  }

  /** Get actions that the user can perform (chats, dances) from the server. */
  function getActions() {
    fetch('actions.php')
      .then(checkStatus)
      .then(JSON.parse)
      .then(onGetActions)
      .catch(showError);
  }

  /**
   * Callback for when actions the user can perform (chats, dances) are retrieved.
   * Set up toolbar with result.
   * @param {Object} data Data from API response.
   */
  function onGetActions(data) {
    Object.keys(data.chat).forEach(categoryName => {
      addToolbarCategory(categoryName, data.chat[categoryName], sendChat);
    });
    dances = data.dances;
    addToolbarCategory('Dance', data.dances, startDance);
  }

  /**
   * Add a category of action to the toolbar and set up listeners so that user can interact.
   * @param {String} categoryName Name of category.
   * @param {String[]} options Array of option items within category.
   * @param {Function} onClick Callback function to call be called when an option item is clicked
   *  with the option item text as a parameter.
   */
  function addToolbarCategory(categoryName, options, onClick) {
    const toolbar = document.getElementById('toolbar');
    const chatMenu = document.getElementById('chat-menu');

    const categoryButton = document.createElement('button');
    categoryButton.innerText = categoryName;
    categoryButton.addEventListener('click', () => showActionCategory(categoryName));
    toolbar.appendChild(categoryButton);

    const categoryList = document.createElement('ul');
    categoryList.id = `list-${categoryName}`;
    options.forEach(chatOption => {
      const optionButton = document.createElement('button');
      optionButton.innerText = chatOption;
      optionButton.addEventListener('click', () => {
        hideVisibleActionCategory();
        onClick(chatOption);
      });

      const optionListItem = document.createElement('li');
      optionListItem.append(optionButton);
      categoryList.appendChild(optionListItem);
    });

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-btn');
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener('click', hideVisibleActionCategory);
    const cancelListItem = document.createElement('li');
    cancelListItem.append(cancelButton);
    categoryList.appendChild(cancelListItem);

    chatMenu.appendChild(categoryList);
  }

  /** Hide current action category list if any are open. */
  function hideVisibleActionCategory() {
    const visibleActionCategory = document.querySelector('#chat-menu ul.visible');
    if (visibleActionCategory) {
      visibleActionCategory.classList.remove('visible');
    }
  }

  /**
   * Show an action category list with the given name.
   * @param {String} categoryName Name of the action list to show.
   */
  function showActionCategory(categoryName) {
    hideVisibleActionCategory();
    document.querySelector(`#chat-menu ul#list-${categoryName}`).classList.add('visible');
  }

  /**
   * Send a chat message to be displayed to other players.
   * @param {String} chat Message to send.
   */
  function sendChat(chat) {
    fetch(`api.php`, {
      method: 'POST',
      body: toFormData({
        action: 'chat',
        player: playerId,
        message: chat
      })
    })
      .then(checkStatus)
      .then(JSON.parse)
      .then(processEvent)
      .catch(showError);
  }

  /**
   * Make player dance.
   * @param {String} dance Name of dance to dancce.
   */
  function startDance(dance) {
    fetch(`api.php`, {
      method: 'POST',
      body: toFormData({
        action: 'dance',
        player: playerId,
        dance
      })
    })
      .then(checkStatus)
      .then(JSON.parse)
      .then(processEvent)
      .catch(showError);
  }

  /**
   * Callback for when user clicks the canvas. Move to the clicked location.
   * @param {Event} e Event object from click event.
   */
  function onCanvasClick(e) {
    moveTo(e.offsetX - DST_SPRITE_WIDTH / 2, e.offsetY - DST_SPRITE_WIDTH / 2);
  }

  /**
   * Move player as close to the provided location as is valid.
   * @param {number} x X-position to move to.
   * @param {number} y Y-position to move to.
   */
  function moveTo(x, y) {
    fetch(`api.php`, {
      method: 'POST',
      body: toFormData({
        action: 'move',
        player: playerId,
        x: clamp(x, 80, 600),
        y: clamp(y, 100, 450)
      })
    })
      .then(checkStatus)
      .then(JSON.parse)
      .then(processEvent)
      .catch(showError);
  }

  /**
   * Fetch events that have happened since the last time events were retrieved.
   * @param {boolean} [skipAnimation=false] Whether animations should be skipped for events
   * retrieved in this request.
   */
  function fetchEvents(skipAnimation = false) {
    if (!waitingForEventsResponse) {
      waitingForEventsResponse = true;
      fetch(`events.php?from=${latestProcessed}&player=${playerId}`)
        .then(checkStatus)
        .then(JSON.parse)
        .then(data => onFetchEvents(data, skipAnimation))
        .catch(showError);
    }
  }

  /**
   * Callback when events have been retrieved. Loop through the array and retrieve one at a time.
   * @param {Object[]} data Array of event objects from the API endpoint.
   * @param {boolean} [skipAnimation=false] Whether animations should be skipped for events
   * retrieved in this request.
   */
  function onFetchEvents(data, skipAnimation = false) {
    waitingForEventsResponse = false;
    if (data.length > 0) {
      latestProcessed = data[0].id;

      data.reverse().forEach(event => processEvent(event, skipAnimation));
    }
  }

  /**
   * Sets up player with the given name so that it can be animated.
   * @param {String} name Name of player to create.
   * @param {number} [x=0] Starting x-position of player.
   * @param {number} [y=0] Starting y-position of player.
   */
  function createPlayer(name, x = 0, y = 0) {
    players[name] = {
      name,
      walkDirection: DIR_NONE,
      dance: false,
      animationStep: 0,
      animationAlt: false,
      chatMessage: '',
      chatLifetime: 0,
      x,
      y,
      targetX: 0,
      targetY: 0
    };
  }

  /**
   * Process an event from the server. Move events move a player, chat events show a chat message,
   * dance messages make a player dance, disconnect messages disconnect a user.
   * @param {Object} event Event object from the server.
   * @param {boolean} [skipAnimation=false] Whether animations should be skipped for this event.
   */
  function processEvent(event, skipAnimation = false) {
    if (!Object.keys(players).includes(event.player)) {
      createPlayer(event.player, event.x || 0, event.y || 0);
    }
    if (event.action === 'move') {
      updateTargetLocation(event.player, event.x, event.y, skipAnimation);
      players[event.player].dance = false;
    } else if (event.action === 'chat' && !skipAnimation) {
      players[event.player].chatMessage = event.message;
      players[event.player].chatLifetime = 0;
    } else if (event.action === 'dance' && !skipAnimation) {
      players[event.player].dance = event.dance;
    } else if (event.action === 'disconnect') {
      delete players[event.player];
    }
  }

  /**
   * Update target location of a player so that it starts animating towards it.
   * @param {String} name Name of player.
   * @param {number} x X-position to animate towards.
   * @param {number} y Y-position to animate towards.
   * @param {boolean} [skipAnimation=false] Whether animations should be skipped for this event.
   */
  function updateTargetLocation(name, x, y, skipAnimation = false) {
    players[name].targetX = x;
    players[name].targetY = y;

    if (skipAnimation) {
      players[name].x = x;
      players[name].y = y;
    }
  }

  /**
   * Callback to perform animations and render players.
   * @param {DOMHighResTimeStamp} timestamp Timestamp from requestAnimationFrame().
   */
  function tick(timestamp) {
    const deltaTime = (timestamp - lastTick) / 1000;
    lastTick = timestamp;
    ctx.drawImage(background, 0, 0);
    Object.keys(players)
      .forEach(name => {
        const player = players[name];
        updatePlayerState(player, deltaTime);
        drawPlayer(player);
      });
    window.requestAnimationFrame(tick);
  }

  /**
   * Animate a player moving towards its target, dismiss a player's chat when appropriate,
   * and advance a player's current animation frame.
   * @param {String} player Name of the player to update.
   * @param {number} deltaTime Amount of time since last update (seconds).
   */
  function updatePlayerState(player, deltaTime) {
    if (player.x !== player.targetX || player.y !== player.targetY) {
      updatePlayerPositionState(player, deltaTime);
    }  else {
      player.walkDirection = DIR_NONE;
    }

    if (player.animationStep + deltaTime > ANIMATION_ALT_TIME)  {
      player.animationStep = 0;
      player.animationAlt = !player.animationAlt;
    } else {
      player.animationStep += deltaTime;
    }

    if (player.chatMessage && player.chatLifetime + deltaTime > CHAT_HIDE_TIME) {
      player.chatMessage = '';
    } else if (player.chatMessage) {
      player.chatLifetime += deltaTime;
    }
  }

  /**
   * Move a player towards its target.
   * @param {String} player Name of the player to update.
   * @param {number} deltaTime Amount of time since last update (seconds).
   */
  function updatePlayerPositionState(player, deltaTime)  {
    const maxMove = deltaTime * MOVE_SPEED;
    const dX = clamp(player.targetX - player.x, -maxMove, maxMove);
    const dY = clamp(player.targetY - player.y, -maxMove, maxMove);

    player.x += dX;
    player.y += dY;

    const dXBigger = Math.abs(dX) >= Math.abs(dY);

    if (dX > 0 && dXBigger) {
      player.walkDirection = DIR_RIGHT;
    } else if (dX < 0 && dXBigger) {
      player.walkDirection = DIR_LEFT;
    } else if (dY > 0 && !dXBigger) {
      player.walkDirection = DIR_FORWARD;
    } else if (dY < 0 && !dXBigger) {
      player.walkDirection = DIR_BACKWARD;
    }
  }

  /**
   * Draw a player's sprite, name, and chat bubble if there is a message to show.
   * @param {String} player Name of the player to draw.
   */
  function drawPlayer(player) {
    const srcX = !player.dance
      ? DIR_TO_SPRITE_MAP[player.walkDirection]
      : dances.indexOf(player.dance) + Object.keys(DIR_TO_SPRITE_MAP).length;
    const srcY = player.animationAlt ? 1 : 0;

    ctx.drawImage(sprites,
      srcX * SRC_SPRITE_WIDTH, srcY * SRC_SPRITE_WIDTH, SRC_SPRITE_WIDTH, SRC_SPRITE_WIDTH,
      player.x, player.y, DST_SPRITE_WIDTH, DST_SPRITE_WIDTH
    );

    ctx.fillStyle = '#000000';
    const nameWidth = ctx.measureText(player.name).width;
    ctx.fillText(player.name,
      player.x + (DST_SPRITE_WIDTH - nameWidth) / 2, player.y + DST_SPRITE_WIDTH);

    if (player.chatMessage) {
      drawChat(player.chatMessage,
        player.x + DST_SPRITE_WIDTH / 2, player.y - CANVAS_FONT_SIZE + 15);
    }
  }

  /**
   * Draw a chat bubble at a position.
   * @param {String} message Message to display in the chat bubble.
   * @param {number} centerX X-position of the center of the chat bubble.
   * @param {number} centerY Y-position of the center of the chat bubble.
   * @param {number} [arrowSize=5] Size of the arrow of the chat bubble.
   * @param {number} [paddingX=12] Horizontal padding of the chat bubble.
   * @param {number} [paddingY=10] Vertical padding of the chat bubble.
   */
  function drawChat(message, centerX, centerY, arrowSize = 5, paddingX = 12, paddingY = 10) {
    const chatWidth = ctx.measureText(message).width;

    const top = centerY - CANVAS_FONT_SIZE - paddingY + 4;
    const bottom = centerY + paddingY;
    const left = centerX - chatWidth / 2 - paddingX;
    const right = centerX + chatWidth / 2 + paddingX;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';

    ctx.beginPath();
    ctx.moveTo(centerX + arrowSize, bottom);
    ctx.lineTo(centerX, bottom + 1.5 * arrowSize);
    ctx.lineTo(centerX - arrowSize, bottom);
    ctx.lineTo(left + paddingX, bottom);
    ctx.lineTo(left + paddingX, bottom);
    ctx.quadraticCurveTo(left, bottom, left, bottom - paddingY);
    ctx.lineTo(left, top + paddingY);
    ctx.quadraticCurveTo(left, top, left + paddingX, top);
    ctx.lineTo(right - paddingX, top);
    ctx.quadraticCurveTo(right, top, right, top + paddingY);
    ctx.lineTo(right, bottom - paddingY);
    ctx.quadraticCurveTo(right, bottom, right - paddingX, bottom);
    ctx.lineTo(centerX + arrowSize, bottom);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.fillText(message, centerX - chatWidth / 2, centerY);
  }

  /**
   * Return a value clamped to be between min and max, inclusive.
   * @param {number} val Value to clamp.
   * @param {number} min Minimum value (inclusive).
   * @param {number} max Maximum value (inclusive).
   * @returns {number} Value clamped to be between min and max, inclusive.
   */
  function clamp(val, min, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    } else {
      return val;
    }
  }

  /**
   * Return a FormData representation of a JSON object.
   * @param {Object} jsonData JSON object to convert to FormData object.
   * @returns {FormData} FormData representation of a JSON object.
   */
  function toFormData(jsonData) {
    const formData = new FormData();
    Object.keys(jsonData)
      .forEach(key => formData.append(key, jsonData[key]));
    return formData;
  }

  /**
   * Check status of response from API request, returning the request's text content if the response
   * was successful and throws an error with the status number otherwise.
   * @param {Response} response Response object from API request.
   * @returns {Promise<String>|Promise<Error>} String promise if response successful, Error promise
   *  if response unsuccessful.
   */
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status));
    }
  }

  /**
   * Show error message to user in case there is an API error.
   */
  function showError() {
    document.getElementById('error').classList.remove('hidden');
  }

  moveTo((GAME_WIDTH - DST_SPRITE_WIDTH) / 2, GAME_HEIGHT / 2);
  loadSpriteMap();
  loadBackground();
  getActions();
  trackPageView();
  window.addEventListener('load', onWindowLoad);
})();