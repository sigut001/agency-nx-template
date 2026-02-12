const fs = require('fs');
const path = require('path');
const logFile = path.resolve(__dirname, '../debug/test.log');
fs.writeFileSync(logFile, 'Hello from test script\n');
console.log('Test script finished');
