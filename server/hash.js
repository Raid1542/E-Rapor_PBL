const bcrypt = require('bcrypt');
const password = 'root123'; 
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash:', hash);
});