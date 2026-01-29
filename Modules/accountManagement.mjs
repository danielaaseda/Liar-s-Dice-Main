import express from "express"
const router = express.Router();
const users = [];
let nextUserId = 1;

//---------------Signup Route------------------------------

router.post("/signup", (req, res) => {
const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const newUser = {
    id: nextUserId++,
    username,
    password
  };

  users.push(newUser);

  res.status(201).json({ success: true });
});

//------------------Login----------------
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
//------------------LogOut---------------
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true});
});
//------------------Delete---------------
router.delete("/delete", (req, res) => {
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
})
export default router;