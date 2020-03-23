# node-red-standalone

## Windows and macOS
- After installing Node-RED, you can start Node-RED as applications.

## Ubuntu, Debian and Fedora with GUI
- chmod +x Node-RED-0.0.1.AppImage
- ./Node-RED-0.0.1.AppImage

## CLI using server mode
### Windows
-

### macOS
- /Applications/Node-RED.app/Contents/MacOS/Node-RED --development
-> Access http://localhost:1880 using web browser

### Ubuntu
- sudo apt update
- sudo apt install -y libx11-xcb-dev libxcomposite-dev libxcursor-dev libxdamage-dev libxi6 ibgdk-pixbuf2.0-0 libgtk-3-0 libasound2 xvfb
- sudo apt install -y libappindicator1
- export DISPLAY=':99.0'
- Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
- chmod +x Node-RED-0.0.1.AppImage
- ./Node-RED-0.0.1.AppImage --development
-> Access http://localhost:1880 using web browser

## For developers
- npm install -g windows-build-tools
  (Run the script from an administrative PowerShell in case of Windows)
- git clone https://github.com/kazuhitoyokoi/node-red-standalone.git
- cd node-red-standalone
- npm install
- npm run build
- npm start
- npm start -- --development
- npm start -- --production
- npm start -- --dashboard
- npm start -- --kiosk
