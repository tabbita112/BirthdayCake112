# PWA安装问题排查指南

如果Chrome显示"无法安装"，请按照以下步骤排查：

## 🔍 快速诊断

1. **打开诊断工具**：
   - 访问 `http://localhost:8000/check-pwa.html`
   - 查看各项检查结果

## 常见问题及解决方案

### 问题1: "此网站无法安装为应用"

**原因**：Service Worker未正确注册或manifest.json有问题

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 进入 Application > Service Workers
3. 检查Service Worker状态
4. 如果有错误，点击"Unregister"清除
5. 刷新页面重新注册

### 问题2: "缺少必需的图标"

**解决方法**：
- 确保 `Assets/icon-192.png` 和 `Assets/icon-512.png` 存在
- 图标必须是PNG格式
- 尺寸必须精确（192x192和512x512）

### 问题3: "需要使用HTTPS"

**解决方法**：
- 使用 `localhost` 或 `127.0.0.1` 访问（不需要HTTPS）
- 如果使用IP地址，需要HTTPS
- 可以使用 `ngrok` 或类似工具创建HTTPS隧道

### 问题4: Service Worker注册失败

**解决方法**：
1. 检查 `sw.js` 文件是否存在
2. 检查浏览器控制台错误信息
3. 确保使用绝对路径 `/sw.js` 而不是 `./sw.js`
4. 清除浏览器缓存后重试

## 📱 手动安装步骤

### Chrome/Edge（桌面）

1. 访问网页
2. 点击地址栏右侧的"安装"图标（如果显示）
3. 或通过菜单：更多工具 > 创建快捷方式 > 勾选"作为窗口打开"

### Chrome（Android）

1. 使用Chrome浏览器访问
2. 点击右上角菜单（三个点）
3. 选择"添加到主屏幕"
4. 确认安装

### Safari（iOS）

1. 使用Safari浏览器访问
2. 点击分享按钮（方框+箭头）
3. 选择"添加到主屏幕"
4. 确认安装

## 🔧 调试步骤

1. **清除所有缓存**：
   - Chrome: F12 > Application > Clear storage > Clear site data

2. **检查Manifest**：
   - F12 > Application > Manifest
   - 查看是否有错误

3. **检查Service Worker**：
   - F12 > Application > Service Workers
   - 查看注册状态和错误信息

4. **检查控制台**：
   - F12 > Console
   - 查看是否有错误信息

## ✅ 验证安装成功

安装成功后，你应该能够：
- 在应用列表中看到"小蛋糕大冒险"
- 离线运行应用（关闭网络后仍能使用）
- 以独立窗口运行（没有浏览器地址栏）

## 🆘 仍然无法安装？

如果以上方法都不行，请：
1. 打开诊断工具：`http://localhost:8000/check-pwa.html`
2. 截图所有检查结果
3. 检查浏览器控制台的错误信息
4. 确认使用的是Chrome、Edge或Firefox最新版本
