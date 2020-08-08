var udp = require('dgram');
var buffer = require('buffer');
var http = require('http');
var { parse } = require('querystring');
var url = require('url');
var fs = require('fs');

var COMMAND_MODE = Buffer.from('command');
var TAKE_OFF = Buffer.from('takeoff');
var LAND = Buffer.from('land');
const DRONE_PORT = 8889;

var client = udp.createSocket('udp4');
client.bind(DRONE_PORT,'192.168.10.2');


var my_server = http.createServer(function(req, res) {
	let body = '';
	if(req.method === 'POST') {
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			my_result = parse(body);
			console.log(my_result.action);
			switch(my_result.action) {
				case 'takeoff':
				case 'land':
				case 'command':
				case 'stop':
				case 'emergency':
				case 'streamon':
				case 'streamoff':
					dController(my_result.droneId + " " + my_result.action);
					break;
				case 'cw':
				case 'ccw':
				case 'up':
				case 'down':
				case 'back':
				case 'forward':
				case 'right':
				case 'left':
				case 'flip':
				case 'speed':
					dController(my_result.droneId + " " + my_result.action + " " + my_result.value);
					break;

				default:
					res.end('uh oh\n');
			}
			res.end('ok\n');
		});
	}
	if(req.method === 'GET') {
		var q = url.parse(req.url, true);
		var filename = "." + q.pathname;
		fs.readFile(filename, function(err, data) {
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				return res.end("404 Not Found");
			}

			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data);
			res.end();
		});

	}
}).listen(8080, '192.168.77.1');

function getIntructions(m_body) {
	parse(m_body);
}


function dController(argv) {
	argv = argv.split(" ");
	droneId = argv[0];	
	switch (argv[1]) {
		case 'takeoff':
			console.log('Prepare for take off...');
			client.send(argv[1],0,argv[1].length,DRONE_PORT,droneId,function(error){
				if(error){
					console.log('Something went wrong!');
					client.close();
				}else{
					console.log('Take Off initiated');
				}
			});
			break;
		case 'land':
			console.log('Coming in for a landing...');
			client.send(argv[1],0,argv[1].length,DRONE_PORT,droneId,function(error){
				if(error){
					console.log('Something went wrong!');
					client.close();
				}else{
					console.log('Landing sequence initiated...');
				}
			});
			break;	
		case 'command':
			console.log('We are now gonna place the drone at: ' + droneId + ' into SDK mode...');
			client.send(argv[1],0,argv[1].length,DRONE_PORT,droneId,function(error){
				if(error){
					console.log('Something went wrong!');
					client.close();
				}else{
					console.log('SDK mode initalized');
				}
			});
			break;
		case 'up':
		case 'down':
		case 'left':
		case 'right':
		case 'forward':
		case 'back':
		case 'cw':
		case 'ccw':
		case 'flip':
		case 'speed':
			console.log('Making a move....');
			theMove = argv[1] + " " + argv[2];
			client.send(theMove,0,theMove.length,DRONE_PORT,droneId,function(error){
				if(error){
					console.log('Something went wrong!');
					client.close();
				}else{
					console.log('move complete');
				}
			});
			break;

		default:
			console.log('something may have gone wrong: ' + argv[1]);
			client.send(argv[1],0,argv[1].length,DRONE_PORT,droneId);
			
	}
}
