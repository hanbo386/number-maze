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
            targetBgY - 60, 
            ui.target.label, 
            { 
                fontSize: ui.target.labelFontSize, 
                color: ui.target.labelColor 
            }
        ).setOrigin(0.5);
        
        this.targetText = this.add.text(centerX, targetBgY + 10, '0', {
            fontSize: ui.target.valueFontSize,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: ui.target.valueColor
        }).setOrigin(0.5);

        // 当前选中总和
        const currentSumY = ui.currentSum.y;
        this.add.text(
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
        const tileValue = value || Phaser.Math.Between(
            this.config.rules.minTileValue, 
            this.config.rules.maxTileValue
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
     * 设置新的目标数字
     */
    setNewTarget() {
        this.targetSum = Phaser.Math.Between(
            this.config.rules.minTargetSum, 
            this.config.rules.maxTargetSum
        );
        
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
        this.currentSelectionSum += tile.value;
        this.updateSelectionVisuals();
        tile.playSelectAnimation();
    }

    /**
     * 从选中列表移除
     */
    removeFromSelection() {
        const removed = this.selectedTiles.pop();
        this.currentSelectionSum -= removed.value;
        this.updateSelectionVisuals();
    }

    /**
     * 更新选中视觉效果
     */
    updateSelectionVisuals() {
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

        if (this.currentSelectionSum === this.targetSum && this.selectedTiles.length > 0) {
            this.successMatch();
        } else {
            if (this.selectedTiles.length > 1) {
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
    }

    /**
     * 成功匹配处理
     */
    successMatch() {
        const { rules } = this.config;
        const points = this.selectedTiles.length * rules.basePointsPerTile + 
                      (this.selectedTiles.length > rules.bonusTileCount ? rules.bonusPoints : 0);
        
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
        const penalty = this.config.rules.penaltyPoints;
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

