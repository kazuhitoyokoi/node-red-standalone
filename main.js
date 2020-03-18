var path = require('path');
var http = require('http');
var expapp = require('express')();
var server = http.createServer(expapp);
var { app, BrowserWindow, shell, Menu, Tray, nativeTheme, autoUpdater, crashReporter } = require('electron');
var argv = require('minimist')(process.argv.slice(1));
var RED = require('node-red');
var util = require('@node-red/util').util;

var settings = {
    httpNodeRoot: '/',
    contextStorage: { memory: { module: 'memory' }, filesystem: { module: 'localfilesystem' } },
    editorTheme: { projects: { enabled: true } }
};

if (nativeTheme.shouldUseDarkColors) {
    settings.editorTheme.page = { css: path.join(__dirname, 'node_modules/@node-red-contrib-themes/midnight-red/theme.css') };
}

if (argv.production) {
    settings.httpAdminRoot = false;
} else if (argv.development) {
    settings.httpAdminRoot = '/';
} else {
    settings.httpAdminRoot = '/' + util.generateId();
}

RED.init(server, settings);
if (!argv.production) {
    expapp.use(settings.httpAdminRoot, RED.httpAdmin);
}
expapp.use(settings.httpNodeRoot, RED.httpNode);
var port = argv.port || argv.p || 1880;
server.listen(port);

function createWindow() {
    'use strict';
    Menu.setApplicationMenu(new Menu());
    var win = new BrowserWindow({ titleBarStyle: 'hidden', frame: (process.platform !== 'darwin') });
    win.maximize();
    var template = [{
        label: 'Node-RED',
        submenu: [ { label: 'About', role: 'about' }, { label: 'Quit', role: 'quit' } ]
    }, {
        label: 'View',
        submenu: [ { role: 'reload', accelerator: 'F5' }, { type: 'separator' },
                   { role: 'resetzoom' }, { role: 'zoomin' }, { role: 'zoomout' } ]
    }, {
        label: 'Window',
        submenu: [{
            label: 'Toggle Maximize',
            accelerator: 'F9',
            click: function () {
                if (win.isMaximized()) {
                    win.setSize(800, 600);
                } else {
                    win.maximize();
                }
            }
        },
        { role: 'togglefullscreen', accelerator: 'F11' },
        { type: 'separator' }, { role: 'toggledevtools', accelerator: 'F12' }]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    win.setMenuBarVisibility(false);

    win.webContents.on('new-window', function (event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    if (argv.dashboard) {
        win.loadURL('http://localhost:' + port + '/ui');
    } else if (argv.worldmap) {
        setTimeout(function () {
            win.loadURL('http://localhost:' + port + '/worldmap');
        }, 1000);
    } else {
        win.webContents.on('did-finish-load', function () {
            win.webContents.insertCSS('#red-ui-header { -webkit-app-region: drag; }');
            win.webContents.insertCSS('#red-ui-header > ul { -webkit-app-region: no-drag; }');
        });
        win.loadURL('http://localhost:' + port + settings.httpAdminRoot);
    }
}

RED.start().then(function () {
    'use strict';
    if (!argv.development && !argv.production) {
        app.whenReady().then(createWindow);
    }
});

if (process.platform === 'windows') {
    autoUpdater.setFeedURL('https://raw.githubusercontent.com/kazuhitoyokoi/node-red-standalone/master/autoupdater.json');
    setInterval(function () {
        console.log('checkForUpdates()');
        autoUpdater.checkForUpdates();
    }, 1000);
    autoUpdater.on('error', function (error) {
        console.log('error: ' + error);
    });
    autoUpdater.on('checking-for-update', function () {
        console.log('checking-for-update');
    });
    autoUpdater.on('update-available', function () {
        console.log('update-available');
    });
    autoUpdater.on('update-not-available', function () {
        console.log('update-not-available');
    });
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateURL) {
        console.log('update-downloaded' + ',' + event + ',' + releaseNotes +',' + releaseName + ',' + releaseDate + ',' +  updateURL);
    });
    autoUpdater.on('before-quit-for-update', function () {
        console.log('before-quit-for-update');
    });
}

crashReporter.start({ companyName: 'YourCompany', submitURL: 'https://your-domain.com/url-to-submit', uploadToServer: true });
