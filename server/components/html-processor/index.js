const fs = require('fs');
const _ = require('lodash');
const Handlebars = require('handlebars');

const md5 = require('../md5');
const header = require('../header');
const cache = require('../cache').local();

const conf = require('../../conf');

/**
 * 将html文本中以[[keyname]]括起来的变量名用data中对应keyname的值作替换
 * @param  {[type]} html [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const fillHtmlVars = (html, data) => {
    let re = html;
    _.each(data, (value, key) => {
        let jsonV;
        if (_.isString(value)) {
            jsonV = value;
        } else {
            jsonV = JSON.stringify(value);
        }
        jsonV = (jsonV || '').replace(/(\u0085)|(\u2028)|(\u2029)/g, () => "");
        jsonV = (jsonV || '').replace(/\</g, () => "&lt;")
        jsonV = (jsonV || '').replace(/\>/g, () => "&gt;")

        re = html.replace(new RegExp(`\\[\\[${key}\\]\\]`, 'g'), () => jsonV);
    });

    return re;
};

/**
 * 将html中的flag标识变量作
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-06-23T16:05:14+0800
 * @param    {[type]}                           html [description]
 * @return   {[type]}                                [description]
 */
const replaceFlagParams = (html) => html.replace('__date', Date.now().toString(32));

/**
 * 替换日志采集js-sdk路径和api路径
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-12-28T17:22:24+0800
 * @param    {[type]}                           html [description]
 * @return   {[type]}                           [description]
 */
const replaceCollectVars = (html) => {
    let re = html.replace('[[collectjs]]', conf.collectjs);
    re = re.replace('[[spaCollectjs]]', conf.spaCollectjs);
    re = re.replace('[[collectApiPrefix]]', conf.collectApiPrefix);

    return re;
};

/**
 * 替换其它参数
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
const replaceParams = (html) => html.replace('[[__WSURL__]]', conf.websocketUrl);


/**
 * 处理html类型文件响应
 * @param  {Object}   req     请求对象
 * @param  {Object}   res     响应对象
 * @param  {function} next    路由指针
 * @param  {Object}   options 配置项
 *     options.filePath   String    必填项，指示读取html的全路径地址
 *     options.headers    Object    可选项，存在时，则将headers中的内容设置到res中作为响应头
 *     options.renderData       Object    可选项，存在时，会对Html内容作数据渲染注入（使用handlebars作为引擎）
 *     options.filVars          Object    可选项，存在时，会对Html中声明的变量作属性注入
 * @return {String}  要输出的html内容
 */
const handler = (req, res, next, opts) => {
    const options = opts || {};
    let html;

    const cacheKey = md5(options.filePath);

    try {
        html = cache.get(cacheKey);
        if (!html) {
            console.log('not use html cache. cacheKey:', cacheKey, ' path:', options.filePath);
            html = fs.readFileSync(options.filePath, 'utf8');
            cache.set(cacheKey, html);
        }
    } catch (e) {
        console.error('HTML Process Error', e);
        next();
        return '';
    }

    // 无法正确读取 HTML
    // 交给后续的 404 处理
    if (!html) {
        next();
        return '';
    }

    // 对html作渲染处理（使用Handlebars渲染数据）
    if (options.renderData) {
        html = Handlebars.compile(html)(options.renderData);
    }

    // 对html注入相关变量
    if (options.fillVars) {
        html = fillHtmlVars(html, options.fillVars);
    }

    // 处理常用的标识变量替换（如时间戳）
    html = replaceFlagParams(html);

    // 替换collect相关变量
    html = replaceCollectVars(html);

    // 替换其它参数
    html = replaceParams(html);


    // 页面缓存时间固定为 10 分钟
    // header.cacheControl('10m', res);
    // header.expire('10m', res);

    // 设置文件类型
    header.contentType('html', res);

    // 读取 route 的配置并设置对应的 headers 信息
    _.each(options.headers, (value, key) => {
        let re = value;
        if (_.isFunction(value)) {
            re = value.call();
        }
        res.set(key, re);
    });

    // 返回网页
    res.status(200).send(html);

    return html;
};

module.exports = handler;
