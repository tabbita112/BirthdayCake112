// GitHub Pages 路径配置
// 如果是用户/组织页面 (username.github.io)，设置为空字符串 ''
// 如果是项目页面 (username.github.io/repo-name)，设置为 '/repo-name'
const GITHUB_PAGES_BASE = ''; // 修改为你的仓库路径，例如：'/cake-adventure'

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GITHUB_PAGES_BASE };
}
