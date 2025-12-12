/**
 * 房间场景
 * 处理房间加入、玩家列表、准备状态
 */
import { GameConfig } from '../config/GameConfig.js';
import { NetworkManager } from '../utils/NetworkManager.js';

export class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
        this.config = GameConfig;
        this.roomCode = '';
        this.playerName = '';
        this.players = [];
        this.isHost = false; // 是否是房主
        this.networkManager = null;
        this.mode = null; // 'create' 或 'join'
    }

    init(data) {
        // 接收场景参数，判断是创建房间还是加入房间
        this.mode = data?.mode || 'join'; // 'create' 或 'join'
    }

    create() {
        const { gameWidth, gameHeight, colors } = this.config;
        
        // 背景
        this.add.rectangle(
            gameWidth / 2, 
            gameHeight / 2, 
            gameWidth, 
            gameHeight, 
            colors.bg
        );

        // 先初始化网络管理器
        this.initNetworkManager();

        // 然后根据模式创建UI
        if (this.mode === 'create') {
            this.createRoomUI();
        } else {
            this.joinRoomUI();
        }
    }

    createRoomUI() {
        const { gameWidth, gameHeight } = this.config;
        
        // 标题
        this.add.text(gameWidth / 2, 80, 'Create Room', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 显示"等待房间号"文本
        this.waitingText = this.add.text(gameWidth / 2, 200, 'Creating room...', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 房间号显示区域（稍后显示）
        this.roomCodeDisplay = null;
        this.roomCodeText = null;

        // 玩家列表标题
        this.add.text(gameWidth / 2, 350, 'Players:', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 玩家列表容器
        this.playerListContainer = this.add.container(gameWidth / 2, 450);

        // 开始游戏按钮（仅房主可见）
        this.startButton = this.add.rectangle(
            gameWidth / 2,
            gameHeight - 150,
            250,
            60,
            0x444466
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0x888888)
         .setVisible(false);

        this.startText = this.add.text(gameWidth / 2, gameHeight - 150, 'Start Game', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5)
         .setVisible(false);

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });

        // 返回按钮
        const backButton = this.add.text(gameWidth / 2, gameHeight - 80, 'Back', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5)
         .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // 在所有UI元素创建完成后，创建房间
        // 延迟确保网络管理器已初始化并注册了回调
        this.time.delayedCall(800, () => {
            if (this.networkManager) {
                console.log('Calling createRoom...');
                console.log('Network state - isConnected:', this.networkManager.isConnected, 'isMockMode:', this.networkManager.isMockMode);
                
                // 如果连接失败，确保使用模拟模式
                if (!this.networkManager.isConnected) {
                    console.log('Not connected, forcing mock mode');
                    this.networkManager.useMockMode();
                }
                
                // 确保回调已注册
                if (!this.networkManager.callbacks.onRoomCreated) {
                    console.error('onRoomCreated callback not registered!');
                }
                
                this.networkManager.createRoom();
            } else {
                console.error('Network manager not initialized!');
            }
        });
    }

    joinRoomUI() {
        const { gameWidth, gameHeight } = this.config;
        
        // 标题
        this.add.text(gameWidth / 2, 80, 'Join Room', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 房间号输入
        this.add.text(gameWidth / 2, 200, 'Room Code (4 digits):', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 输入框背景
        const inputBg = this.add.rectangle(
            gameWidth / 2,
            260,
            200,
            60,
            0x1f2b4d
        ).setStrokeStyle(2, 0x444466);

        // 房间号文本显示
        this.roomCodeText = this.add.text(gameWidth / 2, 260, '____', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 8
        }).setOrigin(0.5);

        // 数字按钮
        this.createNumberPad();

        // 玩家列表标题
        this.add.text(gameWidth / 2, 400, 'Players:', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 玩家列表容器
        this.playerListContainer = this.add.container(gameWidth / 2, 500);

        // 加入按钮（初始禁用状态）
        this.joinButton = this.add.rectangle(
            gameWidth / 2,
            gameHeight - 150,
            200,
            60,
            0x444466
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0x888888);

        this.joinText = this.add.text(gameWidth / 2, gameHeight - 150, 'Join', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#888888'
        }).setOrigin(0.5);

        this.joinButton.on('pointerdown', () => {
            if (this.roomCode.length === 4) {
                this.joinRoom();
            }
        });

        // 等待房主开始游戏提示（加入房间后显示）
        this.waitingText = this.add.text(gameWidth / 2, gameHeight - 220, '', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5)
         .setVisible(false);

        // 返回按钮
        const backButton = this.add.text(gameWidth / 2, gameHeight - 80, 'Back', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5)
         .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // 初始化网络管理器（必须在UI创建后，但在用户操作前）
        this.initNetworkManager();
        
        // 确保网络管理器已初始化
        this.time.delayedCall(200, () => {
            if (!this.networkManager) {
                console.error('Network manager not initialized!');
            } else {
                console.log('Network manager ready, isConnected:', this.networkManager.isConnected);
                
                // 如果未连接，显示提示
                if (!this.networkManager.isConnected) {
                    console.warn('⚠️ Not connected to server');
                    console.warn('⚠️ Please start the server: npm start');
                }
            }
        });
    }

    createNumberPad() {
        const startX = this.config.gameWidth / 2 - 90;
        const startY = 320;
        const buttonSize = 50;
        const spacing = 20;

        // 创建1-9的数字按钮（3x3网格）
        for (let i = 1; i <= 9; i++) {
            const row = Math.floor((i - 1) / 3);
            const col = (i - 1) % 3;
            const x = startX + col * (buttonSize + spacing);
            const y = startY + row * (buttonSize + spacing);

            const btn = this.add.rectangle(x, y, buttonSize, buttonSize, 0x444466)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x888888);
            
            const numText = this.add.text(x, y, i.toString(), {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.addDigit(i);
            });
        }

        // 第四行：0按钮（左侧）和删除按钮（右侧）
        const fourthRowY = startY + 3 * (buttonSize + spacing);
        
        // 0按钮（在第四行左侧）
        const zeroX = startX;
        const zeroBtn = this.add.rectangle(zeroX, fourthRowY, buttonSize, buttonSize, 0x444466)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x888888);
        
        this.add.text(zeroX, fourthRowY, '0', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        zeroBtn.on('pointerdown', () => {
            this.addDigit(0);
        });

        // 删除按钮（在第四行右侧）
        const deleteBtn = this.add.rectangle(
            startX + 2 * (buttonSize + spacing),
            fourthRowY,
            buttonSize,
            buttonSize,
            0xff0055
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(
            startX + 2 * (buttonSize + spacing),
            fourthRowY,
            '⌫',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        deleteBtn.on('pointerdown', () => {
            this.removeDigit();
        });
    }

    addDigit(digit) {
        if (this.roomCode.length < 4) {
            this.roomCode += digit.toString();
            this.updateRoomCodeDisplay();
            
            // 如果输入了4位数字，启用加入按钮
            if (this.roomCode.length === 4 && this.joinButton) {
                this.joinButton.setFillStyle(0x00ff00);
                this.joinButton.setStrokeStyle(2, 0xffffff);
                this.joinText.setColor('#000000');
            }
        }
    }

    removeDigit() {
        if (this.roomCode.length > 0) {
            this.roomCode = this.roomCode.slice(0, -1);
            this.updateRoomCodeDisplay();
            
            // 如果不足4位，禁用加入按钮
            if (this.roomCode.length < 4 && this.joinButton) {
                this.joinButton.setFillStyle(0x444466);
                this.joinButton.setStrokeStyle(2, 0x888888);
                this.joinText.setColor('#888888');
            }
        }
    }

    updateRoomCodeDisplay() {
        let display = this.roomCode;
        while (display.length < 4) {
            display += '_';
        }
        this.roomCodeText.setText(display.split('').join(' '));
    }

    joinRoom() {
        if (this.roomCode.length !== 4) {
            console.log('Room code must be 4 digits');
            return; // 必须输入4位数字
        }
        
        console.log('Joining room:', this.roomCode);
        console.log('Network manager state:', {
            exists: !!this.networkManager,
            isConnected: this.networkManager?.isConnected,
            isMockMode: this.networkManager?.isMockMode,
            hasCallback: !!this.networkManager?.callbacks?.onRoomJoined
        });
        
        // 隐藏加入按钮，显示等待提示
        if (this.joinButton) {
            this.joinButton.setVisible(false);
            this.joinText.setVisible(false);
        }
        if (this.waitingText) {
            this.waitingText.setText('Joining room...');
            this.waitingText.setVisible(true);
        }
        
        if (this.networkManager) {
            // 检查连接状态
            if (!this.networkManager.isConnected) {
                console.error('Not connected to server');
                if (this.waitingText) {
                    this.waitingText.setText('Error: Server not connected. Please start server: npm start');
                    this.waitingText.setVisible(true);
                }
                // 重新显示加入按钮
                if (this.joinButton && this.joinText) {
                    this.joinButton.setVisible(true);
                    this.joinText.setVisible(true);
                }
                return;
            }
            
            // 确保回调已注册
            if (!this.networkManager.callbacks.onRoomJoined) {
                console.error('onRoomJoined callback not registered! Registering now...');
                this.networkManager.callbacks.onRoomJoined = (data) => {
                    console.log('Joined room callback received:', data);
                    this.roomCode = data.roomCode;
                    this.isHost = data.isHost || false;
                    
                    // 更新等待提示
                    if (this.waitingText) {
                        this.waitingText.setText('Waiting for host to start...');
                        this.waitingText.setVisible(true);
                    }
                    
                    // 显示玩家列表
                    this.updatePlayerList(data.players || []);
                };
            }
            
            this.networkManager.joinRoom(this.roomCode);
        } else {
            console.error('Network manager not initialized!');
            if (this.waitingText) {
                this.waitingText.setText('Error: Network not initialized');
            }
        }
    }

    startGame() {
        // 房主点击开始游戏
        if (this.isHost && this.networkManager) {
            this.networkManager.startGame(this.roomCode);
        }
    }

    updatePlayerList(players) {
        this.players = players;
        
        // 清空现有列表
        this.playerListContainer.removeAll(true);
        
        // 显示玩家列表
        players.forEach((player, index) => {
            const y = index * 50;
            const playerName = player.isHost ? `${player.name} (Host)` : player.name;
            const playerText = this.add.text(0, y, playerName, {
                fontSize: '20px',
                color: player.isHost ? '#00ffcc' : '#aaaaaa',
                fontStyle: player.isHost ? 'bold' : 'normal'
            }).setOrigin(0, 0.5);
            
            this.playerListContainer.add(playerText);
        });

        // 如果有至少2个玩家，房主可以开始游戏
        if (this.isHost && players.length >= 2) {
            this.startButton.setVisible(true);
            this.startText.setVisible(true);
            this.startButton.setFillStyle(0x00ff00);
        } else if (this.isHost) {
            this.startButton.setVisible(false);
            this.startText.setVisible(false);
        }
    }

    initNetworkManager() {
        this.networkManager = new NetworkManager();
        
        // 注册回调（必须在连接前注册，只注册一次）
        // 直接设置回调，确保能正确注册
        this.networkManager.callbacks.onRoomCreated = (data) => {
            console.log('Room created callback received:', data);
            if (data && data.roomCode) {
                this.roomCode = data.roomCode;
                this.isHost = true;
                this.playerName = 'You';
                
                console.log('Setting room code to:', this.roomCode);
                
                // 显示房间号
                this.showRoomCode();
                
                // 添加自己到玩家列表（初始只有自己）
                this.updatePlayerList([{ name: 'You', isHost: true, playerId: data.playerId }]);
                
                // 确保开始按钮初始状态正确
                if (this.startButton && this.startText) {
                    this.startButton.setVisible(false);
                    this.startText.setVisible(false);
                }
            } else {
                console.error('Invalid room creation data:', data);
            }
        };

        this.networkManager.callbacks.onRoomJoined = (data) => {
            console.log('Joined room:', data);
            this.roomCode = data.roomCode;
            this.isHost = data.isHost || false;
            
            // 更新等待提示
            if (this.waitingText) {
                this.waitingText.setText('Waiting for host to start...');
                this.waitingText.setVisible(true);
            }
            
            if (this.mode === 'join') {
                // 加入房间后，显示玩家列表
                this.updatePlayerList(data.players || []);
            }
        };

        // 直接设置回调，确保能正确注册
        this.networkManager.callbacks.onPlayerListUpdate = (players) => {
            console.log('Player list updated:', players);
            this.updatePlayerList(players);
        };

        this.networkManager.on('GameStart', (gameData) => {
            this.startGameWithData(gameData);
        });
        
        // 注册错误回调
        this.networkManager.callbacks.onError = (error) => {
            console.error('Network error:', error);
            if (this.waitingText) {
                this.waitingText.setText('Error: ' + (error.message || 'Unknown error'));
                this.waitingText.setVisible(true);
            }
            // 重新显示加入按钮（如果是加入模式）
            if (this.mode === 'join' && this.joinButton && this.joinText) {
                this.joinButton.setVisible(true);
                this.joinText.setVisible(true);
            }
        };
        
        // 尝试连接到服务器，如果失败则使用模拟模式
        try {
            this.networkManager.connect();
            // 如果连接失败，会自动切换到模拟模式
        } catch (error) {
            console.log('Connection error, using mock mode');
            this.networkManager.useMockMode();
        }
    }

    showRoomCode() {
        console.log('Showing room code:', this.roomCode);
        
        // 更新等待文本
        if (this.waitingText) {
            this.waitingText.setText('Room Code:');
        }

        // 房间号显示背景
        if (!this.roomCodeDisplay) {
            this.roomCodeDisplay = this.add.rectangle(
                this.config.gameWidth / 2,
                260,
                200,
                60,
                0x1f2b4d
            ).setStrokeStyle(2, 0x00ffcc);
        }

        // 格式化房间号（添加空格，如 "1 2 3 4"）
        const formattedCode = this.roomCode.split('').join(' ');
        console.log('Formatted room code:', formattedCode);
        
        // 房间号文本
        if (!this.roomCodeText) {
            this.roomCodeText = this.add.text(
                this.config.gameWidth / 2,
                260,
                formattedCode,
                {
                    fontSize: '42px',
                    fontStyle: 'bold',
                    color: '#00ffcc',
                    letterSpacing: 6
                }
            ).setOrigin(0.5)
             .setDepth(10); // 确保在最上层
            
            console.log('Room code text created:', formattedCode);
        } else {
            this.roomCodeText.setText(formattedCode);
            this.roomCodeText.setVisible(true);
            console.log('Room code text updated:', formattedCode);
        }
        
        // 确保背景也在正确位置
        if (this.roomCodeDisplay) {
            this.roomCodeDisplay.setVisible(true);
            this.roomCodeDisplay.setDepth(9);
        }
    }

    startGameWithData(gameData) {
        // 游戏开始，切换到MainScene
        this.scene.start('MainScene', {
            mode: 'multiplayer',
            gameData: gameData,
            networkManager: this.networkManager
        });
    }
}

