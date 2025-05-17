# 大学生树洞 - 校园生活交流平台

这是一个基于Vue.js和LeanCloud开发的大学生树洞应用，旨在为大学生提供一个匿名或实名分享校园生活、学习经验和情感故事的平台。

## 项目特点

- 🌟 **匿名发布** - 保护用户隐私，自由表达想法
- 🔄 **实时互动** - 评论和点赞功能
- 🏷️ **标签分类** - 通过标签快速找到感兴趣的内容
- 📱 **响应式设计** - 完美适配各种设备
- 🔒 **用户认证** - 安全的账户系统

## 技术栈

- **前端框架**: Vue.js 3 + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **后端服务**: LeanCloud
- **部署平台**: Gitee Pages

## 本地开发

### 前提条件

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone https://gitee.com/your-username/university-tree-hole.git
cd university-tree-hole
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置LeanCloud

在 `src/utils/leancloud.js` 文件中，将LeanCloud的应用信息替换为你自己的：

```javascript
AV.init({
  appId: 'YOUR_APP_ID',
  appKey: 'YOUR_APP_KEY',
  serverURL: 'YOUR_SERVER_URL'
});
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

## 部署到Gitee Pages

### 构建项目

```bash
npm run build
# 或
yarn build
```

### 部署步骤

1. 将构建好的 `dist` 目录中的所有文件推送到你的Gitee仓库的特定分支（通常是 `gh-pages` 或 `master`）

2. 在Gitee仓库设置中启用Gitee Pages服务：
   - 进入你的仓库
   - 点击「服务」->「Gitee Pages」
   - 选择部署分支和目录
   - 点击「启动」按钮

3. 访问你的Gitee Pages网站（通常是 `https://username.gitee.io/repo-name`）

### 自动部署（可选）

你可以使用GitHub Actions或其他CI/CD工具实现自动部署。

## 项目结构

```
├── public/             # 静态资源
├── src/                # 源代码
│   ├── assets/         # 资源文件
│   ├── components/     # 组件
│   ├── layouts/        # 布局组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html          # HTML模板
├── package.json        # 项目依赖
└── vite.config.js      # Vite配置
```

## 功能列表

- 用户注册和登录
- 发布树洞内容（匿名/实名）
- 浏览树洞列表
- 查看树洞详情
- 评论互动
- 点赞功能
- 标签筛选
- 个人树洞管理

## 注意事项

- 本项目使用LeanCloud作为后端服务，需要自行注册LeanCloud账号并创建应用
- 部署到Gitee Pages时，由于是纯静态托管，所有数据交互都通过LeanCloud API进行
- 请确保在生产环境中正确配置LeanCloud的安全域名

## 许可证

MIT