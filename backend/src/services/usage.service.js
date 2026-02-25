const pool = require("../config/db");
const { v4: uuid } = require("uuid");

/**
 * Helpers for reset calculation
 */
function computeNextDailyReset() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next;
}

function computeNextMonthlyReset() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * 🔴 PRE-CHECK BEFORE CALLING LLM
 * Uses estimated tokens
*/
async function checkUserCanConsume(userId, estimatedTokens) {
  const res = await pool.query(
    `SELECT daily_used, monthly_used,
            daily_limit, monthly_limit,
            daily_reset_at, monthly_reset_at
     FROM users WHERE id=$1`,
    [userId]
  );

  const user = res.rows[0];
  if (!user) throw new Error("User not found");

  let dailyUsed = user.daily_used;
  let monthlyUsed = user.monthly_used;

  const now = new Date();

  // simulate reset if needed
  if (!user.daily_reset_at || now > new Date(user.daily_reset_at)) {
    dailyUsed = 0;
  }

  if (!user.monthly_reset_at || now > new Date(user.monthly_reset_at)) {
    monthlyUsed = 0;
  }

  if (dailyUsed + estimatedTokens > user.daily_limit) {
    throw new Error("Daily token limit exceeded");
  }

  if (monthlyUsed + estimatedTokens > user.monthly_limit) {
    throw new Error("Monthly token limit exceeded");
  }

  return true;
}

/**
 * 🔥 FINAL USAGE CONSUMPTION (ATOMIC)
 */
async function addUsage({
  userId,
  model,
  inputTokens,
  outputTokens
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      `SELECT * FROM users WHERE id=$1 FOR UPDATE`,
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) throw new Error("User not found");
    if (!user.is_active) throw new Error("User disabled");

    const now = new Date();

    let dailyUsed = user.daily_used;
    let monthlyUsed = user.monthly_used;
    let dailyResetAt = user.daily_reset_at;
    let monthlyResetAt = user.monthly_reset_at;

    // daily reset
    if (!dailyResetAt || now > new Date(dailyResetAt)) {
      dailyUsed = 0;
      dailyResetAt = computeNextDailyReset();
    }

    // monthly reset
    if (!monthlyResetAt || now > new Date(monthlyResetAt)) {
      monthlyUsed = 0;
      monthlyResetAt = computeNextMonthlyReset();
    }

    const total = inputTokens + outputTokens;

    // final check (real tokens)
    // if (dailyUsed > user.daily_limit) {
    //   throw new Error("Daily token limit exceeded");
    // }

    // if (monthlyUsed > user.monthly_limit) {
    //   throw new Error("Monthly token limit exceeded");
    // }

    // update user
    await client.query(
      `UPDATE users
       SET daily_used=$1,
           monthly_used=$2,
           daily_reset_at=$3,
           monthly_reset_at=$4
       WHERE id=$5`,
      [
        dailyUsed + total,
        monthlyUsed + total,
        dailyResetAt,
        monthlyResetAt,
        userId
      ]
    );

    // insert log
    await client.query(
      `INSERT INTO usage_logs(
        id,user_id,model,
        input_tokens,output_tokens,total_tokens
      )
      VALUES($1,$2,$3,$4,$5,$6)`,
      [
        uuid(),
        userId,
        model,
        inputTokens,
        outputTokens,
        total
      ]
    );

    await client.query("COMMIT");

    return {
      inputTokens,
      outputTokens,
      totalTokens: total
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Usage summary
 */
async function getUsageSummary(userId) {
  const userRes = await pool.query(
    `SELECT daily_used, monthly_used,
            daily_limit, monthly_limit
     FROM users WHERE id=$1`,
    [userId]
  );

  const user = userRes.rows[0];
  if (!user) throw new Error("User not found");

  const logRes = await pool.query(
    `SELECT COUNT(*) as total_requests,
            COALESCE(SUM(total_tokens),0) as total_tokens
     FROM usage_logs WHERE user_id=$1`,
    [userId]
  );

  return {
    daily_used: user.daily_used,
    monthly_used: user.monthly_used,
    daily_limit: user.daily_limit,
    monthly_limit: user.monthly_limit,
    total_requests: parseInt(logRes.rows[0].total_requests),
    total_tokens_used: parseInt(logRes.rows[0].total_tokens)
  };
}

module.exports = {
  addUsage,
  getUsageSummary,
  checkUserCanConsume
};