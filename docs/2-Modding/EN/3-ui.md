# UI Elements and Creating UI

On this page, we will look at how to create UI and bind it to functions.

NOTE: All code additions proceed over the first example code. Only the function that will change is provided. The code given at the beginning serves as skeleton code.

---

### API

``server.bindKey``

    This function is the main bridge that directly binds the player's keyboard to your Lua functions.

    What Does It Do? When the player presses that key, Godot sends a packet to the server, and the server calls your function in Lua.

    Parameters: playerId (Who pressed?), key (Which key? e.g., "B", "F2"), callback (Which function should run?).

``server.unbindKey``

    This function removes the key bound to the client.

    Parameters: playerId, key (Which key? e.g., "B", "F2")
    
``UI.createMenu``

    The basic command that starts the interface construction.

    What Does It Do? Creates a new menu object in memory. Sets the coordinates and title.

    Parameters: playerId, title, x, y, width, height, hasBackground (true/false), isFullscreen(true/false)

``menu:addButton``

    A function that automatically arranges the button, saving you from calculating X and Y.

    What Does It Do? Places the button in the next available space in the menu and saves what will happen when clicked.

    Parameters: buttonText, callbackFunction.

``menu:addLabel``

    Adds an advanced text (label) to the panel.

    It has support for horizontal and vertical alignment and precise position adjustment (offset).

    Parameters: 

            text: The text to be written inside the Label.

            halg: Horizontal alignment (0: Left, 1: Center, 2: Right).

            valg: Vertical alignment (0: Top, 1: Center, 2: Bottom).

            h: Element height (Optional, default is 30).

            offX: Horizontal fine tuning (Right/Left pixel adjustment).

            offY: Vertical fine tuning (Up/Down pixel adjustment).

``menu:addRow``

    Arranges the following elements side by side.

    When the specified number of elements are added, the system automatically returns to the normal (top to bottom) layout.

    Parameters: > * count: How many elements will be arranged side by side (e.g., 2, 3 etc.).

Quick usage example

```lua

-- We opened a menu with a center-aligned (1) title
local menu = UI.createMenu(playerId, "p_panel", "MANAGEMENT", 100, 100, 450, nil, true, false, 1)

-- 1st Row: Two elements side by side
menu:addRow(2)
-- We shifted the text 5 pixels up (-5) so it stays perfectly aligned with the button
menu:addLabel("Player Name:", 0, 1, 40, 0, -5) 
menu:addButton("Inspect", function() end)

-- 2nd Row: Three elements side by side
menu:addRow(3)
menu:addButton("Kick", function() end)
menu:addButton("Ban", function() end)
menu:addButton("Mute", function() end)

menu:show()

```

``menu:show()``

    Creates (Spawns) the panel.

`menu:close()`

    Does NOT DELETE the panel, it only makes it invisible (Hides it). In the background, it actually runs `menu:setVisible(false)`. When the player reopens the menu, the text they wrote or slider settings stay exactly as they left them.

### Let's write our first script.

In this script, our panel will be bound to the ``B`` key and a panel will open when pressed. It will close when pressed again.
Inside the panel, there will be a button. When the button is pressed, a message will go to the client.

### Example code

```lua
server.on("onPlayerJoin", function(playerId)
    -- let's bind the function to the B key
    server.bindKey(playerId, "B", open_panel)

end)


function open_panel(id)
    -- let's create a menu
    
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- by default center (alg) is false 
    menu:addLabel("UI test successful!")
    -- in this label align center = true. if you pay attention in game, the text of this label stands centered in the panel.
    menu:addLabel("centered", true)

    -- we are adding a button. inside a callback.
    menu:addButton("Send message", function(playerId)

        server.sendMessage(playerId, "Hello first message")
    end)

    -- close button.
    menu:addButton("close", function(playerId)
        menu:close()
    end)

    -- the menu is being created.
    menu:show()

end

```

---

## Using Input (text input)

Here we will show how to create an input and send the text coming from it back to the player.
We will take the information entered into the input and send the text the player wrote to the player when the button we made earlier is pressed.

### API

``menu:addInput``

    This API allows you to add an Input element to the panel.

    Parameters: 
        -placeholder: The gray hint text that appears when the box is empty (e.g.: "Write your name...").

        -isLive:

            --false: The data is sent once when the player finishes typing and presses Enter or leaves the box (focus_exited).

            --true: Instant data flows to the server every time the player presses a letter (with a 300ms delay).

        -callbackFunc: The function that will run when data arrives. This function returns two values to you: (playerId, text).

