local RESOURCE = GetCurrentResourceName()
local EVENT = RESOURCE .. ':'

local OLD_PREFIXES = {
    'veh_',
    'ped_',
    'mp_ped_',
    'settings_',
    'saved_veh_category_',
    'mp_character_category_',
    'vmenu_string_saved_weapon_loadout_',
}

local OLD_KEYS = {
    'vmenu_default_character',
    'vmenu_string_default_loadout',
}

local plugin = vMenu.CreatePlugin('Restore Old vMenu Data')
local pendingLookups
local busy = false

local function try(getter, key)
    local ok, value = pcall(getter, key)

    if ok then
        return value
    end
end

local function readValue(key)
    local text = try(GetResourceKvpString, key)

    if text ~= nil then
        return 's', text
    end

    local whole = try(GetResourceKvpInt, key)

    if whole ~= nil and whole ~= 0 then
        return 'i', whole
    end

    local number = try(GetResourceKvpFloat, key)

    if number ~= nil and number ~= 0.0 then
        return 'f', number
    end

    return 'i', 0
end

local function collect()
    local entries, seen = {}, {}

    local function add(key)
        if seen[key] then return end

        seen[key] = true

        local kind, value = readValue(key)

        entries[#entries + 1] = { key = key, type = kind, value = value }
    end

    for _, prefix in ipairs(OLD_PREFIXES) do
        local handle = StartFindKvp(prefix)

        if handle ~= -1 then
            while true do
                local key = FindKvp(handle)

                if not key then break end

                add(key)
            end

            EndFindKvp(handle)
        end
    end

    for _, key in ipairs(OLD_KEYS) do
        if try(GetResourceKvpString, key) ~= nil then
            add(key)
        end
    end

    return entries
end

local function finish()
    busy = false
    pendingLookups = nil
end

local function restore()
    if busy then return end

    local entries = collect()

    if #entries == 0 then
        plugin:Notify('warning', 'No old vMenu saves were found on this computer.')
        return
    end

    busy = true

    pendingLookups = function(lookups)
        if not lookups then
            plugin:Notify('warning', 'Please wait a few seconds before trying again.')
            finish()
            return
        end

        plugin.RootMenu:Close()

        SendNUIMessage({ action = 'open', resource = RESOURCE, entries = entries, lookups = lookups, docsUrl = Config.DocsToolUrl })
        SetNuiFocus(true, true)
    end

    local waitingFor = pendingLookups

    SetTimeout(20000, function()
        if pendingLookups == waitingFor then
            plugin:Notify('error', 'The server did not answer. Try again in a moment.')
            finish()
        end
    end)

    TriggerServerEvent(EVENT .. 'lookups')
end

RegisterNetEvent(EVENT .. 'lookups', function(lookups)
    local answer = pendingLookups

    if answer then
        pendingLookups = function() end
        answer(lookups)
    end
end)

RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)

    if type(data) == 'table' and data.copied then
        plugin:Notify('success', 'Code copied. Paste it in vMenu > Misc Settings > Import & Export > Paste A Code.', 10000)
    end

    finish()
    cb('ok')
end)

plugin.RootMenu:AddButton('Restore My Old vMenu Saves', {
    Description = 'Finds everything the old vMenu saved on this computer (vehicles, peds, characters, loadouts and settings) and turns it into a code you paste into vMenu once. The screen also links the online tool from vMenu, if you prefer to pick what to keep item by item.',
}):OnSelected(restore)

plugin:Connect(function() end)
