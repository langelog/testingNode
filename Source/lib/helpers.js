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

helpers.createRandomString = function(length) {
    length = typeof(length) == "number" && length > 0? length : 0;
    if(length) {
        var possibleCharacters = "abcdefghiklmnopqrstuvwxyz0123456789";
        var str = "";
        for(i=1; i<=length; i++) {
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
}


// export
module.exports = helpers;