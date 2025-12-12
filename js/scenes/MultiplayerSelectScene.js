/**
 * 多人游戏选择场景
 * 选择创建房间或加入房间
 */
import { GameConfig } from '../config/GameConfig.js';

export class MultiplayerSelectScene extends Phaser.Scene {
    constructor() {
        super('MultiplayerSelectScene');
        this.config = GameConfig;
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

        // 标题
        this.add.text(gameWidth / 2, 150, 'Multiplayer', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 创建房间按钮
        const createRoomBtn = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2 - 80,
            300,
            80,
            0x00ffcc
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(gameWidth / 2, gameHeight / 2 - 80, 'Create Room', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        createRoomBtn.on('pointerdown', () => {
            this.scene.start('RoomScene', { mode: 'create' });
        });

        // 加入房间按钮
        const joinRoomBtn = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2 + 80,
            300,
            80,
            0x00ffcc
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(gameWidth / 2, gameHeight / 2 + 80, 'Join Room', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        joinRoomBtn.on('pointerdown', () => {
            this.scene.start('RoomScene', { mode: 'join' });
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
    }
}

