const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const userRepo = require("../repositories/user.repo");
const { generateAccessToken, generateRefreshToken } = require("./token.service");
const { revokeRefreshToken } = require("./token.service");
/**
 * REGISTER USER
 */
async function register(email, password) {

  // check if exists in DB
  const exists = await userRepo.findUserByEmail(email);
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const now = new Date();

  // next midnight reset
  const nextDaily = new Date();
  nextDaily.setHours(24, 0, 0, 0);

  // next month reset
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  const user = {
    id: uuid(),
    email,
    password: hashed,
    daily_limit: 50000,
    monthly_limit: 1000000,
    daily_used: 0,
    monthly_used: 0,
    daily_reset_at: nextDaily,
    monthly_reset_at: nextMonth
  };

  const createdUser = await userRepo.createUser(user);
  return createdUser;
}

/**
 * LOGIN USER
 */
async function login(email, password) {

  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return { accessToken, refreshToken, role: user.role };
}

/**
 * LOGOUT USER (remove refresh token)
 */
// const { readJSON, writeJSON } = require("../utils/fileDB");

async function logout(refreshToken) {
  await revokeRefreshToken(refreshToken);
}

module.exports = { register, login, logout };