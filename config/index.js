// get the NODE_ENV and 'appdir'
var env     = process.env.NODE_ENV || 'development',
    appdir  = require('path').resolve(__dirname, '..');

// requires
var fs      = require('fs'),
    log     = require('sslog'),
    config  = require(appdir + '/lib/config');

// allow to get appdir via config
config.appdir = appdir;

// load default config options
config.load(appdir + '/config/default.json', function(err) {
    if (err) { log.error('Config: ' + err.message);
        process.exit(1);
    }

    // load environment specific config options
    config.load(appdir + '/config/env/' + env + '.json', function(err) {
        if (err) {
            log.warn('Config: env "' + env + '", ' + err.message);
            return;
        }

        // set verbose level
        if (config.verbose) log.level = 5;

        // prepare for SSL if enabled
        config.ssl = config.ssl || {};
        if (config.ssl.listen !== false)
        {
            // prepare and sanity for some of the SSL options
            try
            {
                if (config.ssl.ca)
                {
                    if (!Array.isArray(config.ssl.ca)) throw new Error('config.ssl.ca: must be and Array of string(s)');
                    config.ssl.ca = config.ssl.ca.map(function(ca) { return fs.readFileSync(ca); });
                }
                if (config.ssl.pfx)  config.ssl.pfx = fs.readFileSync(config.ssl.pfx);
                if (config.ssl.key)  config.ssl.key  = fs.readFileSync(config.ssl.key);
                if (config.ssl.cert) config.ssl.cert = fs.readFileSync(config.ssl.cert);
            }
            catch (e)
            {
                log.warn('SSL won\'t be enabled.' + e.message);
                config.ssl.listen = false;
            }
        }
    });
});

module.exports = config;
