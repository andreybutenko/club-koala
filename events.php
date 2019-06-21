<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This endpoint accepts GET requests when a client wants to get recent events. Clients get synced
  to the global game state through this endpoint.

  Web Service details:
  =====================================================================
  Required GET parameters:
  - player: Player requesting recent events.

  Optional GET parameters:
  - from: If client has previously synced with the game state, `from` can be specified to limit
          response to events that have happened since the event with the given ID.

  Output format: JSON or plain text.

  Output Details:
  - Return event objects of recent events as JSON array in reverse-chronological ordering.
    Event objects contain id, action, player, and other properties depending on which action was
    completed.
  - If player parameter is missing, responds with 400 Bad Request as plain text.
  - If a non-GET request is made, responds with 405 Method Not Allowed as plain text.
*/

include 'util.php';

/*
  Return all events that have happened since the event with the given ID. If the event with the
  given ID is no longer in the log, returns at most $max_events events and also clips log to the
  most recent $max_events events to limit file size.
  {string} $id: ID of the event to look for.
  {integer} $max_events: Maximum number of events to return.
  {array} returns: Array of all events that have happened since the event with the given ID.
*/
function get_events_from_id($id, $max_events = 20) {
  $events = json_decode(file_get_contents('data/events.json'), true);
  $result = [];
  $foundFromIndex = false;
  $i = 0;

  while (!$foundFromIndex && $i < $max_events && $i < count($events)) {
    $currentEvent = $events[$i];
    if ($currentEvent['id'] !== $id) {
      array_push($result, $currentEvent);
      $i++;
    } else {
      $foundFromIndex = true;
    }
  }

  if ($i === $max_events) {
    file_put_contents('data/events.json', json_encode($result));
  }

  return $result;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['player'])) {
  header('Content-type: application/json');
  $id = isset($_GET['from']) ? $_GET['from'] : '';
  echo json_encode(get_events_from_id($id));
} else if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  set_error(405, 'The events.php endpoint only supports GET requests.');
} else {
  set_error(400, 'The player parameter must be provided.');
}
?>