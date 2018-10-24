const withPlugins = require('next-compose-plugins');

const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');


const prod = process.env.NODE_ENV === 'production';

const plugins = [
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
    }],
];

module.exports = withPlugins([...plugins],{
    useFileSystemPublicRoutes: false,
    distDir: 'build',
    assetPrefix: prod? '//xxxx.com/rs/official': '',
    pageExtensions: ['jsx', 'js'],
    generateBuildId: async () => {
        return 'ym-official-build-id'
    },
    webpack: (config, options) => {
        const { isServer, buildId } = options

        // Fixes npm packages that depend on `fs` module
        config.node = {
            fs: 'empty'
        }

        return config;
    }
});