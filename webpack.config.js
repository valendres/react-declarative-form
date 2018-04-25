const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserWebpackPlugin = require('open-browser-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    devServer: {
        port: '8080',
        hot: true,
        stats: 'errors-only',
    },
    mode: 'development',
    entry: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        './example/index',
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            'react-form-validator': path.resolve(__dirname, './src'),
        },
        modules: [path.resolve(__dirname, 'node_modules')],
    },
    plugins: [
        new OpenBrowserWebpackPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: 'React Form Validator - Example',
            template: path.resolve(__dirname, './example/index.ejs'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: ['/node_modules/', 'dist'],
                loader: 'awesome-typescript-loader',
                query: {
                    useTranspileModule: true,
                    useBabel: true,
                    useCache: true,
                    cacheDirectory: '.cache',
                    reportFiles: ['src/**/*.{ts,tsx}'],
                },
            },
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
        ],
    },
};
