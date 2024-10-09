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
const debug = true;
const path = '/dev/cu.usbserial-FTB6SPL3';

MockBinding.createPort(path, {echo: false});

let data;
// let db;
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
    data = JSON.parse(_data);
    // console.log(data.fcns)
  } catch(e) {};
});


const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', async (socket) => {
  console.log('a user connected');
  // socket.emit('hi', JSON.stringify(data));
  // let i = 0;
  while(true) {

    await bluebird.delay(10);

    // flvl: data.flvl/2.5
    const time = dateFormat(new Date(), "HH:MM");
    socket.emit('hi', JSON.stringify({
      ...data,
      time
    }));
  }
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