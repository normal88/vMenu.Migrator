Config = {}

-- IMPORTANT: this resource's FOLDER NAME must be exactly the name your old vMenu ran under (usually "vMenu").
-- FiveM only lets a resource read the saves stored under its own name, so the folder name is what
-- decides whose saves this plugin can see. On FiveM Legacy those saves are shared by every server the
-- player ever played on, so one restore brings over everything they saved with the old vMenu.
-- This does not work on FiveM Enhanced, which keeps its saves somewhere else.

-- Folder/resource name of vMenu Enhanced on your server.
-- The conversion reads ped-models.json, weapons.json and weapon-components.json from its config folder,
-- so peds, weapons and attachments are matched against what your server actually has.
Config.vMenuResource = 'vMenu.Enhanced'

-- Seconds a player has to wait between two restores. Stops the button from being spammed.
Config.Cooldown = 10

-- Link to vMenu's own online import tool, shown on the restore screen for players who prefer it.
-- That tool lets them edit, merge and compare their saves and pick exactly what to keep, item by item,
-- without overwriting saves they already made in vMenu Enhanced.
Config.DocsToolUrl = 'https://docs.vespura.com/vmenu/enhanced/old-vmenu-import/'
