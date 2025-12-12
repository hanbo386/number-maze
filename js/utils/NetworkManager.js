/**
 * 网络管理器
 * 处理房间加入、玩家同步、游戏状态同步等
 */
export class NetworkManager {
    constructor() {
        this.ws = null;
        this.roomCode = '';
        this.playerId = '';
        this.isConnected = false;
        this.isMockMode = false; // 初始化模拟模式标志
        this.callbacks = {
            onRoomCreated: null,
            onRoomJoined: null,
            onPlayerListUpdate: null,
            onGameStart: null,
            onGameEnd: null,
            onScoreUpdate: null,
            onCountdownUpdate: null,
            onError: null
        };
    }

    /**
     * 连接到服务器
     * @param {string} serverUrl - 服务器地址
     */
    connect(serverUrl = 'ws://localhost:8080') {
        try {
            this.ws = new WebSocket(serverUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to server');
                this.isConnected = true;
                this.isMockMode = false;
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.warn('⚠️ Server connection failed. Please make sure the server is running: npm start');
                // 不自动切换到模拟模式，等待用户启动服务器
            };

            this.ws.onclose = () => {
                console.log('Disconnected from server');
                this.isConnected = false;
                console.warn('⚠️ Connection closed. Please check if the server is running.');
                // 不自动切换到模拟模式
            };

            // 设置超时提示，但不自动切换模式
            setTimeout(() => {
                if (!this.isConnected && !this.isMockMode) {
                    console.warn('⚠️ Connection timeout. Server may not be running.');
                    console.warn('⚠️ Please start the server with: npm start');
                    console.warn('⚠️ Waiting for server connection...');
                }
            }, 3000);
        } catch (error) {
            console.error('Failed to connect:', error);
            console.warn('⚠️ Please start the server with: npm start');
            // 不自动切换到模拟模式
        }
    }

    /**
     * 使用模拟模式（用于开发测试）
     */
    useMockMode() {
        console.log('Using mock network mode');
        this.isConnected = true;
        this.isMockMode = true;
        // 模拟模式下的操作会立即返回成功
    }

    /**
     * 生成4位随机房间号
     * @returns {string} 4位数字字符串
     */
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * 处理服务器消息
     * @param {Object} message - 消息对象
     */
    handleMessage(message) {
        switch (message.type) {
            case 'room_created':
                this.roomCode = message.roomCode;
                this.playerId = message.playerId;
                if (this.callbacks.onRoomCreated) {
                    this.callbacks.onRoomCreated(message);
                }
                break;

            case 'room_joined':
                this.roomCode = message.roomCode;
                this.playerId = message.playerId;
                if (this.callbacks.onRoomJoined) {
                    this.callbacks.onRoomJoined(message);
                }
                break;

            case 'player_list_update':
                if (this.callbacks.onPlayerListUpdate) {
                    this.callbacks.onPlayerListUpdate(message.players);
                }
                break;

            case 'game_start':
                if (this.callbacks.onGameStart) {
                    this.callbacks.onGameStart(message.gameData);
                }
                break;

            case 'game_end':
                if (this.callbacks.onGameEnd) {
                    this.callbacks.onGameEnd(message.rankings);
                }
                break;

            case 'score_update':
                if (this.callbacks.onScoreUpdate) {
                    this.callbacks.onScoreUpdate(message.scores);
                }
                break;

            case 'countdown_update':
                if (this.callbacks.onCountdownUpdate) {
                    this.callbacks.onCountdownUpdate(message.timeRemaining);
                }
                break;

            case 'error':
                console.error('Server error:', message.message);
                break;

            case 'host_transferred':
                // 房主转移通知
                console.log('Host transferred');
                break;
        }
    }

    /**
     * 发送消息到服务器
     * @param {Object} message - 消息对象
     */
    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.log('Mock send:', message);
        }
    }

    /**
     * 创建房间
     */
    createRoom() {
        console.log('createRoom called, isMockMode:', this.isMockMode, 'isConnected:', this.isConnected);
        
        // 如果没有连接成功，自动使用模拟模式
        if (!this.isConnected || this.isMockMode) {
            console.log('Using mock mode to create room');
            this.isMockMode = true;
            // 模拟模式：立即生成房间号
            const roomCode = this.generateRoomCode();
            this.roomCode = roomCode;
            this.playerId = 'player_' + Date.now();
            
            console.log('Generated room code:', roomCode);
            
            // 模拟延迟后返回房间创建成功
            setTimeout(() => {
                console.log('Triggering onRoomCreated callback with:', { roomCode, playerId: this.playerId, isHost: true });
                if (this.callbacks.onRoomCreated) {
                    this.callbacks.onRoomCreated({
                        roomCode: roomCode,
                        playerId: this.playerId,
                        isHost: true
                    });
                } else {
                    console.error('onRoomCreated callback is not registered!');
                }
            }, 300);
        } else {
            this.send({
                type: 'create_room'
            });
        }
    }

    /**
     * 加入房间
     * @param {string} roomCode - 房间号
     */
    joinRoom(roomCode) {
        console.log('joinRoom called, roomCode:', roomCode, 'isMockMode:', this.isMockMode, 'isConnected:', this.isConnected);
        
        // 检查连接状态
        if (!this.isConnected) {
            console.error('Cannot join room: Not connected to server');
            console.warn('⚠️ Please start the server with: npm start');
            if (this.callbacks.onError) {
                this.callbacks.onError({
                    message: 'Not connected to server. Please start the server with: npm start'
                });
            }
            return;
        }
        
        this.roomCode = roomCode;
        this.send({
            type: 'join_room',
            roomCode: roomCode
        });
    }

    /**
     * 开始游戏（仅房主）
     * @param {string} roomCode - 房间号
     */
    startGame(roomCode) {
        this.send({
            type: 'start_game',
            roomCode: roomCode
        });
    }

    /**
     * 设置准备状态
     * @param {boolean} ready - 是否准备
     */
    setReady(ready) {
        this.send({
            type: 'set_ready',
            roomCode: this.roomCode,
            ready: ready
        });
    }

    /**
     * 提交分数
     * @param {number} score - 分数
     */
    submitScore(score) {
        this.send({
            type: 'submit_score',
            roomCode: this.roomCode,
            playerId: this.playerId,
            score: score
        });
    }

    /**
     * 注册回调函数
     * @param {string} event - 事件名称（如 'RoomCreated' 或 'onRoomCreated'）
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        // 如果传入的是 'onRoomCreated'，直接使用；如果是 'RoomCreated'，转换为 'onRoomCreated'
        let eventKey = event;
        if (!event.startsWith('on')) {
            eventKey = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        }
        
        if (this.callbacks.hasOwnProperty(eventKey)) {
            this.callbacks[eventKey] = callback;
            console.log('Callback registered for:', eventKey);
        } else {
            console.error('Unknown event:', eventKey, 'Available events:', Object.keys(this.callbacks));
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