### Example script

```lua

function open_panel(id)

    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- variable to hold the entered text.
    local entered_text = "..."

    menu:addLabel("Enter text into the box.", true)

    -- isLive = false: Only updates the data when Enter is pressed or leaving the box
    -- (important for the server's network traffic)
    menu:addInput("Enter text...", false, function(playerId, txt)
        -- we hold the text coming from the input in entered_text.
        entered_text = txt
    end)

    -- we send the incoming input data (text) to the player when the button is pressed.
    menu:addButton("send entered input", function(playerId)
        server.sendMessage(playerId, entered_text)
    end)

    menu:addButton("close", function(playerId)
        menu:close()
    end)
    menu:show()

end

```

---

## Progress bar usage.

In this section, we will see the usage of the progress bar.

### API

``menu:addProgressBar``

    Adds a Loading bar to the panel. 

    Parameters: val, maxVal
        
        val = its momentary value.

        maxVal = the maximum value the bar can take.

``server.updateUI``

    Updates the UI element.

    Parameters:

        playerId, "bar_id", { val = new_speed }
    
    I will show how to get the bar_id or the ID value of the UI element to be retrieved.


In this code, we will add a Progress bar to the panel and update it according to the value entered in the input when a button is pressed.

### Example code

```lua

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    local entered_number

    menu:addLabel("Enter text into the box.", true)

    -- isLive = false: Only updates the data when Enter is pressed or leaving the box
    -- (important for the server's network traffic)
    menu:addInput("Enter text...", false, function(playerId, value)
        entered_number = value
    end)

    local progressbar_id = menu:addProgressBar(0, 100)

    menu:addButton("send entered input", function(playerId)
        server.updateUI(playerId, progressbar_id, { val = entered_number})
    end)

    menu:show()

end

```

A different version where the progress bar will be updated the moment the value is entered.

### Example code

```lua

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    local progressbar_id = menu:addProgressBar(0, 100)

    -- isLive = true: Updates the moment a value is entered with a 300ms delay.
    menu:addInput("Enter text...", true, function(playerId, value)
        -- We are constantly updating the ProgressBar.
        server.updateUI(playerId, progressbar_id, { val = value})
    end)
    
    menu:show()

end

```

---


## Dropdown usage

Now we will see how to put a Dropdown on the panel and send the selected data to the player.

### API

``menu:addDropdown``

    A Dropdown allows you to present a list to the player without taking up much space on the screen. When a selection is made, it sends you both the order (index) of the selected item and the text on it.

    Parameters: menu:addDropdown(itemsList, callbackFunc)
        itemsList (table): The list of options to appear inside. E.g.: {"Red", "Blue"}.

        callbackFunc: Triggered when the player makes a selection. It returns these values to you: (playerId, index, text).

            index: The order of the selected item (starts from 0).

            text: The text on the selected item.

### Example code

```lua 

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- we are making a list
    local list = { "option_1", "option_2", "test1", "greetings", "hello", "red"}
    -- we are adding a Dropdown to the panel.
    menu:addDropdown(list, function(playerId, index, txt)
        -- we are sending the text value and index value of the selected item to the client.
        server.sendMessage(playerId, "Selected: " .. txt .. ", Order of selected: " .. index)
    end)
    menu:show()
end

```

---

## CheckBox usage

Now we will see CheckBox usage.

### API

``menu:addCheckBox(text, isChecked, callbackFunc)``

    Checkbox is used to make binary (true/false) selections. For example; it is ideal for turning on headlights, activating the ABS system, or confirming a setting.

    Parameters:

        text: The description text that will appear next to the box.

        isChecked: Should it be checked by DEFAULT when the menu is opened? (true/false).

        Callback Return: (playerId, state). The state value comes as true when the player checks the box, and false when they uncheck it.

### Example code

```lua

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- we are adding a CheckBox to the panel.
    menu:addCheckBox("Test CheckBox", false, function(playerId, state)
        -- we are sending the incoming state to the client.
        -- NOTE: state comes as a bool. definitely use tostring() when sending this
        -- to an API like sendMessage that sends a string.
        server.sendMessage(playerId, "Selected CheckBox state " .. tostring(state))
    end)

    menu:show()

end

```

