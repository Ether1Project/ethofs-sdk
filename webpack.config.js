/* eslint-disable operator-linebreak */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

module.exports = (env) => {
    const { mode } = env;

    return {
        mode: mode,
        entry: mode === 'development' ? './src-dev/browser/index.js' : './src/index.js',
        devtool: 'inline-source-map',
        devServer: mode === 'development' ? { open: true } : undefined,
        target: 'web',
        output: {
            path: resolve(__dirname, 'dist'),
            filename: 'ethofs-sdk-web.min.js'
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', 'eslint-loader']
                }
            ]
        },
        plugins: mode === 'development'
            ? [new HtmlWebpackPlugin({ template: resolve(__dirname, 'src-dev', 'browser', 'index.html'), inject: 'head' })]
            : [],
        resolve: {
            modules: [resolve('./node_modules')],
            extensions: ['.js', '.json']
        }
    };
};
