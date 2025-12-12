/**
 * 网格工具函数
 * 提供网格相关的计算和判断功能
 */
export class GridUtils {
    /**
     * 判断两个Tile是否相邻
     * @param {Object} tile1 - 第一个Tile对象
     * @param {Object} tile2 - 第二个Tile对象
     * @returns {boolean} 是否相邻
     */
    static isAdjacent(tile1, tile2) {
        const dx = Math.abs(tile1.row - tile2.row);
        const dy = Math.abs(tile1.col - tile2.col);
        return dx <= 1 && dy <= 1;
    }
    
    /**
     * 计算Tile在网格中的屏幕坐标
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {Object} config - 游戏配置对象
     * @returns {Object} {x, y} 坐标对象
     */
    static getTilePosition(row, col, config) {
        const startX = config.gridOffsetX + config.tileSize / 2;
        const startY = config.gridOffsetY + config.tileSize / 2;
        return {
            x: startX + col * (config.tileSize + config.spacing),
            y: startY + row * (config.tileSize + config.spacing)
        };
    }
}

