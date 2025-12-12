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

    /**
     * 生成所有可能的乘法结果（由1-9的数字相乘得到，最多4个数字）
     * @param {number} minTarget - 最小目标值
     * @param {number} maxTarget - 最大目标值
     * @returns {Array<number>} 可能的乘积值列表
     */
    static generatePossibleMultiplies(minTarget, maxTarget) {
        const possibleValues = new Set();
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // 使用递归函数生成所有可能的乘积
        const generateProducts = (currentProduct, depth, maxDepth) => {
            if (depth > maxDepth) return;
            
            if (currentProduct >= minTarget && currentProduct <= maxTarget) {
                possibleValues.add(currentProduct);
            }
            
            // 如果当前乘积已经超过最大值，停止递归
            if (currentProduct > maxTarget) return;
            
            // 继续添加数字
            for (const digit of digits) {
                const newProduct = currentProduct * digit;
                if (newProduct <= maxTarget) {
                    generateProducts(newProduct, depth + 1, maxDepth);
                }
            }
        };
        
        // 从每个数字开始，最多4个数字
        for (const digit of digits) {
            generateProducts(digit, 1, 4);
        }
        
        return Array.from(possibleValues).filter(v => v >= minTarget && v <= maxTarget).sort((a, b) => a - b);
    }

    /**
     * 生成所有可能的除法结果（由1-9的数字相除得到整数结果，最多4个数字）
     * @param {number} minTarget - 最小目标值
     * @param {number} maxTarget - 最大目标值
     * @returns {Array<number>} 可能的商值列表
     */
    static generatePossibleDivides(minTarget, maxTarget) {
        const possibleValues = new Set();
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // 使用递归函数生成所有可能的商
        const generateQuotients = (currentQuotient, depth, maxDepth) => {
            if (depth > maxDepth) return;
            
            if (Number.isInteger(currentQuotient) && 
                currentQuotient >= minTarget && 
                currentQuotient <= maxTarget) {
                possibleValues.add(currentQuotient);
            }
            
            // 如果当前商已经小于最小值，停止递归
            if (currentQuotient < minTarget) return;
            
            // 继续除以数字
            for (const digit of digits) {
                if (digit !== 0) {
                    const newQuotient = currentQuotient / digit;
                    // 只继续如果结果是整数
                    if (Number.isInteger(newQuotient) && newQuotient >= minTarget) {
                        generateQuotients(newQuotient, depth + 1, maxDepth);
                    }
                }
            }
        };
        
        // 从每个数字开始，最多4个数字
        for (const digit of digits) {
            generateQuotients(digit, 1, 4);
        }
        
        return Array.from(possibleValues).filter(v => v >= minTarget && v <= maxTarget).sort((a, b) => a - b);
    }
}

