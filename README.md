# 📚 Length English - 英语分级学习小程序

[![GitHub stars](https://img.shields.io/github/stars/shimingfa1993/LengthEnglish.svg?style=social&label=Star)](https://github.com/shimingfa1993/LengthEnglish)
[![GitHub forks](https://img.shields.io/github/forks/shimingfa1993/LengthEnglish.svg?style=social&label=Fork)](https://github.com/shimingfa1993/LengthEnglish)
[![GitHub license](https://img.shields.io/github/license/shimingfa1993/LengthEnglish.svg)](https://github.com/shimingfa1993/LengthEnglish/blob/main/LICENSE)

一个基于uni-app开发的智能英语学习小程序，通过单词长度分级和考研词汇优先策略，结合百度翻译API，为用户提供个性化的英语学习体验。

## ✨ 功能特色

### 🔥 核心功能
- **🌐 智能翻译**：集成百度翻译API，提供准确的中英互译服务
- **📖 单词详情**：音标、释义、真实场景例句一应俱全
- **📏 按长度学习**：1-10字母单词分级，循序渐进掌握词汇
- **🎯 考研优先**：智能识别并优先显示考研高频词汇，标有"常用"徽章
- **🎵 语音支持**：单词和例句发音功能，纯正英语发音
- **📋 一键复制**：支持例句复制到剪贴板，便于收藏学习

### 📚 学习模式
- **分级词汇库**：超过10000+单词，按长度科学分类
- **真实例句**：来自百度翻译的真实语境例句，告别模板化学习
- **动态加载**：智能加载更多例句，丰富学习内容
- **考研加强**：基于考研英语大纲和历年真题的词汇优化

### 🎨 用户体验
- **现代化UI**：渐变色彩、圆角设计、流畅动画
- **响应式布局**：完美适配各种屏幕尺寸
- **智能反馈**：实时加载状态、错误提示、成功反馈
- **版本管理**：完整的Git版本控制，持续迭代优化

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **uni-app** | Vue 3 | 跨平台开发框架 |
| **百度翻译API** | v2 | 专业翻译服务 |
| **SCSS** | - | 样式预处理器 |
| **crypto-js** | ^4.1.1 | API签名加密 |
| **微信开发者工具** | latest | 开发调试工具 |
| **Git** | - | 版本控制 |

## 🚀 快速开始

### 📋 环境准备
1. **开发工具**：[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 或 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. **API密钥**：注册 [百度翻译开放平台](https://fanyi-api.baidu.com/) 获取API密钥
3. **Node.js**：建议 v14+ 版本

### 📦 安装依赖
```bash
# 克隆项目
git clone https://github.com/shimingfa1993/LengthEnglish.git

# 进入项目目录
cd LengthEnglish

# 安装依赖
npm install
```

### 🔧 配置API密钥
在 `utils/baiduTranslate.js` 中配置您的百度翻译API密钥：
```javascript
// 请替换为您的真实API密钥
const APP_ID = '20250708002400959';      // 您的APP ID
const SECRET_KEY = 'V1ot7I2zVu2xKtbzb7id';  // 您的密钥
```

### 🏃‍♂️ 运行项目
1. **使用微信开发者工具**：
   - 打开微信开发者工具
   - 选择"小程序"项目
   - 导入项目目录
   - 点击"编译"运行

2. **配置网络域名**（正式发布需要）：
   ```
   request合法域名：
   - https://fanyi-api.baidu.com
   - https://api.dictionaryapi.dev
   - https://api.datamuse.com
   ```

## 📁 项目结构

```
LengthEnglish/
├── 📄 README.md                    # 项目说明文档
├── 📄 manifest.json               # uni-app配置文件
├── 📄 pages.json                  # 页面路由配置
├── 📄 package.json                # 依赖管理
├── 📄 project.config.json         # 微信小程序配置
├── 📄 网络配置说明.md               # 网络域名配置指南
├── 📁 pages/                      # 页面文件
│   ├── 📁 index/                  # 🏠 首页 - 翻译功能
│   │   └── 📄 index.vue
│   ├── 📁 wordlist/               # 📝 单词列表 - 按长度分类
│   │   └── 📄 index.vue
│   ├── 📁 worddetail/             # 📖 单词详情 - 详细信息
│   │   └── 📄 index.vue
│   └── 📁 translate/              # 🌐 翻译页面 - 完整翻译
│       └── 📄 index.vue
├── 📁 utils/                      # 工具库
│   ├── 📄 baiduTranslate.js       # 🔗 百度翻译API封装
│   └── 📄 commonWords.js          # 📚 10000+常用词汇库
├── 📁 static/                     # 静态资源
│   └── 📄 logo.png
└── 📁 unpackage/                  # 编译输出（忽略）
```

## 🎯 功能详情

### 🏠 首页功能
- **快速翻译**：中英互译，支持长文本
- **导航入口**：快速进入单词学习和完整翻译

### 📝 单词列表
- **分级展示**：1-10字母单词分类显示
- **考研优先**：考研词汇带有"常用"标识优先显示
- **智能排序**：常用词汇在前，学习更高效

### 📖 单词详情
- **百度翻译**：权威中文释义
- **真实例句**：来自百度翻译的真实语境例句
- **发音功能**：单词和例句语音播放
- **一键复制**：例句复制功能，便于收藏
- **加载更多**：动态获取更多例句

### 🌐 翻译页面
- **专业翻译**：基于百度翻译API
- **历史记录**：翻译历史本地存储
- **语言切换**：中英文一键切换
- **复制朗读**：翻译结果复制和语音播放

## 📊 数据统计

| 指标 | 数量 | 说明 |
|------|------|------|
| **总词汇量** | 10,000+ | 涵盖1-10字母所有长度 |
| **考研词汇** | 5,500+ | 基于考研英语大纲 |
| **例句来源** | 百度翻译 | 真实语境，动态获取 |
| **支持平台** | 微信小程序 | 可扩展到H5、App |

## 🎨 界面预览

- **现代化设计**：渐变色彩、圆角元素、阴影效果
- **响应式布局**：完美适配手机、平板各种尺寸
- **交互动画**：流畅的加载动画和状态转换
- **用户友好**：清晰的视觉层次和操作反馈

## 📈 开发计划

### 🚧 进行中
- [x] ✅ 百度翻译API集成
- [x] ✅ 考研词汇库扩充
- [x] ✅ 真实例句功能
- [x] ✅ Git版本管理

### 🔮 计划中
- [ ] 🔖 单词收藏功能
- [ ] 📊 学习进度跟踪
- [ ] 🎮 单词测试模式
- [ ] 📱 离线下载支持
- [ ] 📈 学习数据统计
- [ ] 🏆 成就系统
- [ ] 👥 社交分享功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 🐛 报告问题
- 使用 [GitHub Issues](https://github.com/shimingfa1993/LengthEnglish/issues) 报告bug
- 详细描述问题复现步骤
- 提供错误截图或日志

### 💡 功能建议
- 通过 Issues 提出新功能建议
- 描述功能的使用场景和价值

### 🔧 代码贡献
1. Fork 项目到您的GitHub
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 👥 贡献者

感谢所有为这个项目做出贡献的开发者！

## 📞 联系方式

- **项目地址**：https://github.com/shimingfa1993/LengthEnglish
- **问题反馈**：[GitHub Issues](https://github.com/shimingfa1993/LengthEnglish/issues)
- **功能建议**：[GitHub Discussions](https://github.com/shimingfa1993/LengthEnglish/discussions)

---

⭐ 如果这个项目对您有帮助，请给它一个星星！Star支持是我们持续改进的动力。

📚 让我们一起打造更好的英语学习体验！ 