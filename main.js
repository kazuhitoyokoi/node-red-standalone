var path = require('path');
var RED = require('node-red');
var http = require('http');
var expapp = require('express')();
var server = http.createServer(expapp);
var { app, BrowserWindow, shell, Menu, Tray, nativeTheme, autoUpdater, crashReporter } = require('electron');
var argv = require('minimist')(process.argv.slice(1));
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
    win.webContents.on('new-window', function (event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });
    win.webContents.on('did-finish-load', function () {
        win.webContents.insertCSS('#red-ui-header { -webkit-app-region: drag; }');
        win.webContents.insertCSS('#red-ui-header > ul { -webkit-app-region: no-drag; }');
    });
    win.maximize();
    win.loadURL('http://localhost:' + port + settings.httpAdminRoot);
    var template = [{
        label: 'Node-RED',
        submenu: [{
            label: 'Reload',
            accelerator: 'F5',
            click: function () { win.webContents.reload(); }
        }, {
            label: 'Full screen',
            accelerator: 'F11',
            click: function () { win.setFullScreen(!win.isFullScreen()); }
        }, {
            label: 'Maximize',
            accelerator: 'F9',
            click: function () {
                if (win.isMaximized()) {
                    win.setSize(800, 600);
                } else {
                    win.maximize();
                }
            }
        }, {
            label: 'Developer tools',
            accelerator: 'F12',
            click: function () { win.webContents.openDevTools(); }
        }, { label: 'Quit', role: 'quit' }]
    }];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    win.setMenuBarVisibility(false);
}

RED.start().then(function () {
    'use strict';
    if (!argv.development && !argv.production) {
        app.whenReady().then(createWindow);
    }
});

autoUpdater.setFeedURL('https://raw.githubusercontent.com/kazuhitoyokoi/node-red-standalone/master/autoupdater.json');
autoUpdater.checkForUpdates();

crashReporter.start({ companyName: 'YourCompany', submitURL: 'https://your-domain.com/url-to-submit', uploadToServer: true });
