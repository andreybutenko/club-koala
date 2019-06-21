# Club Koala API Documentation
The Club Koala API enables clients to push updates when a player performs an action, and pull events when it wants to sync with the global game state.

## Player performs an action
**Request Format:** api.php with POST parameters `action`, `players`, and:
- x: Required if action == 'move'. Destination x-position of player.
- y: Required if action == 'move'. Destination y-position of player.
- message: Required if action == 'chat'. Message from player.
- dance: Required if action == 'dance'. Dance for player to perform.

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** This endpoint accepts POST requests when a player performs an action such as moving, dancing, chatting, etc. After recieving an action, this script adds it to the event log to be shared with other players.

**Example Request:** api.php with POST parameters of `player=Andrey`, `action=move`, `x=532`, and `y=344`.

**Example Response:**
```json
{
  action: "move",
  id: "5cde544278991",
  player: "Andrey",
  x: 532,
  y: 344
}
```

**Example Request:** api.php with POST parameters of `player=Andrey`, `action=dance`, and `dance='Cheer Leader'`.

**Example Response:**
```json
{
  action: "dance",
  dance: "Cheer Leader",
  id: "5cde545527411",
  player: "Andrey"
}
```

**Example Request:** api.php with POST parameters of `player=Andrey`, `action=chat`, and `message="That's a mood"`.

**Example Response:**
```json
{
  action: "chat",
  id: "5cde55166391d",
  message: "That's a mood",
  player: "Andrey"
}
```

**Error Handling:**
- If a required parameter is missing, responds with 400 Bad Request as plain text with a helpful message: 'Action and player parameters must be set.' or 'Invalid action parameters.'.
- If a non-POST request is made, responds with 405 Method Not Allowed as plain text with a helpful error message: 'The api.php endpoint only supports POST requests.'.

## Client retrieves recent events
**Request Format:** events.php with POST parameters `players` and optionally `from`.

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** This endpoint accepts GET requests when a client wants to get recent events. Clients get synced to the global game state through this endpoint. If client has previously synced with the game state, `from` can be specified to limit response to events that have happened since the event with the given ID. If `from` is not specified, returns at most 20 events.

**Example Request:** events.php with POST parameters of `from=5cde55d65739d` and
`player=Andrey`.

**Example Response:**
```json
[
  {
    "id": "5cde55eb51490",
    "action": "move",
    "player": "alina",
    "x": 226,
    "y": 318
  },
  {
    "id": "5cde55eb2dbb0",
    "action": "chat",
    "player": "alina",
    "message": "What are your favorite animals?"
  }
]
```

**Example Request:** events.php with POST parameters of `from=5cde55eb51490` and
`player=Andrey`.

**Example Response:**
```json
[]
```

**Error Handling:**
- If a required parameter is missing, responds with 400 Bad Request as plain text with a helpful message: 'Player parameter must be set.'.
- If a non-GET request is made, responds with 405 Method Not Allowed as plain text with a helpful error message: 'The events.php endpoint only supports GET requests.'.

## Check if a display name is available
**Request Format:** check_name.php?name={name}

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** This endpoint accepts GET requests when a client wants to check if a name is available. The server checks if a player with the given name is currently connected, and returns either 'taken' or 'available' appropriately.

**Example Request:** check_name.php?name=Andrey

**Example Response:**
```
taken
```

**Error Handling:**
- If name parameter is missing, responds with 400 Bad Request as plain text with a helpful message: 'The name parameter must be provided.'.
- If a non-GET request is made, responds with 405 Method Not Allowed as plain text with a helpful message: 'The check_name.php endpoint only supports GET requests.'.


## Track a page view
**Request Format:** analytics.php

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** This endpoint accepts GET requests to track and view page visits. If ignore parameter is true, current request is not counted.

**Example Request:** analytics.php

**Example Response:**
```
8
```

**Example Request:** analytics.php?ignore=true

**Example Response:**
```
8
```

**Error Handling:**
- If a non-GET request is made, responds with 405 Method Not Allowed as plain text with a helpful message: 'The analytics.php endpoint only supports GET requests.'.


## Get possible player actions
**Request Format:** actions.php

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** This endpoint accepts GET requests to get actions a player can perform. The response is a JSON object that includes two objects: an object 'chat', where keys are categories of chat messages and values are arrays of chat messages in that category; and an object 'dances' that contains an array of dance names.

**Example Request:** actions.php

**Example Response:**
```json
{
  "chat": {
    "Greetings": [
      "Hi!",
      "Hello",
      "Hey!",
      "Goodbye",
      "See you"
    ],
    "Mood": [
      "How are you doing?",
      "Great!",
      "Good",
      "Terrible",
      "Big mood",
      "That's a mood",
      "Oh no",
      "Happy to hear that"
    ],
    "Animals": [
      "What are your favorite animals?",
      "Koalas, of course!",
      "Cats",
      "Dogs",
      "Ponies",
      "Turtles",
      "Frogs",
      "Fish",
      "Bottlebrush Yowies",
      "Birds",
      "Birds are not real!!",
      "Mowgli"
    ],
    "Emojis": [
      "😊",
      "😢",
      "✨",
      "🐨",
      "👌",
      "🤠"
    ],
    "Interact": [
      "Let's dance!",
      "Nice moves!",
      "Keep it up!",
      "#dab",
      "I'm sleepy...",
      "'Sko Dawgs!!"
    ],
    "TAs": [
      "Lauren Bricker is the best instructor!",
      "Melissa Hovik is the best instructor!",
      "Conner is the best TA!",
      "Daniel is the best TA!",
      "Chao is the best TA!",
      "Jack is the best TA!",
      "Sandy is the best TA!",
      "Ann is the best TA!",
      "Manchen is the best TA!",
      "Hudson is the best TA!",
      "Manny is the best TA!",
      "Will is the best TA!",
      "Zach is the best TA!",
      "Olga is the best TA!",
      "Tal is the best TA!",
      "Louis is the best TA!",
      "Valerie is the best TA!",
      "Mark is the best TA!",
      "Kyle is the best TA!",
      "Sven is the best TA!",
      "Kevin is the best TA!",
      "Kelley is the best grader!",
      "Jeremy is the best infrastructure TA!",
      "Sweekruthi is the best mentor!",
      "Jeffrey is the best mentor!",
      "Hawk is the best mentor!",
      "I love Panopto!",
      "Yes!"
    ]
  },
  "dances": [
    "Very Happy",
    "Dab",
    "Cheer Leader",
    "Wave",
    "Sleep"
  ]
}
```

**Error Handling:**
- If a non-GET request is made, responds with 405 Method Not Allowed as plain text with a helpful error message: 'The actions.php endpoint only supports GET requests.'.