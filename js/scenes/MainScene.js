/**
 * 主游戏场景
 * 管理游戏的主要逻辑和UI
 */
import { GameConfig } from '../config/GameConfig.js';
import { ColorUtils } from '../utils/ColorUtils.js';
import { GridUtils } from '../utils/GridUtils.js';
import { Tile } from '../objects/Tile.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.config = GameConfig;
    }

    preload() {
        this.generateTextures();
    }

    create() {
        this.initGameState();
        this.createBackground();
        this.createUI();
        this.createGrid();
        this.setNewTarget();
        this.setupInput();
        this.graphics = this.add.graphics();
    }

    update() {
        this.drawSelectionLine();
    }

    /**
     * 初始化游戏状态
     */
    initGameState() {
        this.grid = [];
        this.selectedTiles = [];
        this.isDragging = false;
        this.score = 0;
        this.targetSum = 0;
        this.currentSelectionSum = 0;
        this.currentOperationMode = this.config.operationModes.ADD; // 默认加法模式
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { gameWidth, gameHeight, colors, uiWidth, uiCenterX } = this.config;
        
        // 主背景
        this.add.rectangle(
            gameWidth / 2, 
            gameHeight / 2, 
            gameWidth, 
            gameHeight, 
            colors.bg
        );
        
        // UI面板背景
        this.add.rectangle(
            uiCenterX, 
            gameHeight / 2, 
            uiWidth, 
            gameHeight, 
            colors.uiPanel
        );
        
        // 分隔线
        this.add.rectangle(
            uiWidth, 
            gameHeight / 2, 
            4, 
            gameHeight, 
            0x000000, 
            0.3
        );
    }

    /**
     * 创建UI元素
     */
    createUI() {
        const centerX = this.config.uiCenterX;
        const { ui } = this.config;

        // 标题
        this.add.text(centerX, ui.title.y, ui.title.text, {
            fontSize: ui.title.fontSize,
            fontStyle: ui.title.fontStyle,
            color: ui.title.color
        }).setOrigin(0.5);

        // 运算模式选择器
        this.createOperationModeSelector(centerX, ui.operationMode.y);

        // 目标数字显示
        const targetBgY = ui.target.bgY;
        this.add.circle(
            centerX, 
            targetBgY, 
            ui.target.bgRadius, 
            ui.target.bgColor
        ).setStrokeStyle(
            ui.target.bgStrokeWidth, 
            ui.target.bgStrokeColor
        );
        
        this.add.text(
            centerX, 
            targetBgY - 50, 
            ui.target.label, 
            { 
                fontSize: ui.target.labelFontSize, 
                color: ui.target.labelColor 
            }
        ).setOrigin(0.5);
        
        this.targetText = this.add.text(centerX, targetBgY + 5, '0', {
            fontSize: ui.target.valueFontSize,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: ui.target.valueColor
        }).setOrigin(0.5);

        // 表达式显示
        const expressionY = ui.expression.y;
        this.add.text(
            centerX, 
            expressionY, 
            ui.expression.label, 
            { 
                fontSize: ui.expression.labelFontSize, 
                color: ui.expression.labelColor 
            }
        ).setOrigin(0.5);
        
        this.expressionText = this.add.text(centerX, expressionY + 30, '', {
            fontSize: ui.expression.valueFontSize,
            fontStyle: 'bold',
            color: ui.expression.valueColor
        }).setOrigin(0.5);

        // 当前结果（可隐藏）
        const currentSumY = ui.currentSum.y;
        this.currentSumLabel = this.add.text(
            centerX, 
            currentSumY, 
            ui.currentSum.label, 
            { 
                fontSize: ui.currentSum.labelFontSize, 
                color: ui.currentSum.labelColor 
            }
        ).setOrigin(0.5);
        
        this.currentSumText = this.add.text(centerX, currentSumY + 50, '0', {
            fontSize: ui.currentSum.valueFontSize,
            fontStyle: 'bold',
            color: ui.currentSum.valueColor
        }).setOrigin(0.5);

        // 添加切换显示/隐藏按钮
        this.currentSumVisible = true;
        const toggleButton = this.add.text(
            centerX, 
            currentSumY + 100, 
            'Hide', 
            { 
                fontSize: '16px', 
                color: '#888888',
                backgroundColor: '#333333',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true })
         .setDepth(100);

        toggleButton.on('pointerdown', () => {
            this.toggleCurrentResultVisibility();
        });

        this.currentSumToggleButton = toggleButton;

        // 分数
        const scoreY = ui.score.y;
        this.add.text(
            centerX, 
            scoreY, 
            ui.score.label, 
            { 
                fontSize: ui.score.labelFontSize, 
                color: ui.score.labelColor 
            }
        ).setOrigin(0.5);
        
        this.scoreText = this.add.text(centerX, scoreY + 50, '0', {
            fontSize: ui.score.valueFontSize,
            color: ui.score.valueColor
        }).setOrigin(0.5);
    }

    /**
     * 创建运算模式选择器
     */
    createOperationModeSelector(centerX, y) {
        const { ui, operationModes, operationSymbols } = this.config;
        const { buttonSize, buttonSpacing, labelFontSize, labelColor } = ui.operationMode;
        
        // 标签
        this.add.text(centerX, y, ui.operationMode.label, {
            fontSize: labelFontSize,
            color: labelColor
        }).setOrigin(0.5);

        // 创建四个运算按钮
        const modes = [
            { mode: operationModes.ADD, symbol: operationSymbols.add },
            { mode: operationModes.SUBTRACT, symbol: operationSymbols.subtract },
            { mode: operationModes.MULTIPLY, symbol: operationSymbols.multiply },
            { mode: operationModes.DIVIDE, symbol: operationSymbols.divide }
        ];

        this.operationButtons = [];
        const totalWidth = modes.length * buttonSize + (modes.length - 1) * buttonSpacing;
        const startX = centerX - totalWidth / 2 + buttonSize / 2;

        modes.forEach((item, index) => {
            const x = startX + index * (buttonSize + buttonSpacing);
            const isActive = item.mode === this.currentOperationMode;
            
            const button = this.add.circle(
                x,
                y + 35,
                buttonSize / 2,
                isActive ? ui.operationMode.activeColor : ui.operationMode.inactiveColor
            ).setInteractive({ useHandCursor: true })
             .setStrokeStyle(2, isActive ? 0xffffff : 0x888888)
             .setDepth(100); // 设置高深度，确保按钮在最上层

            const symbolText = this.add.text(x, y + 35, item.symbol, {
                fontSize: ui.operationMode.fontSize,
                color: ui.operationMode.textColor,
                fontStyle: 'bold'
            }).setOrigin(0.5)
             .setDepth(101); // 文本在按钮之上

            // 绑定点击事件
            button.on('pointerdown', () => {
                this.switchOperationMode(item.mode);
            });

            this.operationButtons.push({
                mode: item.mode,
                button: button,
                text: symbolText
            });
        });
    }

    /**
     * 切换运算模式
     */
    switchOperationMode(newMode) {
        if (this.currentOperationMode === newMode) return;
        
        this.currentOperationMode = newMode;
        
        // 更新按钮外观
        this.operationButtons.forEach(btn => {
            const isActive = btn.mode === newMode;
            btn.button.setFillStyle(
                isActive ? this.config.ui.operationMode.activeColor : this.config.ui.operationMode.inactiveColor
            );
            btn.button.setStrokeStyle(2, isActive ? 0xffffff : 0x888888);
        });

        // 清除当前选择
        this.clearSelection();
        
        // 设置新的目标数字（确保有解）
        this.setNewTargetWithSolution();
    }

    /**
     * 切换当前结果显示/隐藏
     */
    toggleCurrentResultVisibility() {
        this.currentSumVisible = !this.currentSumVisible;
        
        if (this.currentSumVisible) {
            this.currentSumLabel.setVisible(true);
            this.currentSumText.setVisible(true);
            this.currentSumToggleButton.setText('Hide');
        } else {
            this.currentSumLabel.setVisible(false);
            this.currentSumText.setVisible(false);
            this.currentSumToggleButton.setText('Show');
        }
    }

    /**
     * 创建游戏网格
     */
    createGrid() {
        for (let row = 0; row < this.config.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.config.gridSize; col++) {
                const pos = GridUtils.getTilePosition(row, col, this.config);
                this.addTile(row, col, pos.x, pos.y);
            }
        }
    }

    /**
     * 添加Tile到网格
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} value - 数字值（可选，随机生成）
     * @returns {Tile} 创建的Tile对象
     */
    addTile(row, col, x, y, value = null) {
        const modeRules = this.config.rules[this.currentOperationMode];
        const tileValue = value || Phaser.Math.Between(
            modeRules.minTileValue, 
            modeRules.maxTileValue
        );
        
        const tile = new Tile(
            this, 
            row, 
            col, 
            x, 
            y, 
            tileValue, 
            this.config, 
            ColorUtils.getNumberColor
        );
        
        tile.setInteractions(
            (t) => this.handleTileDown(t),
            (t) => this.handleTileOver(t)
        );
        
        this.grid[row][col] = tile;
        tile.playSpawnAnimation();
        
        return tile;
    }

    /**
     * 设置新的目标数字（确保在当前网格中有解）
     */
    setNewTargetWithSolution() {
        const modeRules = this.config.rules[this.currentOperationMode];
        let targetValue;
        let attempts = 0;
        const maxAttempts = 50;
        
        // 获取当前网格中所有tile的值
        const gridValues = [];
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                const tile = this.grid[row][col];
                if (tile && tile.active) {
                    gridValues.push(tile.value);
                }
            }
        }
        
        // 尝试生成一个在当前网格中有解的目标值
        do {
            if (this.currentOperationMode === this.config.operationModes.MULTIPLY) {
                const possibleValues = GridUtils.generatePossibleMultiplies(
                    modeRules.minTarget, 
                    modeRules.maxTarget
                );
                if (possibleValues.length > 0) {
                    targetValue = Phaser.Utils.Array.GetRandom(possibleValues);
                } else {
                    targetValue = Phaser.Math.Between(modeRules.minTarget, modeRules.maxTarget);
                }
            } else if (this.currentOperationMode === this.config.operationModes.DIVIDE) {
                const possibleValues = GridUtils.generatePossibleDivides(
                    modeRules.minTarget, 
                    modeRules.maxTarget
                );
                if (possibleValues.length > 0) {
                    targetValue = Phaser.Utils.Array.GetRandom(possibleValues);
                } else {
                    targetValue = Phaser.Math.Between(modeRules.minTarget, modeRules.maxTarget);
                }
            } else {
                // 加法和减法直接随机生成
                targetValue = Phaser.Math.Between(
                    modeRules.minTarget, 
                    modeRules.maxTarget
                );
            }
            
            attempts++;
            // 对于加法和减法，总是有解的，直接退出
            if (this.currentOperationMode === this.config.operationModes.ADD || 
                this.currentOperationMode === this.config.operationModes.SUBTRACT) {
                break;
            }
            
            // 检查当前网格中是否有解
            if (this.hasSolutionInGrid(targetValue, gridValues)) {
                break;
            }
        } while (attempts < maxAttempts);
        
        this.targetSum = targetValue;
        
        this.tweens.add({
            targets: this.targetText,
            scale: 1.2,
            duration: this.config.animations.targetUpdateDuration,
            yoyo: true,
            onComplete: () => {
                this.targetText.setText(this.targetSum);
            }
        });
    }

    /**
     * 设置新的目标数字（兼容旧代码）
     */
    setNewTarget() {
        this.setNewTargetWithSolution();
    }

    /**
     * 检查当前网格中是否存在可以达到目标值的组合
     * @param {number} target - 目标值
     * @param {Array<number>} values - 网格中的值列表
     * @returns {boolean} 是否存在解
     */
    hasSolutionInGrid(target, values) {
        if (values.length === 0) return false;
        
        // 检查所有可能的组合（最多4个数字）
        const checkCombination = (arr, start, count, current) => {
            if (count === 0) {
                const result = this.calculateResultForValues(current);
                return result === target;
            }
            
            for (let i = start; i < arr.length; i++) {
                if (checkCombination(arr, i + 1, count - 1, [...current, arr[i]])) {
                    return true;
                }
            }
            return false;
        };
        
        // 检查1-4个数字的组合
        for (let len = 1; len <= Math.min(4, values.length); len++) {
            if (checkCombination(values, 0, len, [])) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 计算给定值列表的结果（用于检查是否有解）
     * @param {Array<number>} values - 值列表
     * @returns {number} 计算结果
     */
    calculateResultForValues(values) {
        if (values.length === 0) return 0;
        if (values.length === 1) return values[0];
        
        switch (this.currentOperationMode) {
            case this.config.operationModes.ADD:
                return values.reduce((sum, val) => sum + val, 0);
            
            case this.config.operationModes.SUBTRACT:
                return values.reduce((result, val, index) => 
                    index === 0 ? val : result - val
                );
            
            case this.config.operationModes.MULTIPLY:
                return values.reduce((product, val) => product * val, 1);
            
            case this.config.operationModes.DIVIDE:
                let result = values[0];
                for (let i = 1; i < values.length; i++) {
                    if (values[i] === 0) return NaN;
                    result = result / values[i];
                }
                return Number.isInteger(result) ? result : NaN;
            
            default:
                return 0;
        }
    }

    /**
     * 设置输入事件
     */
    setupInput() {
        this.input.on('pointerup', this.handleInputEnd, this);
        this.input.on('pointermove', this.handlePointerMove, this);
    }

    /**
     * 生成纹理
     */
    generateTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 基础方块纹理
        graphics.fillStyle(0xffffff);
        graphics.fillRoundedRect(
            0, 
            0, 
            this.config.tileSize, 
            this.config.tileSize, 
            16
        );
        graphics.generateTexture('tile', this.config.tileSize, this.config.tileSize);
        
        // 粒子纹理
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle', 16, 16);
    }

    /**
     * 处理Tile按下事件
     * @param {Tile} tile - 被按下的Tile
     */
    handleTileDown(tile) {
        if (!tile.active) return;
        this.isDragging = true;
        this.addToSelection(tile);
    }

    /**
     * 处理Tile滑过事件
     * @param {Tile} tile - 滑过的Tile
     */
    handleTileOver(tile) {
        if (!this.isDragging || !tile.active) return;

        const index = this.selectedTiles.indexOf(tile);

        if (index === -1) {
            const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
            if (GridUtils.isAdjacent(lastTile, tile)) {
                this.addToSelection(tile);
            }
        } else if (index === this.selectedTiles.length - 2) {
            this.removeFromSelection();
        }
    }

    /**
     * 添加到选中列表
     * @param {Tile} tile - 要添加的Tile
     */
    addToSelection(tile) {
        this.selectedTiles.push(tile);
        this.updateSelectionVisuals();
        tile.playSelectAnimation();
    }

    /**
     * 从选中列表移除
     */
    removeFromSelection() {
        this.selectedTiles.pop();
        this.updateSelectionVisuals();
    }

    /**
     * 根据当前运算模式计算结果
     * @returns {number} 计算结果
     */
    calculateResult() {
        if (this.selectedTiles.length === 0) return 0;
        if (this.selectedTiles.length === 1) return this.selectedTiles[0].value;

        const values = this.selectedTiles.map(t => t.value);
        
        switch (this.currentOperationMode) {
            case this.config.operationModes.ADD:
                return values.reduce((sum, val) => sum + val, 0);
            
            case this.config.operationModes.SUBTRACT:
                return values.reduce((result, val, index) => 
                    index === 0 ? val : result - val
                );
            
            case this.config.operationModes.MULTIPLY:
                return values.reduce((product, val) => product * val, 1);
            
            case this.config.operationModes.DIVIDE:
                let result = values[0];
                for (let i = 1; i < values.length; i++) {
                    if (values[i] === 0) return NaN; // 除零错误
                    result = result / values[i];
                }
                // 检查是否为整数
                return Number.isInteger(result) ? result : NaN;
            
            default:
                return 0;
        }
    }

    /**
     * 生成运算表达式字符串
     * @returns {string} 表达式字符串
     */
    generateExpressionString() {
        if (this.selectedTiles.length === 0) return '';
        if (this.selectedTiles.length === 1) {
            return `${this.selectedTiles[0].value}`;
        }

        const symbol = this.config.operationSymbols[this.currentOperationMode];
        const values = this.selectedTiles.map(t => t.value);
        return values.join(` ${symbol} `);
    }

    /**
     * 更新选中视觉效果
     */
    updateSelectionVisuals() {
        this.currentSelectionSum = this.calculateResult();
        const expression = this.generateExpressionString();
        
        // 更新表达式显示
        if (expression) {
            const result = this.currentSelectionSum;
            if (!isNaN(result)) {
                this.expressionText.setText(`${expression} = ${result}`);
            } else {
                this.expressionText.setText(`${expression} = Invalid`);
            }
        } else {
            this.expressionText.setText('');
        }
        
        // 更新结果显示
        if (isNaN(this.currentSelectionSum)) {
            this.currentSumText.setText('Invalid');
            this.currentSumText.setColor(this.config.colors.penalty);
            this.targetText.setColor(this.config.colors.text);
        } else {
            this.currentSumText.setText(this.currentSelectionSum);
            
            if (this.currentSelectionSum === this.targetSum) {
                this.currentSumText.setColor(this.config.colors.targetMatch);
                this.targetText.setColor(this.config.colors.targetMatch);
            } else if (this.currentSelectionSum > this.targetSum) {
                this.currentSumText.setColor(this.config.colors.penalty);
                this.targetText.setColor(this.config.colors.text);
            } else {
                this.currentSumText.setColor(this.config.colors.currentSum);
                this.targetText.setColor(this.config.colors.text);
            }
        }
    }

    /**
     * 绘制选中连线
     */
    drawSelectionLine() {
        this.graphics.clear();
        if (this.selectedTiles.length === 0) return;

        this.graphics.lineStyle(
            14, 
            this.config.colors.line, 
            0.8
        );
        this.graphics.beginPath();
        
        const first = this.selectedTiles[0];
        this.graphics.moveTo(first.container.x, first.container.y);

        for (let i = 1; i < this.selectedTiles.length; i++) {
            const tile = this.selectedTiles[i];
            this.graphics.lineTo(tile.container.x, tile.container.y);
        }

        // 跟随指针效果（鼠标或触摸）
        if (this.isDragging) {
            const pointer = this.input.activePointer;
            this.graphics.lineTo(pointer.worldX, pointer.worldY);
        }

        this.graphics.strokePath();
    }

    /**
     * 处理指针移动事件（用于触摸设备）
     */
    handlePointerMove(pointer) {
        if (!this.isDragging || !pointer.isDown) return;

        // 获取指针位置
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;

        // 检查是否在游戏区域内
        if (worldX < this.config.gridOffsetX || 
            worldX > this.config.gridOffsetX + this.config.boardSize ||
            worldY < this.config.gridOffsetY || 
            worldY > this.config.gridOffsetY + this.config.boardSize) {
            return;
        }

        // 使用基于距离的检测方法，找到距离指针最近的 tile
        // 这样可以更准确地判断用户想要选中的 tile，避免误触
        let closestTile = null;
        let closestDistance = Infinity;
        const maxDistance = this.config.tileSize * 0.6; // 最大触发距离（tile 大小的 60%）

        // 遍历所有 tile，找到距离指针最近且在范围内的 tile
        for (let row = 0; row < this.config.gridSize; row++) {
            for (let col = 0; col < this.config.gridSize; col++) {
                const tile = this.grid[row][col];
                if (!tile || !tile.active) continue;

                // 计算指针到 tile 中心的距离
                const tileCenterX = tile.container.x;
                const tileCenterY = tile.container.y;
                const dx = worldX - tileCenterX;
                const dy = worldY - tileCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 只有当距离小于阈值且在范围内时，才考虑这个 tile
                if (distance < maxDistance && distance < closestDistance) {
                    closestDistance = distance;
                    closestTile = tile;
                }
            }
        }

        // 如果找到了最近的 tile，触发选中逻辑
        if (closestTile) {
            this.handleTileOver(closestTile);
        }
    }

    /**
     * 处理输入结束
     */
    handleInputEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.graphics.clear();

        // 检查结果是否有效且匹配目标
        if (!isNaN(this.currentSelectionSum) && 
            this.currentSelectionSum === this.targetSum && 
            this.selectedTiles.length > 0) {
            this.successMatch();
        } else {
            // 如果结果无效（如除零）或超过目标，则失败
            if (this.selectedTiles.length > 1 || isNaN(this.currentSelectionSum)) {
                this.failMatch();
            }
        }

        this.clearSelection();
    }

    /**
     * 清除选中状态
     */
    clearSelection() {
        this.selectedTiles = [];
        this.currentSelectionSum = 0;
        this.currentSumText.setText('0');
        this.currentSumText.setColor(this.config.colors.currentSum);
        this.targetText.setColor(this.config.colors.text);
        this.expressionText.setText('');
    }

    /**
     * 成功匹配处理
     */
    successMatch() {
        const modeRules = this.config.rules[this.currentOperationMode];
        const points = this.selectedTiles.length * modeRules.basePointsPerTile + 
                      (this.selectedTiles.length > modeRules.bonusTileCount ? modeRules.bonusPoints : 0);
        
        this.score += points;
        this.scoreText.setText(this.score);

        if (this.selectedTiles.length > 0) {
            const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
            this.showScorePopup(
                lastTile.container.x, 
                lastTile.container.y, 
                points, 
                false
            );
        }

        // 创建爆炸效果并移除Tile
        this.selectedTiles.forEach(tile => {
            this.createExplosion(
                tile.container.x, 
                tile.container.y, 
                ColorUtils.getNumberColor(tile.value)
            );
            tile.active = false;
            tile.destroy();
            this.grid[tile.row][tile.col] = null;
        });

        this.refillGrid();

        this.time.delayedCall(500, () => {
            this.setNewTarget();
        });

        this.cameras.main.shake(200, 0.01);
    }

    /**
     * 失败匹配处理
     */
    failMatch() {
        const modeRules = this.config.rules[this.currentOperationMode];
        const penalty = modeRules.penaltyPoints;
        this.score = Math.max(0, this.score - penalty);
        this.scoreText.setText(this.score);
        
        if (this.selectedTiles.length > 0) {
            const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
            this.showScorePopup(
                lastTile.container.x, 
                lastTile.container.y, 
                -penalty, 
                true
            );
        }
        
        this.selectedTiles.forEach(tile => {
            tile.playFailAnimation();
        });

        this.cameras.main.shake(100, 0.005);
    }

    /**
     * 创建爆炸粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} color - 颜色值
     */
    createExplosion(x, y, color) {
        const { particles, animations } = this.config;
        
        const particleSystem = this.add.particles(0, 0, 'particle', {
            x: x,
            y: y,
            speed: particles.speed,
            angle: particles.angle,
            scale: particles.scale,
            alpha: particles.alpha,
            tint: color,
            lifespan: animations.explosionLifespan,
            blendMode: 'ADD',
            quantity: particles.quantity
        });
        
        this.time.delayedCall(animations.explosionCleanupDelay, () => {
            particleSystem.destroy();
        });
    }

    /**
     * 显示分数弹窗
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} score - 分数值
     * @param {boolean} isPenalty - 是否为惩罚
     */
    showScorePopup(x, y, score, isPenalty) {
        const { ui, colors, animations } = this.config;
        const textStr = isPenalty ? `${score}` : `+${score}`;
        const color = isPenalty ? colors.penalty : colors.score;
        
        const popup = this.add.text(x, y, textStr, {
            fontSize: ui.scorePopup.fontSize,
            fontStyle: ui.scorePopup.fontStyle,
            color: color,
            stroke: ui.scorePopup.stroke,
            strokeThickness: ui.scorePopup.strokeThickness
        }).setOrigin(0.5);
        
        popup.setDepth(100);

        this.tweens.add({
            targets: popup,
            y: y - ui.scorePopup.moveDistance,
            alpha: 0,
            scale: 1.5,
            duration: animations.scorePopupDuration,
            ease: animations.scorePopupEase,
            onComplete: () => {
                popup.destroy();
            }
        });
    }

    /**
     * 重新填充网格
     */
    refillGrid() {
        for (let col = 0; col < this.config.gridSize; col++) {
            let emptySlots = 0;

            // 下落逻辑
            for (let row = this.config.gridSize - 1; row >= 0; row--) {
                if (this.grid[row][col] === null) {
                    emptySlots++;
                } else if (emptySlots > 0) {
                    const tile = this.grid[row][col];
                    const newRow = row + emptySlots;
                    
                    this.grid[newRow][col] = tile;
                    this.grid[row][col] = null;
                    tile.row = newRow;

                    const targetY = (this.config.gridOffsetY + this.config.tileSize / 2) + 
                                   newRow * (this.config.tileSize + this.config.spacing);

                    tile.playFallAnimation(targetY);
                }
            }

            // 生成新Tile
            for (let i = 0; i < emptySlots; i++) {
                const row = emptySlots - 1 - i;
                const pos = GridUtils.getTilePosition(row, col, this.config);
                const startY = -150 - i * (this.config.tileSize + this.config.spacing);
                const targetY = pos.y;

                const newTile = this.addTile(row, col, pos.x, startY);
                
                newTile.playSpawnFallAnimation(
                    targetY, 
                    i * this.config.animations.tileSpawnFallDelay
                );
            }
        }
    }
}

