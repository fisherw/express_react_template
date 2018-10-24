
const path = require('path');
const express = require('express');
const next = require('next');
const logger = require('morgan');
const bodyParser = require('body-parser');
const Multer = require('multer');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const redis3xSession = require('redis3x-session');
const helmet = require('helmet');

const cache = require('./components/cache');
const dangerDetect = require('./middleware/danger-detect/danger-detect');
const flash = require('./middleware/flash/flash');
const router = require('./middleware/router/router');
// const staticc = require('./middleware/static/static');
// const notFound = require('./middleware/not-found/not-found');
// const error = require('./middleware/error/error');
    
const conf = require('./conf');

const routesPath = path.resolve(__dirname, './routes');
const app = express();

let nextApp;

function getRedisCluster() {
    return cache.remote();
}

/**
 * 初始化服务（启用中间件）
 * @return {[type]} [description]
 */
async function init() {
    // 配置常用变量
    app.set('name', conf.name);
    app.set('version', conf.version);
    app.set('mode', conf.mode);

    app.enable('trust proxy');

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        defaultLayout: 'main',
    }));
    app.set('view engine', 'handlebars');

    app.use(helmet());

    // for parsing application/json
    app.use(bodyParser.json({
        limit: '10mb',
    }));

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb',
    }));

    // for parsing multipart/form-data file upload
    app.use(new Multer().single('file'));

    app.use(logger(':remote-addr - :remote-user ":method :url HTTP/:http-version" ":referrer" ":user-agent" :status :res[content-length] - :response-time ms'));

    // 危险检测
    app.use(dangerDetect());

    // 使用带签名的cookie，提高安全性
    app.use(cookieParser('$asdloeksXOZo8W3...abe39w'));

    // 静态文件交由下方Next的handler处理
    // 启用静态文件
    // app.use(staticc());
    
    // 生成redis连接实例
    app.redisCluster = getRedisCluster();
    // redis session缓存服务开启
    app.use(redis3xSession({
        redisCluster: app.redisCluster,
        expires: conf.redisExpire,
    }));


    // flash 临时消息存储服务开启
    app.use(flash());


    // next 配置
    try {
        nextApp = next({
            dev: conf.mode === 'dev',
            dir: path.resolve(path.join(__dirname, '../')),
        });

        const nextHandle = nextApp.getRequestHandler()
        await nextApp.prepare()

        // Nextjs静态资源相关路由，若不想*路由走nextjs，可启用下面两条路由，并注释下方*号路由
        // app.get('/_next/*', (req, res) => {
        //     handle(req, res);
        // });

        // app.get('/static/*', (req, res) => {
        //     handle(req, res);
        // });

        // 启用业务路由
        app.use(router(routesPath));

        // 交由下方Next的handler处理
        // 页面不存在
        // app.use(notFound());

        // 交由下方Next的handler处理
        // 启用出错打印中间件
        // app.use(error());

        // 其它路由交由nextjs处理
        app.get('*', (req, res) => {
            nextHandle(req, res);
        });
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

    // 配置监听端口
    const serverOptions = [
        conf.serverPort,
    ];

    // 配置监听host
    if (conf.host) {
        serverOptions.push(conf.host);
    }

    // 监听回调
    serverOptions.push(() => {
        console.log('[mode:', conf.mode, '] listening on port ', conf.serverPort);
        process.on('SIGINT', () => {
            process.kill(process.pid);
        });
    });

    return app.listen(...serverOptions);
}

exports.app = app;
exports.init = init;

module.exports.getRedisCluster = function () {
    if (!app.redisCluster) {
        app.redisCluster = getRedisCluster();
    }
    return app.redisCluster;
};

module.exports.getNextApp = () => {
    return nextApp;
}
