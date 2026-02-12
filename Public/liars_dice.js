const API_BASE = "/acc"; 

const loadView = async (viewName) => {
  const app = document.getElementById("app");
  const res = await fetch(`/Views/${viewName}.html`);
  app.innerHTML = await res.text();
  attachViewLogic(viewName);
};

const showResult = (data) => {
  const el = document.querySelector("#result");
  if (el) el.textContent = JSON.stringify(data, null, 2);
};

const setStatus = (msg, isError = false) => {
  const el = document.querySelector("#status");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#b00020" : "#1a7f37";
};

const request = async (path = "", options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

const userService = {
  signup: (user) => request("/signup", { method: "POST", body: JSON.stringify(user) }),
  login: (creds) => request("/login", { method: "POST", body: JSON.stringify(creds) }),
  update: (user) => request("/editme", { method: "PUT", body: JSON.stringify(user) }),
  remove: () => request("/me", { method: "DELETE" }),
  logout: () => request("/logout", { method: "GET" })
};

const attachViewLogic = (viewName) => {
  switch (viewName) {
    case "signup": bindSignup(); break;
    case "login": bindLogin(); break;
    case "edit": bindEdit(); break;
    case "dashboard": bindDashboard(); break;
    case "game": bindGame(); break;
  }
};

function bindSignup() {
  const form = document.querySelector("form");
  const tosOpen = document.getElementById("tos-open");
  const tosClose = document.getElementById("tos-close");
  const tosModal = document.getElementById("tos-modal");
  const tosText = document.getElementById("tos-text");

  tosOpen.addEventListener("click", async () => {
    tosModal.classList.remove("hidden");
    if (tosText.dataset.loaded) return;
    const res = await fetch("/Documentation/TermsOfService.md");
    tosText.textContent = await res.text();
    tosText.dataset.loaded = "true";
  });

  tosClose.addEventListener("click", () => {
    tosModal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      tos: form.querySelector("#tos-check").checked
    };

    try {
      const res = await userService.signup(user);
      showResult(res);
      setStatus("Account created successfully");
      
      setTimeout(() => loadView("login"), 1000);
    } catch (err) {
      showResult({ error: err.message });
      setStatus(err.message, true);
    }
  });

  const goLoginBtn = document.getElementById("go-login");
  if (goLoginBtn) {
    goLoginBtn.addEventListener("click", () => loadView("login"));
  }
}


function bindLogin() {
  const form = document.querySelector("form");
  const signupBtn = document.getElementById("go-signup");
  if (signupBtn) signupBtn.addEventListener("click", () => loadView("signup"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const creds = {
      username: form.username.value.trim(),
      password: form.password.value
    };

    try {
      const res = await userService.login(creds);
      showResult(res);
      setStatus("Logged in successfully");
      
      setTimeout(() => loadView("dashboard"), 500);
    } catch (err) {
      showResult({ error: err.message });
      setStatus(err.message, true);
    }
  });
}

function bindEdit() {
  const form = document.querySelector("form");
  const delBtn = document.querySelector("#delete-btn");
  const backBtn = document.querySelector("#go-back");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value
    };

    try {
      const res = await userService.update(user);
      showResult(res);
      setStatus("Account updated");
      setTimeout(() => loadView("dashboard"), 500);
    } catch (err) {
      showResult({ error: err.message });
      setStatus(err.message, true);
    }
  });

  delBtn.addEventListener("click", async () => {
    try {
      const res = await userService.remove();
      showResult(res);
      setStatus("Account deleted");
      setTimeout(() => loadView("login"), 800);
    } catch (err) {
      showResult({ error: err.message });
      setStatus(err.message, true);
    }
  });

  if (backBtn) backBtn.addEventListener("click", () => loadView("dashboard"));
}

function bindDashboard() {
  const logoutBtn = document.getElementById("logout-btn");
  const editBtn   = document.getElementById("edit-btn");
  const startGameBtn = document.getElementById("start-game-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await userService.logout();
        setStatus("Logged out successfully");
        setTimeout(() => loadView("login"), 500);
      } catch {
        setStatus("Logout failed", true);
      }
    });
  }

  if (editBtn) editBtn.addEventListener("click", () => loadView("edit"));

  if (startGameBtn)
    startGameBtn.addEventListener("click", () => loadView("game"));
  checkLoginStatus?.();
}
function bindGame() {
  const backBtn = document.getElementById("back-dashboard-btn");
  const rollBtn = document.getElementById("roll-btn");
  const playerName = document.getElementById("player-name");
  const diceArea = document.getElementById("player-dice");
  const log = document.getElementById("game-log");

  const username = sessionStorage.getItem("username") || "Player";
  playerName.textContent = username;

  const createDice = (count = 5) => {
    return Array.from({ length: count }, () =>
      Math.ceil(Math.random() * 6)
    );
  };

  rollBtn.addEventListener("click", () => {
    const dice = createDice();
    diceArea.innerHTML =
      dice.map(d => `<span class="die">🎲 ${d}</span>`).join(" ");
    log.textContent += `You rolled: ${dice.join(", ")}\n`;
  });

  backBtn.addEventListener("click", () => loadView("dashboard"));
}


loadView("login");
