# Manipulating player vehicle data and Element management

In this document, we will see how to fetch data from players' vehicles. 
Alongside this, we will examine the logic of `getElementData`, `setElementData`, and `removeElementData`.

## 1. Fetching the vehicle state.

When the `B` key is pressed, we will fetch the state data from the vehicle of the player who pressed the key.

### API

`car.requestCarState(playerId, function(playerId, data)`

    This API allows you to fetch the state data from the player's vehicle.

    Data we can access via data.:

        "rpm": engine's rpm
        "kmh": speed
        "gear": gear
        "fuel": engine's fuel amount 
        "en_health": engine's health
        "en_oil": engine oil state
        "kilometer": how many kilometers it has traveled
        "steer_deg": steering angle

`server.bindKey`

    This function is the main bridge that connects the player's keyboard directly to your Lua functions.

    What does it do? When the player presses that key, Godot sends a packet to the server, and the server calls your function in Lua.

    Parameters: playerId (Who pressed?), key (Which key? e.g.: "B", "F2"), callback (Which function should run?).

### Example code

```lua

server.on("onPlayerJoin", function(playerId)

    -- we bind the key when the player joins.
    server.bindKey(playerId, "B", function(playerId)
        -- we send a data fetch request by calling requestCarState from the car API.
        car.requestCarState(playerId, function(playerId, data)
            
            -- data is retrieved via data.
            local speed = math.floor(data.kmh)
            local rpm = math.floor(data.rpm)

            -- we send the data to the player.
            server.sendMessage(playerId, "Speed: " .. speed)
            server.sendMessage(playerId, "Rpm: " .. rpm )
        
        end)
    end)
end)


```

---

## 2. Manipulating vehicle data.

Now we will manipulate the vehicle's state data.
Pressing the `B` key will turn the vehicle's turbo on, pressing it again will turn it off.

### API

`car.setCarState(playerId, data)`

    Can manipulate the vehicle's data

    Parameters: playerId, data

        The content of data can be like this:

            car.setCarState(id, {

                motor_sagligi = 100.0,
                motor_yagi = 100.0,
                mevcut_benzin = 45.0

            })

        Variables you can control:

            Engine and Maintenance:

                motor_yagi: Remaining oil

                motor_sagligi: Engine damage

                clutch_health: Clutch health

            Fuel and Distance:

                mevcut_benzin: Fuel in the tank

                kilometre: Total distance

                tuketim_100km: Vehicle consumption

                toplam_yakilan: Consumed fuel

            Performance (Turbo):

                turbo_on: Turbo active

                turbo_max_psi: Maximum pressure

                turbo_spool_rate: Spool rate

                turbo_rpm_bonus: Redline bonus

            Lights and Signals:

                farlar_acik: Headlight state

                fren_lambasi_yansin: Brake light

                geri_vites_lambasi_yansin: Reverse light

                korna_caliyor: Horn state

                sinyal_durumu: Signal direction (-1 = left, 1 = right, 2 = hazards)

            Tires:

                tire_wear: Wear (Table)

                tire_types: Tire type (Table)


            WARNING: (For the ones that are tables, you must send them as a Lua table like tire_wear = { fl = 0.5, fr = 0.5... }.)

`server.setElementData(elementId, key, value, broadcast)`

    Features: 
        -elementId takes a value regardless of whether it is an object or a player.
            You can use this to attach temporary data to players.
            You can provide playerId to the elementId parameter. It's up to you.

        -key parameter takes a string format (e.g., "job").

        -value can take any type, regardless of whether it's bool, string, float, or int
            e.g.: "police" or 100 or 100.0 or true
        
        -broadcast parameter is the option for whether that element change should be broadcasted to all players.
            true by default 

        If the player leaves the server, the element data belonging to that player is automatically cleared with the ClearElement function.

`server.getElementData(elementId, key)`

    Features:
        -elementId takes a value regardless of whether it is an object or a player.
            You can use this to attach temporary data to players.
            You can provide playerId to the elementId parameter. It's up to you.

        -key parameter determines which element's value will be retrieved.


