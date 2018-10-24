import _ from 'lodash'
import proxy from '../../components/proxy'
import resProcessor from '../../components/res-processor'


import conf from '../../conf'


async function requestTransfer(req, res, next) {
    try {
        /* 获取请求地址 */
        let url = conf.apiPrefix.baseApi + req._parsedUrl.pathname.replace('/api/wechat/transfer', '');
 
        /* 获取请求参数 */
        let params
        if (req.method === 'GET') {
            params = req.query
        } else {
            params = req.body
        }

        /* 组织分页参数 */
        if (params.size) {
            params.page = {
                page: params.page,
                size: params.size,
            };
        }

        /* 添加userId */
        const userId = _.get(req, 'rSession.user.userId')
        if (userId) {
            params.userId = userId
        }

        const result = await proxy.apiProxyPromise(url, params, conf.baseApi.secret, req)
        resProcessor.jsonp(req, res, result)
    } catch (error) {
        resProcessor.error500(req, res, error);
        return
    }
}

/**
 * 组合接口转发
 * 
 * @param {any} req 
 * @param {any} res 
 * @param {any} next 
 */
async function groupRequestTransfer(req, res, next) {
    try {
        const requestData = req.body
        const userId = _.get(req, 'rSession.user.userId')

        const tasks = requestData.map(item => {
            const url = conf.apiPrefix.baseApi + item.url
            const body = item.body || {}
            const secret = conf.baseApi.secret

            /* 加入userId */
            if (userId) {
                body.userId = userId
            }

            /* 组合分页参数 */
            if (body.size) {
                body.page = {
                    page: body.page,
                    size: body.size,
                };
            }

            return [url, body, secret]
        })

        const results = await proxy.parallelPromise(tasks)

        resProcessor.jsonp(req, res, {
            state: {
                code: 0
            },
            data: results
        })
    } catch (error) {
        console.error(`
        '组合接口请求失败:',
            参数：${req.body}
            错误：${error}
        `)
        resProcessor.error500(req, res, error);
    }
}

export { requestTransfer, groupRequestTransfer };
