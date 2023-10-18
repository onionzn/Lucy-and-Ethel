const kukaVarProxyTcpClient = require('./kukaVarProxyTcpClient.js');

const debugHeader = 'MAIN > ';
const DEBUG = false;

// for KUKA settings
let robotEthelIP = '172.31.1.149';
let robotLucyIP = '172.31.1.148';
const kvpPort = 7000;

let kvp = new kukaVarProxyTcpClient(robotEthelIP, kvpPort, DEBUG)
console.log(debugHeader + await kvp.connectToSocket());
