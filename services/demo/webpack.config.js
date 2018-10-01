const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserWebpackPlugin = require('open-browser-webpack-plugin');

const packagePath = relPath => path.resolve(__dirname, relPath);
const rootPath = relPath => path.resolve(__dirname, '../..', relPath);

module.exports = {
    devtool: 'inline-source-map',
    devServer: {
        port: '8080',
        hot: true,
        stats: 'errors-only',
    },
    mode: 'development',
    entry: [rootPath('node_modules/react-hot-loader/patch'), './src/index'],
    output: {
        path: packagePath('dist'),
        publicPath: '/',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: [packagePath('node_modules'), rootPath('node_modules')],
    },
    plugins: [
        new OpenBrowserWebpackPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            title: 'React Declarative Form - Demo',
            template: packagePath('./src/index.ejs'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(woff2?|eot|ttf)$/i,
                loader: 'file-loader',
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [autoprefixer()],
                        },
                    },
                ],
            },
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
