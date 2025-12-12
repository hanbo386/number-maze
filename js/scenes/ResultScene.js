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
        this.rankings = [];
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
        // TODO: 从服务器获取排名
        // 暂时使用模拟数据
        setTimeout(() => {
            const mockRankings = [
                { name: 'Player 1', score: 500 },
                { name: 'You', score: this.playerScore },
                { name: 'Player 2', score: 200 }
            ].sort((a, b) => b.score - a.score);

            this.displayRankings(mockRankings);
        }, 500);
    }

    displayRankings(rankings) {
        this.rankingContainer.removeAll(true);

        rankings.forEach((player, index) => {
            const y = index * 60;
            const isYou = player.name === 'You';
            
            // 排名数字
            this.rankingContainer.add(
                this.add.text(-200, y, `${index + 1}.`, {
                    fontSize: '24px',
                    color: isYou ? '#00ffcc' : '#ffffff'
                }).setOrigin(0, 0.5)
            );

            // 玩家名称
            this.rankingContainer.add(
                this.add.text(-100, y, player.name, {
                    fontSize: '24px',
                    fontStyle: isYou ? 'bold' : 'normal',
                    color: isYou ? '#00ffcc' : '#aaaaaa'
                }).setOrigin(0, 0.5)
            );

            // 分数
            this.rankingContainer.add(
                this.add.text(100, y, player.score.toString(), {
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: isYou ? '#00ffcc' : '#ffffff'
                }).setOrigin(1, 0.5)
            );
        });
    }
}

