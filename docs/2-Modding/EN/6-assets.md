# Asset creation and basic asset controls

In this documentation, we will see the basic assets helper and moving an asset.

## 1. Quick Start

Let's write our first script.
All additions in the document will be edited over the long script I put first.
Before all tests, do not forget to press the "B" key so that the object is created first.

### Create Your First Asset

Let's create an object in the world when players press the "B" key.

> **IMPORTANT INFO: GLOBAL SYNCHRONIZATION (isPersistent)**
> There is a hidden `isPersistent` parameter at the very end of all `assets` functions (create, move, rotate, anim, remove, etc.) in this documentation.
> By default, this value is considered **true**. This means that an object you create, move, or remove appears/changes synchronously for **all players on the server**. Newly joined players will also see these objects automatically.
> If you want an action to happen *only on that specific player's screen*, you must pass `false` as the last parameter of the function.

### APIs We Will Use

`assets.create`
    Creates a physical object (mesh) in the world.

    Parameters: playerId, id (unique name), modelName, x, y, z, rx, ry, rz, collision (true/false).

    Feature: If collision is not specified, it is considered true (solid object) by default.

    Note: You can enter any name you want in the "unique name" part of the parameters.

    Note: modelName: The name written in the "contents" section of info.json (e.g., "street_lamp").

`server.bindKey`
    Binds a specific key on a player's keyboard to a server-side Lua function. When the player presses the key, the assigned function is instantly triggered on the server.

    Parameters: playerId, key (Key name in String format, e.g.: "F2", "K"), callback (The function that will run when the key is pressed).


### below is a simple example of creating an object. The result of this script will create a mesh(object) in the scene at the coordinates `x: 1, y: 0, z: 1`.

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,2,1)
    end)
end)

```


## 2. Now let's add a simple `trigger` control mechanism to this script.

### APIs We Will Use

`assets.createTrigger`
    Creates a sensor area that the player can enter, exit, and pass through.

    Parameters: playerId, id, modelName, x, y, z, radius.

    Note: This object is always created with has_collision = false.

### The example marker control code is as follows

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

local marker_asset = "marker"
local marker_unid = "markerim"

server.on("onPlayerJoin", function(playerId)
    -- we create a marker when the player joins
    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)

    server.bindKey(playerId, "B", function(id)
        -- the part from our old code
        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)
end)

server.on("onGuiCallback", function(playerId, jsonStr)
    -- we convert the data coming from Godot into a Lua table using the API
    -- example data type: {"cmd":"trigger_exit","id":"markerim"}

    local data = server.jsonDecode(jsonStr)

    -- we check if the incoming data matches the marker's unid.
    if data.id == marker_unid then
        
        -- we check if the command type in the incoming data is enter or exit.
        if data.cmd == "trigger_enter" then
            
            server.sendMessage(playerId, "welcome")

        elseif data.cmd == "trigger_exit" then

            server.sendMessage(playerId, "goodbye")
        
        end
        -- NOTE: the reason we use elseif here
        -- is to check if it's "trigger_exit" if the incoming data is not "trigger_enter"
        -- otherwise, the goodbye message would never be sent because the signal comes one-way.

    end
end)

```

---

## 3. Now let's use this trigger system to move the object.

### APIs We Will Use

`assets.move`
    Moves an object smoothly (Tween) from one point to another.

    Parameters: playerId, id, x, y, z, time (seconds), ease ("linear" or "sine").

### The part that will change in the code

```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            -- the 1, 4, 1 part here is the parameter for where the object should go from where it is: x y z
            -- the 1.0 part is how many seconds it should take for the object to reach the targeted position.
            -- "linear" is the easing type with which the object will reach the position.
            -- linear: moves in a straight line. there is no acceleration or deceleration.
            -- sine: moves smoothly, starting slow, speeding up in the middle, and ending slow. good for places like market doors.

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")

        elseif data.cmd == "trigger_exit" then
            
            -- the situation above is the same here. we are just pulling it back to its old position.

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
        
        end
    end
end)

```

---

## 4. Now let's also add changing the rotation of the object to the code.

### API

`assets.rotate`
    Rotates an object around its own axis smoothly (using Tween) by the specified degrees.

    Parameters: playerId, id, rx (X angle), ry (Y angle), rz (Z angle), time (seconds), ease ("linear" or "sine").

    Technical detail: You write in degrees (0-360) in Lua, the system automatically converts this to radians, the unit Godot understands.

### Example code

