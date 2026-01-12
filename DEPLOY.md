# GitHub Pages 部署指南

## 📋 部署前准备

1. **确保所有文件已提交**：
   ```bash
   git add .
   git commit -m "准备部署到GitHub Pages"
   ```

2. **检查文件结构**：
   确保以下文件在项目根目录：
   - `index.html`
   - `game.js`
   - `style.css`
   - `manifest.json`
   - `sw.js`
   - `Assets/` 文件夹（包含所有图片）

## 🚀 部署步骤

### 方法一：使用GitHub Actions（自动部署，推荐）

1. **创建GitHub仓库**（如果还没有）：
   - 访问 https://github.com/new
   - 创建新仓库（可以是公开或私有）

2. **推送代码到GitHub**：
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

3. **启用GitHub Pages**：
   - 进入仓库 Settings
   - 左侧菜单选择 Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

4. **自动部署**：
   - 每次推送到 `main` 分支会自动部署
   - 部署完成后，访问：`https://你的用户名.github.io/仓库名/`

### 方法二：手动部署（传统方式）

1. **推送代码到GitHub**（同上）

2. **启用GitHub Pages**：
   - 进入仓库 Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 或 "master"
   - Folder 选择 "/ (root)"
   - 点击 Save

3. **等待部署完成**：
   - 通常需要1-2分钟
   - 访问：`https://你的用户名.github.io/仓库名/`

## ⚠️ 重要提示

### 路径问题

GitHub Pages有两种情况：

1. **用户/组织页面** (`username.github.io`)：
   - 路径是根路径 `/`
   - 当前配置可以直接使用

2. **项目页面** (`username.github.io/repository-name`)：
   - 路径是子路径 `/repository-name/`
   - 需要调整路径配置

### 如果是项目页面，需要修改：

**修改 `manifest.json`**：
```json
{
  "start_url": "/repository-name/",
  "scope": "/repository-name/"
}
```

**修改 `sw.js` 中的路径**（添加仓库名前缀）：
```javascript
const urlsToCache = [
  '/repository-name/',
  '/repository-name/index.html',
  // ... 其他路径也要加前缀
];
```

**修改 `game.js` 中的Service Worker注册**：
```javascript
navigator.serviceWorker.register('/repository-name/sw.js', { scope: '/repository-name/' })
```

## 🔧 创建自动路径配置（推荐）

为了避免每次都要手动修改，可以创建一个配置脚本：

```javascript
// config.js
const REPO_NAME = 'repository-name'; // 修改为你的仓库名
const BASE_PATH = REPO_NAME ? `/${REPO_NAME}` : '';

// 在HTML中引入
// <script src="config.js"></script>
```

## 📱 测试部署

部署完成后：

1. **访问你的GitHub Pages地址**
2. **测试PWA安装**：
   - 使用Chrome/Edge访问
   - 检查是否可以安装
   - 测试离线功能

3. **检查控制台**：
   - 按F12打开开发者工具
   - 查看是否有错误

## 🐛 常见问题

### 问题1：页面404

**解决**：确保 `index.html` 在仓库根目录

### 问题2：图片无法加载

**解决**：检查 `Assets/` 文件夹路径是否正确

### 问题3：Service Worker无法注册

**解决**：
- GitHub Pages使用HTTPS，应该可以正常注册
- 检查 `sw.js` 路径是否正确
- 清除浏览器缓存重试

### 问题4：PWA无法安装

**解决**：
- 访问 `https://你的用户名.github.io/仓库名/check-pwa.html` 进行诊断
- 确保所有图标文件存在
- 检查manifest.json配置

## ✅ 部署检查清单

- [ ] 所有文件已推送到GitHub
- [ ] GitHub Pages已启用
- [ ] 网站可以正常访问
- [ ] 游戏可以正常运行
- [ ] 图片资源正常加载
- [ ] Service Worker可以注册
- [ ] PWA可以安装（可选）

## 🎉 完成！

部署成功后，你可以：
- 分享链接给朋友
- 在任何设备上访问
- 安装为PWA应用
- 离线游玩

祝你部署顺利！🎂
