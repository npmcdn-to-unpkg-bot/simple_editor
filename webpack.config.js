const path = require("path");
const webpack = require('webpack');
const ROOT_PATH = path.resolve(__dirname);
/**********************************
 * webpack --progress --colors --watch --display-modules
 * webpack-dev-server --progress --colors --watch
 **********************************/
module.exports = {
    entry: './resources_block_editor/js/app.js',
    //devtool: '#inline-source-map',
    devtool: '#eval',
    output: {
        path: './resources_block_editor/dist',
        filename: 'app.bundle.js',
        publicPath: '/resources_block_editor/dist/'
    },
    resolve: {
        modulesDirectories: ["node_modules", "bower_components"],
        alias : {
            'jquery' : path.resolve(ROOT_PATH, 'resources_block_editor/bower_components/jquery/src/jquery'),
            'jquery-ui' : path.resolve(ROOT_PATH, 'resources_block_editor/bower_components/jquery-ui/jquery-ui.min.js'),
            'angular-block-ui' : path.resolve(ROOT_PATH, 'resources_block_editor/bower_components/angular-block-ui/dist/angular-block-ui.min.js'),
            'angular-ngNotify' : path.resolve(ROOT_PATH, 'resources_block_editor/bower_components/ng-notify/dist/ng-notify.min.js'),
            'angular-notification' : path.resolve(ROOT_PATH, 'resources_block_editor/bower_components/angular-ui-notification/dist/angular-ui-notification.min.js'),
            'angular-base64' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-base64/angular-base64.min.js'),
            'angular-cookie' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-cookie/angular-cookie.min.js'),
            'angular-file-upload' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-file-upload/dist/angular-file-upload.min.js'),
            'x2js' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/x2js/xml2json.min.js'),
            'angular-x2js' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-x2js/dist/x2js.min.js'),
            'angular-ui-select' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-ui-select/dist/select.min.js'),
            'angular-sanitize' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-sanitize/angular-sanitize.min.js'),
            'angular-editable-text' : path.resolve(ROOT_PATH,'./resources_block_editor/bower_components/angular-editable-text/dist/angular-editable-text.min.js'),
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
            {test: /jquery\.js$/, loader: 'expose?jQuery!expose?$'},
            {test: /\.css$/, loader: "style-loader!css-loader" },
            {test: /\.html$/, loader: 'ngtemplate?relativeTo=view/&prefix=/resources_block_editor/view/!html'},
            //{ test: /\.html$/, loader: "ng-cache?prefix=[dir]/[dir]"},
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
            {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            "window.jQuery": "jquery",
            "$": "jquery",
            "jQuery": "jquery",
            X2JS : 'x2js'
        }),
        //new webpack.optimize.UglifyJsPlugin({
        //    compress: {
        //        warnings: false,
        //    },
        //    output: {
        //        comments: false,
        //    },
        //}),
    ]
}