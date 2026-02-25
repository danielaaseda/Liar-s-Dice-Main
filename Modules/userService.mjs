// Modules/userService.mjs

let users = [];
let nextUserId = 1;

export function signup({ username, password, email, tos }) {
  if (!username || !password || !email)
    throw new Error("Username, password and email required");

  if (tos !== true)
    throw new Error("You must accept the Terms of Service.");

  if (!email.includes("@"))
    throw new Error("Invalid email");

  const existing = users.find(u => u.username === username);
  if (existing)
    throw new Error("Username already taken");

  const newUser = {
    id: nextUserId++,
    username,
    password,
    email,
    consent: {
      tosAccepted: new Date().toISOString()
    }
  };

  users.push(newUser);
  return { success: true };
}

export function login({ username, password }) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) throw new Error("Wrong username or password");

  return { id: user.id, username: user.username };
}

export function deleteUser(userId) {
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("User not found");
  users.splice(index, 1);
  return { success: true };
}

export function editUser(userId, { username, email, password }) {
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error("User not found");

  if (username) {
    const taken = users.some(u => u.username === username && u.id !== userId);
    if (taken) throw new Error("Name taken");
    user.username = username;
  }

  if (email) user.email = email;
  if (password) user.password = password;

  return { success: true };
}

export function listUsers() {
  return users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    createdAt: u.consent?.tosAccepted
  }));
}

export function getUser(userId) {
  return users.find(u => u.id === userId) || null;
}
