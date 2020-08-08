var udp = require('dgram');
var buffer = require('buffer');

var COMMAND_MODE = Buffer.from('command');
var TAKE_OFF = Buffer.from('takeoff');
var LAND = Buffer.from('land');
const DRONE_PORT = 8889;

var argv = process.argv.slice(2);

var droneId = argv[0];

var client = udp.createSocket('udp4');
client.bind(DRONE_PORT,'192.168.10.3');

switch (argv[1]) {
	case 'takeoff':
		console.log('Prepare for take off...');
		client.send(TAKE_OFF,0,TAKE_OFF.length,DRONE_PORT,droneId,function(error){
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
		client.send(LAND,0,LAND.length,DRONE_PORT,droneId,function(error){
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
		client.send(COMMAND_MODE,0,COMMAND_MODE.length,DRONE_PORT,droneId,function(error){
			if(error){
				console.log('Something went wrong!');
				client.close();
			}else{
				console.log('SDK mode initalized');
			}
		});
		break;
	default:
		client.send(argv[1],0,argv[1].length,DRONE_PORT,droneId);
		
}