### Example code


```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)

        -- the reason we use "or false" here is for "nil/null" protection.
        local turbo_active = server.getElementData(playerId, "turbo_on") or false

        -- we define the data variable
        local data = {}
        
        -- check if turbo is active or not.
        if turbo_active == false then

            -- if turbo is off, we turn it on.

            data = {

                turbo_on = true,
                turbo_max_psi = 5.0
            }
            server.setElementData(playerId, "turbo_on", true)
        else
            
            -- if turbo is on, we turn it off.
            data = {

                turbo_on = false,
                turbo_max_psi = 5.0
            }
            server.setElementData(playerId, "turbo_on", false)
        end

        -- MAIN PART: we update the vehicle's state.
        car.setCarState(playerId, data)

    end)
end)


```


---


## 3. Managing the player and the vehicle

Using the car class again, we will kick the player from the vehicle, teleport them into the vehicle, destroy the vehicle, and create the vehicle.

### API

`car.kick(playerId)`

    Features:
        -playerId: The ID number of the player in the vehicle.
        Used to forcefully remove (kick) the player from the vehicle.
        The vehicle is not destroyed, it stays where it is. The player simply switches to pedestrian mode.

`car.destroy(playerId)`

    Features:
        -playerId: The ID number of the player whose vehicle will be destroyed.
        Completely deletes the player's current vehicle from both the server and all clients.
        The player is automatically switched to "Character" (pedestrian) mode.

`car.putIn(playerId, carName, uniqueId)`

    Features:
        -playerId: The ID number of the player to be placed in the vehicle.
        -carName: The model name of the vehicle (e.g.: "jreo_model_23").
        -uniqueId: The unique ID of the vehicle in the world.
        Instantly teleports the player inside their active or parked vehicle without making them wait.

`car.create(playerId, modelName, uniqueId)`

    Features:
        -playerId: The ID number of the player who will be given the vehicle.
        -modelName: The model name of the vehicle to be created (e.g.: "jreo_model_23").
        -uniqueId: The unique ID number to be assigned to the vehicle.
        Creates a new vehicle object for the player and sends the loading command to the client (Godot).

`car.approve(playerId, carName, uniqueId, broadcast)`

    Features:
        -playerId: The ID number of the player to be approved.
        -carName: The model name of the vehicle.
        -uniqueId: The unique ID number of the vehicle.
        -broadcast: Whether this information will be sent to other players (true/false).
        It is the approval mechanism where the server makes the transaction official by saying, "Yes, this player is currently in this vehicle".
        It is critical for anti-cheat and synchronization.


### Example code

```lua

server.on("onPlayerJoin", function(playerId)
    -- we bind a key
    server.bindKey(playerId, "B", function(playerId)
        
        -- we create a panel
        local menu = UI.createMenu(playerId, "menum", "TEST menu", 200, 200, nil, nil, true, false)
        -- error prevention
        if not menu then return end

        -- a button, and this button creates a vehicle.
        menu:addButton("create", function ()

            car.create(playerId, "jreo_model_23", 31)
        end)


        -- we create a list for the dropdown.
        local list = {"create", "remove", "enter", "kick" }

        menu:addDropdown(list, function(playerId, index, txt)
            
            if txt == "create" then
                -- creates the vehicle
                car.create(playerId, "jreo_model_23", 138)
            elseif txt == "remove" then
                -- destroys the vehicle
                car.destroy(playerId)
            elseif txt == "enter" then
                -- forcefully puts into the vehicle 
                car.putIn(playerId)
            elseif txt == "kick" then
                -- kicks from the vehicle
                car.kick(playerId)
            end
        
        end)
        
        menu:show()
    end)
end)

```

### Using the car.approve API