```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            -- here hediye_unid is already the alias id of the object to be rotated.
            -- the 0, 100, 0 part is the target rotation. X Y Z
            -- 3.0 is the time required to reach the target rotation in seconds
            -- "sine" is the easing type with which the object will reach the position.
            -- linear: moves in a straight line. there is no acceleration or deceleration.
            -- sine: moves smoothly, starting slow, speeding up in the middle, and ending slow. good for places like market doors.

            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")

            -- here we take the object back to its old rotation.
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")

        end
    end
end)

```

---

## 5. Playing animations

Let's add animation playback support to our code

### API

`assets.anim`
    Plays pre-made animations embedded within an object (.glb file).

    Parameters: playerId, id, animName (Clip name [VERY IMPORTANT: READ THE NOTE]), speed (Playback speed), reverse (true or false).

    Requirement: An AnimationPlayer must be present within the object’s model; the system automatically detects this node and starts the animation.

    The reverse parameter is used to play the animation in reverse.

    If you exported the model from a modeling program (e.g., Blender) and assigned an animation to this mesh in Blender,
    Godot automatically creates the animation node.


### Example code

# VERY IMPORTANT NOTE: PAY CLOSE ATTENTION TO THIS WHEN NAMING ANIMATIONS e.g. "Cube_001Action":

If you made an animation for the model in Blender, definitely click the arrow key next to the mesh and look at its children. Also look at the children of Animation, and the node above something that says NLA Tracks is the name of that animation. absolutely do not leave symbols like . or , in it. if you have to leave it, for example if the animation name is Cube.001Action, absolutely write `"Cube_001Action"` when entering the name in the anim part of the code. Because when models are imported into Godot, places like "." in the names are converted to "_". ABSOLUTELY pay attention to this.


```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")

            -- hediye_unid is again the unique id of the object to be played.
            -- "Cube_001Action" is the name of the animation to be played.
            -- I MUST ADDRESS THIS ANIMATION PLAYBACK PART VERY IMPORTANTLY, PLEASE READ THE TEXT ABOVE!
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, false)

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, true)

        end
    end
end)

```

---

## 6. Deleting the object

In this part, we will provide example code to delete the object.
When the player presses the "G" key, the box we created with the "B" key will be deleted after 3 seconds.

### API

`server.setTimer`
    Runs a function after a specified time. Optionally, it can put this process into an infinite loop.

    ms (Milliseconds): Determines how long after the process will take place. (Example: 1000 = 1 second, 5000 = 5 seconds).

    callback (Function): It is the Lua function that will run when the time expires.

    loop (Loop): if set to true, the timer starts again every time it expires; if set to false (default), it runs only once and stops.

`assets.remove`
    Permanently deletes an existing object from the world. (If it was created globally, it will be removed for everyone).

    Parameters: playerId, id (the unique name of the object to be deleted), isPersistent (optional, default is true).

### Example code

```lua

server.on("onPlayerJoin", function(playerId)

    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)

    server.bindKey(playerId, "G", function(id)
    
        server.setTimer(3000, function()
        
            assets.remove(playerId, hediye_unid)
        
        end, false)
    
    end)
end)


```

---


# And with all of these, our final script

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

local marker_asset = "marker"
local marker_unid = "markerim"

server.on("onPlayerJoin", function(playerId)

    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)

    server.bindKey(playerId, "G", function(id)
    
        server.setTimer(3000, function()
        
            assets.remove(playerId, hediye_unid)
        
        end, false)
    
    end)
end)



server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, false)

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, true)

        end
    end
end)

```

---

## 7. Sticking an Object to a Player/Vehicle (Stick)

After creating an object, you can stick/attach it to a player (For example, giving a bag to a player's hand or putting a hat on their head).

### API

`assets.stick`
    Attaches an object to the specified target (targetPlayerId). As the target moves, the object moves with it.

    Parameters: playerId, id (the object's id), targetPlayerId (the player/target it will stick to), lx, ly, lz (X, Y, Z distance/offset from the target), rx, ry, rz (the object's rotation), attachType (attachment type/bone name), isPersistent.

### Example Code

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "H", function(id)
        -- First, we create the hat (The coordinates don't matter much because we will attach it immediately)
        assets.create(id, "player_hat", "hat_model", 0, 0, 0)
        
        -- Wait for 0.5 seconds and stick the object to the player's head
        -- (It is healthy to give a short time for the object to load on the Godot side)
        server.setTimer(500, function()
            -- With lx, ly, lz settings, we give an offset so the hat fits perfectly on the head.
            assets.stick(id, "player_hat", id, 0, 1.8, 0, 0, 0, 0, "head")
        end, false)
    end)
end)

```