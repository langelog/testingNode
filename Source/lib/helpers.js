/*
 * This is the Helper for multiple tasks
 */

// Dependencies:
var crypto = require("crypto");
var config = require("../config");

// Container for helpers
var helpers = {};

helpers.hash = function(str) {
    if(typeof(str) == "string" && str.length > 0) {
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {};
    }
};


// export
module.exports = helpers;