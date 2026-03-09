import pool from "../db.mjs";
import fs from "fs";

const createUserQuery = fs.readFileSync(
  new URL("../Database/Users/createUser.sql", import.meta.url),
  "utf8"
);

const getUserByUsernameQuery = fs.readFileSync(
  new URL("../Database/Users/getUserByUsername.sql", import.meta.url),
  "utf8"
);

const getUserByIdQuery = fs.readFileSync(
  new URL("../Database/Users/getUserById.sql", import.meta.url),
  "utf8"
);

const deleteUserQuery = fs.readFileSync(
  new URL("../Database/Users/deleteUser.sql", import.meta.url),
  "utf8"
);

const updateUserQuery = fs.readFileSync(
  new URL("../Database/Users/updateUser.sql", import.meta.url),
  "utf8"
);

const listUsersQuery = fs.readFileSync(
  new URL("../Database/Users/listUsers.sql", import.meta.url),
  "utf8"
);


export async function signup({ username, password, email, tos }) {
  if (!username || !password || !email){
    throw new Error("MISSING_FIELDS");
  }
  if (tos !== true){
    throw new Error("TOS_REQ");
  }

  const existing = await pool.query(
    getUserByUsernameQuery,
    [username]
  );

  if (existing.rows.length > 0){
    throw new Error("USERNAME_TAKEN");
  }
  const result = await pool.query(
    createUserQuery,
    [username, email, password] 
  );

  return result.rows[0];
}


export async function login({ username, password }) {
  const result = await pool.query(
    getUserByUsernameQuery,
    [username]
  );

  if (result.rows.length === 0){
    throw new Error("INVALID_CREDENTIALS");
  }
  const user = result.rows[0];

  if (user.password !== password){
    throw new Error("INVALID_CREDENTIALS");
}
  return { id: user.id, username: user.username };
}


export async function deleteUser(userId) {
  const result = await pool.query(
    deleteUserQuery,
    [userId]
  );

  if (result.rowCount === 0){
    throw new Error("USER_NOT_FOUND");
  }
  return { success: true };
}


export async function editUser(userId, { username, email, password }) {
  const existing = await pool.query(
    getUserByIdQuery,
    [userId]
  );

  if (existing.rows.length === 0){
    throw new Error("USER_NOT_FOUND");
  }
  await pool.query(
    updateUserQuery,
    [username, email, password, userId]
  );

  return { success: true };
}


export async function listUsers() {
  const result = await pool.query(listUsersQuery);
  return result.rows;
}


export async function getUser(userId) {
  const result = await pool.query(
    getUserByIdQuery,
    [userId]
  );

  if (result.rows.length === 0){
    throw new Error("USER_NOT_FOUND");
  }
  return result.rows[0];
}