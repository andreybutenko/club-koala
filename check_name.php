<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This endpoint accepts GET requests when a client wants to check if a name is available.
  The server checks if a player with the given name is currently connected, and returns either
  'taken' or 'available' appropriately.

  Web Service details:
  =====================================================================
  Required GET parameters:
  - name: Name to check for availability.

  Output format: plain text.

  Output Details:
  - Return either 'taken' or 'available' appropriately.
  - If name parameter is missing, responds with 400 Bad Request as plain text.
  - If a non-GET request is made, responds with 405 Method Not Allowed as plain text.
*/

header('Content-type: plain/text');

include 'util.php';

/*
  Return whether a player is already connected with the given name.
  {string} $name: Name to check for.
  {boolean} returns: Whether a player is already connected with the given name.
*/
function is_name_taken($name) {
  $connected = array_keys(json_decode(file_get_contents('data/connections.json'), true));
  $taken = in_array($name, $connected);
  return $taken;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['name'])) {
  echo is_name_taken($_GET['name']) ? 'taken' : 'available';
} else if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  set_error(405, 'The check_name.php endpoint only supports GET requests.');
} else {
  set_error(400, 'The name parameter must be provided.');
}
?>