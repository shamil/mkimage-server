/**
 * worker.js - does the actual logic of the mkimage server
 *
 * this is the file which runs with cluster module
 * it can also be run as stand-alone like that (from project dir):
 *      NODE_ENV=production node lib/worker.js
 */
var exec        = require('child_process').exec,
    express     = require('express'),
    oldapi      = require('./oldapi'),
    imgresizer  = require('./imgresizer'),
    imagemagick = require("./imagemagick"),
    config      = require('../config'),
    app         = express();

// give a name to the worker process
process.title = 'mkimage: worker process';

var public_dir        = __dirname + '/../public',
    access_log        = config.access_log && require('fs').createWriteStream(config.access_log, {flags: 'a'}),
    access_log_format = config.access_log_format || 'default';

// load some middlewares
app.use(express.logger({ stream: access_log || process.stdout, format: access_log_format }));
app.use(express.responseTime());
app.use(express.static(public_dir));
app.use(oldapi()); // process old api
app.use(imgresizer);

// the 404 route
app.get('*', function(req, res){
    res.status(404).sendfile('404.html', { root: public_dir });
});

// start serving
if (!module.parent) app.listen(config.listen || 8000);