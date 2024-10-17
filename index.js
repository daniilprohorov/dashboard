import _ from 'lodash';
import {SerialPort} from 'serialport';
import { ReadlineParser } from 'serialport';
import {Server} from "socket.io";
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import express from 'express';
import bluebird from 'bluebird';
import { MockBinding } from '@serialport/binding-mock'
import dateFormat from 'dateformat';
import {program} from 'commander';
program.option('-d, --debug').option('-p, --port <char>');

program.parse();

const {
  debug = false,
  port: path = '/dev/cu.usbserial-FTB6SPL3'
} = program.opts();

MockBinding.createPort(path, {echo: false});

const port = debug 
  ? new SerialPort({
    binding: MockBinding,
    path,
    baudRate: 115200
  })
  : new SerialPort({
    path,
    baudRate: 115200
  });
// const parser = port.pipe(new DelimiterParser({ delimiter: '\n' }))
const parser = port.pipe(new ReadlineParser())

parser.on('data', async function(_data) {
  try {
    const {rpm, speed, ...data} = JSON.parse(_data);
    io.emit('moment_data', JSON.stringify({rpm, speed}));
    if(data.flvl) {
      data.flvl = data.flvl/2.5;
    }
    const time = dateFormat(new Date(), "HH:MM");
    const data2send = newData({...data, time})
    if(data2send) {
      io.emit('long_data', data2send);
    }
  } catch(e) {};
});

let _oldDataStringify;
function newData(_data) {
  const dataStringify = JSON.stringify(_data);
  if(dataStringify !== _oldDataStringify) {
    _oldDataStringify = dataStringify;
    return dataStringify;
  }
  return null;


}


const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

let isOpenSerialPortMock = false;
port.on('open', () => {
  isOpenSerialPortMock = true;
})
let i = 1000;
let up = true;
while(debug){
  if(isOpenSerialPortMock) {
    const dataFromPort = {rpm: i};
    port.port.emitData(`${JSON.stringify(dataFromPort)}\n`) 
    if(i >= 6000) {
      up = false;
    }
    // if(i <= _.random(800, 3000)) {
    if(i <= 800) {
      up = true;
    }
    if(up) {
      i += _.random(10, 50);
    } else {
      const random = _.random(10, 200);
      i -= random;

    }
  }
  await bluebird.delay(10);
}