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
const debug = true;
// const path = '/dev/cu.usbserial-10';
const path = '/dev/ROBOT';

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

// function dataToObject(data) {
//   let str = data.toString();
//   str = str.replace(/\r?\n|\r/g, '');
//   return JSON.parse(str);
// }

// function toHexString(n, l = 2) {
//   const hexedString = _.toUpper(n.toString(16))
//   //if(!l) return hexedString
//   const repeat = l - hexedString.length;

//   return _.repeat('0', repeat < 0 ? 0 : repeat) + hexedString
// }

// async function saveToDb(db, value) {
//   if(!db) {
//     console.log("Error DB is not defined");
//     return;
//   }
//   const {
//     iden,
//     cmd_flag: cmdFlag,
//     data
//   } = dataToObject(value)
//   const dataStr = _.join(data, ' ');
//   const insertedValues = [
//     iden,
//     cmdFlag,
//     dataStr
//   ];
//   await db.run(`INSERT INTO bus(iden, cmd_flag, data) VALUES(?, ?, ?)`, insertedValues);
//   return {iden, cmdFlag, data: dataStr};
// }

// function showIden(obj, idenFilteredBy) {
//   if (obj.iden === idenFilteredBy) {
//     const {iden, cmdFlag, data} = obj;
//     console.log(iden, ' | ', cmdFlag, ' | ', data);
//   }
// }

parser.on('data', async function(_data) {
  data = JSON.parse(_data);
  // console.log(_data);
  // const obj = dataToObject(data)
  // const savedObj = await saveToDb(db, data)
  // showIden(savedObj, '8FC');
  // showIden(savedObj, '664');
  // showIden(savedObj, '6E4');
  // showIden(savedObj, '5E4');
  // showIden(savedObj, '4E4');
});


// // you would have to import / invoke this in another file
// async function openDb () {
//   return open({
//     filename: './db/test.db',
//     driver: sqlite3.Database
//   })
// }

// async function main() {
//   db = await openDb();
//   await db.exec('CREATE TABLE IF NOT EXISTS bus(iden text, cmd_flag text, data text, created DATETIME DEFAULT CURRENT_TIMESTAMP)');
// }


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

// let i = 0
// while(true) {
//   await bluebird.delay(1000);
//   // data = {lol: `${i}`}
//   console.log('lol')
//   // port.write(`data${i}\\nasdas;dlfkjasdf\\n`)
//   // port.write('kek\n')
//   port.binding.emitData('kek\n')

//   // port.write(JSON.stringify({testData: 'value', cycle: i}))
//   i++;
// }
let isOpenSerialPortMock = false;
port.on('open', () => {
  // ...then test by simulating incoming data
  isOpenSerialPortMock = true;
})
let i = 0;
while(true){
  if(isOpenSerialPortMock) {
    const dataFromPort = {rpm: i};
    port.port.emitData(`${JSON.stringify(dataFromPort)}\n`) 
    i++;
  }
  await bluebird.delay(300);
}

// sqlite3.verbose()
// main();