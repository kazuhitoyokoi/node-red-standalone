var fs = require('fs');
var puppeteer = require('puppeteer');

try {
    fs.mkdirSync('build');
} catch (e) {}

var url = 'https://nodered.org/about/resources/media/node-red-icon.svg';
puppeteer.launch().then(function (browser) {
    'use strict';
    browser.newPage().then(function (page) {
        page.setContent('<html><body><img width=512 height=512 src="' + url + '"></body></html>');
        page.$('img').then(function (img) {
            img.screenshot({path: 'build/icon.png', omitBackground: true}).then(function () {
                browser.close();
            });
        });
    });
});
