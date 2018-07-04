/*
 * The Request Handlers
 */

// Dependencies:
var _data = require("./data");
var helpers = require("./helpers");



// Define the handlers:
var handlers = {};

// Ping Handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Users:
handlers.users = function(data, callback) {
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for users submethods:
handlers._users = {};

// Users - Post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
    // check that all required fields are filled out
    var firstName    = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0? data.payload.firstName.trim() : false;
    var lastName     = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0? data.payload.lastName.trim() : false;
    var phone        = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 11? data.payload.phone.trim() : false;
    var password     = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesnt already exist
        _data.read('users',phone,function(err,data) {
            if(err) {
                // hash the password:
                var hashedPassword = helpers.hash(password);

                if(hashedPassword) {
                    // Create the user object:
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': tosAgreement
                    };

                    // Store the user
                    _data.create('users',phone,userObject,function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, "Could not create the user");
                        }
                    });
                } else {
                    callback(500, {"error": "Could not hash the user password"});
                }
            } else {
                callback(400, {"error": "User with that phone number already exists"})
            }
        });
    } else {
        callback(400, {"error": "Missing required fields"});
    }
}
// Users - Get
// require data: phone
// optional data: none
// TODO: only let an authorized user to access their object.
handlers._users.get = function(data, callback) {
    // check phone number is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 11? data.queryStringObject.phone.trim() : false;
    if(phone) {
        // Lookup the user
        _data.read('users',phone,function(err,data) {
            if(!err && data) {
                // Remove hashed password before returning:
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callbacl(404);
            }
        });
    } else {
        callback(400, {'Error':'Missing require fields'});
    }
}

// Users - Put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// TODO: Only let authorized users to update their own object.
handlers._users.put = function(data, callback) {
    // check the required fields:
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 11? data.payload.phone.trim() : false;

    // check for the optional fields:
    var firstName    = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0? data.payload.firstName.trim() : false;
    var lastName     = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0? data.payload.lastName.trim() : false;
    var password     = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // error if the phone is not valid:
    if(phone) {
        // error if nothing is set to update
        if(firstName || lastName || password) {
            // lookup user
            _data.read('users',phone,function(err,userData) {
                if(!err && userData) {
                    // update optinal fields:
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the updates:
                    _data.update('users',phone,userData,function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(500, {"error": "Could not update user"});
                        }
                    });

                } else {
                    callback(400, {"error": "The specified used doesnt exist"});
                }
            });

        } else {
            callback(400, {"error": "missing fields to update"});
        }
    } else {
        callback(400, {"error": "missing required field"});
    }
    
}

// Users - Delete
// required field: phone
// TODO: Only authenticated user can delete.
// TODO: Also delete associated files to user.
handlers._users.delete = function(data, callback) {
    // check phone number is valid
    var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 11? data.queryStringObject.phone.trim() : false;
    if(phone) {
        // Lookup the user
        _data.read('users',phone,function(err,data) {
            if(!err && data) {
                _data.delete('users',phone,function(err){
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {"error": "Could not delete the specified user"});
                    }
                });
            } else {
                callback(400, {"error": "Could not find the specified user"});
            }
        });
    } else {
        callback(400, {'Error':'Missing require fields'});
    }
}


// Users:
handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for tokens submethods:
handlers._tokens = {};

// Tokens - post:
// Required data: phone, password
// Optional data: none 
handlers._tokens.post = function(data,callback) {
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 11? data.payload.phone.trim() : false;
    var password     = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password) {
        _data.read('users',phone,function(err,userData) {
            if(!err && userData) {
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword) {
                    // If valid, create new token with a random name. Set expiration date 1 hour in the future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    // Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err) {
                        if(!err) {
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'error':'Could not create the token'});
                        }
                    });
                } else {
                    callback(400, {"error":"Password did not match the specified users stored password"});
                }
            } else {
                callback(400, {"error":"Could not find the specific user"});
            }
        });
    } else {
        callbacl(400,{"error":"Missing required parameters"});
    }
};

// Tokens - get:
handlers._tokens.get = function(data,callback) {

};

// Tokens - put:
handlers._tokens.put = function(data,callback) {

};

// Tokens - delete:
handlers._tokens.delete = function(data,callback) {

};

// Not found Handler
handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;