Features:
        -playerId: The ID number of the player to be approved.
        -carName: The model name of the vehicle.
        -uniqueId: The unique ID number of the vehicle.
        -broadcast: Whether this information will be sent to other players (true/false).
        It is the approval mechanism where the server makes the transaction official by saying, "Yes, this player is currently in this vehicle".
        It is critical for anti-cheat and synchronization.

### Example code

```lua

-- ID Controller Variable
-- ID Controller Variable
-- true: Server generates a random secure ID (Prevents collisions)
-- true: Server generates a random secure ID (Prevents collisions)
-- false: Trusts and uses the ID coming from the client
-- false: Trusts and uses the ID coming from the client
local useServerGeneratedId = true

-- Seed for randomness
-- Seed for randomness
math.randomseed(os.time())

-- Simple list to track active vehicle IDs
-- Simple list to track active vehicle IDs
local activeVehicleIds = {}

local function generateUniqueId()
    local newId
    repeat
        -- Random number between 1000 and 999999
        -- Random number between 1000 and 999999
        newId = math.random(1000, 999999)
    until not activeVehicleIds[newId] -- If this ID is in use, generate again
                                      -- If this ID is in use, generate again
    
    activeVehicleIds[newId] = true
    return newId
end

-- Listening to the main request coming from C#
-- Listening to the main request coming from C#
server.on("onVehicleRequest", function(playerId, carName, requestedId, isBroadcast)
    
    -- CASE 1: EXITING VEHICLE (EXIT)
    -- CASE 1: EXITING VEHICLE (EXIT)
    if carName == "Character" or requestedId == -2 then
        -- No need to generate an ID for exiting, just approve it
        -- No need to generate ID for exiting, just approve it
        car.approve(playerId, "Character", -2, true)
        return
    end

    -- CASE 2: GARAGE PREVIEW (PREVIEW)
    -- CASE 2: GARAGE PREVIEW (PREVIEW)
    -- Only visible to the player (Broadcast FALSE).
    -- Only visible to the player (Broadcast FALSE).
    if isBroadcast == false then
        car.approve(playerId, carName, requestedId, false)
        return
    end

    -- CASE 3: ENTERING VEHICLE / SPAWN (ENTER)
    -- CASE 3: ENTERING VEHICLE / SPAWN (ENTER)
    -- If Broadcast is TRUE, it means the vehicle is being created for everyone.
    -- If Broadcast is TRUE, it means the vehicle is being created for everyone.
    if isBroadcast == true then
        
        local finalVehicleId
        
        -- Determine the ID based on the variable
        -- Determine the ID based on the variable
        if useServerGeneratedId then
            -- Generating a unique ID on the server side.
            -- Generating a unique ID on the server side.
            finalVehicleId = generateUniqueId()
            print("[FREEROAM] Creating Vehicle (Server ID). Player: " .. playerId .. " | Model: " .. carName .. " | ID: " .. finalVehicleId)
        else
            -- Trusting the ID coming from the client.
            -- Trusting the ID coming from the client.
            finalVehicleId = requestedId
            
            -- Let's add the ID from the client to the active list to prevent confusion
            -- Let's add the ID from the client to the active list to prevent confusion
            activeVehicleIds[finalVehicleId] = true
            
            print("[FREEROAM] Creating Vehicle (Client ID). Player: " .. playerId .. " | Model: " .. carName .. " | Incoming ID: " .. finalVehicleId)
        end

        -- Approve the vehicle to everyone with the determined finalVehicleId.
        -- Approve the vehicle to everyone with the determined finalVehicleId.
        car.approve(playerId, carName, finalVehicleId, true)
    end
end)

```


---


## 4. Deleting elements

To delete an element, ``server.removeElementData(elementId, key)`` is used.
In the example code, we will create an element with the `B` key and delete that element with the `M` key.

### API

`server.removeElementData(elementId, key)`

    Feature: can delete an Element.

        -elementId, the elementId of an element created with setElementData can be entered.

        -key, the key value of an element created with setElementData is entered. 
            for example: we gave "job".

