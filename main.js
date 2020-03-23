var fs = require('fs');
var path = require('path');
var http = require('http');
var expapp = require('express')();
var server = http.createServer(expapp);
var argv = require('minimist')(process.argv.slice(1));
var superagent = require('superagent');
var RED = require('node-red');
var util = require('@node-red/util').util;
var { app, BrowserWindow, shell, Menu, Tray, nativeTheme, powerSaveBlocker, crashReporter } = require('electron');
var update = require('update-electron-app');
var log = require('electron-log');
Object.assign(console, log.functions);
if (!argv.noupdate) { update({ logger: log }); }

var port = argv.port || argv.p || 1880;
var settings = {
    httpNodeRoot: '/',
    flowFilePretty: true,
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

var win;
var notifyUpdate = function () {
    var packageInfo = fs.readFileSync('./package.json');
    var packageVersion = JSON.parse(packageInfo).version;
    var url = 'https://api.github.com/repos/node-red/node-red-nodegen/releases/latest';
    superagent.get(url).set('User-Agent', "Node-RED").end(function (err, res) {
        if (!err) {
            var tag_name = JSON.parse(res.text).tag_name;
            if (tag_name !== packageVersion) {
                var message = 'New version ' + tag_name + ' has been released.';
                var button = 'Download';
                var url = 'https://github.com/kazuhitoyokoi/node-red-standalone/releases';
                var code = 'RED.notify("' + message + '",{buttons:[{text:"' + button + '",class:"primary",click:function(){window.open("' + url + '")}}]})';
                win.webContents.executeJavaScript(code);
            } else { console.log('no update: ' + tag_name); }
        } else { console.log(err); }
    });
};

var createWindow = function () {
    Menu.setApplicationMenu(new Menu());
    win = new BrowserWindow({ titleBarStyle: 'hidden', frame: (process.platform !== 'darwin'), kiosk: argv.kiosk });
    if (argv.kiosk) { powerSaveBlocker.start('prevent-display-sleep'); }
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
            label: 'Toggle Maximize', accelerator: 'F9',
            click: function () {
                if (win.isMaximized()) { win.setSize(800, 600); } else { win.maximize(); }
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
    } else {
        win.webContents.on('did-finish-load', function () {
            win.webContents.insertCSS('#red-ui-header { -webkit-app-region: drag; }');
            win.webContents.insertCSS('#red-ui-header > ul { -webkit-app-region: no-drag; }');
            setTimeout(notifyUpdate, 10000);
        });
        win.loadURL('http://localhost:' + port + settings.httpAdminRoot);
    }
    app.on('second-instance', function () {
        if (win.isMinimized()) { win.restore(); }
        win.focus();
    });
};

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    RED.init(server, settings);
    if (!argv.production) { expapp.use(settings.httpAdminRoot, RED.httpAdmin); }
    expapp.use(settings.httpNodeRoot, RED.httpNode);
    server.listen(port);
    RED.start().then(function () {
        if (!argv.development && !argv.production) {
            app.whenReady().then(createWindow);
        } else {
            var tray = new Tray('build/icon@2x.png');
            var template = [{ label: 'Quit', role: 'quit' }];
            if (argv.development) {
                template.unshift({ label: 'Node-RED', click: function () { shell.openExternal('http://localhost:' + port); } });
            }
            tray.setContextMenu(Menu.buildFromTemplate(template));
            if (process.platform === 'darwin') { app.dock.hide(); }
        }
    });
    crashReporter.start({ companyName: 'YourCompany', submitURL: 'https://your-domain.com/url-to-submit', uploadToServer: true });
}
