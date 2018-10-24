const conf = require('../../conf');

const lru = require('./lru');
const redis = require('./redis');

/**
 * 使用lru作为本地缓存服务
 */
function local() {
    return lru();
}

/**
 * 使用redis作为远程缓存服务
 */
function remote() {
    return redis(conf.redisConf);
}

exports.local = local;
exports.remote = remote;