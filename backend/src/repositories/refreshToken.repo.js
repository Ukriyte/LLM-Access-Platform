const pool = require("../config/db");
const { v4: uuid } = require("uuid");

/**
 * Save refresh token
 */
async function saveRefreshToken(userId, token) {
  await pool.query(
    `INSERT INTO refresh_tokens(id, user_id, token)
     VALUES($1, $2, $3)`,
    [uuid(), userId, token]
  );
}

/**
 * Find refresh token
 */
async function findRefreshToken(token) {
  const res = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token=$1`,
    [token]
  );
  return res.rows[0];
}

/**
 * Delete refresh token
 */
async function deleteRefreshToken(token) {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE token=$1`,
    [token]
  );
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken
};