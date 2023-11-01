import Net from 'net';
import { Frame_t } from './kukaTypes.js'

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
      this.kukaSocket.write("Hello World");
      this.kukaSocket.on('data', (data) => {console.log('data')});
    
    })
    
    
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

  encodeKvpMessage(messageId, rw, varName, varValue) {

    const _id = this.uint16to8(messageId);
    const _rw = new Uint8Array([rw]);

    const _varNameAscii = this.encoder.encode(varName);
    const N = _varNameAscii.length;
    const _varNameLength = this.uint16to8(N);

    let M = 0;
    let _varValueAscii;
    let _varValueLength;

    if (rw === 1) {
        _varValueAscii = this.encoder.encode(varValue);
        M = _varValueAscii.length
        _varValueLength = this.uint16to8(M);
    }

    const totalLength = (rw === 0) ? 7 + N : 9 + N + M;
    const contentLength = (rw === 0) ? 3 + N : 5 + N + M;

    const message = new Uint8Array(totalLength);
    message.set(_id, 0);
    message.set(this.uint16to8(contentLength), 2);
    message.set(_rw, 4);
    message.set(_varNameLength, 5);
    message.set(_varNameAscii, 7);

    if (rw === 1) {
        message.set(_varValueLength, 7 + N);
        message.set(_varValueAscii, 7 + N + 2);
    }

    return message;
  }
  
}


