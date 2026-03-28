# Database Operations and Notes

Drivionline uses a centralized SQLite database (server.sqlite) to manage all persistent data. Developers have a layer to store player data, build custom systems (economy, inventory, etc.), or query existing tables: **SQL API.**

## 1. Notes

### 1.1 Database Architecture
When the server starts, the following core tables are automatically configured:

KeyValueStore: Flexible data storage area in JSON format.

```text
Players: Table containing player roles and basic account information.
    -DbId: Player's main ID
    -Role: Player's role
    -Username: Player's main username
```

```text
Bans: Server security and ban records.
    DbId: Username of the banned player
    Reason: Reason for the ban
    Bantime: Time of the ban
    UnbanTime: End time of the ban
```

### 1.2 Data Storage Methods

SQL API (Raw SQL)
Provides direct access for developers who want to create their own tables or run complex queries.

server.dbExecute(query, params): Used for data insertion, update, or table creation operations. Returns the number of affected rows.

server.dbQuery(query, params): Used for data retrieval operations. Returns the results as a Lua table (JSON Array).

### 1.3 Security and SQL Injection Protection
For database security, all dynamic data must be passed via parameterized queries. Instead of concatenating values directly into the SQL string, a parameter table with a @ or $ prefix should be used.

Safe Usage Example:

```lua

local dbid = server.getPlayerDbId(playerId)
local params = { 
    ["@role"] = "admin",
    ["@id"] = dbid 
    }

server.dbExecute("UPDATE Players SET Money = @para WHERE DbId = @id", params)

```

### 1.4 Supported Data Types (SQLite)
When defining columns in SQL queries, the following types should be referenced:

INTEGER: Whole numbers (ID, amount, timestamp).

TEXT: Text data and JSON blocks.

REAL: Decimal numbers (Coordinates, speed data).

NULL: Empty values.

### 1.5 Important Notes and Limitations
Transaction Management: SQLite is a file-based system; optimizing queries is recommended for performance during heavy write operations.

Table Management: Mod developers can create their own custom tables using the CREATE TABLE IF NOT EXISTS command.

Auto ID: The PRIMARY KEY AUTOINCREMENT feature ensures a unique identifier is created for each inserted row.

### 1.6 SQL Basic Commands Guide (Lua API Usage)

#### 1.6.1 Data Retrieval (`SELECT`)
`server.dbQuery` is used to read information from the database. This function always returns a table (list). It is most useful when creating a list of player money, levels, or leaderboards.

```lua
-- 1. Get the names and money of all players (No parameters needed)
local all_players = server.dbQuery("SELECT Username, money FROM Players")

-- 2. SAFE USAGE: Get "admins" who have more than a certain amount of money
local params = { 
    ["@target_money"] = 5000, 
    ["@target_role"] = "admin" 
}
local rich_admins = server.dbQuery("SELECT * FROM Players WHERE money > @target_money AND Role = @target_role", params)

-- 3. Sort the top 10 richest players by money (Richest to poorest)
local top10 = server.dbQuery("SELECT Username, money FROM Players ORDER BY money DESC LIMIT 10")
```

#### 1.6.2 Data Updating (`UPDATE`)
`server.dbExecute` is used to change an existing record. You use this when a player earns money or ranks up. **WARNING:** If you don't use `WHERE`, everyone's data will change!

```lua
-- 1. Increase the money of the player with ID 5 by 100
local money_params = { 
    ["@to_add"] = 100, 
    ["@target_id"] = 5 
}
server.dbExecute("UPDATE Players SET money = money + @to_add WHERE DbId = @target_id", money_params)

-- 2. Mark a player as banned
local ban_params = { 
    ["@reason"] = "Using Cheats", 
    ["@target_id"] = 10 
}
server.dbExecute("UPDATE Bans SET Reason = @reason WHERE DbId = @target_id", ban_params)
```

#### 1.6.3 Adding New Data (`INSERT` / `REPLACE`)
Adds a new row to the database. In SQLite, the `REPLACE` command updates the row if that ID (or Key) exists, or creates a new one if it doesn't (It's a lifesaver).

```lua
-- 1. Create a new player record
local register_params = { 
    ["@id"] = 15, 
    ["@name"] = "FastDriver", 
    ["@role"] = "user" 
}
server.dbExecute("INSERT INTO Players (DbId, Username, Role) VALUES (@id, @name, @role)", register_params)

-- 2. Update if record exists, create new if not (Works like a Key-Value system)
local kv_params = { 
    ["@key"] = "server_message", 
    ["@value"] = "Welcome!" 
}
server.dbExecute("REPLACE INTO KeyValueStore (Key, Value) VALUES (@key, @value)", kv_params)
```

