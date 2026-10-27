fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'vMenu Migrator'
author 'Normal'
description 'vMenu Enhanced plugin: lets a player turn their old vMenu saves into a vMenu Enhanced transfer code with one button'
version '1.0.1'
license 'GPL-3.0-or-later'

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/app.js',
    'ui/migrate.js',
    'ui/convert/*.js',
}

shared_script 'config.lua'

client_scripts { 'vmenu.lua', 'client/main.lua' }

server_script 'server/main.lua'

dependency 'vMenu.Enhanced'
