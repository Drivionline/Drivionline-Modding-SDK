# Welcome to the Drivionline Modding API

Drivionline servers support mods and scripts written entirely in **Lua**. Thanks to our C#-based backend engine, you can control every single element, player, and vehicle within the game.

This documentation series includes all the functions and events you need to build your own game mode, user interfaces (GUI), and systems.

# How do I grant admin/owner permissions to my own account?

In the Lua code located at ``scripts/support/authorization_setup.lua`` on the server, replace the ``“ADD USERNAME”`` in the ``local username = “ADD USERNAME”`` variable with your own username. For the ``local new_role = “admin”`` variable, you can enter any custom role if you have a custom system. However, the default and standard systems generally use the ``“admin”`` role. If you want to grant yourself the ``‘owner’`` role (this is the highest privilege, so be careful), you can enter ``“owner”`` instead of the role. After completing this process, don’t forget to log into the game and enter the command ``/set_role`` in the F7 command window.


## The Lua Version We Use

**Version**: Based on Lua 5.2 (99% compatible with 5.1).

**Biggest Pitfall**: Tables start at 1. If you use `myTable[0]`, you’ll get `nil`.

**Restricted**: For security reasons, dangerous libraries such as os.execute (system commands) and io (file read/write) are disabled.

**Data Storage**: You can use our database API to store data.

**Operator Note**: The // (integer division) or &, | (bitwise operators) introduced in Lua 5.3 do not work. The bit32 library must be used for bitwise operations.

## Lua Stubs service

Whether you use a Lua Stubs tool or not, this file will be extremely useful to you, but you must open the Lua code coming from the `scripts/Drivionline_API. lua` directory. Do this once before writing any script, or keep it open in the background so that your Lua Stubs program recognizes it as a library. This way, you’ll see everything—like where parameters go and function autocompletion—in real-time as you write code. This will significantly increase your coding speed.
The same applies to the helper code in the ``scripts/helpers`` folder. 

## Quick Start

Writing your first script is quite simple. Create a new `.lua` file in the `scripts` directory within your server folder and paste the code below.

### Create Your First Command

Let's create a command that players can type into the F7 console.

```lua
-- Print information to the logs when the server starts
function onServerStart()
    server.consoleLog("Our first script has been successfully loaded!")
end
server.on("onServerStart", onServerStart)

-- A simple command to give the player a vehicle: /givecar
server.addCommand("givecar", function(playerId, args)
    
    -- Get the player's name
    local name = server.getPlayerName(playerId)
    
    -- Spawn a vehicle for the player (Ex: jreo_model_23)
    car.create(playerId, "jreo_model_23", 1)
    
    -- Send a message to the player
    server.sendMessage(playerId, "Congratulations " .. name .. ", your vehicle has been created!")
    
end)