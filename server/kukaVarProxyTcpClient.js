const Net = require('net');

class kukaVarProxyTcpClient {
  constructor(ip, port, DEBUG) {
    this.ip = ip;
    this.port = port;
    this.DEBUG = DEBUG;
    this.debugHeader = 'kukaVarProxyTcpClient > ';

    this.kukaSocket = new Net.Socket();
    this.kukaSocket.setNoDelay(true); // turn off buffering Nagle's
  }

  async connectToSocket() {
    this.kukaSocket.connect(this.port, this.ip);
    return new Promise((resolve, reject) => {
        this.kukaSocket.on('connect', () => { resolve(`connected to kuka socket at ${this.port}:${this.ip}`) });
        setTimeout(() => reject('no connection'), 2000);
    });
  }
  
}