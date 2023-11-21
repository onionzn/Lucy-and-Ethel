// const kvp = require('./kukaVarProxyTcpClient.js');
// const kukaVarProxyTcpClient = require('./kukaVarProxyTcpClient.js');
import { kukaVarProxyTcpClient } from './kukaVarProxyTcpClient.js';


const debugHeader = 'MAIN > ';
const DEBUG = false;

// for KUKA settings
let robotEthelIP = '172.31.1.149';
let robotLucyIP = '172.31.1.148';
const kvpPort = 7000;

let kvp = new kukaVarProxyTcpClient(robotEthelIP, kvpPort, DEBUG)
//await kvp.connectToSocket();
//console.log(result);

async function setup() {
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

setup();
moveRobotTest();