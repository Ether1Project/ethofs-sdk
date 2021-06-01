/* eslint-disable operator-linebreak */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

module.exports = (env) => {
    const { mode, dev } = env;

    const output = {
        path: resolve(__dirname, 'lib'),
        filename: mode === 'production' ? 'ethofs-sdk.min.js' : 'ethofs-sdk.js'
    };

    if (!dev) {
        output.library = 'ethofs-sdk';
        output.libraryTarget = 'umd';
    }

    const config = {
        mode: mode,
        entry: dev === 'web' ? './src-dev/browser/index.js' : './src/index.js',
        devtool: 'inline-source-map',
        devServer: dev === 'web' ? { open: true } : undefined,
        output: output,
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', 'eslint-loader']
                }
            ]
        },
        plugins: dev === 'web'
            ? [new HtmlWebpackPlugin({ template: resolve(__dirname, 'src-dev', 'browser', 'index.html'), inject: 'head' })]
            : [],
        resolve: {
            modules: [resolve('./node_modules')],
            extensions: ['.js', '.json']
        }
    };

    return dev
        ? config
        : [
            Object.assign({ ...config }, { target: 'node' }),
            Object.assign(
                { ...config },
                {
                    target: 'web',
                    output: Object.assign(
                        { ...config.output },
                        { filename: mode === 'production' ? 'ethofs-sdk-web.min.js' : 'ethofs-sdk-web.js' }
                    )
                }
            )
        ];
};
