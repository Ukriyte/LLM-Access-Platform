const pool = require("./src/config/db");

pool.query("SELECT NOW()", (err, res) => {
  console.log(err, res.rows);
  process.exit();
});