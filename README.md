# Smart Gateway for Not So Smart Devices
This is a nodeJS application to provide a web interface for all of your wifi and 433mhz electrical plugs, combined.  It simuteneuolsy serves as a gateway for SmartThings, so those not-so-smart plugs can be integrated and controled by your SmartThings and its automations.

## Currently supported:
BestTek (Tuya based) wifi plugs

Etekcity 433 mhz plugs

## Setup/Configurations:

### For Wifi Plugs:
Install the required API https://github.com/codetheweb/tuyapi.  Follow the instructions on that site to get the required parameters for each device.  Test and make sure the API works before moving on to install this Gateway.

### For 433 Mhz Plugs:
Follow this guide to set up a 433 mhz transmitter https://www.samkear.com/hardware/control-power-outlets-wirelessly-raspberry-pi.  Step 3 may be skipped.

It's recommended to use https://github.com/ninjablocks/433Utils to keep a clean installation.

While the setup can be a straight forward for some, it is not intuitive and easy for most folks.  If you have a couple of those Etekcity plugs laying around, this is a fun project to do.  If you don't have them and if the wifi plugs could work for your requirements, buy the wifi plugs - they are not more expensive compared to the Etekcity's.  By the way, the Etekcity kit includes a physical remote.

Make sure you can turn off/on the plug by using a command line.

My API for 433 mhz plugs is included in this project.

### SmartThings
Please see my other separated project for the SmartThings Device Handler which communicates with this Gateway over your local network.
