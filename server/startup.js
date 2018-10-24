// require('babel-polyfill');

const commander = require('commander');

const server = require('./server');
const conf = require('./conf');

let host;
let port;
let mode;

/**
 * 识别服务运行模式
 * @param  {[type]} m [description]
 * @return {any}   [description]
 */
function detectMode(m) {
    if (!m) {
        if (process.env.NODE_ENV === 'production') {
            return 'prod';
        }

        return 'dev';
    }

    return m.toLowerCase();
}

// 主函数入口
if (require.main === module) {
    // 配置命令行参数
    commander
        .option('-p, --port <number>', 'server port')
        .option('-h, --host <ip>', 'ipv4 address')
        .option('-m, --mode <dev|test|prod>', 'server mode')
        .option('-c, --cpath <path>', 'path of config')
        // .option('-l, --localUserId <userId>', 'userId of local development')
        .parse(process.argv);

    console.log('start date : ',(new Date()).toString());
    console.log('...... detecting environment ......');
    console.log('   commander.host', commander.host);
    console.log('   commander.port', commander.port);
    console.log('   commander.mode', commander.mode);
    console.log('   process.env.PORT', process.env.PORT);
    console.log('   commander.cpath', commander.cpath);
    console.log('   commander.localUserId', commander.localUserId);
    console.log('...... configuring ......');

    // 从命令行参数中读取，如果没有就默认设置为开发环境
    mode = detectMode(commander.mode);

    console.log('   server mode', mode);

    // 初始化配置文件
    conf.init({
        mode,
        cpath: commander.cpath,
    });

    // 端口取用优先级
    // 从启动参数中获取
    if (commander.port) {
        try {
            port = Number(commander.port);
        } catch(e) {
            // logger.warn('commander.port parse error', e);
        }
    }

    // 指定运行ip地址
    if (commander.host) {
        if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(commander.host)) {
            host = commander.host.trim();
        }
    }

    // 从环境变量中获取
    if (!port && process.env.PORT) {
        try {
            port = Number(process.env.PORT);
        } catch(e) {
            // logger.warn('process.env.PORT parse error', e);
        }
    }
    // 从配置文件获取
    if (!port && conf.serverPort) {
        port = conf.serverPort;
    }
    // 默认 5000
    if (!port) {
        port = 5000;
    }
    console.log('   server port', port);

    // 将参数放到配置中
    conf.update({
        mode,
        host,
        serverPort: port,
        // localUserId: commander.localUserId,
    });

    // 编译jsx语法
    // if (conf.mode != 'prod') {
    //     require('babel-register')({
    //         extensions: [ '.js' ]
    //     });
    // }

    // 普通方式启动服务器
    server.init();
}
