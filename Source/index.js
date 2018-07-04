
var http = require("http");
var https = require("https");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var fs = require("fs");
var handlers = require("./lib/handlers");
var helpers = require("./lib/helpers");

// Instantiating the Http Server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});
// Instantiating the Https Server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Starting the Server
httpServer.listen(config.httpPort, function() {
    console.log("server at: http://localhost:"+config.httpPort);
});
// Starting the Https Server
httpsServer.listen(config.httpsPort, function() {
    console.log("server HTTPS at: https://localhost:"+config.httpsPort);
})


// all the server logic (for Http and Https)
var unifiedServer = function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object:
    var queryStringObject = parsedUrl.query;
    // Get the method:
    var method = req.method.toLocaleLowerCase();
    // Get the headers:
    var headers = req.headers;
    // Get the payload:
    var decoder = new StringDecoder('utf-8');
    var buffer = "";
    req.on("data", function(data) {
        buffer += decoder.write(data);
    });
    req.on("end", function() {
        buffer += decoder.end();
        //res.end("Hello World!\n");

        var chosenHandler = typeof(routes[trimmedPath]) !== "undefined" ? routes[trimmedPath] : handlers.notFound;

        var report = {
            path: trimmedPath,
            method: method,
            queryStringObject: queryStringObject,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        }
        //console.log(report);

        chosenHandler(report, function(statuscode, payload) {
            statuscode = typeof(statuscode) == "number"? statuscode : 200;
            payload = typeof(payload) == "object"? payload : {};
            var payloadString = JSON.stringify(payload);
    
            res.setHeader("Content-Type", "application/json");
            res.writeHead(statuscode);
            res.end(payloadString);
    
            console.log("returning this response: ",statuscode,payloadString);
        });
    });
};


var routes = {
    "ping": handlers.ping,
    "users": handlers.users,
    "tokens": handlers.tokens
};


