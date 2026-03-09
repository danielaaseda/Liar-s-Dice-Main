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
import { getLocale } from "../Modules/getLocale.mjs";

const router = express.Router();


router.post("/signup", async (req, res) => {
  const locale = getLocale(req);
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (err) {

    if (err.message === "MISSING_FIELDS") {
      return res.status(400).json({ error: locale.MISSING_FIELDS });
    }

    if (err.message === "USERNAME_TAKEN") {
      return res.status(400).json({ error: locale.USERNAME_TAKEN });
    }

    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

router.post("/login", async (req, res) => {
const locale = getLocale(req);
  try {
    const sessionUser = await login(req.body);
    req.session.user = sessionUser;
    res.json({ success: true });
  } catch (err) {

    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: locale.INVALID_CREDENTIALS });
    }

    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.delete("/me", confirmLogin, async (req, res) => {
  const locale = getLocale(req);
  try {
    const userId = req.session.user.id;
    const result = await deleteUser(userId);
    req.session.destroy(() => res.json(result));
  } catch (err) {

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: locale.USER_NOT_FOUND });
    }

    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

router.put("/editme", confirmLogin, async (req, res) => {
const locale = getLocale(req);
  try {
    const userId = req.session.user.id;
    const result = await editUser(userId, req.body);
    res.json(result);
  } catch (err) {

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: locale.USER_NOT_FOUND });
    }

    if (err.message === "USERNAME_TAKEN") {
      return res.status(400).json({ error: locale.USERNAME_TAKEN });
    }

    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

router.get("/currentUser", confirmLogin, async (req, res) => {
const locale = getLocale(req);
  try {
    const user = await getUser(req.session.user.id);
    res.json(user);
  } catch (err) {

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: locale.USER_NOT_FOUND });
    }

    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

router.get("/UList", confirmLogin, async (req, res) => {
const locale = getLocale(req);
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

export default router;