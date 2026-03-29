# Sound system API

3D sound/music system managed API's

### API
``world.playSound``
> * Plays an audio or music file from the specified URL in the 3D world and broadcasts it synchronously to all players.
> * Parameters: 
> * `attachId`: A unique identifier for the sound (usually playerId representing the vehicle or player).
> * `url`: The link to the audio file or stream to be played.
> * `x`, `y`, `z`: The 3D coordinates where the sound source will be located.
> * `dist`: The maximum distance the sound can be heard.
> * `startMs`: The start time of the sound. Used with `server.getTimestamp()` to ensure all players hear the same exact moment.

``world.setEq``
> * Updates the bass, treble, and overall volume of a currently playing sound and synchronizes it across all players.
> * Parameters: 
> * `attachId`: The ID of the sound to be updated.
> * `bass`: Bass level (e.g., between -24.0 and 24.0).
> * `treble`: Treble level (e.g., between -24.0 and 24.0).
> * `vol`: Main volume level (e.g., between 0.0 and 100.0).

``world.stopSound``
> * Stops the sound with the specified ID and completely removes it from all players' systems.
> * Parameters: 
> * `attachId`: The ID of the sound to stop.


#### Example Usage

```lua
-- Starting the sound
local pos = world.getPlayerPosition(playerId)
world.playSound(tostring(playerId), "https://...", pos.x, pos.y, pos.z, 150.0, server.getTimestamp())

-- Updating sound and EQ settings
world.setEq(tostring(playerId), 12.0, -5.0, 80.0)

-- Stopping the sound
world.stopSound(tostring(playerId))

```