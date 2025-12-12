# 如何启动服务器

## 问题：无法加入房间

如果遇到以下情况：
- 创建房间后，其他玩家无法加入
- 控制台显示 "WebSocket connection failed"
- 玩家列表不更新

**原因：服务器没有运行**

## 解决方案

### 1. 安装依赖（如果还没安装）

```bash
npm install
```

### 2. 启动服务器

在项目根目录下运行：

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 3. 确认服务器运行

看到以下输出表示服务器已启动：

```
WebSocket server running on ws://localhost:8080
Server ready for connections
```

### 4. 打开游戏

在浏览器中打开 `index.html`，现在应该可以正常创建和加入房间了。

## 注意事项

- 服务器必须在游戏运行前启动
- 服务器默认运行在 `ws://localhost:8080`
- 如果端口被占用，可以修改 `server.js` 中的 `PORT` 变量

## 测试多人游戏

1. 启动服务器：`npm start`
2. 打开第一个浏览器窗口，创建房间
3. 打开第二个浏览器窗口（或新标签页），加入房间
4. 两个窗口应该都能看到玩家列表
5. 房主可以看到"Start Game"按钮

