# 服务器启动说明

## 安装依赖

首先需要安装 Node.js（建议版本 14 或更高），然后安装项目依赖：

```bash
npm install
```

## 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

服务器将在 `ws://localhost:8080` 启动。

## 服务器功能

### 房间管理
- **创建房间**：生成4位随机房间号
- **加入房间**：通过房间号加入
- **玩家列表**：实时同步房间内玩家列表
- **房主管理**：房主可以开始游戏，房主离开时自动转移

### 游戏同步
- **棋盘生成**：服务器生成8x8棋盘，所有玩家使用相同棋盘
- **目标值同步**：所有玩家挑战相同的目标值
- **倒计时同步**：3分钟倒计时，服务器统一管理
- **分数同步**：实时同步所有玩家分数

### 游戏流程
1. 玩家创建或加入房间
2. 房主点击"Start Game"开始游戏
3. 所有玩家同时开始，使用相同的棋盘和目标值
4. 3分钟倒计时开始
5. 玩家实时提交分数
6. 时间到后，显示排名并结束游戏

## 消息协议

### 客户端 -> 服务器

#### 创建房间
```json
{
  "type": "create_room",
  "playerName": "Player Name"
}
```

#### 加入房间
```json
{
  "type": "join_room",
  "roomCode": "1234",
  "playerName": "Player Name"
}
```

#### 开始游戏（仅房主）
```json
{
  "type": "start_game",
  "roomCode": "1234"
}
```

#### 提交分数
```json
{
  "type": "submit_score",
  "roomCode": "1234",
  "playerId": "player_xxx",
  "score": 100
}
```

### 服务器 -> 客户端

#### 房间创建成功
```json
{
  "type": "room_created",
  "roomCode": "1234",
  "playerId": "player_xxx",
  "isHost": true
}
```

#### 加入房间成功
```json
{
  "type": "room_joined",
  "roomCode": "1234",
  "playerId": "player_xxx",
  "isHost": false,
  "players": [...]
}
```

#### 玩家列表更新
```json
{
  "type": "player_list_update",
  "players": [
    {
      "name": "Player Name",
      "isHost": true,
      "playerId": "player_xxx",
      "ready": false,
      "score": 0
    }
  ]
}
```

#### 游戏开始
```json
{
  "type": "game_start",
  "gameData": {
    "grid": [[1,2,3,...], ...],  // 8x8 二维数组
    "targetSum": 50,
    "operationMode": "add",
    "countdown": 180
  }
}
```

#### 倒计时更新
```json
{
  "type": "countdown_update",
  "timeRemaining": 120
}
```

#### 分数更新
```json
{
  "type": "score_update",
  "scores": [
    {
      "playerId": "player_xxx",
      "name": "Player Name",
      "score": 100
    }
  ]
}
```

#### 游戏结束
```json
{
  "type": "game_end",
  "rankings": [
    {
      "playerId": "player_xxx",
      "name": "Player Name",
      "score": 100
    }
  ]
}
```

## 注意事项

- 服务器默认端口为 8080，可在 `server.js` 中修改
- 房间在最后一个玩家离开后自动删除
- 游戏进行中不允许新玩家加入
- 房主离开时，自动将第一个玩家设为新房主

