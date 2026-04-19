server.on("onPlayerJoin", function(pId)

    assets.create(pId, "drv_rocket", "rocket", 182.00, 90.00, -187.00, 0, -90, 0, true, true)

    assets.createTrigger(pId, "trigger_0101", "marker", 175.78, 93.44, -213.50, 1.0, true)
    server.bindKey(pId, "M", open_panel)

end)

math.randomseed(os.time())

server.on("onGuiCallback", function(playerId, jsonStr)
    --godot'dan gelen veriyi API kullanarak lua tablosuna dönüştürüyoruz
    --örnek veri tipi: {"cmd":"trigger_exit","id":"markerim"}

    local data = server.jsonDecode(jsonStr)

    --gelen verinin markerin unid'si ile uyuşup uyuşmadığına bakıyoruz.
    if data.id == "trigger_0101" then
        
        --gelen verideki komut tipinin enter veya exit olduğuna bakıyoruz.
        if data.cmd == "trigger_enter" then
            world.setPlayerPosition(playerId, 173.46, 125.76, -176.50)
        end
    end
end)

function open_panel(id)
    -- bir menu oluşturalım
    
    local menu = UI.createMenu(id, "rocket_menu", "Roket menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- varsayılan olarak center (alg) false 
    menu:addLabel("Uçmak için kodu gir!")

    local glb_sifre 

    menu:addInput("Şifre...", false, function(pId, sifre)
        glb_sifre = sifre
    end)

    menu:addButton("Uçur", function(pId)
        if glb_sifre == "1234" then
            server.sendMessage(pId, "dogru, cikiyor")
            assets.move(pId, "drv_rocket", 183.00, 2000.00, -187.00, 80, "sine", true)
            --assets.rotate(pId, "drv_rocket", 30, 0, 10, 50, "sine", true)
        else
            server.sendMessage(pId, "şifre yanlış; 1234 veya 12345 veya başka :)")
        end
        
    end)

    menu:addButton("İndir", function(pId)
        if glb_sifre == "1234" then
            server.sendMessage(pId, "dogru, iniyor")
            assets.move(pId, "drv_rocket", 183.00, 80.00, -187.00, 50, "sine", true)
            --assets.rotate(pId, "drv_rocket", 30, 0, 10, 50, "sine", true)
        else
            server.sendMessage(pId, "şifre yanlış; 1234 veya 12345 veya başka :)")
        end
        
    end)

    menu:addButton("sil", function(pId)
    
        assets.remove(pId, "wood_" .. pId, true)
    
    end)

    menu:addButton("oluştur", function(pId)
        local pos = world.getPlayerPosition(pId)
       
        assets.createRigidBody(pId, "wood_" .. pId, "wood", pos.x+0.3, pos.y+1, pos.z+0.5, 0, -90, 0, 2000, true)
    end)

    -- kapatma butonu.
    menu:addButton("kapat", function(playerId)
        menu:close()
    end)

    -- menü oluşturuluyor.
    menu:show()

end