'use strict'

import { app, BrowserWindow } from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
// let loginWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    show: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)
  mainWindow.maximize()
  mainWindow.show()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// loginWindow = new BrowserWindow({
//   width: 800,
//   height: 600
// })
// loginWindow.loadURL('https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F')
// loginWindow.webContents.on('did-navigate', (event, url) => {
//   console.log('did-navigate=================>', url)
//   if (url !== 'https://www.jd.com/') {
//     return
//   }
//   session.defaultSession.cookies.get({}, cookies => {
//     console.log('did-navigate cookies=================>', cookies)
//     mainWindow.webContents.send('cookies-obtained', cookies)
//   })
//   mainWindow.webContents.session.cookies.get({}, cookies => {
//     console.log('did-navigate webContents cookies=================>', cookies)
//     mainWindow.webContents.send('cookies-obtained', cookies)
//   })
//   // ipcMain.on('request-cookies', event => {
//   //   session.defaultSession.cookies.get({}, cookies => {
//   //     event.reply('response-cookies', cookies)
//   //   })
//   // })
// })
// })
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
