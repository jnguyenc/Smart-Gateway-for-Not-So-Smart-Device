/*=========================================================
To Do:
1. Get actual device state at inital load
2. Save/load 433 device state from a file to simmulate get state

=========================================================*/
//===== Global variables ==================================
const hubPort = 8082;
const devicesFilePath = __dirname + "/devices-info.json";

//===== Setting up ========================================
var http = require('http');
var fs = require('fs');
var url = require('url');
var server = http.createServer(onRequest);

//===== Setup supported devices ===========================
const Device = {};
Device.tuya = require('tuyapi');
Device.dev433 = require('./Dev433');

//===== Getting Devices information from file =============
const devicesInfo = require(devicesFilePath);
function getDevice(devId){
	let device = devicesInfo.devices.filter(function(d){
		return d.id == devId;
	});
	return device[0];
}

//====== Start the HTTP Server Listening to request =======
server.listen(hubPort);
console.log("The Smart Gateway for The Not-So-Smart Devices Console Log\nListening to port " + hubPort);

/*===== Request and Respond template ======================
//	request:	{dev_id:05200415dc4f22c86dd7,command:[state-on|state-off|status]}
//	response:	{dev_id:05200415dc4f22c86dd7,command:[state-on|state-off|status],command_response:[OK|msg],dev_state:[true|false|unknown]}
===========================================================*/
	
function onRequest(request, response){
	//console.log(request.url);
	//browser often makes 2 requests, one for favicon.ico do nothing and return
	if(request.url == "/favicon.ico"){
		return;
	}
	
	//get request_data from the header first
	let request_data = request.headers["request_data"];
	let query;
	
	//if the request_data is not sent in the header, get query from the url
	if (typeof request_data === 'undefined'){
		if(request.url == "/"){
			//no query in the url, then show devices' info
			showDevicesInfo();
			return;	
		}
		else if(request.url == "/json"){
			showDevicesInfo("json");
			return;	
		}
		else{
			//parse query from the url
			let parsedUrl = url.parse(request.url, true);
			query = parsedUrl.query;
			//console.log("URL data " + JSON.stringify(query));
			
		}			
	}
	else{
		//console.log("Header request_data " + request_data);
		query = JSON.parse(request_data);
	}
	console.log("Query " + JSON.stringify(query));
	
	//extract devId and command from the query
	let devId = query.dev_id;
	let command = query.command;
		
	//find and get device configuration by devId
	let dev = getDevice(devId);
	
	if(typeof dev === 'undefined'){
		//can't find the device from passed devId
		errDeviceNotFound(devId);
		return;
	}
	//console.log(JSON.stringify(dev));
	
	//set up the current device to perform command
	let currDevice = new Device[dev.type]({id: dev.id,key: dev.key,ip: dev.ip});

	//processing client command	
	switch(command) {
		case "state-on":
			setDeviceState({set: 1});
		break;
		
		case "state-off":
			setDeviceState({set: 0});
		break;
		
		case "status":
			getDeviceState();
		break;

		default:
			errClientCommand(command);
	}
	//=====================================================
	//====== Error Handling functions
	function errDeviceNotSupported(devId){
		prepareResponse("Device not supported: " + devId);
	}
	
	function errDeviceNotFound(devId){
		prepareResponse("Device not found: " + devId);
	}
	
	function errClientCommand(command){
		prepareResponse("Invalid command: " + command);
	}
	
	function errDeviceCommand(err){
		prepareResponse("Device command or network error");
	}
	//=====================================================
	//===== set and get functions to the device ===========
	function setDeviceState(command){
		//Promise then takes 1 succeeded and 1 failed callbacks, cleanest coding style
		currDevice.set(command).then(
			result => getDeviceState(),
			err => errDeviceCommand(err)
		);
	}

	function getDeviceState(){
		currDevice.get("state").then(
			function(devState){
				//console.log("dev.state="+dev.state);
				//console.log("devState="+devState);
				if(devState != null){
					//update the dev configurations only not null, Dev433 needs this
					dev.state = devState;
				}
				prepareResponse("OK");
			},
			err => {
				errDeviceCommand(err);
			}
		);
	}
	//=====================================================
	
	function prepareResponse(msg){
		let devState = "unknown";
		if(typeof dev != "undefined" && typeof dev.state != "undefined"){
			devState = dev.state;
		}
	
		response.setHeader("content-type", "text/html");
		
		// response = original query + device state + message
		let res = query;
		res["dev_state"] = devState;
		res["command_response"] = msg;
		
		response.setHeader("response_data", JSON.stringify(res));
		response.write(JSON.stringify(res));
		response.end();
		console.log("Response " + JSON.stringify(res));
		console.log("===================================");
	}
	//=====================================================
	//===== Provide the interface and/or configurations ===
	function showDevicesInfo(type){
		type = type? type: "html";
		if(type == "json"){
			response.write(displayDevicesJson());
		}
		else{
			response.write(displayDevicesHtml());
		}
		response.end();
		console.log("Show Devices Info - Type: " + type);
		console.log("===================================");	
	}
	//=====================================================
	//===== Provide devices configurations ================
	function displayDevicesJson(){
		return JSON.stringify(devicesInfo);
	}
	
	//=====================================================
	//===== Provide devices configurations ================
	function displayDevicesHtml(){
		let responseHtml = fs.readFileSync(__dirname + "/page-template.html", "utf8");	
		responseHtml = responseHtml.replace("#devicesData#", JSON.stringify(devicesInfo));
		// only one type of response is necessary... config the client side(page-template.html) accordingly
		//responseHtml = responseHtml.replace("#devices#", compileDevices());
		return responseHtml;
	}
	
	function compileDevices(){
		let devicesHtml = "";
		let deviceHtmlTemplate = fs.readFileSync( __dirname + "/device-template.html", "utf8");
		for(let i in devicesInfo.devices){
			let deviceHtml = deviceHtmlTemplate;
			// set up individual device html
			deviceHtml = deviceHtml.replace(/#devId#/g, devicesInfo.devices[i]["id"]);
			deviceHtml = deviceHtml.replace(/#devState#/g, (devicesInfo.devices[i]["state"]? "on":""));
			deviceHtml = deviceHtml.replace(/#devName#/g, devicesInfo.devices[i]["name"]);
			// add to the collection of devices
			devicesHtml +=	deviceHtml + "\n";
		}	
		return devicesHtml;
	}
}