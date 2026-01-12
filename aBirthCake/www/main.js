const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'Assets', 'icon.png'),
    title: '小蛋糕大冒险'
  });

  // 加载index.html
  win.loadFile('index.html');

  // 打开开发者工具（可选，发布时可以注释掉）
  // win.webContents.openDevTools();

  // 窗口关闭事件
  win.on('closed', () => {
    // 取消引用窗口对象
    app.quit();
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出应用程序
app.on('window-all-closed', () => {
  // 在macOS上，除非用户用Cmd + Q确定地退出，
  // 否则绝大部分应用程序及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
