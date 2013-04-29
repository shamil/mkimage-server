// requires
var fs          = require('fs'),
    log         = require('sslog'),
    config      = require('../lib/config');

// get the NODE_ENV
var env = process.env.NODE_ENV;

// load default config options
config.load('./config/default.json', function(err) {
    if (err) { log.error('Config: ' + err.message);
        process.exit(1);
    }

    // load environment specific config options
    config.load('./config/env/' + env + '.json', function(err) {
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
            // load SSL certificate
            try
            {
                config.ssl.cert = fs.readFileSync(config.ssl.cert);
                config.ssl.key  = fs.readFileSync(config.ssl.key);
            }
            catch (err)
            {
                log.warn('SSL won\'t be enabled. Configuration error: ' + err.message);
                config.ssl.listen = false;
            }
        }
    });
});

module.exports = config;
