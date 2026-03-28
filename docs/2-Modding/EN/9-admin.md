# Admin Management and Ban, Kick Events

In this section, we will look at the Admin APIs you can use to manage the players on your server.

---

## 1. Ban and Kick Operations

Used to kick players from the server or suspend them temporarily/permanently.

### APIs

`server.admin.banPlayer(dbId, "reason", duration)`
> Bans the player.
> **Parameters:** `dbId` (Player's permanent ID), `"reason"` (Reason for the ban), `duration` (In minutes)

`server.admin.kickPlayer(playerId, "reason")`
> Kicks the player from the game.
> **Parameters:** `playerId` (Not DbId, the playerId on the network!), `"reason"` (Reason for kicking)

### Example Usage

```lua
-- Banning a specific DbId for 24 hours (1440 minutes)
server.admin.banPlayer(15, "Cheat usage detected", 1440)

-- Kicking an active playerId on the network from the game
server.admin.kickPlayer(3, "You swore too much")
```

---

## 2. Unban Operation

Used to end a banned player's punishment early.

### API

`server.admin.unbanPlayer(dbId)`
> Removes the player's ban.
> **Parameters:** `DbId` (Permanent database ID)

### Example Usage

```lua
-- Unbanning the player with DbId 15
server.admin.unbanPlayer(15)
```

---

## 3. Listing Operations (Active Players and Banned Players)

Allows you to fetch the current players on the server or the banned players in the database as a list (as JSON).

### APIs

`server.admin.getActivePlayers()`
> Returns the list of active players on the server as JSON. Content: `playerId`, `dbId`, `username`, `nickname`.

`server.admin.getAllBans()`
> Returns all banned players in the database as JSON. Content: `DbId`, `Reason`, `UnbanTime`.

### Example Usage (Fetching Active Players)

*Note: Do not forget to use `server.jsonDecode` to be able to loop through the fetched data.*

```lua
-- Example of printing the players on the server to the console
local playersJson = server.admin.getActivePlayers()
local players = server.jsonDecode(playersJson)

for i, p in pairs(players) do
    server.consoleLog("Player: " .. p.nickname .. " | Username: " .. p.username .. " | DbId: " .. p.dbId)
end
```

### Example Usage (Fetching Banned Players)

```lua
-- Example of fetching and processing the banned list
local bansJson = server.admin.getAllBans()
local bannedPlayers = server.jsonDecode(bansJson)

for i, ban in pairs(bannedPlayers) do
    server.consoleLog("Banned DbId: " .. ban.DbId .. " | Reason: " .. ban.Reason)
end
```

---

## 4. Querying Player Information

Allows you to access players' database records such as name, nickname by using their ID numbers.

### APIs

`server.getPlayerUsername(playerId)`
> Accesses the player's Username only with the `playerId` currently in the game.

`server.getPlayerNameByDbId(DbId)`
> Fetches the player's in-game name (Nickname) from the database using the `DbId`.

`server.getPlayerUsernameByDbId(DbId)`
> Fetches the player's username (Username) from the database using the `DbId`.

### Example Usage

```lua
-- Learning player details via DbId
local targetDbId = 42

local nickname = server.getPlayerNameByDbId(targetDbId)
local username = server.getPlayerUsernameByDbId(targetDbId)

server.consoleLog("Queried Player: " .. nickname .. " (" .. username .. ")")
```