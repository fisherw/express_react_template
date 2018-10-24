// const getenv = require('getenv');

module.exports.updateFromEnv = (conf) => {    
    
    // 如果有环境变量的配置，在这里添加
    // conf.websocketUrl = getenv('QLCHAT_NODEJS_FRONTEND_WEBSOCKET_URL', conf.websocketUrl);
    
    return conf;
};