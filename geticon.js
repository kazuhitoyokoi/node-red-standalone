var fs = require('fs');
var puppeteer = require('puppeteer');
var url = 'https://nodered.org/about/resources/media/node-red-icon.svg';
var settings = [{ size: 512, output: 'build/icon.png' }, { size: 32, output: 'build/icon@2x.png' }];

try {
    fs.mkdirSync('build');
} catch (e) {}

var createIcon = function (size, output) {
    (async() => {
        var browser = await puppeteer.launch();
        var page = await browser.newPage();
        await page.setContent('<html><body><img width=' + size + ' height=' + size + ' src="' + url + '"></body></html>');
        var img = await page.$('img');
        await img.screenshot({ path: output, omitBackground: true });
        await browser.close();
    })();
};

for (var i = 0; i < settings.length; i++) {
    createIcon(settings[i].size, settings[i].output);
}
