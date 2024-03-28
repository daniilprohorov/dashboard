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
  //if(!l) return hexedString
  const repeat = l - hexedString.length;

  return _.repeat('0', repeat < 0 ? 0 : repeat) + hexedString
}

async function saveToDb(db, value) {
  if(!db) {
    console.log("Error DB is not defined");
    return;
  }
  const {
    iden,
    cmd_flag: cmdFlag,
    data
  } = dataToObject(value)
  const dataStr = _.join(data, ' ');
  const insertedValues = [
    iden,
    cmdFlag,
    dataStr
  ];
  await db.run(`INSERT INTO bus(iden, cmd_flag, data) VALUES(?, ?, ?)`, insertedValues);
  return {iden, cmdFlag, data: dataStr};
}

function showIden(obj, idenFilteredBy) {
  if (obj.iden === idenFilteredBy) {
    const {iden, cmdFlag, data} = obj;
    console.log(iden, ' | ', cmdFlag, ' | ', data);
  }
}

parser.on('data', async function(data) {
  const obj = dataToObject(data)
  const savedObj = await saveToDb(db, data)
  showIden(savedObj, '8FC');
  showIden(savedObj, '664');
  showIden(savedObj, '6E4');
  showIden(savedObj, '5E4');
  showIden(savedObj, '4E4');
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
  await db.exec('CREATE TABLE IF NOT EXISTS bus(iden text, cmd_flag text, data text, created DATETIME DEFAULT CURRENT_TIMESTAMP)');
}

sqlite3.verbose()
main();