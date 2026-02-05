import express from "express"
import { confirmLogin } from "./confirm.mjs"; 

const router = express.Router();
const users = [];
let nextUserId = 1;


router.post("/signup", (req, res) => {
const { username, password, email, tos, } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Username, password and Email required" });
  }

  if (tos !== true) {
    return res.status(400).json({ error: "You must accept the Terms of Service."})
  }

  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.status(409).json({ error: "Username already taken" });
  }
  if(!email || !email.includes("@")){
    return res.status(400).json({ error: "Invalid email."});
  }

  const newUser = {
    id: nextUserId++,
    username,
    password,
    email,
    consent: {
      tosAccepted: new Date().toISOString(),
    }
  };

  users.push(newUser);

  res.status(201).json({ success: true });
});


router.post("/login", (req, res) => {
    const{username, password} = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if(!user) {
        return res.status(401).json ({ error: "wrong username or password"});
    }

    req.session.user = {
        id: user.id,
        username: user.username
    };

    res.json({ success: true});
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true});
});

router.delete("/me", (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.put("/editme", (req, res) => {
  const userId = req.session?.user?.id;
  const {username, password, email} = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (username) {
    const usernameTaken = users.some(
      u => u.username === username && u.id !== userId
    );
    if (usernameTaken){
      return res.status(409).json({ error: "Name taken."});
    }
    user.username = username;
    req.session.user.username = username;
  }

  if (email){
    user.email = email;
  }
  if (password){
    user.password = password;
  }
  res.json({ success: true});
  });

  router.get("/currentUser", confirmLogin, (req, res) => {
    res.json(req.user);
  });

  router.get("/UList", confirmLogin, (req, res) => {
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.consent?.tosAccepted,
    }));
    res.json(userList);
  });

export default router;