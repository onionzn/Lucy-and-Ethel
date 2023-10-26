import Net from 'net';

export class kukaVarProxyTcpClient {
  constructor(ip, port, DEBUG) {
    this.ip = ip;
    this.port = port;
    this.DEBUG = DEBUG;
    this.debugHeader = 'kukaVarProxyTcpClient > ';

    this.kukaSocket = new Net.Socket();
    this.kukaSocket.setNoDelay(true); // turn off buffering Nagle's
  }

  async connectToSocket() {
    this.kukaSocket.connect(this.port, this.ip, () => {
      console.log(`Connected to kuka socket at ${this.ip}:${this.port}`);
    });
    
    this.kukaSocket.on('error', (error) => {
      console.log(error);
    })
  }
  
}


