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

    this.setupTcpSocketCallbacks();
  }

  setupTcpSocketCallbacks() {
    this.kukaSocket.on('connect', () => {
      console.log(this.debugHeader + 'robot connected to socket');
      // this.requestVariableRead(`$POS_ACT`);
    });

    this.kukaSocket.on('error', (err) => {
        console.log(`> robot socket error: ${err}`);
    });

    this.kukaSocket.on('data', async(data) => {
        console.log('I am data!!!');
        let decodedResponse = this.decodeKvpResponse(await data);
        console.log(`Decoded Message`);
        console.log(`Read/Write: ${decodedResponse.rw},\n Response: ${decodedResponse.id},\n Value: ${decodedResponse.value},\n Success?: ${decodedResponse.success},`);
        console.log(`Whole Message: ${JSON.stringify(decodedResponse)}`);
        console.log('End of data!!!');
    });
  }

  requestVariableRead(variable) {
    const message = this.encodeKvpMessage(0, 0, variable);
    console.log(`encoding message ${message}`);
    this.kukaSocket.write(message);
  }

  async connectToSocket() {
    await this.kukaSocket.connect(this.port, this.ip, () => {
      console.log(`Connected to kuka socket at ${this.ip}:${this.port}`);
    });
  }

  async moveRobot(x, y, z, a, b, c){
    let commandModeKukaVar = 'COM_COMMAND_TYPE';
    this.requestVariableSet(commandModeKukaVar, '#MOTION');

    let mode = '#m_LIN';

    let f = new Frame_t(x, y, z, a, b, c);
    const r = 5;
    let motionRequestString = `{ M ${mode} , F {X ${f.X.toFixed(r)}, Y ${f.Y.toFixed(r)}, Z ${f.Z.toFixed(r)} }, COMPLETED FALSE }`;

    this.requestVariableSet(`COM_MOTION_REQUEST`, motionRequestString);
  }

  requestVariableSet(variable, value) {
    const message = this.encodeKvpMessage(0, 1, variable, value);
    console.log(`message: ${message}`);
    this.kukaSocket.write(message);
  }

  encodeKvpMessage(messageId, rw, varName, varValue) {

    const _id = this.uint16to8(messageId);
    const _rw = new Uint8Array([rw]);

    const _varNameAscii = new TextEncoder().encode(varName);
    const N = _varNameAscii.length;
    const _varNameLength = this.uint16to8(N);

    let M = 0;
    let _varValueAscii;
    let _varValueLength;

    if (rw === 1) {
        _varValueAscii = new TextEncoder().encode(varValue);
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

  decodeKvpResponse(rawMessage) {
    console.log(rawMessage)
    const _N = rawMessage.slice(5, 7)
    const N = this.uint8toNumber(_N);
    const _id = rawMessage.slice(0, 2);
    const _rw = rawMessage[4];
    const _value = rawMessage.slice(7, 7 + N);

    const _tail = rawMessage.slice(7 + N);

    // TODO chek lnegth
    let message = {};
    message.rw = _rw;
    message.id = this.uint8toNumber(_id);
    message.value = new TextDecoder().decode(_value);
    message.success = (_tail[0] === 0 && _tail[1] === 1 && _tail[2] === 1) ? true : false;

    return message;
  }

  uint8toNumber(a) {
    const lsb = a[1];
    const msb = a[0];
    return msb << 8 | lsb;
  }

  uint16to8(uint16) {
      var ret = new Uint8Array(2);
      ret[1] = uint16 & 0x00FF;
      ret[0] = (uint16 & 0xFF00) >> 8;
      return ret;
  }
}


