<?php
/*
  Name: Andrey Butenko
  Date: May 16, 2019
  Section: CSE 154 AI

  This file performs tasks that should be completed on every API request. It ensures that the
  events and connections data files exist, it marks the current user as active, it disconnects
  idle users, and it declares the function which creates an error status.

  This is NOT an endpoint.
  This is to avoid copy-and-pasting this content into every .php file.
*/

/*
  Check if a file exists. If not, create it with default content.
  {string} $file_name: File name to check.
  {string} $default_content: Default content for file.
*/
function ensure_file_exists($file_name, $default_content) {
  if (count(glob($file_name)) === 0) {
    file_put_contents($file_name, $default_content);
  }
}

/*
  Loop through current game connections and disconnect users who haven't pinged for a while.
  If $user_name is provided, updates connection status for current user.
  {string} $user_name: Optional, user name of current user.
*/
function update_current_connections($user_name = false) {
  $res = array();
  $connections = json_decode(file_get_contents('data/connections.json'), true);
  $time = round(microtime(true));

  if ($user_name !== false) {
    $connections[$user_name] = $time;
  }

  $keys = array_keys($connections);
  for ($i = 0; $i < count($keys); $i++) {
    if ($connections[$keys[$i]] > $time - 5) {
      $res[$keys[$i]] = $connections[$keys[$i]];
    } else {
      $events = json_decode(file_get_contents('data/events.json'), true);
      $newEvent = array(
        'id' => uniqid(),
        'action' => 'disconnect',
        'player' => $keys[$i]
      );
      array_unshift($events, $newEvent);
      file_put_contents('data/events.json', json_encode($events));
    }
  }
  
  file_put_contents('data/connections.json', json_encode($res));
}

/*
  Set HTTP respond code with a message.
  {integer} $code: Error code.
  {string} $msg: Additional error message.
*/
function set_error($code, $msg) {
  header('Content-type: plain/text');
  http_response_code($code);
  echo $msg;
}

ensure_file_exists('data/events.json', '[]');
ensure_file_exists('data/connections.json', '[]');

if (isset($_POST['player'])) {
  update_current_connections($_POST['player']);
} else if (isset($_GET['player'])) {
  update_current_connections($_GET['player']);
} else {
  update_current_connections();
}
?>