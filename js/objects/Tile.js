/**
 * Tile 游戏对象
 * 表示游戏网格中的一个数字方块
 */
export class Tile {
    /**
     * 创建Tile对象
     * @param {Phaser.Scene} scene - Phaser场景对象
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} value - 数字值
     * @param {Object} config - 游戏配置对象
     * @param {Function} getNumberColor - 获取数字颜色的函数
     */
    constructor(scene, row, col, x, y, value, config, getNumberColor) {
        this.scene = scene;
        this.row = row;
        this.col = col;
        this.value = value;
        this.active = true;
        this.config = config;
        
        // 创建容器
        this.container = scene.add.container(x, y);
        this.container.setSize(config.tileSize, config.tileSize);
        
        // 创建背景精灵
        this.sprite = scene.add.image(0, 0, 'tile');
        const color = getNumberColor(value);
        this.sprite.setTint(color);
        
        // 创建数字文本
        this.text = scene.add.text(0, 0, value.toString(), {
            fontSize: config.ui.tile.fontSize,
            fontStyle: config.ui.tile.fontStyle,
            color: config.ui.tile.color
        }).setOrigin(0.5);
        
        // 添加到容器
        this.container.add([this.sprite, this.text]);
        
        // 绑定数据到容器
        this.container.setData('tile', this);
        
        // 设置交互
        this.container.setInteractive();
    }
    
    /**
     * 设置交互事件
     * @param {Function} onPointerDown - 按下事件处理函数
     * @param {Function} onPointerOver - 滑过事件处理函数
     */
    setInteractions(onPointerDown, onPointerOver) {
        // 支持鼠标和触摸设备
        this.container.on('pointerdown', () => onPointerDown(this));
        // pointerover 在触摸设备上不会触发，所以主要依赖场景中的 pointermove 处理
        this.container.on('pointerover', () => {
            // 只在鼠标设备上有效（触摸时不会触发）
            if (this.scene.input.activePointer.isDown) {
                onPointerOver(this);
            }
        });
    }
    
    /**
     * 播放选中动画
     */
    playSelectAnimation() {
        this.scene.tweens.add({
            targets: this.container,
            scale: 0.85,
            duration: this.config.animations.tileSelectDuration,
            yoyo: true
        });
    }
    
    /**
     * 播放失败震动动画
     */
    playFailAnimation() {
        this.scene.tweens.add({
            targets: this.container,
            x: '+=6',
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }
    
    /**
     * 播放下落动画
     * @param {number} targetY - 目标Y坐标
     */
    playFallAnimation(targetY) {
        this.scene.tweens.add({
            targets: this.container,
            y: targetY,
            duration: this.config.animations.tileFallDuration,
            ease: this.config.animations.tileFallEase
        });
    }
    
    /**
     * 播放生成动画
     */
    playSpawnAnimation() {
        this.container.setScale(0);
        this.scene.tweens.add({
            targets: this.container,
            scale: 1,
            duration: this.config.animations.tileSpawnDuration,
            ease: this.config.animations.tileSpawnEase
        });
    }
    
    /**
     * 播放生成并下落动画
     * @param {number} targetY - 目标Y坐标
     * @param {number} delay - 延迟时间
     */
    playSpawnFallAnimation(targetY, delay = 0) {
        this.scene.tweens.add({
            targets: this.container,
            y: targetY,
            duration: this.config.animations.tileSpawnFallDuration,
            delay: delay,
            ease: this.config.animations.tileSpawnFallEase
        });
    }
    
    /**
     * 销毁Tile
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}

