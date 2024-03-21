# Jevil's Dilemma

## Single Player

### The Flow

1. The player enters the site, writes their name in the given text box (labled as "your name") and chooses "single player".
2. They are redirected to a new screen where the game is played.
3. In the screen(point 2) the player has a single button "Start" which starts the game
4. After clicking "start", they recieve a randomly selected dilemma question from a set of dilemmas (stored somewhere in a JSON file)
5. They start typing their response to the dilemma question in the given text box below the question
6. When they hit enter or click on the "submit" button, they see a list named "history" get appended by the current question (including the player's response). Also as a reaction to clicking the "submit" button, the current question is replaced with another question.
7. Note that these questions cannot be repeated, so before we fetch the next question we will first filter out all the question that player have already seen. this can be done by assigning each question with unique IDs. These IDs will also be stored inside the JSON file.
8. The Player after receiving total of 10 questions will have the option to restart the game or export the results.
9. They should be able to export their question/response history in one of the selected format CSV,HTML,TXT,PDF(optional)
10. The data related to player's play-routine will not be stored in the database

## Multi Player

### The Flow

1. The player enters the site, writes their name in the given text box (labled as "your name") and chooses "multiplayer player".
2. They are redirected to a new screen where the game is played.
3. In a corner they have a CODE for the current game session. This CODE can be shared to invite another player(s) into the game.
4. As the new player clicks the link they are shown a page where they need to write their name (similar to point 1), but the option to choose "single player" or "multiplayer" are not given in this screen.
5. As the new player joins the session, a Toast is shown in the top-right corner of the screen with the name of the new user.
6. All the players will see a single button (start) on the screen. clicking it will display a randomly selected dilemma question.
7. Each player will write their responses in a given text box and click "submit".
8. A new dilemma question will not be shown until all of the players have submitted their response.
9. A public history for each players responses w.r.t questions will be appended with the current response.
10. All the players will go through this until they have submitted responses for total of 10 questions. After that they will have an option to export their results in one of the predefined formats CSV,HTML,TXT,PDF(optional)
11. The session will then end as soon as the limit of 10 questions is reached. Kicking all players out of the session.
12. The data related to player's play-routine will not be stored in the database

## 👥 Setup considerations for 2-players

### Server-Side Setup:

- **WebSocket Server:** We'll need a server-side component that implements a WebSocket server. Probably using Express.js. This server will handle communication between the two or more players.
- **Game State Management:** The server will need to manage the game state, including the current dilemma, player information (names, responses etc)

### Client-Side Setup (using React):

- **WebSocket Connection:** Each player's React application will need to connect to the WebSocket server using the WebSocket API. This connection allows real-time communication between players.
- **Sending and Receiving Messages:** Players will send messages to the server via WebSockets to indicate their chosen options or actions in the game. The server will then broadcast the updates to both players, keeping their game states synchronized.
- **UI Updates:** Each player's React component will receive messages from the server and update the UI accordingly. This will involve displaying the chosen dilemma, opponent's response, history of questions and updating the game state.

#### Additional Considerations (For future)
- Error handling and disconnection management are essential for a robust game experience.
- We can implement additional features like turn timers, scorekeeping, and a chat functionality using WebSockets for communication.
- People might jump in the middle of the game.

## 📱📲 Setup to generate a sharable link for a multiplayer-player dilemma game using WebSockets

### Server-Side Setup:

- Unique Game ID: When a player starts a new game, the server generates a unique game ID (e.g., a random string). This ID identifies the specific game session.
- Sharable Link Creation: The server creates a sharable link by combining the game ID with the server's base URL. For example, if the server is at https://your-game-server.com and generates a game ID of `abc123`, the sharable link would be https://your-game-server.com/game/abc123.
- Game State Management: The server stores the game state associated with the game ID, including the current dilemma, player information, and turn tracker.

### Client-Side Setup (using React):

**Joining a Game:**
- When a player with the sharable link opens the game in their browser, their React app parses the link to extract the game ID.
- The React app connects to the WebSocket server and sends a message indicating they want to join the game with the extracted ID.
**Server Validation**
- The server receives the join request with the game ID.
- The server checks if a game exists with that ID and if it's currently available for another player to join.
**Game Start/Waiting Room:**
- If the game exists and is available:
  - The server adds the joining player to the game and sends them the initial game state (current dilemma, player information).
  - Both players' React components receive updates and display the same dilemma.
- If the game doesn't exist or is full, the server sends an appropriate message to the joining player (e.g., "Game not found" or "Game already full").


