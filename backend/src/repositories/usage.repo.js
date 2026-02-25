const pool = require("../config/db");
const { v4: uuid } = require("uuid");

/**
 * ATOMIC TOKEN CONSUMPTION
 * This prevents race conditions
 */
async function consumeTokens({
  userId,
  model,
  inputTokens,
  outputTokens
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Lock user row
    const userRes = await client.query(
      `SELECT * FROM users WHERE id=$1 FOR UPDATE`,
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) throw new Error("User not found");
    if (!user.is_active) throw new Error("User disabled");

    // total tokens
    const total = inputTokens + outputTokens;

    // check limits
    if (user.daily_used + total > user.daily_limit) {
      throw new Error("Daily token limit exceeded");
    }

    if (user.monthly_used + total > user.monthly_limit) {
      throw new Error("Monthly token limit exceeded");
    }

    // update counters
    await client.query(
      `UPDATE users 
       SET daily_used = daily_used + $1,
           monthly_used = monthly_used + $1
       WHERE id=$2`,
      [total, userId]
    );

    // insert usage log
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

module.exports = { consumeTokens };