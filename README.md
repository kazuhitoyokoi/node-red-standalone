# node-red-standalone

## Windows and macOS
- You can use Node-RED installer.

## Ubuntu with GUI
- chmod +x Node-RED-0.0.1.AppImage
- ./Node-RED-0.0.1.AppImage

## Ubuntu with CLI
- sudo apt update
- sudo apt install -y libx11-xcb-dev libxcomposite-dev libxcursor-dev libxdamage-dev libxi6 ibgdk-pixbuf2.0-0 libgtk-3-0 libasound2 xvfb
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
