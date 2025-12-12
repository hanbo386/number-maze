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
    
    // 运算模式配置
    operationModes: {
        ADD: 'add',
        SUBTRACT: 'subtract',
        MULTIPLY: 'multiply',
        DIVIDE: 'divide'
    },
    
    // 运算模式显示符号
    operationSymbols: {
        add: '+',
        subtract: '-',
        multiply: '×',
        divide: '÷'
    },
    
    // 游戏规则配置（按运算模式）
    rules: {
        add: {
            minTarget: 10,
            maxTarget: 50,
            minTileValue: 1,
            maxTileValue: 9,
            basePointsPerTile: 10,
            bonusPoints: 50,
            bonusTileCount: 3,
            penaltyPoints: 5
        },
        subtract: {
            minTarget: 1,
            maxTarget: 20,
            minTileValue: 1,
            maxTileValue: 9,
            basePointsPerTile: 10,
            bonusPoints: 50,
            bonusTileCount: 3,
            penaltyPoints: 5
        },
        multiply: {
            minTarget: 10,
            maxTarget: 200,
            minTileValue: 1,
            maxTileValue: 9,
            basePointsPerTile: 15,
            bonusPoints: 75,
            bonusTileCount: 3,
            penaltyPoints: 5
        },
        divide: {
            minTarget: 1,
            maxTarget: 20,
            minTileValue: 1,
            maxTileValue: 9,
            basePointsPerTile: 15,
            bonusPoints: 75,
            bonusTileCount: 3,
            penaltyPoints: 5
        }
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
            text: 'Number Maze',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            y: 60
        },
        operationMode: {
            label: 'Operation',
            labelFontSize: '20px',
            labelColor: '#aaaaaa',
            buttonSize: 50,
            buttonSpacing: 10,
            y: 120,
            activeColor: 0x00ffcc,
            inactiveColor: 0x444466,
            textColor: '#ffffff',
            fontSize: '28px'
        },
        target: {
            label: 'Target',
            labelFontSize: '24px',
            labelColor: '#aaaaaa',
            valueFontSize: '72px',
            valueColor: '#ffffff',
            bgY: 240,
            bgRadius: 90,
            bgColor: 0x16213e,
            bgStrokeColor: 0x444466,
            bgStrokeWidth: 4
        },
        expression: {
            label: 'Expression',
            labelFontSize: '18px',
            labelColor: '#aaaaaa',
            valueFontSize: '24px',
            valueColor: '#ffdd00',
            y: 320
        },
        currentSum: {
            label: 'Current Result',
            labelFontSize: '24px',
            labelColor: '#aaaaaa',
            valueFontSize: '48px',
            valueColor: '#ffdd00',
            y: 420
        },
        score: {
            label: 'Score',
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

