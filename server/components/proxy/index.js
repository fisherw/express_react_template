const request = require('request');
const http = require('http');
const async = require('async');
const _ = require('lodash');
const md5 = require('../../components/md5');
const random = require('../../components/random');


const conf = require('../../conf');

/**
 * 长连接agent
 */
const keepAliveAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000 * 30,
});

/**
 * 组装服务端请求参数
 *
 * 返回格式：
 * {
 *   "id": "1332396785551379",
     "sign": "be4cf5f643cbf7b5eda61be121e6b349",
     "timestamp": "1234232352534",
     "data": params
 * }
 * @param  {Array} params 请求参数（Array)
 * @param  {String} key 请求签名key
 * @return {Array}        [description]
 */
const wrapReqParams = (params, key) => {
    const timeStamp = (new Date()).getTime();
    const reqId = timeStamp + random.randomNum(3);
    const reqSign = md5(`${reqId}:${key}:${timeStamp}`);
    const wrapedParams = {
        id: reqId,
        sign: reqSign,
        timestamp: timeStamp,
    };

    wrapedParams.data = params;

    return wrapedParams;
};

/**
 * 获取用户ip
 * @param {Request} req 
 */
const getIp = (req) => {
    if (!req) {
        return '';
    }
    return req.ip || (req.headers && req.headers['x-forwarded-for']) || req.get('X-Real-Ip') || '';
}

/**
 * 拼接接口地址
 * @param {String} uri 
 */
const getFullUri = (uri) => {
    if (uri.indexOf('http') > -1) {
        return uri;
    }

    return conf.apiPrefix + uri;
}

/**
 * 服务端接口请求（伪）代理，请求获取的数据通过回调callback给回
 * @param  {[type]}   uri      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const apiProxy = (uri, params, callback, req) => {
    const data = params;

    if (data) {
        data.ip = getIp(req);
    }

    // 组装参数
    const postData = wrapReqParams(data, conf.apiKey);

    const serverRequestStartTime = process.hrtime();
    
    request.post({
        uri: getFullUri(uri),
        body: postData, // JSON.stringify(postData),
        json: true,
        timeout: conf.requestTimeout,
        headers: {
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=60',
            'X-Request-ID': req && req.get('X-Request-ID') || '',
        },
        agent: keepAliveAgent,
        jsonReviver: (key, value) => {
            if (typeof value === 'string') {
                return value.replace(/(\u0085)|(\u2028)|(\u2029)/g, () => "");
            }

            return value;
        }
    }, (err, response, body) => {
        const serverRequestEndTime = process.hrtime();

        const ms = (serverRequestEndTime[0] - serverRequestStartTime[0]) * 1e3 +
            (serverRequestEndTime[1] - serverRequestStartTime[1]) * 1e-6;

        if (err) {
            if (callback) {
                callback(err, null);
            }
            console.error(`[proxy request error] uri: ${uri} params: ${JSON.stringify(data)}`, ' error:', err, '\n');
            return;
        }

        if (callback) {
            callback(null, body || {});
        }

        console.log(`[${req && _.get(req,'rSession.user.userId')}] [request api] uri: ${uri} params: ${JSON.stringify(data)} key: ${conf.apiKey} response: ${JSON.stringify(body || '').slice(0, 400)}  response-time: ${ms.toFixed(3)} ms`, '\n');
    });
};

/**
 * 服务端接口请求（伪）代理，promise 封装
 * @param  {[type]}   uri      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const apiProxyPromise = (uri, params, secret, req) => new Promise((resolve, reject) => {
    apiProxy(uri, params, (err, body) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(body);
    }, secret, req);
});

/**
 * 并行请求，不用等到前一个函数执行完再执行下一个函数，如果函数触发了错误，可以在callback函数中验证
 *
 * @param {any} tasks [[name, uri, params, secret], [name, uri, params, secret], [name, uri, params, secret], ...]
 * @returns
 */
const parallelPromise = (tasks, req) => {
    let tasksArr = {};

    if (tasks[0].length === 4) {
        tasks.forEach((item) => {
            tasksArr[item[0]] =  (callback) => {
                apiProxy(item[1], item[2], callback, item[3], req);
            };
        });
    } else if (tasks[0].length === 3) {
        tasksArr = tasks.map((item) => (callback) => {
            apiProxy(item[0], item[1], callback, item[2], req);
        });
    } else {
        throw new Error('参数不正确!');
    }

    return new Promise((resolve, reject) => {
        async.parallel(tasksArr, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

/**
 * 线性执行任务
 * 当前面一个函数执行完成就会立即执行下一个函数，如果函数触发了错误，可以在callback函数中验证，否则会一直执行完成tasks
 *
 * @param {any} tasks [[name, uri, params, secret], [name, uri, params, secret], [name, uri, params, secret], ...]
 * @returns
 */
const seriesPromise = (tasks, req) => {
    let tasksArr = {};

    if (tasks[0].length === 4) {
        tasks.forEach((item) => {
            tasksArr[item[0]] = (callback) => {
                apiProxy(item[1], item[2], callback, item[3], req);
            };
        });
    } else if (tasks[0].length === 3) {
        tasksArr = tasks.map((item) => (callback) => {
            apiProxy(item[0], item[1], callback, item[2], req);
        });
    } else {
        throw new Error('参数不正确!');
    }

    return new Promise((resolve, reject) => {
        async.series(tasksArr, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports.apiProxy = apiProxy;
module.exports.apiProxyPromise = apiProxyPromise;
module.exports.wrapReqParams = wrapReqParams;
module.exports.parallelPromise = parallelPromise;
module.exports.seriesPromise = seriesPromise;