---

## Slider usage

In this section, we will see how to use a Slider.

Let's send the value to the client when the slider is dragged and print the value on a label.

### API

``menu:addSlider(min, max, val, step, callbackFunc)``

    Slider is used to select numerical values within a specific range. To prevent packet traffic on the Godot side, it only sends data to the server when the player stops dragging (drag_ended).

    Parameters:

        min: The minimum value at the far left of the bar.

        max: The maximum value at the far right of the bar.

        val: Where the bar will stop initially (current value).

        step: How much the bar will increase by (E.g.: 1.0 or 0.5).

        Callback Return: (playerId, value). The value is the numerical amount selected by the player.

### Example code

```lua

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, nil, true, false)

    if not menu then return end

    menu:addLabel("Drag the slider")

    local indicator_id = menu:addLabel("0")

    menu:addSlider(0, 100, 1, 0.5, function(playerId, value)

        server.sendMessage(playerId, tonumber(value))
        server.updateUI(playerId, indicator_id, { txt = tostring(value) })

    end)

    menu:show()

end

```

---


## Applying a Texture to the panel.

In this section, we will apply a texture to a Panel.

### API

``server.setImage(playerId, panel_id, texture_id)``

    This API allows you to apply a texture to a panel.

    texture_id = is the "id" part inside the info.json inside the mod's zip file, Example: if it is "id": "panel_texture", then "panel_texture" goes to the texture_id parameter. 

    Parameters: playerId, panel_id, texture_id

### Example code

In this code, all the variables we access with menu.id and can access via menu. are as follows:


| Variable | Meaning |
| :--- | :--- |
| **menu.id** | Menu Name |
| **menu.playerId** | Owner Player |
| **menu.title** | Window Title |
| **menu.x** | Horizontal Position |
| **menu.y** | Vertical Position |
| **menu.width** | Width |
| **menu.height** | Height |
| **menu.hasBackground** | Background |
| **menu.isFullscreen** | Full Screen |
| **menu.elements** | Element List |


```lua

function open_panel(id)
    local menu = UI.createMenu(id, "test_menu", "Test menu", 200, 200, 1000, 500, true, false)

    if not menu then return end

    -- we are adding a label so it won't be empty.
    menu:addLabel("Test")

    -- we get the panel_id variable as menu.id. 
    -- WELL, where did the id in this menu.id come from?:
    -- the menu variable returns a table. the content of the table is specified above.

    server.setImage(id, menu.id, "panel_texture")

    menu:show()

end

```

---


## Arranging elements side by side

We will do this with ``menu:startRow(<number of elements to be arranged side by side>)``.

### Example code

```lua

function open_panel(playerId)
    local menu = UI.createMenu(playerId, "test_menu", "Test menu", 300, 200, 1000, 500, true, false)
    if not menu then return end


        
    -- LET'S PUT 3 DIFFERENT ELEMENTS SIDE BY SIDE
    menu:startRow(3)

    -- 1st Element: Only Text
    menu:addLabel("Blood Type:", 0) 

    -- 2nd Element: Dropdown Menu
    menu:addDropdown({"A+", "A-", "B+", "B-", "0+", "0-", "AB+", "AB-"}) 

    -- 3rd Element: Button
    menu:addButton("Update", function(p)
        server.consoleLog("Blood type updated!")
    end)

    -- Moves to the bottom row and continues normally...
    menu:startRow(2)
    menu:addCheckBox("VIP Player", true)
    menu:addInput("Leave a note...", false)

    menu:show()
    
end

```


---


## Theme system and usage

You can give a common theme to every panel, every button, everything in the game, or a separate theme to each separate menu. 

If you have a common theme that you want all elements to receive, you can adjust the ``DefaultTheme`` table in the ``scripts/helpers/ui_helper.lua`` script according to yourself.

If you want to give a theme specific to that menu from any script, you can use ``menu:setTheme(theme)``. If you only set and use ``DefaultTheme``, there is no need.

### API

``menu:setTheme(theme)``

    Feature: Gives a theme to all elements using Godot's StyleBoxFlat system.

    Parameters: theme (you can use it if you want to give a theme specific to that menu from any script)

### Example code

