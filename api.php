<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This endpoint accepts POST requests when a player performs an action such as moving, dancing,
  chatting, etc. After recieving an action, this script adds it to the event log to be shared
  with other players.

  Web Service details:
  =====================================================================
  Required POST parameters:
  - action: Action being performed. Either 'move', 'chat', or 'dance'.
  - player: Player performing the action.
  - x: Required if action == 'move'. Destination x-position of player.
  - y: Required if action == 'move'. Destination y-position of player.
  - message: Required if action == 'chat'. Message from player.
  - dance: Required if action == 'dance'. Dance for player to perform.

  Output format: JSON or plain text.

  Output Details:
  - Return event object of this event as JSON. Contains id, action, player, and other properties
    depending on which action was completed.
  - If a required parameter is missing, responds with 400 Bad Request as plain text.
  - If a non-POST request is made, responds with 405 Method Not Allowed as plain text.
*/

include 'util.php';

/*
  Create and return a move event.
  {string} $player: Name of player.
  {integer} $x: Destination x-position of player.
  {integer} $y: Destination y-position of player.
  {object} return: Move event
*/
function create_move_event($player, $x, $y) {
  $new_event = array(
    'id' => uniqid(),
    'action' => 'move',
    'player' => $_POST['player'],
    'x' => intval($_POST['x']),
    'y' => intval($_POST['y'])
  );

  return $new_event;
}

/*
  Create and return a chat event.
  {string} $player: Name of player.
  {string} $message: Message from player.
  {object} return: Chat event
*/
function create_chat_event($player, $message) {
  $new_event = array(
    'id' => uniqid(),
    'action' => 'chat',
    'player' => $player,
    'message' => $message
  );

  return $new_event;
}

/*
  Create and return a dance event.
  {string} $player: Name of player.
  {string} $dance: Dance for player to perform.
  {object} return: Dance event
*/
function create_dance_event($player, $dance) {
  $new_event = array(
    'id' => uniqid(),
    'action' => 'dance',
    'player' => $player,
    'dance' => $dance
  );

  return $new_event;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $events = json_decode(file_get_contents('data/events.json'));

  if (isset($_POST['action']) && isset($_POST['player'])) {
    $action = $_POST['action'];
    $new_event;

    if ($action === 'move' && isset($_POST['x']) && isset($_POST['y'])) {
      $new_event = create_move_event($_POST['player'], intval($_POST['x']), intval($_POST['y']));
    } else if ($action == 'chat' && isset($_POST['message'])) {
      $new_event = create_chat_event($_POST['player'], $_POST['message']);
    } else if ($action == 'dance' && isset($_POST['dance'])) {
      $new_event = create_dance_event($_POST['player'], $_POST['dance']);
    } else {
      set_error(400, 'Invalid action parameters.');
    }

    if (isset($new_event)) {
      header('Content-type: application/json');
      array_unshift($events, $new_event);
      echo json_encode($new_event);
      file_put_contents('data/events.json', json_encode($events));
    } 
  } else {
    set_error(400, 'Action and player parameters must be set.');
  }
} else {
  set_error(405, 'The api.php endpoint only supports POST requests.');
}
?>