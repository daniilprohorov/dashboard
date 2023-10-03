const {SerialPort} = require('serialport')
const port = new SerialPort({
  path: '/dev/ttyAMA0',
  baudRate: 9600
});

// The open event is always emitted
port.on('data', function(data) {
  console.log(String(data))
});
