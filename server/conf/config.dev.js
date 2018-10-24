
const config = {
    'requestTimeout': 300000,
    'serverPort': 5000,

    'apiKey': '',
    'apiPrefix': '',

    'redisConf': {
        nodes: '192.168.5.100:6379',
        password: 'sYxw8jBJ9c',
    },
    'redisExpire': 60 * 60 * 24,

    'lruMaxAge': 2,
    'lruMax': 2,

    // 日志采集sdk及api前缀配置
    // 'collectjs': 'http://collect.dev1.qlchat.com/js/c.click.event.pv.error.visible.query.onlog.onpv.onvisible.js',
    // 'spaCollectjs': 'http://collect.dev1.qlchat.com/js/c.click.event.pv.error.visible.query.onlog.js?9',
    // 'collectApiPrefix': 'http://collect.dev1.qlchat.com',
    // 'websocketUrl': 'ws://h5ws.dev1.qlchat.com'
};

module.exports = config;
