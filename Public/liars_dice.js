const API_BASE_URL = "/acc";

const getElement = (selector) => document.querySelector(selector);

async function sendApiRequest(endpoint, method = "GET", payload) {
  const response = await fetch(API_BASE_URL + endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.error || "Request failed");
  }

  return responseData;
}

function updateStatusMessage(message, isError = false) {
  const statusElement = getElement("#status");
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.style.color = isError ? "red" : "green";
}

function displayJsonResult(data) {
  const resultElement = getElement("#result");
  if (resultElement) {
    resultElement.textContent = JSON.stringify(data, null, 2);
  }
}

const userApi = {
  createAccount: (userData) => sendApiRequest("/signup", "POST", userData),
  loginUser: (credentials) => sendApiRequest("/login", "POST", credentials),
  updateAccount: (userData) => sendApiRequest("/editme", "PUT", userData),
  deleteAccount: () => sendApiRequest("/me", "DELETE"),
  logoutUser: () => sendApiRequest("/logout")
};

async function loadPage(viewName) {
  const htmlContent = await fetch(`/Views/${viewName}.html`).then(res => res.text());
  getElement("#app").innerHTML = htmlContent;

  const pageBindings = {
    signup: setupSignupPage,
    login: setupLoginPage,
    edit: setupEditPage,
    dashboard: setupDashboardPage,
    game: setupGamePage
  };

  pageBindings[viewName]?.();
}

function setupSignupPage() {
  const signupForm = getElement("form");

  signupForm.onsubmit = async (event) => {
    event.preventDefault();

    const userData = {
      username: signupForm.username.value.trim(),
      email: signupForm.email.value.trim(),
      password: signupForm.password.value,
      acceptedTerms: getElement("#tos-check").checked
    };

    try {
      await userApi.createAccount(userData);
      updateStatusMessage("Account created successfully");
      loadPage("login");
    } catch (error) {
      updateStatusMessage(error.message, true);
    }
  };

  getElement("#go-login")?.onclick = () => loadPage("login");
}

function setupLoginPage() {
  const loginForm = getElement("form");

  getElement("#go-signup")?.onclick = () => loadPage("signup");

  loginForm.onsubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      username: loginForm.username.value.trim(),
      password: loginForm.password.value
    };

    try {
      await userApi.loginUser(loginData);
      sessionStorage.setItem("username", loginData.username);

      updateStatusMessage("Logged in successfully");
      loadPage("dashboard");
    } catch (error) {
      updateStatusMessage(error.message, true);
    }
  };
}

function setupEditPage() {
  const editForm = getElement("form");

  editForm.onsubmit = async (event) => {
    event.preventDefault();

    const updatedUserData = {
      username: editForm.username.value,
      email: editForm.email.value,
      password: editForm.password.value
    };

    try {
      await userApi.updateAccount(updatedUserData);
      updateStatusMessage("Account updated");
      loadPage("dashboard");
    } catch (error) {
      updateStatusMessage(error.message, true);
    }
  };

  getElement("#delete-btn")?.onclick = async () => {
    try {
      await userApi.deleteAccount();
      updateStatusMessage("Account deleted");
      loadPage("login");
    } catch (error) {
      updateStatusMessage(error.message, true);
    }
  };

  getElement("#go-back")?.onclick = () => loadPage("dashboard");
}

function setupDashboardPage() {
  getElement("#logout-btn")?.onclick = async () => {
    try {
      await userApi.logoutUser();
      updateStatusMessage("Logged out");
      loadPage("login");
    } catch (error) {
      updateStatusMessage(error.message, true);
    }
  };

  getElement("#edit-btn")?.onclick = () => loadPage("edit");
  getElement("#start-game-btn")?.onclick = () => loadPage("game");
}

function setupGamePage() {
  const gameLog = getElement("#game-log");
  const playerDiceContainer = getElement("#player-dice");

  getElement("#player-name").textContent =
    sessionStorage.getItem("username") || "Player";

  function renderPlayerDice(diceValues, diceColor = "gold") {
    playerDiceContainer.innerHTML = diceValues.map(value =>
      `<span class="die" style="color:${diceColor}; border-color:${diceColor}">
        🎲 ${value}
      </span>`
    ).join("");
  }

  async function startNewGame() {
    const selectedDiceType = getElement("#dice-type").value;
    const selectedDiceColor = getElement("#dice-colour").value;

    const gameData = await sendApiRequest("/game/start", "POST", {
      diceType: selectedDiceType,
      diceColour: selectedDiceColor
    });

    renderPlayerDice(gameData.dice, gameData.colour);
    gameLog.textContent = `Game started with d${selectedDiceType}\n`;
  }

  async function submitPlayerBid() {
    const bidQuantity = getElement("#bid-quantity").value;
    const bidValue = getElement("#bid-value").value;

    if (!bidQuantity || !bidValue) {
      gameLog.textContent += "Please enter both quantity and value\n";
      return;
    }

    const bidResponse = await sendApiRequest("/game/bid", "POST", {
      quantity: bidQuantity,
      value: bidValue
    });

    if (bidResponse.error) {
      gameLog.textContent += bidResponse.error + "\n";
      return;
    }

    if (bidResponse.action === "bid") {
      gameLog.textContent +=
        `Computer bid ${bidResponse.bid.quantity} × ${bidResponse.bid.value}\n`;
    }

    if (bidResponse.action === "liar") {
      gameLog.textContent += "Computer called liar!\n";
    }
  }

  async function callLiarAction() {
    const liarResult = await sendApiRequest("/game/liar", "POST");

    gameLog.textContent +=
      `Liar called!\nBid: ${liarResult.bid.quantity}×${liarResult.bid.value}\nActual: ${liarResult.actual}\n`;
  }

  getElement("#roll-btn").onclick = startNewGame;
  getElement("#bid-btn").onclick = submitPlayerBid;
  getElement("#liar-btn").onclick = callLiarAction;
  getElement("#back-dashboard-btn").onclick = () => loadPage("dashboard");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service_worker.js");
}

loadPage("login");