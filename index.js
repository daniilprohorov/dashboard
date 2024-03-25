import _ from 'lodash';
import sqlite3 from 'sqlite3'
import {open} from 'sqlite'
import {SerialPort} from 'serialport';
import {DelimiterParser} from '@serialport/parser-delimiter';

let db;
const port = new SerialPort({
  path: '/dev/cu.usbserial-10',
  baudRate: 115200
});
const parser = port.pipe(new DelimiterParser({ delimiter: '\n' }))

function dataToObject(data) {
  let str = data.toString();
  str = str.replace(/\r?\n|\r/g, '');
  return JSON.parse(str);
}

async function saveToDb(db, data) {
  if(!db) {
    console.log("Error DB is not defined");
    return;
  }
  const bus = dataToObject(data)
  const sofHexString = _.toUpper(bus.sof.toString(16));
  const idenHexString = _.toUpper(bus.iden.toString(16));
  const cmdFlagsHexString = _.toUpper(bus.cmd_flags.toString(16));
  const dataHexString = _.join(_.map(bus.data, v => _.toUpper(v.toString(16))), ' ');
  const insertData = [sofHexString, idenHexString, cmdFlagsHexString, dataHexString]
  await db.run(`INSERT INTO bus(sof, iden, cmd_flags, data) VALUES(?, ?, ?, ?)`, insertData);
}

parser.on('data', async function(data) {
  const obj = dataToObject(data)
  console.log(`${Date.now()} ${JSON.stringify(obj)}`)
  await saveToDb(db, data)
});


// you would have to import / invoke this in another file
async function openDb () {
  return open({
    filename: './db/test.db',
    driver: sqlite3.Database
  })
}

async function main() {
  db = await openDb();
  await db.exec('CREATE TABLE IF NOT EXISTS bus(sof text, iden text, cmd_flags text, data text, created DATETIME DEFAULT CURRENT_TIMESTAMP)');
  // await saveToDb(db, JSON.stringify({
  //   sof: 'sof',
  //   iden: 'iden',
  //   cmd_flags: 'cmd_flags',
  //   cmd_flags_f: 'cmd_flags_f',
  //   data: 'lol kek this is data'
  // }));
}

sqlite3.verbose()
main();