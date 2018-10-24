/**
 * 数据以jsonp格式响应
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Array} data  响应的数据（json对象）
 * @return {null}
 */
const jsonp = (req, res, data) => {
    const callbackFn = req.query.callback;

    let dataStr = JSON.stringify(data || {});
    dataStr = dataStr.replace(/(\u0085)|(\u2028)|(\u2029)/g, () => "");
    if (callbackFn) {
        res.set('Content-Type', 'application/javascript');
        res.send(`${callbackFn}(${dataStr})`);
    } else {
        res.send(dataStr);
    }
};

/**
 * 缺少参数时的响应方法(带上data时以data数据响应。默认以缺少参数提示信息响应)
 * @param  {[type]} req  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const paramMissError = (req, res, data) => {
    let json = data;
    // api 接口
    if (/^\/api/.test(req.originalUrl)) {
        if (!data || typeof data === 'string') {
            json = {
                success: false,
                state: {
                    code: 1,
                    msg: data || '缺少必要参数',
                },
            };
        }

        jsonp(req, res, json);
    } else { // 页面路由
        res.status(404);
        res.send(json || '页面不存在');
    }
};

/**
 * 以状态码200响应，默认带上ok标识，可用msg替代
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
const ok = (req, res, msg) => {
    res.status(200).send(msg || 'ok');
};

/**
 * 禁止访问
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
const forbidden = (req, res, msg) => {
    res.status(403);

    if (msg && typeof msg === 'object') {
        jsonp(req, res, msg);
        return;
    }

    res.send(msg || '无访问权限');
};

/**
 * 500内部服务错误
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @param  {[type]}   msg  [description]
 * @return {[type]}        [description]
 */
const error500 = (req, res, error, msg) => {
    res.status(500).send(msg || '内部服务错误');
};

const errorPage = (req, res) => {
    res.render('500');
};

module.exports.jsonp = jsonp;
module.exports.paramMissError = paramMissError;
module.exports.ok = ok;
module.exports.forbidden = forbidden;
module.exports.error500 = error500;
module.exports.errorPage = errorPage;
