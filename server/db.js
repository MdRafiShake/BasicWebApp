import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'rafi01960470590@#',
  database: 'basicwebapp'
});

console.log('MySQL Connected');
export default db;
