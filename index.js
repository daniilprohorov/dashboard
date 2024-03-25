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

function toHexString(n, l = 2) {
  const hexedString = _.toUpper(n.toString(16))
  if(!l) return hexedString

  return _.repeat('0', l - hexedString.length) + hexedString
}

async function saveToDb(db, value) {
  if(!db) {
    console.log("Error DB is not defined");
    return;
  }
  const {
    sof,
    iden,
    cmd_flags: cmdFlags,
    data
  } = dataToObject(value)
  const insertedValues = [
    toHexString(sof),
    toHexString(iden, 3),
    toHexString(cmdFlags, 1),
    _.join(_.map(data, toHexString), ' ')
  ];
  await db.run(`INSERT INTO bus(sof, iden, cmd_flags, data) VALUES(?, ?, ?, ?)`, insertedValues);
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
}

sqlite3.verbose()
main();