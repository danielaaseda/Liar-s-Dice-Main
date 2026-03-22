
const API_BASE = "/acc";

const $ = (sel) => document.querySelector(sel);
const request = async (path, options = {}) => {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message);
  return data;
};
const showResult = (data) => {
  const el = $("#result");
  if (el) el.textContent = JSON.stringify(data, null, 2);
};
const setStatus = (msg, isError = false) => {
  const el = $("#status");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#b00020" : "#1a7f37";
};

const userService = {
  signup: (u) => request("/signup", { method: "POST", body: JSON.stringify(u) }),
  login:  (c) => request("/login",  { method: "POST", body: JSON.stringify(c) }),
  update: (u) => request("/editme", { method: "PUT",  body: JSON.stringify(u) }),
  remove: () => request("/me",     { method: "DELETE" }),
  logout: () => request("/logout", { method: "GET" })
};

const loadView = async (name) => {
  const html = await fetch(`/Views/${name}.html`).then(r => r.text());
  $("#app").innerHTML = html;
  attachViewLogic(name);
};

const attachViewLogic = (name) => {
  const map = {
    signup: bindSignup,
    login: bindLogin,
    edit: bindEdit,
    dashboard: bindDashboard,
    game: bindGame
  };
  map[name]?.();
};

function bindSignup() {
  const form = document.querySelector("form");
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
      loadView("login");
    } catch (err) {
      setStatus(err.message, true);
      showResult({ error: err.message });
    }
  });
  document.getElementById("go-login")?.addEventListener("click", () => loadView("login"));
}

function bindLogin() {
  const form = $("form");
  $("#go-signup")?.addEventListener("click", () => loadView("signup"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const creds = {
      username: form.username.value.trim(),
      password: form.password.value
    };
    try {
      const res = await userService.login(creds);
      sessionStorage.setItem("username", creds.username);
      showResult(res);
      setStatus("Logged in");
      loadView("dashboard");
    } catch (e) {
      setStatus(e.message, true);
    }
  });
}

function bindEdit() {
  const form = $("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = {
      username: form.username.value,
      email: form.email.value,
      password: form.password.value
    };
    try {
      const res = await userService.update(user);
      setStatus("Account updated");
      showResult(res);
      loadView("dashboard");
    } catch (e) {
      setStatus(e.message, true);
    }
  });
  $("#delete-btn")?.addEventListener("click", async () => {
    try {
      await userService.remove();
      setStatus("Account deleted");
      loadView("login");
    } catch (e) {
      setStatus(e.message, true);
    }
  });
  $("#go-back")?.addEventListener("click", () => loadView("dashboard"));
}

function bindDashboard() {
  $("#logout-btn")?.addEventListener("click", async () => {
    try {
      await userService.logout();
      setStatus("Logged out");
      loadView("login");
    } catch (e) {
      setStatus(e.message, true);
    }
  });
  $("#edit-btn")?.addEventListener("click", () => loadView("edit"));
  $("#start-game-btn")?.addEventListener("click", () => loadView("game"));
}

function bindGame() {

  const log = $("#game-log");
  const diceArea = $("#player-dice");

  $("#player-name").textContent =
    sessionStorage.getItem("username") || "Player";

async function startGame() {

  const diceType = document.getElementById("dice-type").value;
  const diceColour = document.getElementById("dice-colour").value;

  const res = await fetch("/game/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      diceType,
      diceColour
    })
  });

  const data = await res.json();

  showDice(data.dice,data.colour);

  log.textContent = `Game started with d${diceType} dice!\n`;

}

function showDice(dice, colour = "gold") {

  diceArea.innerHTML =
    dice.map(n =>
      `<span class="die" style="border-color:${colour}; color:${colour}">
        🎲 ${n}
      </span>`
    ).join("");
}

  async function placeBid() {

    const quantity = $("#bid-quantity").value;
    const value = $("#bid-value").value;

    if (!quantity || !value) {
      log.textContent += "Enter quantity and value first.\n";
      return;
    }

    const res = await fetch("/game/bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quantity,
        value
      })
    });

    const data = await res.json();

    if (data.error) {
      log.textContent += data.error + "\n";
      return;
    }

    if (data.action === "bid") {
      log.textContent +=
        `Computer raised bid to ${data.bid.quantity} × ${data.bid.value}\n`;
    }

    if (data.action === "liar") {
      log.textContent +=
        `Computer called liar!\nBid: ${data.bid.quantity}×${data.bid.value}\nActual: ${data.actual}\n`;
    }

  }

  async function callLiar() {

    const res = await fetch("/game/liar", {
      method: "POST"
    });

    const data = await res.json();

    log.textContent +=
      `Liar called!\nBid was ${data.bid.quantity}×${data.bid.value}\nActual dice: ${data.actual}\n`;
  }

  $("#roll-btn").addEventListener("click", startGame);

  $("#bid-btn").addEventListener("click", placeBid);

  $("#liar-btn").addEventListener("click", callLiar);

  $("#back-dashboard-btn").addEventListener("click", () => loadView("dashboard"));

}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service_worker.js");
}

loadView("login");