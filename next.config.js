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
    [optimizedImages, {
        imagesFolder: 'imgs',
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
        lessLoaderOptions: {
            javascriptEnabled: true,
        },
    }],
];

// fix: prevents error when .css files are required by node
if (typeof require !== 'undefined') {
    require.extensions['.less'] = (file) => {}
}

module.exports = withPlugins([...plugins],{
    useFileSystemPublicRoutes: false,
    distDir: 'build',
    assetPrefix: prod? '//cdn.xxx.cc.com/official/': '',
    pageExtensions: ['jsx', 'js'],
    generateBuildId: async () => {
        return 'bid2'
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
                    receiver: 'http://receiver.yunmicloud.xin/receiver',
                    to: '/mnt02/res/official/_next'
                })
            );
            
        }

        return config;
    }
});