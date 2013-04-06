/**
 * worker.js - does the actual logic of the mkimage server
 *
 * this is the file which runs with cluster module
 * it can also be run as stand-alone like that (from project dir):
 *      NODE_ENV=production node lib/worker.js
 */
var express     = require('express'),
    imageable   = require("imageable"),
    identify    = require("./identify.js"),
    config      = require('../config'),
    app         = express();

// give a name to the worker process
process.title = 'mkimage: worker process';

// do not crash the node process on uncaught exceptions (but log them)
process.on('uncaughtException', function (err) {
    require('util').log('PROCESS EXCEPTION: [' + process.pid + '] - ' + err.stack);
});

var public_dir        = __dirname + '/../public',
    access_log        = config.access_log && require('fs').createWriteStream(config.access_log, {flags: 'a'}),
    access_log_format = config.access_log_format || 'default';

// load some middlewares
app.use(express.logger({ stream: access_log || process.stdout, format: access_log_format }));
app.use(express.static(public_dir));
app.use(imageable(config.imageable));

// TODO: serve a real favicon
app.get('/favicon.ico', function(req, res) {
    res.send('');
});

// Backward compatibility of old resize server (perseus-shield)
app.get('/r', function(req, res) {
    var params = req.query;
    var size = '', url = '';

    // check that 'url' param was passeed
    if (!params['url'])
    {
        res.send(400, 'missing a "url" parameter');
    }
    else
    {
        url = encodeURIComponent(params['url']);

        // prepare size fro new API
        if (!isNaN(params['width']) && !isNaN(params['height']))
        {
            size = params['width'] + 'x' + params['height'];
            res.redirect('/fit?url=' + url + '&size=' + size);
        }
        else if(!isNaN(params['width']))
        {
            size = params['width'];
            res.redirect('/resize?url=' + url + '&size=' + size);
        }
        else if(!isNaN(params['height']))
        {
            size = 'x' + params['height'];
            res.redirect('/resize?url=' + url + '&size=' + size);
        }
        else
        {
           identify.parseFile(params.url, function(err, json) {
                if (err) res.send(400, err.message);
                if (!json.Geometry) res.send(500, "something went wrong, try again or specify different url");
                res.redirect('/resize?url=' + url + '&size=' + encodeURIComponent(json.Geometry));
            });
        }
    }
});

// the 404 route
app.get('*', function(req, res){
    res.status(404).sendfile('404.html', { root: public_dir });
});

// start serving
if (!module.parent) app.listen(config.listen || 8000);