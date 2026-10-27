# vMenu Migrator

A vMenu Enhanced plugin that lets a player bring their saves from the original vMenu (v3.9.2 and older) over to vMenu Enhanced from inside the game. They don't need to close FiveM, find the `kvs` folder or visit a website.

## How a player uses it

1. Open `vMenu > Plugins > Restore Old vMenu Data` and press **Restore My Old vMenu Saves**.
2. A screen lists what was found (vehicles, peds, characters, loadouts, settings) and anything that could not be brought over.
3. Press **Copy Code**, then paste it in `vMenu > Misc Settings > Import & Export > Paste A Code`.

Pasting it twice does no harm.

## How it works

- **Reading the old saves.** FiveM only lets a resource read the saves stored under its own name. This resource is therefore named exactly like the old vMenu, `vMenu`, which lets it read everything the old vMenu saved on the player's computer. On FiveM Legacy those saves are shared by every server the player has played on.
- **Converting them.** The saves are turned into a vMenu Enhanced transfer code by vMenu's own converter. It is the same code as the [Import Saved Data From Old vMenu](https://docs.vespura.com/vmenu/enhanced/old-vmenu-import/) page, copied unchanged into `ui/convert/`.
- **Matching your server.** Ped, weapon and attachment names are matched against your server's `vMenu.Enhanced/config` files.
- **Nothing changes on the player's computer.** The old saves are only read, never changed or deleted.

## Install

```
# resources.cfg, after vMenu.Enhanced
ensure vMenu
```

- **Folder name.** The folder **must** be named exactly what your old vMenu ran under, which is usually `vMenu`. Any other name finds nothing.
- **FiveM Legacy only.** FiveM Enhanced keeps saves in a different place, so there is nothing for this plugin to read there.
- **Folder name on GitHub.** This repo is called `vMenu.Migrator`, but on your server the folder must be renamed to `vMenu` (or whatever your old vMenu ran under).

## Credits

`ui/convert/*.js` is from vMenu Enhanced's docs, Copyright (C) 2017-2026 Tom Grobbe, GPL-3.0-or-later. `vmenu.lua` is vMenu Enhanced's Lua plugin API.
