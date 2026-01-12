# 🚀 快速部署到GitHub Pages

## 最简单的方法（3步完成）

### 步骤1：创建GitHub仓库

1. 访问 https://github.com/new
2. 输入仓库名称（例如：`cake-adventure`）
3. 选择 Public 或 Private
4. **不要**勾选"Initialize this repository with a README"
5. 点击 "Create repository"

### 步骤2：上传代码

在项目文件夹中运行：

```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 小蛋糕大冒险游戏"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 步骤3：启用GitHub Pages

1. 进入你的GitHub仓库
2. 点击 **Settings**（设置）
3. 左侧菜单选择 **Pages**
4. 在 **Source** 下拉菜单选择：
   - **GitHub Actions**（推荐，如果看到这个选项）
   - 或 **Deploy from a branch** > 选择 `main` > 选择 `/ (root)` > 点击 **Save**

### 步骤4：等待部署（1-2分钟）

部署完成后，访问：
```
https://你的用户名.github.io/仓库名/
```

## ⚙️ 配置路径（重要！）

### 如果是项目页面（username.github.io/repo-name）

需要修改 `config.js`：

```javascript
const GITHUB_PAGES_BASE = '/仓库名';  // 例如：'/cake-adventure'
```

### 如果是用户页面（username.github.io）

保持 `config.js` 为：
```javascript
const GITHUB_PAGES_BASE = '';
```

## ✅ 验证部署

1. 访问你的GitHub Pages地址
2. 游戏应该能正常运行
3. 测试PWA安装功能
4. 测试离线功能（关闭网络后刷新）

## 🐛 如果遇到问题

1. **页面404**：检查 `index.html` 是否在根目录
2. **图片不显示**：检查 `Assets/` 文件夹路径
3. **Service Worker错误**：检查 `config.js` 中的路径配置
4. **无法安装PWA**：访问 `check-pwa.html` 进行诊断

## 📝 后续更新

每次修改代码后：

```bash
git add .
git commit -m "更新说明"
git push
```

GitHub Actions会自动重新部署（如果使用GitHub Actions方式）。

## 🎉 完成！

现在你的游戏已经在线了，可以分享给任何人！
