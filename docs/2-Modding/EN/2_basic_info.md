# Important Information About the API

The APIs you will use are simple. However, it is highly beneficial to know these details.

---

## 1. APIs that Return Parameters

If you bind a function to the callback of APIs that return parameters, the parameters will automatically be passed to the arguments of the called function.

### Example:

```lua

function repairVehicle(playerId, args)
    -- repair logic...
    server.sendMessage(playerId, "Your vehicle has been repaired.")
end

server.addCommand("repair", repairVehicle)

```

Or

```lua

-- 1. First, we define the action function
function seatbeltAction(playerId)
    -- code content...
end

-- 2. Inside the event, we only pass the function name
server.on("onPlayerJoin", function(playerId)
    -- NOTE: Do not add parentheses like seatbeltAction(), just write its name!
    server.bindKey(playerId, "B", seatbeltAction) 
end)

```

## 2. The server.updateUI API

There is a very important point to mention regarding this API.

Here are the differences in their most summarized form:

1. txt (Visible Text)
    What it is: It is the character sequence (String) printed on the screen that the user sees with their eyes.

    Purpose: To provide information to the user or receive data (name, password, etc.) from them.

    Example: The "Hello World" text inside a **Label** box.

2. val (Backend Value)
    What it is: It is the code-side equivalent of the visual element in the UI. Often it is the same as txt, but the difference is this: if txt is "123", val holds this as a number (Integer) 123.

    Purpose: To perform mathematical operations or send raw data to the database.

    Example: Used when updating the value of a **Progress Bar**.

3. checked (State/Approval)
    What it is: It is a Boolean (true/false) value. It only answers the question "is it selected or not?".

    Purpose: To control the on/off state of components like a Switch, Checkbox, or Radio Button.

    Example: Updating the checked (Checkmark) data of a **CheckBox**.

## 3. The require Statement in LUA Scripts

When calling another script, instead of `require("panel")`, if the script is in a subfolder, write it like this example: `require("ui/panel")`.

## 4. Hook System

The modding system uses a Hook architecture so that multiple scripts can run simultaneously without breaking each other.

`server.on(eventName, callback)`

    This function allows you to "subscribe" to an event that occurs on the server. Unlike the classic `function onEventName()` usage, when you use `server.on`, you do not prevent other scripts from listening to the same event.

Why is this important?: While one mod sends a welcome message when a player joins, another mod can simultaneously give the player a starter car. `runEvent` runs both scripts sequentially in the background.

### Example Code

```lua

-- First script: Welcome message
server.on("onPlayerJoin", function(playerId)
    server.sendMessage(playerId, "Welcome to the server!")
end)

-- Second script: Log recording
server.on("onPlayerJoin", function(playerId)
    server.consoleLog("Player joined, ID: " .. playerId)
end)

```