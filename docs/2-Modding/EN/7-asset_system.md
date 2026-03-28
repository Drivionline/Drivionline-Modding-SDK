# Information on Object and Asset Management (AssetPack System)

In this document, we will see how modded objects (Assets) on the server work, how to add them to the map, and why we use the "AssetPack" logic unlike the vehicle system.

## What is an AssetPack and Why Does It Exist?

In vehicle mods, there is a single car inside each ZIP file, and it is called using the `"id"` (for example: `car_123`) within the `info.json`.

However, for objects (markers, streetlights, trash cans, garage doors, etc.), downloading a separate ZIP file for every small model exhausts both the server and the player's download time. Therefore, we use the **AssetPack** (Object Package) system. We can put dozens of different models inside an AssetPack mod using a single ZIP.

When the client (game) loads a mod with the `AssetPack` type, it does not look at the main mod ID. Instead, it looks at the `"contents"` section inside the `info.json` and saves the names there into its memory as objects.

### An example AssetPack `info.json` file:

```json
{
  "id": "city_pack_1",
  "name": "City Props",
  "type": "AssetPack", 
  "contents": {
    "trash_can": "models/trash.glb",
    "street_light": "models/light.glb",
    "park_bench": "models/bench.glb"
  }
}
```

In the example above, we will **never use** the mod's actual ID, `city_pack_1`, on the Lua side. When creating objects, we will only use the names under `"contents"` (`trash_can`, `street_light`, `park_bench`).

---

## Creating Objects on the Map

To place an object from an AssetPack into the world, we use the `assets.create` API.

See: https://drivionline.com/docs/?lang=EN&class=2+-+Modding&doc=6-assets.md#asset-yaratma-ve-temel-asset-kontrolleri

### API

`assets.create(playerId, uniqueId, assetName, x, y, z, rx, ry, rz, collision)`

  Properties:
    - playerId: The identification number of the player who will see the object.
    - uniqueId: The unique name you give to this object (E.g.: "door_1", "light_5"). You will use this id to delete or move it.
    - assetName: The name written in the "contents" section inside the info.json (E.g.: "street_light").
    - x, y, z: The coordinates of the object in the world.
    - rx, ry, rz: (Optional) The rotation angles of the object (in degrees).
    - collision: (Optional) Whether the object is solid or not, whether it can be passed through (true/false). If not specified, the default is true.


### Example code

```lua
server.on("onPlayerJoin", function(playerId)
    
    -- When the player joins, let's place a street light and a trash can in front of them.
    
    -- CAUTION: We use the name "street_light" inside contents, NOT "city_pack_1"!
    assets.create(playerId, "my_light_1", "street_light", 10, 0, 15)
    
    -- Let's put a trash can slightly next to it and turn off collision (so it can be passed through)
    assets.create(playerId, "my_trash_can", "trash_can", 12, 0, 15, 0, 0, 0, false)
    
end)
```

---

## Common Mistakes ("It Doesn't Work" Issue)

If you wrote the `assets.create` code but the object does not appear in the scene, you are probably trying to enter the main `id` value of the mod.

For example, let's say we have a marker pack like the one below:

```json
{
  "id": "marker_1",
  "name": "functional",
  "type": "AssetPack", 
  "contents": {
    "marker": "marker/marker.glb"
  }
}
```

**WRONG USAGE:**
Using the mod's main id (`marker_1`) to create a marker:

```lua
-- ERROR: marker_1 is the main id inside info.json. The client does not recognize this as an object.
local SENSOR_ASSET = "marker_1" 
assets.createTrigger(playerId, "sensor_1", SENSOR_ASSET, 5, 0, 5, 3.0)
```

**CORRECT USAGE:**
Using the key inside `"contents"` (`marker`) to create a marker:

```lua
-- CORRECT: It said "marker" inside contents, we must use that as the object name.
local SENSOR_ASSET = "marker" 
assets.createTrigger(playerId, "sensor_1", SENSOR_ASSET, 5, 0, 5, 3.0)
```

Thanks to this system, by having to download only a single mod (for example, with just a 1-megabyte ZIP file), you can easily manage and call hundreds of different objects on the map.