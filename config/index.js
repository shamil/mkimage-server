// requires
var path        = require('fs'),
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
            log.warning('Config: env "' + env + '", ' + err.message);
            return;
        }

        // set verbose level
        if (config.verbose) log.level = 5;
    });
});

module.exports = config;