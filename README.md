# Jevil's Dillema

## 👥 Setup considerations for 2-players

### Server-Side Setup:

- **WebSocket Server:** You'll need a server-side component that implements a WebSocket server. Popular choices include Node.js with libraries like ws or socket.io. This server will handle communication between the two players.
- **Game State Management:** The server will need to manage the game state, including the current dilemma, player information (names, scores, etc.), and track which player's turn it is.
- **Matching Players:** You can implement logic to match players who connect to the server. This might involve creating a waiting room or lobby where players wait until another player joins to start a game.

### Client-Side Setup (using React):

- **WebSocket Connection:** Each player's React application will need to connect to the WebSocket server using the WebSocket API. This connection allows real-time communication between players.
- **Sending and Receiving Messages:** Players will send messages to the server via WebSockets to indicate their chosen options or actions in the game. The server will then broadcast the updates to both players, keeping their game states synchronized.
- **UI Updates:** Each player's React component will receive messages from the server and update the UI accordingly. This might involve displaying the chosen dilemma, opponent's selection (if applicable), and updating the game state.

### 📱📲 Simplified example of how the communication might flow:

**Player 1 connects:**

- Player 1's React app establishes a WebSocket connection to the server.
- The server might add Player 1 to a waiting room.

**Player 2 connects:**

- Player 2's React app connects to the server.
- The server detects two players waiting and starts the game.

**Server sends dilemma:**

- The server sends the initial dilemma to both players' React components.

**Player 1 chooses option:**

- Player 1's React app sends a message containing their chosen option to the server via WebSocket.

**Server broadcasts update:**

- The server receives Player 1's choice.
- The server broadcasts the chosen option to both players' React components (including Player 2).

**Player 2 updates UI:**

- Player 2's React app receives the message and updates the UI to show Player 1's selection.

### Additional Considerations:

- You'll need to define a message format for sending and receiving data between the server and clients. This format could be JSON-based and include information like player ID, chosen option, etc.
- Error handling and disconnection management are essential for a robust game experience.
- You can implement additional features like turn timers, scorekeeping, and a chat functionality using WebSockets for communication.

## Setup to generate a sharable link for a two-player dilemma game using WebSockets

### Server-Side Setup:

- Unique Game ID: When a player starts a new game, the server generates a unique game ID (e.g., a random string). This ID identifies the specific game session.
- Sharable Link Creation: The server creates a sharable link by combining the game ID with the server's base URL. For example, if the server is at https://your-game-server.com and generates a game ID of abc123, the sharable link would be https://your-game-server.com/game/abc123.
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

### Additional Considerations:

- The server needs a mechanism to track which games are currently waiting for a second player and which are already full.
- You can implement a lobby system where players can see available games before joining.
- Security measures might be needed to prevent unauthorized access to game sessions or game manipulation.

