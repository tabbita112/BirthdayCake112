# 小蛋糕大冒险 - App打包指南

这个项目支持两种方式打包成App：

## 方式一：PWA（Progressive Web App）- 推荐

PWA是最简单的方式，可以让网页应用像原生App一样运行。

### 使用步骤：

1. **准备图标文件**（可选，如果已有可跳过）：
   - 在 `Assets` 文件夹中放置以下图标：
     - `icon-192.png` (192x192像素)
     - `icon-512.png` (512x512像素)

2. **部署到服务器**：
   - 将整个项目上传到Web服务器（如GitHub Pages、Netlify、Vercel等）
   - 或者使用本地服务器（如 `python -m http.server` 或 `npx serve`）

3. **安装为App**：
   - **桌面浏览器（Chrome/Edge）**：
     - 访问网页
     - 点击地址栏右侧的"安装"图标
     - 或通过菜单：更多工具 > 创建快捷方式 > 勾选"作为窗口打开"
   
   - **移动设备（Android）**：
     - 使用Chrome浏览器访问
     - 点击菜单 > "添加到主屏幕"
   
   - **移动设备（iOS）**：
     - 使用Safari浏览器访问
     - 点击分享按钮 > "添加到主屏幕"

### 优点：
- ✅ 无需额外工具
- ✅ 跨平台（桌面和移动）
- ✅ 支持离线运行
- ✅ 自动更新

---

## 方式二：Electron（桌面应用）

使用Electron可以将网页打包成Windows、Mac、Linux桌面应用。

### 安装步骤：

1. **安装Node.js**（如果还没有）：
   - 访问 https://nodejs.org/ 下载安装

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **开发模式运行**：
   ```bash
   npm start
   ```

4. **打包应用**：
   ```bash
   # 打包所有平台
   npm run build
   
   # 只打包Windows
   npm run build:win
   
   # 只打包Mac
   npm run build:mac
   
   # 只打包Linux
   npm run build:linux
   ```

5. **打包结果**：
   - 打包后的文件在 `dist` 文件夹中
   - Windows: `.exe` 安装程序或便携版
   - Mac: `.dmg` 或 `.zip`
   - Linux: `.AppImage` 或 `.deb`

### 准备图标文件（可选）：

如果要自定义应用图标，需要在 `Assets` 文件夹中放置：
- Windows: `icon.ico`
- Mac: `icon.icns`
- Linux: `icon.png`

### 优点：
- ✅ 真正的桌面应用
- ✅ 可以分发安装包
- ✅ 更好的系统集成

---

## 快速开始（PWA）

最简单的方式是使用PWA：

1. 确保所有文件都在同一目录
2. 使用本地服务器运行（避免CORS问题）：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js的serve
   npx serve
   ```
3. 在浏览器中访问 `http://localhost:8000`
4. 按照上面的步骤安装为PWA

---

## 注意事项

- Service Worker需要HTTPS才能正常工作（本地localhost除外）
- 如果使用Electron，需要先运行 `npm install` 安装依赖
- 图标文件是可选的，没有图标也能正常运行，只是显示默认图标