```lua

local my_theme = {
    bg_color = "#0B0F19",       -- Panel background color
    btn_normal = "#1D4ED8",     -- Button color
    btn_hover = "#2563EB",      -- Color when hovering over the button
    btn_pressed = "#1E40AF",    -- Color visible when clicking the button
    input_bg = "#000000",       -- Inner color of the Input element
    text_color = "#FFFFFF",     -- General text color
    radius = 6                  -- Corner bending
}

local menu = UI.createMenu(playerId, "test_menu", "Test Menu", 200, 100, 600, 400)
menu:setTheme(my_theme) --
menu:addLabel("TestLabel", 1, 1)
menu:addButton("TestButton", function() end)
menu:addInput("TestInput", false, function() end)
menu:show()

```


---


## Tabbed System

You can refer to the following to use the tabbed system.

### API

`menu:addTabs(tabList, activeTab, callbackFunc)`

    Feature: Adds tab switching buttons to the active panel and provides its functionality.

    Parameters: 
        tabList, takes the list of tabs as a Lua table.
            e.g.: {"Tab1", "Tab2"}
        
        activeTab, the information of the currently active tab.

        callbackFunc, a callable function that returns playerId and selectedPage.

### Example Code

```lua

server.bindKey(playerId, "B", function(id) panel(id, "Page1") end)

function panel(playerId, page)
    -- 1. Default Page (If not specified, this will be shown on the first open)
    page = page or "Page1"

    -- 2. Create the Panel (Since the ID is "basit_pnl", it deletes the old one on every call)
    local menu = UI.createMenu(playerId, "basit_pnl", "Basic Panel", 400, 200, 600, 400, true, false)
    if not menu then return end

    -- 3. Add Tabs
    -- addTabs: Arranges the buttons and sets it up so clicking a tab calls this function (panel) again.
    menu:addTabs({"Page1", "Page2"}, page, function(id, selected)
        panel(id, selected) 
    end)

    -- 4. Content (Only the selected page is visible)
    if page == "Page1" then
        menu:addLabel("This is the content of the first page.", 1, 1)
        menu:addButton("Click", function(id) server.sendMessage(id, "You are on Page 1!") end)

    elseif page == "Page2" then
        menu:addLabel("This is the content of the second page.", 1, 1)
        menu:addCheckBox("Checkbox", false)
    end

    -- Render the panel on the screen
    menu:show()
end

```


---


## Automatic Memory (State) System and Visibility

Instead of recreating or deleting menus every time, a Hide/Show (Toggle) logic is used to improve performance. Additionally, the `menu.state` table is available so that variables in the menu are not lost.

### Additional API and Features

`menu:setVisible(state)`

    Instantly changes the visibility of the panel on the screen.
    Parameters: state (true or false)

`menu:close()`

    Does NOT DELETE the panel, it only makes it invisible (Hides it). In the background, it actually runs `menu:setVisible(false)`. When the player reopens the menu, the text they wrote or slider settings stay exactly as they left them.

`menu:destroy()`

    COMPLETELY DELETES the panel from the server and the screen. Only use this when you want to destroy the menu permanently.

`menu.state`

    This is not a function, but a permanent memory table specific to that menu and player. Even if the player closes and reopens the interface (until they leave the game), the data in this table is never deleted.

### New Menu Logic (Example Code)

When `UI.createMenu` is called again with the same menu name, it automatically hides or shows the panel and returns **nil**. This way, the code below only runs when the player opens the menu for the FIRST TIME.

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "F5", function(pId) 
        smart_panel(pId) 
    end)
end)

function smart_panel(id)
    local menu = UI.createMenu(id, "example_menu", "Smart Menu", 200, 200, 600)
    
    -- If the menu already exists, ui_helper makes it visible/invisible and returns nil. 
    -- The code stops here, the buttons below are not recreated.
    if not menu then return end

    -- AUTOMATIC MEMORY (State): Permanent variables specific to the player
    local s = menu.state
    s.username = s.username or "Guest"
    s.volume_level = s.volume_level or 100.0

    menu:addInput(s.username, true, function(pId, text)
        s.username = text -- Saves to memory as the player types
    end)

    menu:addSlider(0, 100, s.volume_level, 1, function(pId, val)
        s.volume_level = val -- Kept in memory as the slider moves
    end)

    menu:addButton("Close", function(pId)
        menu:close() -- ONLY HIDES IT! When you press F5 to reopen, everything will be there.
    end)

    menu:show()
end

```