// var path = require('path');
const withPlugins = require('next-compose-plugins');
const WebpackUploadPlugin = require('webpack-upload');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
// const withImages = require('next-images');
const optimizedImages = require('next-optimized-images');


const prod = process.env.NODE_ENV === 'production';

const plugins = [
    // 使用这个插件来解决css中图片处理的问题以及上传不了static目录中的图片到cdn的问题
    [optimizedImages, {
        // 编译后static目录下的图片存放目录
        imagesFolder: 'imgs',
        // 编译后资源引用路径（开发环境使用本地web服务访问，不能设置路径否则访问不了
        // 生产环境使用的是cdn，需与cdn前缀一致）
        imagesPublicPath: prod ? '/official/_next/static/imgs/': '',
        optimizeImagesInDev: false,
        inlineImageLimit: 3072,
    }],
    [withCSS, {
        cssLoaderOptions: {
            importLoaders: 2
        }
    }],
    [withLess, {
        // 若使用postcssLoaderOptions则postcss不生效
        // postcssLoaderOptions: {
        //     // parser: false, 
        //     autoprefixer: true
        // }
        // lessLoaderOptions: {
        //     javascriptEnabled: true,
        // },
    }],
];

// fix: prevents error when .css files are required by node
if (typeof require !== 'undefined') {
    require.extensions['.less'] = (file) => {}
}

module.exports = withPlugins([...plugins],{
    useFileSystemPublicRoutes: false,
    distDir: 'build',
    assetPrefix: prod? '//cdn.sz01.xxx.cc/official/': '',
    pageExtensions: ['jsx', 'js'],
    // buildid如果不更新，可能会导致访问到旧的编译后的资源，导致js报错
    // Todo 待用更好的方式来利用缓存
    generateBuildId: async () => {
        return new Date().getTime();
    },
    webpack: (config, options) => {
        const { isServer, buildId } = options

        // Fixes npm packages that depend on `fs` module
        config.node = {
            fs: 'empty'
        }

        // config.module.rules.push({
        //     test: /\.(png|jpg|gif)/,
        //     exclude: /node_modules/,
        //     use: 'url-loader?limit=3072&name=[path][name].[hash].[ext]&useRelativePath=false&context=', // inline base64 URLs for <=3k images
        // });
        // config.module.rules.push({
        //     test: /\.(txt|jpg|png|gif)$/,
        //     exclude: /node_modules/,
        //     use: [{
        //         loader: 'file-loader',
        //         options: {
        //             context: '',
        //             emitFile: true,
        //             limit: 3072,
        //             name: '[path][name].[hash].[ext]'
        //         }
        //     }]
        // });

        if (prod && !isServer) {
            config.plugins.push(// 静态资源实现cdn上传
                new WebpackUploadPlugin({
                    receiver: 'http://xx.xxx.xin/receiver',
                    to: '/mnt02/res/official/_next'
                })
            );
            
        }

        return config;
    }
});