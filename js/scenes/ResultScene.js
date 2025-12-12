/**
 * 结算场景
 * 显示对战结果和排名
 */
import { GameConfig } from '../config/GameConfig.js';

export class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
        this.config = GameConfig;
    }

    init(data) {
        this.playerScore = data?.score || 0;
        this.networkManager = data?.networkManager || null;
        this.rankings = data?.rankings || []; // 接收排名数据
        this.playerId = this.networkManager?.playerId || null; // 获取当前玩家ID
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
        this.add.text(gameWidth / 2, 100, 'Game Over', {
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 你的分数
        this.add.text(gameWidth / 2, 200, 'Your Score:', {
            fontSize: '32px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(gameWidth / 2, 250, this.playerScore.toString(), {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#00ffcc'
        }).setOrigin(0.5);

        // 排名标题
        this.add.text(gameWidth / 2, 350, 'Rankings:', {
            fontSize: '32px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // 排名列表容器
        this.rankingContainer = this.add.container(gameWidth / 2, 450);

        // 加载排名数据
        this.loadRankings();

        // 返回主菜单按钮
        const menuButton = this.add.rectangle(
            gameWidth / 2,
            gameHeight - 100,
            250,
            60,
            0x00ffcc
        ).setInteractive({ useHandCursor: true })
         .setStrokeStyle(2, 0xffffff);

        this.add.text(gameWidth / 2, gameHeight - 100, 'Main Menu', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    loadRankings() {
        // 如果已经有排名数据，直接显示
        if (this.rankings && this.rankings.length > 0) {
            // 标记当前玩家
            const rankingsWithYou = this.rankings.map(player => ({
                ...player,
                isYou: player.playerId === this.playerId
            }));
            this.displayRankings(rankingsWithYou);
        } else {
            // 如果没有排名数据，显示提示
            this.rankingContainer.add(
                this.add.text(0, 0, 'No rankings available', {
                    fontSize: '20px',
                    color: '#888888'
                }).setOrigin(0.5)
            );
        }
    }

    displayRankings(rankings) {
        this.rankingContainer.removeAll(true);

        rankings.forEach((player, index) => {
            const y = index * 60;
            const isYou = player.isYou || player.playerId === this.playerId;
            
            // 排名数字（左侧）
            this.rankingContainer.add(
                this.add.text(-280, y, `${index + 1}.`, {
                    fontSize: '24px',
                    color: isYou ? '#00ffcc' : '#ffffff'
                }).setOrigin(0, 0.5)
            );

            // 玩家名称（中间，留出足够空间）
            const playerName = player.name || `Player ${index + 1}`;
            const displayName = isYou ? `${playerName} (You)` : playerName;
            this.rankingContainer.add(
                this.add.text(-80, y, displayName, {
                    fontSize: '24px',
                    fontStyle: isYou ? 'bold' : 'normal',
                    color: isYou ? '#00ffcc' : '#aaaaaa',
                    maxWidth: 250 // 限制最大宽度，防止过长
                }).setOrigin(0, 0.5)
            );

            // 分数（右侧，增加间距避免与名称重叠）
            this.rankingContainer.add(
                this.add.text(250, y, (player.score || 0).toString(), {
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: isYou ? '#00ffcc' : '#ffffff'
                }).setOrigin(1, 0.5)
            );
        });
    }
}

