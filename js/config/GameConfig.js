/**
 * 游戏配置常量
 * 集中管理所有游戏配置参数
 */
export const GameConfig = {
    // 网格配置
    gridSize: 8,
    tileSize: 80,
    spacing: 36,
    
    // 计算棋盘实际大小
    get boardSize() {
        return this.gridSize * this.tileSize + (this.gridSize - 1) * this.spacing;
    },
    
    // 游戏画布尺寸 - 针对横屏 iPad 优化
    gameWidth: 1280,
    gameHeight: 900,
    
    // UI 布局配置
    uiWidth: 280,
    get uiCenterX() {
        return this.uiWidth / 2;
    },
    get gridOffsetX() {
        return this.uiWidth + 20;
    },
    get gridOffsetY() {
        return (this.gameHeight - this.boardSize) / 2;
    },
    
    // 颜色配置
    colors: {
        bg: 0x16213e,
        uiPanel: 0x1f2b4d,
        tileBase: 0xffffff,
        line: 0x00ffcc,
        text: '#ffffff',
        score: '#00ff00',
        penalty: '#ff0055',
        currentSum: '#ffdd00',
        targetMatch: '#00ff00'
    },
    
    // 游戏规则配置
    rules: {
        minTargetSum: 10,
        maxTargetSum: 30,
        minTileValue: 1,
        maxTileValue: 9,
        basePointsPerTile: 10,
        bonusPoints: 50,
        bonusTileCount: 3,
        penaltyPoints: 5
    },
    
    // 动画配置
    animations: {
        tileSpawnDuration: 300,
        tileSpawnEase: 'Back.out',
        tileSelectDuration: 100,
        tileFallDuration: 400,
        tileFallEase: 'Bounce.out',
        tileSpawnFallDuration: 500,
        tileSpawnFallDelay: 60,
        targetUpdateDuration: 100,
        scorePopupDuration: 900,
        scorePopupEase: 'Back.out',
        explosionLifespan: 600,
        explosionCleanupDelay: 700
    },
    
    // 粒子效果配置
    particles: {
        speed: { min: 80, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        quantity: 12
    },
    
    // UI 文本配置
    ui: {
        title: {
            text: '数字迷阵',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            y: 80
        },
        target: {
            label: '目标数字',
            labelFontSize: '24px',
            labelColor: '#aaaaaa',
            valueFontSize: '96px',
            valueColor: '#ffffff',
            bgY: 250,
            bgRadius: 110,
            bgColor: 0x16213e,
            bgStrokeColor: 0x444466,
            bgStrokeWidth: 4
        },
        currentSum: {
            label: '当前总和',
            labelFontSize: '24px',
            labelColor: '#aaaaaa',
            valueFontSize: '60px',
            valueColor: '#ffdd00',
            y: 480
        },
        score: {
            label: '得分',
            labelFontSize: '24px',
            labelColor: '#aaaaaa',
            valueFontSize: '48px',
            valueColor: '#00ffcc',
            y: 750
        },
        tile: {
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#000000'
        },
        scorePopup: {
            fontSize: '50px',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            moveDistance: 100
        }
    }
};

