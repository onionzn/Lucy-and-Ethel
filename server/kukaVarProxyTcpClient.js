import Net from 'net';
import Frame_t from './kukaTypes.js'

export class kukaVarProxyTcpClient {
  constructor(ip, port, DEBUG) {
    this.ip = ip;
    this.port = port;
    this.DEBUG = DEBUG;
    this.debugHeader = 'kukaVarProxyTcpClient > ';

    this.kukaSocket = new Net.Socket();
    this.kukaSocket.setNoDelay(true); // turn off buffering Nagle's
    
    // robot motions
    this.motionQueueSize = 2;
    this.motionQueueCounter = 0;
  }

  async connectToSocket() {
    this.kukaSocket.connect(this.port, this.ip, () => {
      console.log(`Connected to kuka socket at ${this.ip}:${this.port}`);
    });
    
    this.kukaSocket.on('error', (error) => {
      console.log(error);
    })
  }

  async moveRobot(){
    let mode = '#m_LIN';
    let f = new Frame_t(0,0,0,0,0,0);
    const r = 5;
    let motionRequestString = `{ M ${mode} , F {X ${f.X.toFixed(r)}, Y ${f.Y.toFixed(r)}, Z ${f.Z.toFixed(r)} } , COMPLETED FALSE }`;
    this.requestVariableSet(`COM_MOTION_REQUEST_0`, motionRequestString);
  }

  requestVariableSet(variable, value) {
    const message = this.encodeKvpMessage(0, 1, variable, value);
    this.kukaSocket.write(message);
  }
  
}


