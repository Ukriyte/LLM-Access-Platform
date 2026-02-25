const pool = require("../config/db");

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  const res = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return res.rows[0];
}

/**
 * Find user by id
 */
async function findUserById(id) {
  const res = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [id]
  );
  return res.rows[0];
}

/**
 * Create user
 */
async function createUser(user) {
  const query = `
    INSERT INTO users(
      id,email,password,
      daily_limit,monthly_limit,
      daily_used,monthly_used,
      daily_reset_at,monthly_reset_at
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const values = [
    user.id,
    user.email,
    user.password,
    user.daily_limit,
    user.monthly_limit,
    user.daily_used,
    user.monthly_used,
    user.daily_reset_at,
    user.monthly_reset_at
  ];

  const res = await pool.query(query, values);
  return res.rows[0];
}

/**
 * Update usage counters
 */
async function updateUsage(userId, dailyAdd, monthlyAdd) {
  await pool.query(
    `UPDATE users 
     SET daily_used = daily_used + $1,
         monthly_used = monthly_used + $2
     WHERE id=$3`,
    [dailyAdd, monthlyAdd, userId]
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUsage
};