// generate.js
const bcrypt = require('bcryptjs');
const password = 'admin123';
console.log(bcrypt.hashSync(password, 10));