/**
 * Old API support (@lieldulev)
 */

var url     = require('url'),
    log     = require('sslog');

module.exports = function() {
    return function(req, res, next){
        var path    = url.parse(req.url).pathname || '',
            params  = req.query;

        // process only /r requests
        if (!/^\/r\/?/.test(path)) return next();

        log.verbose('old api was hit, converting to new api...');

        // prepare size from new API
        if (!isNaN(params.width) && !isNaN(params.height))
        {
            params.w = params.width;
            params.h = params.height;
            req.url  = '/stretch';
        }
        else if(!isNaN(params.width))
        {
            params.w = params.width;
            req.url  = '/resize';

        }
        else if(!isNaN(params.height))
        {
            params.h = params.height;
            req.url  = '/resize';
        }
        else
        {
            req.url  = '/cache';
        }

        // continue
        next();
    };
};