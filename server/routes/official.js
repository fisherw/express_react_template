var path = require('path');
var htmlProcessor = require('../components/html-processor');
const getNextApp = require('../server').getNextApp;

/**
 * 页面-管理系统-登录
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var admin = async function(req, res, next) {
    // var filePath = path.resolve(__dirname, '../../public/index.html');
    // var options = {
    //     filePath: filePath
    // };
    // htmlProcessor(req, res, next, options);

    // 渲染pages/index地应的页面
    // const html = await nextApp.renderToHTML(req, res, '/index', {
    //     title: '测试'
    // })
    // res.status(200).send(html)

    getNextApp().render(req, res, '/index', {
        title: '测试'
    });
};

/**
 * routes配置，配置格式如下：
 * routes = [
 *     ['get', '/abc', fun1, [fun2, fun3, ...]],
 *     ['post', '/abcd', fun1, fun2],
 *     ...
 * ]
 */
module.exports = [
    // admin page
    ['GET', '/test', admin]
];
