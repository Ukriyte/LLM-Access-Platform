const pool = require("../config/db");

/**
 * View all users
 */
async function getAllUsers() {
  const res = await pool.query(
    `SELECT id,email,
            daily_limit,monthly_limit,
            daily_used,monthly_used,
            is_active,role,created_at
     FROM users
     ORDER BY created_at DESC`
  );
  return res.rows;
}

/**
 * Update token limits
 */
async function updateLimits(userId, dailyLimit, monthlyLimit) {
  const res = await pool.query(
    `UPDATE users
     SET daily_limit=$1,
         monthly_limit=$2
     WHERE id=$3
     RETURNING *`,
    [dailyLimit, monthlyLimit, userId]
  );

  if (!res.rows[0]) throw new Error("User not found");
  return res.rows[0];
}

/**
 * Reset usage
 */
async function resetUsage(userId) {
  const now = new Date();

  const nextDaily = new Date();
  nextDaily.setHours(24,0,0,0);

  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth()+1,
    1
  );

  const res = await pool.query(
    `UPDATE users
     SET daily_used=0,
         monthly_used=0,
         daily_reset_at=$1,
         monthly_reset_at=$2
     WHERE id=$3
     RETURNING *`,
    [nextDaily, nextMonth, userId]
  );

  if (!res.rows[0]) throw new Error("User not found");
  return res.rows[0];
}

/**
 * Disable or enable user
 */
async function toggleUser(userId, isActive) {
  const res = await pool.query(
    `UPDATE users
     SET is_active=$1
     WHERE id=$2
     RETURNING *`,
    [isActive, userId]
  );

  if (!res.rows[0]) throw new Error("User not found");
  return res.rows[0];
}

/**
 * SYSTEM OVERVIEW
 */
async function getOverview() {
  const totalUsers = await pool.query(
    `SELECT COUNT(*) FROM users`
  );

  const activeUsers = await pool.query(
    `SELECT COUNT(*) FROM users WHERE is_active=true`
  );

  const totalRequests = await pool.query(
    `SELECT COUNT(*) FROM usage_logs`
  );

  const totalTokens = await pool.query(
    `SELECT COALESCE(SUM(total_tokens),0) FROM usage_logs`
  );

  return {
    total_users: parseInt(totalUsers.rows[0].count),
    active_users: parseInt(activeUsers.rows[0].count),
    total_requests: parseInt(totalRequests.rows[0].count),
    total_tokens: parseInt(totalTokens.rows[0].coalesce)
  };
}

/**
 * DAILY USAGE (last 7 days)
 */
async function getDailyUsage() {
  const res = await pool.query(`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM-DD') as day,
      SUM(total_tokens)::int as tokens
    FROM usage_logs
    GROUP BY day
    ORDER BY day DESC
    LIMIT 7
  `);

  return res.rows;
}
/**
 * TOP USERS
 */
async function getTopUsers() {
  const res = await pool.query(
    `SELECT u.email,
            SUM(l.total_tokens)::int as tokens
     FROM usage_logs l
     JOIN users u ON u.id=l.user_id
     GROUP BY u.email
     ORDER BY tokens DESC
     LIMIT 5`
  );

  return res.rows;
}

/**
 * MODEL USAGE
 */
async function getModelUsage() {
  const res = await pool.query(
    `SELECT model,
            SUM(total_tokens)::int as tokens
     FROM usage_logs
     GROUP BY model
     ORDER BY tokens DESC`
  );

  return res.rows;
}


module.exports = {
  getAllUsers,
  updateLimits,
  resetUsage,
  toggleUser,
  getOverview,
  getDailyUsage,
  getTopUsers,
  getModelUsage
};