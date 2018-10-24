
const path = require('path');

const _ = require('lodash');
    
const updateFromEnv = require('./env').updateFromEnv;

const root = path.resolve(__dirname, '../dist/');
const global = path.resolve(root, 'g');
const favicon = path.resolve(global, 'favicon.ico');

let conf = {
    root,
    global,
    favicon,
};

/**
 * 更新配置项
 * @param  {object} data 配置参数字典
 * @return {[type]}      [description]
 */
function update(data) {
    _.each(data, (value, key) => {
        exports[key] = value;
    });
}

/**
 * 初始化配置
 * @param  {object} options 配置选项，可配置项mode,可选值为[development, test, prod]
 * @return {null}
 */
function init(options) {

    let confPath = '';
    if (options.cpath) {
        confPath = options.cpath;
    } else if (options.mode === 'prod') {
        confPath = path.resolve(__dirname, `./conf/config`);
    } else {
        confPath = path.resolve(__dirname, `./conf/config.${options.mode}`)
    }

    let confContents = {};

    try {
        confContents = require(confPath)
    } catch(e) {
        console.error('conf path error:', e);
    }

    conf = _.extend(conf, confContents);

    // 存在环境变量，优先读取环境变量
    conf = updateFromEnv(conf);

    // 将配置项 export 出去
    update(conf);
}

exports.init = init;
exports.update = update;
