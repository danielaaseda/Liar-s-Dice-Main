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

router.post("/signup", async (req, res) => {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(400).json({
      error: err.message,
      full: err
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const sessionUser = await login(req.body);
    req.session.user = sessionUser;
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.delete("/me", confirmLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await deleteUser(userId);
    req.session.destroy(() => res.json(result));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/editme", confirmLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await editUser(userId, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/currentUser", confirmLogin, async (req, res) => {
  try {
    const user = await getUser(req.session.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/UList", confirmLogin, async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;