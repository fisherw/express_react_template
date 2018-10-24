const Redis = require('ioredis')

/**
 * 创建redis实例
 * @param {Object} options 
 */
const createRedisCluster = (options) => {
    let nodes = [];
    let redisCluster;
    if (typeof options.nodes === 'string') {
        options.nodes.split(',').forEach((cf) => {
            const hostPort = cf.split(':')

            nodes.push({
                host: hostPort[0].trim(),
                port: hostPort[1].trim()
            })
        })
    } else {
        nodes = options.nodes || []
    }


    if (options.password) {
        redisCluster = new Redis.Cluster(nodes, {
            redisOptions: {
                password: options.password
            }
        });
    } else {
        redisCluster = new Redis.Cluster(nodes);
    }

    console.log('[redis] config: ', options);

    // 监听redis事件
    const events = ['connect', 'ready', 'reconnecting', 'end', 'close', 'error']
    events.forEach((e) => {
        redisCluster.on(e, (evt) => {
            console.log('[redis] status: ', e);

            if (e === 'error') {
                console.error(evt)
            }
        })
    })
    return redisCluster;
}

// 单例模式高度抽象，分离创建对象的函数和判断对象是否已经创建
const singleFactory = (fn) => {
    let result;

    return (options) => {
        return result || (result = fn(options));
    }
}

//
module.exports = singleFactory(createRedisCluster)
