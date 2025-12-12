/**
 * 颜色工具函数
 * 提供数字到颜色的转换等功能
 */
export class ColorUtils {
    /**
     * 根据数字值获取对应的颜色 (HSL 渐变)
     * @param {number} value - 数字值 (1-9)
     * @returns {number} Phaser颜色值
     */
    static getNumberColor(value) {
        const hue = 200 - (value * 15);
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.85, 0.65);
        return color.color;
    }
}

