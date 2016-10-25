/**
 * 3D树布局器
 *
 * 用法：
 * 1. 首先先调用countRadius()方法，计算指定节点及其孩子节点的布局半径；
 * 2. 调用layout()方法，布局指定节点。
 */
ht.Default.Tree3DLayout = {};

/**
 * 布局树
 * @param {ht.Node} root - 根节点
 * @param {number} [dltY] - 层次间隔
 */
ht.Default.Tree3DLayout.layout = function(root, dltY) {
    var self = this;

    // 获取到所有的孩子节点对象数组
    var children = root.getChildren().toArray();
    // 获取孩子节点个数
    var len = children.length;
    // 计算张角
    var degree = root.a('degree');
    // 根据三角函数计算绕父亲节点的半径
    var r = root.a('radius');
    // 获取父亲节点的位置坐标
    var rootPosition = root.p3();

    children.forEach(function(child, index) {
        // 根据三角函数计算每个节点相对于父亲节点的偏移量
        var s = Math.sin(degree * index),
            c = Math.cos(degree * index),
            x = s * r,
            z = c * r;

        // 设置孩子节点的位置坐标
        child.p3(x + rootPosition[0], rootPosition[1] - (dltY || 100), z + rootPosition[2]);

        // 递归调用布局孩子节点
        self.layout(child, dltY);
    });
};

/**
 * 就按节点领域半径及布局半径
 * @param {ht.Node} root - 根节点对象
 * @param {Number} [minR] - 最小半径
 */
ht.Default.Tree3DLayout.countRadius = function(root, minR) {
    minR = (minR == null ? 25 : minR);

    var self = this;

    // 若果是末端节点，则设置其布局半径及领域半径为最小半径
    if (!root.hasChildren()) {
        root.a('radius', minR);
        root.a('totalRadius', minR);
        return;
    }

    // 遍历孩子节点递归计算半径
    var children = root.getChildren();
    children.each(function(child) {
        self.countRadius(child, minR);
    });

    var child0 = root.getChildAt(0);
    // 获取孩子节点半径
    var radius = child0.a('radius'),
        totalRadius = child0.a('totalRadius');

    // 计算子节点的1/2张角
    var degree = Math.PI / children.size();
    // 计算父亲节点的布局半径
    var pRadius = totalRadius / Math.sin(degree);

    // 缓存父亲节点的布局半径
    root.a('radius', pRadius);
    // 缓存父亲节点的领域半径
    root.a('totalRadius', pRadius + totalRadius);
    // 缓存其孩子节点的布局张角
    root.a('degree', degree * 2);
};