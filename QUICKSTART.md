# 快速启动指南

## 运行项目

由于使用了 ES6 模块，需要通过 HTTP 服务器运行，不能直接打开 HTML 文件。

### 方法 1: 使用 Python (推荐)

```powershell
# Python 3
python -m http.server 8000

# 然后在浏览器访问
# http://localhost:8000/index.html
```

### 方法 2: 使用 Node.js http-server

```powershell
# 安装 http-server (如果未安装)
npm install -g http-server

# 运行服务器
http-server -p 8000

# 然后在浏览器访问
# http://localhost:8000/index.html
```

### 方法 3: 使用 VS Code Live Server

1. 安装 VS Code 的 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 项目对比

- **index.html**: 重构后的模块化版本（推荐使用）
- **number-maze.html**: 原始单文件版本（保留作为参考）

## 浏览器要求

- 支持 ES6 模块的现代浏览器
- Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

