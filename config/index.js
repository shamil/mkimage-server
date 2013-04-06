// requires
var path        = require('fs'),
    config      = require('../lib/config');

// get the NODE_ENV
var env = process.env.NODE_ENV;

// load default config options
config.load('./config/default.json', function(err) {
    if (err) {
        console.log('Config error: ' + err.message);
        process.exit(1);
    }
});

// load environment specific config options
config.load('./config/env/' + env + '.json', function(err) {
    if (err) {
        console.log('Config warning: env "' + env + '", ' + err.message);
        return;
    }
});

module.exports = config;