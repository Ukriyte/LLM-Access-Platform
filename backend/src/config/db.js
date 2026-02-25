const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "craftifai",
  password: process.env.DBpass,
  port: process.env.DBPort
});

module.exports = pool;