import _ from 'lodash';
import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import {SerialPort} from 'serialport';
import { ReadlineParser } from 'serialport';
import {Server} from "socket.io";
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import express from 'express';
import bluebird from 'bluebird';
import { SerialPortMock } from 'serialport'
import { MockBinding } from '@serialport/binding-mock'
import { DelimiterParser } from 'serialport';
const debug = false;
const path = '/dev/cu.usbserial-FTB6SPL3';
// const path = '/dev/ROBOT';

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
const parser = port.pipe(new DelimiterParser({ delimiter: '\n' }))
// const parser = port.pipe(new ReadlineParser())

parser.on('data', async function(_data) {
  try {
    //console.log(_data)
    data = dataToObject(_data);
  } catch (e) {}
  // const dataObject = dataToObject(data)
  // if(dataObject.data !== 'error') {
  //   console.log(dataObject)
  // }
  //console.log('sending error via serial');
  // const obj = dataToObject(data)
  // const savedObj = await saveToDb(db, data)
  // showIden(savedObj, '8FC');
  // showIden(savedObj, '664');
  // showIden(savedObj, '6E4');
  // showIden(savedObj, '5E4');
  // showIden(savedObj, '4E4');
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
    socket.emit('hi', JSON.stringify(data));
  }
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

function dataToObject(data) {
  let str = data.toString();
  str = str.replace(/\r?\n|\r/g, '');
  return JSON.parse(str);
}

// let isOpenSerialPortMock = false;
// port.on('open', () => {
//   // ...then test by simulating incoming data
//   isOpenSerialPortMock = true;
// })

// let i = 0;
// while(true){
//   if(isOpenSerialPortMock) {
//     const dataFromPort = {rpm: i};
//     port.port.emitData(`${JSON.stringify(dataFromPort)}\n`) 
//     i++;
//   }
//   await bluebird.delay(300);
// }
