function Dev433(options){
	this.device = options;
	// Defaults
	if (this.device.id === undefined) {
		throw new Error('id is missing from device.');
	}
	if (this.device.key === undefined) {
		throw new Error('key is missing from device.');
	}
	this.device.type = "dev433";
	this.device.state = null;	// force to null when initialize
}
Dev433.prototype.get = function (property){
	return new Promise((resolve, reject) => {
		try{
			//if property is defined res = this.device.property else = this.device
			let res = property? this.device[property]: JSON.stringify(this.device);
			resolve(res);
		}
		catch(err){
			reject(err);
		}
	});
}
Dev433.prototype.set = function (options){
	// Set default to off
	options = options ? options : {set: 0};
	let rfcode = parseInt(this.device.key, 10);
	if(options.set == 0){
		rfcode += 9;	//adjust for off code
	}
	let command = "/home/pi/sendcodes.sh " + rfcode;
	return new Promise((resolve, reject) => {		
		const { exec } = require('child_process');
		exec(command, (err, stdout, stderr) => {
			if (err) {
				// node couldn't execute the command
				console.error(err);
				reject("Couldn't execute the command " + command);
			}
			else{
				// success 
				this.device.state = ((options.set == 1)? true: false);
				resolve(true);
			}
		});
	});
}
module.exports = Dev433;