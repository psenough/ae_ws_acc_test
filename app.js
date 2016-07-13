var util = require('util');
var fs = require('fs');

logme("Starting server...");

var net = require('net');
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var httpServer = http.createServer(app);
// on windows 8, we need to call httpServer.listen(80,'172.17.0.20');
// on mac we need root privileges or get an EACCES error
httpServer.listen(80);

/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var options = {
    etag: false,
    extensions: ['htm', 'html'],
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now());
    }
};
app.use(express.static('public', options));
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/*app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header("Access-Control-Expose-Headers", "Content-Type, WWW-Authenticate, WWW-Authenticate-XHR");
	//res.removeHeader('www-authenticate');
	next();
});*/



//
// express request handling
//
var connections = [];

function catchall(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	// get timestamp
	var d = new Date();
	var n = d.getTime();
	var thistime = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');

	// check if ip is already in connections	
	var found = false;
	for (var i=0; i<connections.length; i++) {
		if (ip == connections[i]['ip']) {
			team = connections[i]['team'];
			connections[i]['lasttime'] = n;
			found = true;
		}
	}

	// if we are dealing with a new ip, give it one of the less assigned teams
	// this value should be sent to the webpage somehow (on terminator it's being sent as part of the title)
	// the webpage itself, not the server, sets what zone value is being sent back as a vote
	if (!found) {
		
		// add the info to our connections records
		connections.push({ip: ip, lasttime: n});
		console.log('ip: ' + ip + ' added, total connections: ' + connections.length);
	}

	res.render('test', {title: 'test'});
}

app.get('/', catchall);



// this catches all uncaught exceptions
// we use it to catch http.get requests that timeout until that module is updated to have proper error callbacks
// this prevents node from crashing when there is an unexpected exceptions
// it can cause issues of application in bad state still running, but it's also useful for debugging
/*process.on('uncaughtException', function (err) {
    //console.log(err);
    logme(util.inspect(err));
});
*/

// Start the Websocket server
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({port: 3001});

var active_conn = [];
var id = 0;

var TYPE_CV = '0';
var TYPE_WEBCLIENT = '1';
var TYPE_NODE = '2';

var list_of_requests = [];

// Callback function for when the websocket connects
server.on('connection', function (client) {
    client.id = id++;
    client.send('hello?');
    active_conn.push({'uid': client.id, 'socket': client, 'latest_message': {}});
    logme('active conns: ' + active_conn.length);

    // Callback for when we receive a message from this client
    client.on('message', function (data) {
        logme('received: ' + data);
		//logme('received something');
    });

    // Callback for when when the websocket closes the connection
    client.on('close', function () {
        logme("websocket closed, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) active_conn.splice(thisid, 1);
    });

    // Callback for when when the websocket raises an error
    client.on('error', function () {
        logme("websocket error, removing it");
        var thisid = getID(client.id);
        if (thisid != -1) active_conn.splice(thisid, 1);
    });
});


setInterval(
	function(){
		for (var i=0; i< active_conn.length; i++) {
			if (active_conn[i].socket) active_conn[i].socket.send('ping: '+ (new Date()).getSeconds());
		}
		//console.log('sent ping to ' + active_conn.length);
		}
, 1000);

function getID(thisid) {
    for (var i = 0; i < active_conn.length; i++) {
        if (active_conn[i]['uid'] == thisid) {
            return i;
        }
    }
    return -1;
}

function logme(thisstring) {
    var timestamp = (new Date()).toISOString().slice(0, 19);
    console.log(timestamp + ' - ' + (thisstring.length>76)?(thisstring.substr(0,76)+'...'):thisstring);
    //var fs = require('fs');
    //fs.appendFile(appdatadir+'logfile.log', '\n' + timestamp + ' - ' + thisstring, function (err) {
    //    if (err) return console.log(err);
    //});
}


logme('init done');
