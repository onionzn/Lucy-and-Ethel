import { kukaVarProxyTcpClient } from './kukaVarProxyTcpClient.js';
import { Frame_t } from './kukaTypes.js'

let deviceDefFile = 'device-defs.json';

// Load Devices from config file
var deviceDefs = {};
import fs from 'fs';
if (fs.existsSync(deviceDefFile)) {
    try {
        // Read the configuration JSON file synchronously
        const data = fs.readFileSync(deviceDefFile, 'utf8');
        const config = JSON.parse(data);
        deviceDefs = config.devices;
    } catch (err) {
        console.error('Error reading or parsing config file:', err);
    }
}

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

let serialPort = {}
var serialData = {};

for (const deviceId in deviceDefs) {
    (function(key) {
        let deviceDef = deviceDefs[key];
        if (deviceDef.autoConnect) {
            console.log(`Auto-connecting to device [${key}] on serial port [${deviceDef.serialPort}] with baud rate [${deviceDef.baudRate}]...`);

            try {
                serialPort[key] = new SerialPort({ path: deviceDef.serialPort, baudRate: deviceDef.baudRate });
                serialPort[key].on('error', function(err) {
                    console.log(`Error connecting to ${key}: ${err.message}`);
                })
                serialPort[key].on("open", function() {
                    console.log(`Connected to ${key}.`);
                });

                const parser = serialPort[key].pipe(new ReadlineParser({ delimiter: '\r\n' }));
                parser.on('data', (data) => {
                    var parser = 'parse2';
                    if ('parser' in deviceDef) {
                        parser = deviceDef['parser'];
                    }
                    const tokens = data.split(",");
                    const datamap = eval(`${parser}(tokens)`);
                    serialData[key] = datamap;
                });
            } catch (err) {
                console.log("error connecting!")
            }
        }
    })(deviceId);
}

// Express server to receive force sensor values from Arduino and 
// to receive messages from Unity for guiding KUKA movement
import express from 'express';
import bodyParser from 'body-parser'; 
import { Console } from 'console';

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.send(serialData);
});

app.get('/device/:deviceId', function(req , res){
    res.send(serialData[req.params.deviceId]);
});

app.listen(8000, '0.0.0.0', function() {
    console.log('device-server listening to port: ' + 8000);
});

// Parser for values from device "loadcell"
function loadcell(tokens) {
    const datamap = {
        'x': tokens[0],
    };
    return datamap;
}

// for KUKA settings
let robotEthelIP = '172.31.1.149';
let robotLucyIP = '172.31.1.148';
const kvpPort = 7000;
const DEBUG = false;

// Instantiate TCP client for sending movement commands to KUKA
let kvp = new kukaVarProxyTcpClient(robotEthelIP, kvpPort, DEBUG)

async function setupKVP() {
    await kvp.connectToSocket();
}

async function moveRobotTest() {
    try {
        await kvp.moveRobot(490, 350, 820, 180, 0, 180);
        await kvp.moveRobot(400, 340, 820, 180, 0, 180);
        await kvp.moveRobot(390, 300, 800, 180, 0, 180);

    } catch (e) {
        console.log(e);
    }
}

setupKVP();
// moveRobotTest();

// Initialize plate positions
const numberOfPlates = 3;
const platePosition0 = new Frame_t(490, 350, 820, 180, 0, 180);
const platePosition1 = new Frame_t(400, 340, 820, 180, 0, 180);
const platePosition2 = new Frame_t(390, 300, 800, 180, 0, 180);
const platePositions = [platePosition0, platePosition1, platePosition2];

// Index of the current plate position
let platePositionIndex = 0;

// Move KUKA to the starting position
// kvp.moveRobot(platePosition0.X, platePosition0.Y, platePosition0.Z, platePosition0.A, platePosition0.B, platePosition0.C);

// Express endpoint to handle POST request from Unity signaling a successful hit
app.post('/hit', function(req, res) {
    const hit = req.body.hit;
    // console.log(hit);
    if (hit === 'True') {
        platePositionIndex += 1;
        // End the user journey if all plates have been hit
        if (platePositionIndex >= numberOfPlates) {
            console.log("End of user journey");
            res.send("End of user journey");
            return;
        }

        // Advance KUKA to the next predefined position
        const nextPosition = platePositions[platePositionIndex];
        console.log(`Before moving to postition at index ${platePositionIndex}`);
        // kvp.moveRobot(nextPosition.X, nextPosition.Y, nextPosition.Z, nextPosition.A, nextPosition.B, nextPosition.C);
        console.log("Moved to next position");
        res.send("Moved to next position");
    } else {
        console.log("Not a hit");
        res.send("Not a hit");
    }
})