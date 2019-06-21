<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This endpoint accepts GET requests to get actions a player can perform. The response includes
  an object 'chat', where keys are categories of chat messages and values are arrays of chat
  messages in that category. The response also includes 

  Web Service details:
  =====================================================================
  Output format: JSON or plain text.

  Output Details:
  - The response is a JSON object that includes two objects:
    - An object 'chat', where keys are categories of chat messages and values are arrays of chat
      messages in that category.
    - An object 'dances' that contains an array of dance names.
  - If a non-GET request is made, responds with 405 Method Not Allowed as plain text.
*/

include('util.php');

header('Content-type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo file_get_contents('data/actions.json');
} else {
  set_error(405, 'The actions.php endpoint only supports GET requests.');
}
?>