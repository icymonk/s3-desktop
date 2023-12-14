import { app, dialog, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.ROOT = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, 'public')
  : path.join(process.env.ROOT, '.output/public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow
const preload = path.join(process.env.DIST, 'preload.js')

function bootstrap() {
  win = new BrowserWindow({
    darkTheme: true,
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    Store.initRenderer()
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    Store.initRenderer()
    win.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
  }
}

function checkUpdate() {
  console.log('checkUpdate')
  autoUpdater.checkForUpdatesAndNotify()
}

app.whenReady().then(bootstrap).then(checkUpdate)

app.on('activate', () => {
  if (win === null) {
    bootstrap()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() })
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

/* Updater ======================================================*/
autoUpdater.requestHeaders = { 'PRIVATE-TOKEN': 'Personal access Token' }
autoUpdater.autoDownload = true

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'icymonk',
  releaseType: 'release',
  publishAutoUpdate: true,
})

autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...')
})

autoUpdater.on('update-available', () => {
  log.info('업데이트가 가능합니다.')
  win.webContents.send('update_available')
})

autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.')
})

autoUpdater.on('error', (err) => {
  log.info('에러가 발생하였습니다. 에러내용 : ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = '다운로드 속도: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%'
  log_message =
    log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  log.info(log_message)
})

autoUpdater.on('update-downloaded', () => {
  // log.info('업데이트가 완료되었습니다.')
  // win.webContents.send('update-downloaded')

  dialog
    .showMessageBox(win, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'UPDATER',
      message: '프로그램 업데이트를 진행하시겠습니까?',
    })
    .then(function (res) {
      log.info(res.response.toString())

      // 위에 option.buttons의 Index = res.response
      if (res.response == 0) {
        log.info('프로그램 종료 및 업데이트')
        autoUpdater.quitAndInstall()
      } else {
        log.info('프로그램 업데이트 안함')
      }
    })
})
