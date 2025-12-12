/**
 * WebSocket 游戏服务器
 * 处理房间管理、游戏同步、分数统计等
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = 8080;

// 房间管理
const rooms = new Map(); // roomCode -> Room
const players = new Map(); // playerId -> Player

// 房间类
class Room {
    constructor(roomCode, hostId) {
        this.roomCode = roomCode;
        this.hostId = hostId;
        this.players = new Map(); // playerId -> PlayerInfo
        this.gameState = null; // 游戏状态：null, 'waiting', 'playing', 'finished'
        this.gameData = null; // 游戏数据（棋盘、目标值等）
        this.scores = new Map(); // playerId -> score
        this.countdown = 180; // 3分钟倒计时
        this.countdownTimer = null;
    }

    addPlayer(playerId, playerName, ws) {
        const isHost = playerId === this.hostId;
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            ws: ws,
            isHost: isHost,
            ready: false,
            score: 0
        });
        this.scores.set(playerId, 0);
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.scores.delete(playerId);
    }

    getPlayerList() {
        return Array.from(this.players.values()).map(p => ({
            name: p.name,
            isHost: p.isHost,
            playerId: p.id,
            ready: p.ready,
            score: p.score
        }));
    }

    broadcast(message, excludePlayerId = null) {
        this.players.forEach((player, playerId) => {
            if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(message));
            }
        });
    }

    startGame() {
        if (this.gameState !== null) {
            return false; // 游戏已开始或已结束
        }

        if (this.players.size < 2) {
            return false; // 至少需要2个玩家
        }

        this.gameState = 'playing';
        
        // 生成游戏数据
        this.gameData = this.generateGameData();
        
        // 广播游戏开始
        this.broadcast({
            type: 'game_start',
            gameData: this.gameData
        });

        // 开始倒计时
        this.startCountdown();

        return true;
    }

    generateGameData() {
        // 生成8x8的棋盘，每个格子是1-9的随机数字
        const gridSize = 8;
        const grid = [];
        for (let row = 0; row < gridSize; row++) {
            grid[row] = [];
            for (let col = 0; col < gridSize; col++) {
                grid[row][col] = Math.floor(Math.random() * 9) + 1; // 1-9
            }
        }

        // 生成目标值（加法模式，范围20-100）
        const minTarget = 20;
        const maxTarget = 100;
        const targetSum = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;

        // 默认使用加法模式
        const operationMode = 'add';

        return {
            grid: grid,
            targetSum: targetSum,
            operationMode: operationMode,
            countdown: this.countdown
        };
    }

    startCountdown() {
        let remaining = this.countdown;
        
        // 每秒更新倒计时
        this.countdownTimer = setInterval(() => {
            remaining--;
            
            // 广播倒计时更新
            this.broadcast({
                type: 'countdown_update',
                timeRemaining: remaining
            });

            if (remaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateScore(playerId, score) {
        if (this.players.has(playerId)) {
            const player = this.players.get(playerId);
            player.score = score;
            this.scores.set(playerId, score);

            // 广播分数更新
            this.broadcast({
                type: 'score_update',
                scores: this.getScores()
            });
        }
    }

    getScores() {
        const scores = [];
        this.players.forEach((player, playerId) => {
            scores.push({
                playerId: playerId,
                name: player.name,
                score: player.score
            });
        });
        // 按分数排序
        return scores.sort((a, b) => b.score - a.score);
    }

    endGame() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }

        this.gameState = 'finished';

        // 广播游戏结束和排名
        const rankings = this.getScores();
        this.broadcast({
            type: 'game_end',
            rankings: rankings
        });
    }

    cleanup() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
    }
}

// 生成4位随机房间号
function generateRoomCode() {
    let code;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms.has(code));
    return code;
}

// 生成玩家ID
function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 创建HTTP服务器
const server = http.createServer();

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('New client connected:', req.socket.remoteAddress);
    
    let playerId = null;
    let roomCode = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data.type, data);

            switch (data.type) {
                case 'create_room':
                    handleCreateRoom(ws, data);
                    break;

                case 'join_room':
                    handleJoinRoom(ws, data);
                    break;

                case 'set_ready':
                    handleSetReady(ws, data);
                    break;

                case 'start_game':
                    handleStartGame(ws, data);
                    break;

                case 'submit_score':
                    handleSubmitScore(ws, data);
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected:', playerId);
        handleDisconnect(playerId, currentRoomCode);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    function handleCreateRoom(ws, data) {
        const roomCode = generateRoomCode();
        const hostId = generatePlayerId();
        playerId = hostId;
        
        // 创建房间
        const room = new Room(roomCode, hostId);
        rooms.set(roomCode, room);
        
        // 更新当前连接的房间号
        currentRoomCode = roomCode;
        
        // 添加房主到房间
        const playerName = data.playerName || 'Player ' + hostId.substr(-4);
        room.addPlayer(hostId, playerName, ws);
        players.set(hostId, { roomCode, ws });

        // 发送房间创建成功消息
        ws.send(JSON.stringify({
            type: 'room_created',
            roomCode: roomCode,
            playerId: hostId,
            isHost: true
        }));

        // 发送玩家列表更新
        ws.send(JSON.stringify({
            type: 'player_list_update',
            players: room.getPlayerList()
        }));

        console.log('Room created:', roomCode, 'Host:', hostId);
    }

    function handleJoinRoom(ws, data) {
        const roomCode = data.roomCode;
        
        if (!rooms.has(roomCode)) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Room not found'
            }));
            return;
        }

        const room = rooms.get(roomCode);
        
        if (room.gameState === 'playing' || room.gameState === 'finished') {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Game already started or finished'
            }));
            return;
        }

        const newPlayerId = generatePlayerId();
        playerId = newPlayerId;
        // 更新外部作用域的 currentRoomCode
        currentRoomCode = roomCode;
        
        // 添加玩家到房间
        const playerName = data.playerName || 'Player ' + newPlayerId.substr(-4);
        room.addPlayer(newPlayerId, playerName, ws);
        players.set(newPlayerId, { roomCode: roomCode, ws });

        // 发送加入成功消息
        ws.send(JSON.stringify({
            type: 'room_joined',
            roomCode: roomCode,
            playerId: newPlayerId,
            isHost: false,
            players: room.getPlayerList()
        }));

        // 广播玩家列表更新给所有玩家（包括房主和新加入的玩家）
        console.log('Broadcasting player list update to all players in room:', roomCode);
        room.broadcast({
            type: 'player_list_update',
            players: room.getPlayerList()
        });

        console.log('Player joined room:', roomCode, 'Player:', newPlayerId);
    }

    function handleSetReady(ws, data) {
        if (!playerId || !currentRoomCode) return;
        
        const room = rooms.get(currentRoomCode);
        if (!room || !room.players.has(playerId)) return;

        const player = room.players.get(playerId);
        player.ready = data.ready || false;

        // 广播玩家列表更新
        room.broadcast({
            type: 'player_list_update',
            players: room.getPlayerList()
        });
    }

    function handleStartGame(ws, data) {
        if (!playerId || !currentRoomCode) return;
        
        const room = rooms.get(currentRoomCode);
        if (!room) return;

        // 只有房主可以开始游戏
        if (room.hostId !== playerId) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Only host can start the game'
            }));
            return;
        }

        if (room.startGame()) {
            console.log('Game started in room:', roomCode);
        } else {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Cannot start game'
            }));
        }
    }

    function handleSubmitScore(ws, data) {
        if (!playerId || !currentRoomCode) return;
        
        const room = rooms.get(currentRoomCode);
        if (!room || room.gameState !== 'playing') return;

        const score = data.score || 0;
        room.updateScore(playerId, score);
    }

    function handleDisconnect(disconnectedPlayerId, disconnectedRoomCode) {
        if (!disconnectedPlayerId) return;

        players.delete(disconnectedPlayerId);

        if (disconnectedRoomCode && rooms.has(disconnectedRoomCode)) {
            const room = rooms.get(roomCode);
            room.removePlayer(playerId);

            // 如果房主离开，选择新的房主或关闭房间
            if (room.hostId === playerId) {
                if (room.players.size > 0) {
                    // 选择第一个玩家作为新房主
                    const newHostId = room.players.keys().next().value;
                    room.hostId = newHostId;
                    const newHost = room.players.get(newHostId);
                    newHost.isHost = true;

                    // 通知新房主
                    if (newHost.ws.readyState === WebSocket.OPEN) {
                        newHost.ws.send(JSON.stringify({
                            type: 'host_transferred',
                            isHost: true
                        }));
                    }
                } else {
                    // 房间为空，删除房间
                    room.cleanup();
                    rooms.delete(roomCode);
                    console.log('Room deleted:', roomCode);
                }
            }

            // 广播玩家列表更新
            if (room.players.size > 0) {
                room.broadcast({
                    type: 'player_list_update',
                    players: room.getPlayerList()
                });
            }
        }
    }
});

server.listen(PORT, () => {
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
    console.log('Server ready for connections');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    rooms.forEach((room) => room.cleanup());
    wss.close(() => {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});

