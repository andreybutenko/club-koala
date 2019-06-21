<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This endpoint accepts GET requests to track and view page visits.

  Web Service details:
  =====================================================================
  Optional GET parameters:
  - ignore: If true, current request is not counted.

  Output format: plain text.

  Output Details:
  - If a non-GET request is made, responds with 405 Method Not Allowed as plain text.
*/

include 'util.php';

ensure_file_exists('data/visits.txt', 0);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $visits = intval(file_get_contents('data/visits.txt'));
  if (!isset($_GET['ignore']) || (isset($_GET['ignore']) && !boolval($_GET['ignore']))) {
    file_put_contents('data/visits.txt', $visits + 1);
  }
  echo $visits + 1;
} else {
  set_error(405, 'The analytics.php endpoint only supports GET requests.');
}
?>