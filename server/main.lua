local EVENT = GetCurrentResourceName() .. ':'

local FILES = {
    pedModels = 'config/ped-models.json',
    weapons = 'config/weapons.json',
    weaponComponents = 'config/weapon-components.json',
}

local lastRequest = {}

RegisterNetEvent(EVENT .. 'lookups', function()
    local src = source
    local now = os.time()

    if lastRequest[src] and now - lastRequest[src] < Config.Cooldown then
        TriggerClientEvent(EVENT .. 'lookups', src, nil)
        return
    end

    lastRequest[src] = now

    local lookups = {}

    for name, path in pairs(FILES) do
        lookups[name] = LoadResourceFile(Config.vMenuResource, path) or ''
    end

    TriggerLatentClientEvent(EVENT .. 'lookups', src, 200000, lookups)
end)

AddEventHandler('playerDropped', function()
    lastRequest[source] = nil
end)