### Example code

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        -- we add the element
        server.setElementData(playerId, "test", "valuee", true)
        -- we get the element we added
        local element = server.getElementData(playerId, "test")
        -- we send the name of the added element to the client
        server.sendMessage(playerId, "element add: " .. element)
    end)

    server.bindKey(playerId, "M", function(playerId)
        
        -- we DELETE the element
        server.removeElementData(playerId, "test")
        -- we try to get the element we deleted
        local element = server.getElementData(playerId, "test")
        -- if it is truly deleted, we cannot get it and element = nil is returned 
        if element == nil then
            -- if the element is truly deleted, tell the client
            server.sendMessage(playerId, "element delete")
        else
            server.sendMessage(playerId, "element delete fail: " .. element)
        end
    end)
end)

```


---


## 5. CarState variables that are tables

The usage of the tire_wear variable will be shown as an example.
When the `B` key is pressed, the vehicle will slide as if it's ice skating.
Traction will decrease to that extent.

### Example code

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        
        -- we define the data
        local data = {
            -- data to be edited is tire_wear
            tire_wear = { fl = 0.5, fr = 0.5, rl = 1.0, rr = 1.0}
        }

        -- we send the data
        car.setCarState(playerId, data)
    end)
end)

```


---


## 6. Fetching the list of installed mods on the server

We will see how to fetch vehicle mods in the server_mods folder of the server folder, and all mods including vehicles that are other APIs.

### API

``server.getVehicleList()``

    Feature: Returns the IDs/names of all mods installed on the server whose type is "vehicle", "car", "araç" (vehicle), etc., as a Lua table.

``server.getModList()``

    Feature: Returns the list of ALL typed mods installed on the server as a Lua table.

### Example code

Now when the player presses the ``B`` key, we will fetch the vehicles from this list and send them to the player.
In the other example, again when the `B` key is pressed, we will send the list of all mods on the server to the player.

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        -- we fetch the list from the server
        local list = server.getVehicleList()
        -- using 'for' is almost mandatory
        for car_id in pairs(list) do
            -- we send the list to the player
            server.sendMessage(playerId, tostring(car_id))
        end
    end)
end)

```

### Example code for getModList

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)

        local list = server.getModList()

        for mod_id in pairs(list) do
            server.sendMessage(playerId, tostring(mod_id))
        end
    end)
end)

```


--- 


## 7. Setting and fetching the player's/vehicle's position

There are APIs where we can set the player's position and fetch their position.

### API

`world.setPlayerPosition(playerId, x, y, z)`

    Feature: If the player is in a vehicle, they are teleported to the position you set along with the vehicle.
        If they are not in a vehicle, only their character is teleported.
    
`world.getPlayerPosition(playerId)`

    Accesses the player's position. Again, if they are in a vehicle, the vehicle's position is returned; if not, the character's position is returned.
        e.g.: local pos = world.getPlayerPosition(playerId)

### Example code

When we press the ``B`` key, we will see our position.
When we press the ``M`` key, we will set our position.

Why did we use `unpack`?

In Lua, `unpack` is used to sequentially "scatter" the values inside a table into a function's parameters. This way, you don't have to bother writing the table out one by one.

Why did we use `math.floor()`?

This is sort of a cleaner in Lua. Normally, when you fetch position data, messy numbers like 32.239132981312 come up. By cleaning this, we convert it into a number like 32.

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "B", function(playerId)
        
        local pos = world.getPlayerPosition(playerId)
        
        -- We combine the values directly and send them in a single message without entering a loop
        local mesaj = string.format("Your position -> X: %s, Y: %s, Z: %s", math.floor(pos.x), math.floor(pos.y), math.floor(pos.z))
        server.sendMessage(playerId, mesaj)
    end)

    server.bindKey(playerId, "M", function()

        local target_pos = { 1, 10, 11}
        world.setPlayerPosition(playerId, unpack(target_pos))
    end)
end)

```