[Back To README](https://github.com/Blankscreen-exe/jevils-dilemma/)

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


