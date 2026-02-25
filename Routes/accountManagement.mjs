// Routes/accountManagement.mjs
import express from "express";
import { confirmLogin } from "../Modules/confirm.mjs";
import {
  signup,
  login,
  deleteUser,
  editUser,
  listUsers,
  getUser
} from "../Modules/userService.mjs";
const router = express.Router();
// SIGNUP
router.post("/signup", (req, res) => {
  try {
    const result = signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// LOGIN
router.post("/login", (req, res) => {
  try {
    const sessionUser = login(req.body);
    req.session.user = sessionUser;
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});
// DELETE USER
router.delete("/me", confirmLogin, (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = deleteUser(userId);
    req.session.destroy(() => res.json(result));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// EDIT USER
router.put("/editme", confirmLogin, (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = editUser(userId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// CURRENT USER
router.get("/currentUser", confirmLogin, (req, res) => {
  const user = getUser(req.session.user.id);
  res.json(user);
});
// USER LIST (admin demo)
router.get("/UList", confirmLogin, (req, res) => {
  res.json(listUsers());
});
export default router;