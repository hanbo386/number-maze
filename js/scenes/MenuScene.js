/**
 * 主菜单场景
 * 提供单机模式和对战模式选择
 */
import { GameConfig } from '../config/GameConfig.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
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
        this.add.text(gameWidth / 2, 150, 'Number Maze', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 单机模式按钮
        const singlePlayerBtn = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2 - 80,
            300,
            80,
            0x00ffcc
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(gameWidth / 2, gameHeight / 2 - 80, 'Single Player', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        singlePlayerBtn.on('pointerdown', () => {
            this.scene.start('MainScene', { mode: 'single' });
        });

        // 对战模式按钮
        const multiplayerBtn = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2 + 80,
            300,
            80,
            0x00ffcc
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(gameWidth / 2, gameHeight / 2 + 80, 'Multiplayer', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        multiplayerBtn.on('pointerdown', () => {
            this.scene.start('MultiplayerSelectScene');
        });
    }
}

