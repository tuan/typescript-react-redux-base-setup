const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./libs/parts');

const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build')
};

const common = {
    entry: {
        app: PATHS.app
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx']
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Test App',
            template: './index.html'
        })
    ]
};

var config;

// Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
    case 'build':
        config = merge(
            common,
            {
                devtool: 'source-map',
                output:{
                    path: PATHS.build,
                    filename: '[name].[chunkhash].js',
                    // This is used for require.ensure. The setup
                    // will work without but this is useful to set.
                    chunkFilename: '[chunkhash].js'
                }
            },
            parts.extractLESS(PATHS.app),
            parts.setupTs(PATHS.app),
            parts.minify(),
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle({
                name: 'vendor',
                entries: ['react', 'react-dom', 'redux', 'react-redux']
            }),
            parts.clean(PATHS.build));
        break;
    default:
        config = merge(
            common, 
            {
                devtool: 'eval-source-map'
            },
            parts.setupLESS(PATHS.app),
            parts.setupHotTs(PATHS.app),
            parts.devServer({
                host: process.env.HOST,
                port: process.env.PORT
            }));
}

module.exports = validate(config);