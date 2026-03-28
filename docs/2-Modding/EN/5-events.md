# Event System (Events)

In the Drivionline server, many systems operate on an **Event** logic. When a player connects to the server, leaves the server, enters a zone (marker), or gets into a vehicle, the C# backend automatically sends a trigger to the Lua scripts.

To listen to an event and run code when that event occurs, we use the `server.on()` function.

---

## 1. System and Mod Events
`onServerStart`

Runs once when the scripts are loaded or when /refreshmods is executed.

```lua

server.on("onServerStart", function()
    server.consoleLog("System Started: All scripts and tables are loaded.")
end)

```

## 2. Player Connection Events

`onPlayerJoin`

Triggered when a player connects and is "ready".

```lua

server.on("onPlayerJoin", function(playerId)
    server.sendMessage(playerId, "You logged in! Your ID is: " .. tostring(playerId))
end)

```

`onPlayerQuit`

Runs when a player closes the game or disconnects.

```lua

server.on("onPlayerQuit", function(playerId)
    server.consoleLog("Player Disconnected: " .. tostring(playerId))
end)

```

## 3. Vehicle and Technical Request Events

`onVehicleRequest`

Runs when a vehicle enter or spawn request comes through the Godot client.

```lua

server.on("onVehicleRequest", function(playerId, carName, requestedId, isBroadcast)
    local info = string.format("Vehicle Request -> Model: %s, ID: %s, Broadcast: %s", 
        carName, tostring(requestedId), tostring(isBroadcast))
    server.sendMessage(playerId, info)
end)

```

## 4. Interface and Raw Data Event

`onGuiCallback`

ALL raw data coming from Godot falls here. It is the heart of the ui_helper.lua library.

```lua

server.on("onGuiCallback", function(playerId, message)
    -- 'message' is a raw JSON string. You must decode it to see the parameters.
    local data = server.jsonDecode(message)
    server.sendMessage(playerId, "Incoming Raw UI Message: " .. message)
end)

```