#### 1.6.4 Data Deletion (`DELETE`)
Completely destroys a row. Used to lift bans or clean up old records.

```lua
-- 1. Lift a specific player's ban
local unban_params = { 
    ["@target_id"] = 5 
}
server.dbExecute("DELETE FROM Bans WHERE DbId = @target_id", unban_params)

-- 2. Delete a specific setting from the KeyValueStore table
local setting_params = { 
    ["@key_to_delete"] = "old_event" 
}
server.dbExecute("DELETE FROM KeyValueStore WHERE Key = @key_to_delete", setting_params)
```

#### 1.6.5 Changing Table Structure (`ALTER TABLE`)
Used to add a new column (property) without deleting the table. 
*(Note: Due to SQL rules, table or column names cannot be specified with a parameter `@`. Therefore, these commands are executed directly.)*

```lua
-- 1. Add a number column named "Level" to the Players table (Default to 1)
server.dbExecute("ALTER TABLE Players ADD COLUMN Level INTEGER DEFAULT 1")

-- 2. Add a text column named "Color" to the Vehicles table
server.dbExecute("ALTER TABLE Vehicles ADD COLUMN Color TEXT DEFAULT 'White'")
```

---

**Golden Tips**

* **Don't Forget `WHERE`:** When doing an `UPDATE` or `DELETE`, if you forget to add a `WHERE` condition at the end of the command, the entire database will be messed up, and the server will crash.
* **Use `LIMIT`:** Pulling thousands of players when making a leaderboard strains the server, always put a limit like `LIMIT 10` or `LIMIT 50`.
* **Searching with `LIKE`:** If you want to find players with a specific word in their name, you should use the `%` (percent) sign in the parameters.
  Example: `server.dbQuery("SELECT * FROM Players WHERE Username LIKE @target", { ["@target"] = "%Can%" })`

--- 

## 2. Real usage examples

We will add a new command to the chat, its name will be `/rol` and an example usage is this: `/rol username admin`
When you type this, we will find that player in the database from the arguments of this command and make their role `admin`.

**WARNING**! Only do this test in a test environment. Never give the `admin` role to a random person in a live environment. And this command can only be used by those who have the `admin` role. Before the test, do not forget to give your own account the `admin` role (see: https://drivionline.com/docs/?lang=TR&class=2+-+Modding&doc=1-intro.md#kendi-hesabiniza-admin-owner-yetkisi-nasil-verilir).


### 2.1 Database Result Table (Result Keys)

| Key | Present in Which Function? | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **`success`** | Both Query and Execute | `Boolean` | Returns `true` if the operation is completed without an SQL error, `false` if there is an error. |
| **`data`** | **Only `dbQuery`** | `Table` (Array) | The list of rows coming from the database. The first row is accessed with `data[1]`. |
| **`affectedRows`** | **Only `dbExecute`** | `Number` | The number of rows affected (updated, deleted, or inserted) by the operation. |
| **`error`** | Both Query and Execute | `String` | **Only present when `success` is false.** Contains the SQL error message. |

### Example code

```lua

server.addCommand("rol", function(playerId, args)
    -- getting arguments from the command
    if args[1] and args[2] then

        -- getting our dbid
        local my_dbid = server.getPlayerDbId(playerId)

        -- defining params
        local my_params = { ["@dbid"] = my_dbid }
        local result = server.dbQuery("SELECT Role FROM Players WHERE DbId = @dbid", my_params)

        if result.success and result.data[1].Role then
            local my_role = result.data[1].Role
            if my_role == "admin" then
                role_update(playerId, args)
                server.sendMessage(playerId, "You are an admin.")
            else 
                server.sendMessage(playerId, "You are NOT an admin.")
            end
        else 
            server.consoleLog("ERROR result CHECK")
        end
    end

end)

function role_update(playerId, args)
    -- security check
    if args[1] and args[2] then
        -- extracting data from arguments
        local username = args[1]
        local new_role = args[2]
        local params = { 
            ["@new_role"] = new_role,
            ["@username"] = username
        
        }
        -- executing database command and getting the result to see if the operation is successful
        -- or not.
        local result = server.dbExecute("UPDATE Players SET Role = @new_role WHERE Username = @username", params)
        if result.success then
            -- if successful, send the result.
            -- if you are wondering how the error system works, you can change the WHERE
            -- keyword in the db query to WERE or something.
            server.sendMessage(playerId, string.format("Role update! new role: %s to %s", new_role, username))
        elseif result.error then
            -- if there is an error, print the raw form of the error to the console. 
            server.consoleLog("error db execute: " .. tostring(result.error))
            server.sendMessage(playerId, "role update error")
        end
    end
end


```