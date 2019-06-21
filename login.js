/**
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI
  This is the login.js script for Club Koala, which checks if a username is available.
*/

(function() {
  'use strict';

  /**
   * Callback for when window loads. Set up key listener, login button listener, and focus input.
   */
  function onWindowLoad() {
    document.addEventListener('keydown', onKeyPress);
    document.getElementById('login').addEventListener('click', checkUsername);
    document.getElementById('username').focus();
  }

  /**
   * Listener that looks at key presses to detect keyboard shortcuts, and runs the corresponding
   * operation.
   * @param {Event} e Event object from keypress listener.
   */
  function onKeyPress(e) {
    if (e.key === 'Enter') {
      checkUsername();
    }
  }

  /**
   * Send API request to check if the user's entered username is available.
   */
  function checkUsername() {
    const username = document.getElementById('username').value;
    if (username.length > 0) {
      fetch(`check_name.php?name=${username}`)
        .then(checkStatus)
        .then(data => onCheckUsername(data, username))
        .catch(() => {
          document.getElementById('server-error').classList.remove('hidden');
        });
    }
  }

  /**
   * Callback for when client recieves API response from checking username. Displays message
   * to user if taken, redirects user to game otherwise.
   * @param {string} data Response from API request.
   * @param {string} username Display name that the user entered.
   */
  function onCheckUsername(data, username) {
    if (data === 'taken') {
      document.getElementById('error').classList.remove('hidden');
    } else if (data === 'available') {
      window.location.href = `game.html?name=${username}`;
    }
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

  window.addEventListener('load', onWindowLoad);
})();