var fs = require('fs');
var path = require('path');
var request = require('request');

var settings = [
    {
        from: 'https://nodered.org/about/resources/media/node-red-icon.svg',
        to: path.join(__dirname, '../build/icon.svg')
    }, {
        from: 'https://nodered.org/about/resources/media/node-red-icon.png',
        to: path.join(__dirname, '../build/icon.png')
    }
];

try {
    fs.mkdirSync(path.join(__dirname, '../build'));
} catch (e) {}

for (var i = 0; i < settings.length; i++) {
    request.get(settings[i].from).pipe(fs.createWriteStream(settings[i].to));
}
