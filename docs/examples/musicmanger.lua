
server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "F5", function(pId) 
        openMusicUI(pId) 
    end)
end)

function openMusicUI(pId)
    local menu = UI.createMenu(pId, "music_sys", "Create using LUA Modding Ses sistemi", 400, 300, 450, 500)
    
    if not menu then return end

    local s = menu.state
    s.url = s.url or "https://..."
    s.vol = s.vol or 100.0
    s.bass = s.bass or 0.0
    s.treble = s.treble or 0.0

    -- == URL GİRİŞİ ==
    menu:addLabel("Muzik Kaynagi (URL)", 1)
    menu:addInput(s.url, true, function(id, text)
        s.url = text -- yazdıkça otomatik hafızaya kaydolur
    end)

    -- == ANA SES (Canlı Label Güncellemeli) ==
    local lbl_vol = menu:addLabel("Ana Ses: %" .. tostring(s.vol), 1)
    menu:addSlider(0, 100, s.vol, 1, function(id, value)
        s.vol = tonumber(value) or 100.0
        server.updateUI(id, lbl_vol, { txt = "Ana Ses: %" .. tostring(s.vol) })
        world.setEq(tostring(id), s.bass, s.treble, s.vol) -- Anında C#'a yolla
    end)

    -- == BASS SEVİYESİ ==
    local lbl_bass = menu:addLabel("Bass: " .. tostring(s.bass) .. " dB", 1)
    menu:addSlider(-24, 24, s.bass, 1, function(id, value)
        s.bass = tonumber(value) or 0.0
        server.updateUI(id, lbl_bass, { txt = "Bas: " .. tostring(s.bass) .. " dB" })
        world.setEq(tostring(id), s.bass, s.treble, s.vol)
    end)

    -- == TİZ SEVİYESİ ==
    local lbl_treble = menu:addLabel("Tiz: " .. tostring(s.treble) .. " dB", 1)
    menu:addSlider(-24, 24, s.treble, 1, function(id, value)
        s.treble = tonumber(value) or 0.0
        server.updateUI(id, lbl_treble, { txt = "Tiz: " .. tostring(s.treble) .. " dB" })
        world.setEq(tostring(id), s.bass, s.treble, s.vol)
    end)

    menu:startRow(4)
    
    -- == BUTONLAR ==
    menu:addButton("YAYINLA", function(id)
        if s.url ~= "" and s.url ~= "https://..." then
            local pos = world.getPlayerPosition(tonumber(id)) or {x=0, y=0, z=0}
            local time = server.getTimestamp()
            
            -- servere gönder
            world.playSound(tostring(id), s.url, pos.x, pos.y, pos.z, 150.0, time)
            
            -- sliderdeki equzi ayarla
            world.setEq(tostring(id), s.bass, s.treble, s.vol)
            create_speaker(id)
            server.sendMessage(id, ">> Tesisat acildi!")
        end
    end)

    menu:addButton("hoparlör", function(id)
        create_speaker(id)
    end)
    
    menu:addButton("KAPAT", function(id)
        world.stopSound(tostring(id))
        remove_speaker(id)
        menu:close() -- panel gizleme
    end)

    menu:show()
end

function create_speaker(playerId)
    
    local pos = world.getPlayerPosition(playerId)

    assets.create(playerId, "speaker_unid", "bass_speaker", pos.x, pos.y, pos.z, 0, 0, 0, false, true)
    server.setTimer(1000, function()
        assets.anim(playerId, "speaker_unid", "bass_loop", 1.0, false, true)
        server.setTimer(1000, function()
            assets.stick(playerId, "speaker_unid", playerId, 0, 1, -2, 0, 180, 0, "car", true)
        end, false)
        
    end, false)
    

end

function remove_speaker(playerId)

    assets.remove(playerId, "speaker_unid", true)
end