
/**
 * routes配置，配置格式如下：
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
module.exports = [
    // 用于服务健康检查
    ['GET', '/_health_check', (req, res) => {
        res.status(200).send('ok');
    }]
];
