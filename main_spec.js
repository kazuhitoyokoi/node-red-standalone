var fs = require('fs');
var webdriverio = require('webdriverio');
var should = require('should');
var chromedriver = require('chromedriver');

var packageInfo = fs.readFileSync('./package.json');
var packageVersion = JSON.parse(packageInfo).version;
var binaryPath;
if (process.platform === 'win32') {
	// todo: add path
} else if (process.platform === 'linux') {
    binaryPath = './dist/Node-RED-' + packageVersion + '.AppImage';
} else if (process.platform === 'darwin') {
    binaryPath = './dist/mac/Node-RED.app/Contents/MacOS/Node-RED';
}

var options = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': { binary: binaryPath }
    }
};

describe('Node-RED', function () {
    before(function () {
        var args = ['--url-base=wd/hub', '--port=9515'];
        chromedriver.start(args);
    });

    after(function () {
        chromedriver.stop();
    });

    it('should have title', function (done) {
        this.timeout(60000);
        var client = webdriverio.remote(options);
        client.init().getTitle().then(function (title) {
            title.should.startWith('Node-RED');
            done();
        }).end();
    });
});
