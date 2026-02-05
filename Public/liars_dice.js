document.body.innerHTML = `
  <main>
    <h1>User Management</h1>

    <section class="card">
      <h2>Create user</h2>
      <create-user></create-user>
    </section>

    <section class="card">
      <h2>Login</h2>
      <login-user></login-user>
    </section>

    <section class="card">
      <h2>Edit user</h2>
      <edit-user></edit-user>
    </section>

    <section class="card">
      <h2>Delete user</h2>
      <delete-user></delete-user>
    </section>

    <section class="card">
      <h2>Result</h2>
      <pre id="result"></pre>
      <p id="status" role="status"></p>
    </section>

    <button id="tos-open" type="button">Read Terms of Service</button>
    <label>
      <input type="checkbox" id="tos-check" />
      I accept the Terms of Service
    </label>

    <div id="tos-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Terms of Service</h3>
        <pre id="tos-text">Loading…</pre>
        <button id="tos-close" type="button">Close</button>
      </div>
    </div>
  </main>
`;

const API_BASE = "./acc"; 

const request = async (path = "", options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
};

const userService = {
  create: (user) => request("/signup", { method: "POST", body: JSON.stringify(user) }),
  login: (creds) => request("/login", { method: "POST", body: JSON.stringify(creds) }),
  update: (user) => request("/editme", { method: "PUT", body: JSON.stringify(user) }),
  remove: () => request("/me", { method: "DELETE" })
};

const makeUser = ({ username, password, email, tos }) => ({
  username,
  password,
  email,
  tos
});

class CreateUser extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <label>Username</label><input id="username" />
      <label>Email</label><input id="email" />
      <label>Password</label><input id="password" type="password" />
      <button>Create</button>
    `;
    this.querySelector("button").addEventListener("click", async () => {
      const username = this.querySelector("#username").value.trim();
      const email = this.querySelector("#email").value.trim();
      const password = this.querySelector("#password").value;
      const tos = document.querySelector("#tos-check").checked === true;

      const user = makeUser({ username, password, email, tos });
      try {
        const result = await userService.create(user);
        showResult(result);
        setStatus("Account created");
      } catch (err) {
        showResult({ error: err.message });
        setStatus(err.message, true);
      }
    });
  }
}

class LoginUser extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <label>Username</label><input id="username" />
      <label>Password</label><input id="password" type="password" />
      <button>Login</button>
    `;
    this.querySelector("button").addEventListener("click", async () => {
      const username = this.querySelector("#username").value.trim();
      const password = this.querySelector("#password").value;

      const creds = { username, password };
      try {
        const result = await userService.login(creds);
        showResult(result);
        setStatus("Logged in");
      } catch (err) {
        showResult({ error: err.message });
        setStatus(err.message, true);
      }
    });
  }
}

class EditUser extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <label>Username</label><input id="username" />
      <label>Email</label><input id="email" />
      <label>Password</label><input id="password" type="password" />
      <button>Update</button>
    `;
    this.querySelector("button").addEventListener("click", async () => {
      const username = this.querySelector("#username").value.trim();
      const email = this.querySelector("#email").value.trim();
      const password = this.querySelector("#password").value;

      const user = makeUser({ username, password, email, tos: undefined });
      try {
        const result = await userService.update(user);
        showResult(result);
        setStatus("Account updated");
      } catch (err) {
        showResult({ error: err.message });
        setStatus(err.message, true);
      }
    });
  }
}

class DeleteUser extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <p>Deletes the currently logged-in user.</p>
      <button>Delete</button>
    `;
    this.querySelector("button").addEventListener("click", async () => {
      try {
        const result = await userService.remove();
        showResult(result);
        setStatus("Account deleted");
      } catch (err) {
        showResult({ error: err.message });
        setStatus(err.message, true);
      }
    });
  }
}

customElements.define("create-user", CreateUser);
customElements.define("login-user", LoginUser);
customElements.define("edit-user", EditUser);
customElements.define("delete-user", DeleteUser);

const showResult = (data) => {
  document.querySelector("#result").textContent = JSON.stringify(data, null, 2);
};
const setStatus = (msg, isError = false) => {
  const statusEl = document.querySelector("#status");
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#b00020" : "#1a7f37";
};

const tosOpen = document.getElementById("tos-open");
const tosClose = document.getElementById("tos-close");
const tosModal = document.getElementById("tos-modal");
const tosText = document.getElementById("tos-text");

tosOpen.addEventListener("click", async () => {
  tosModal.classList.remove("hidden");
  if (tosText.dataset.loaded) return;
  const res = await fetch("./Documentation/TermsOfService.md");
  tosText.textContent = await res.text();
  tosText.dataset.loaded = "true";
});

tosClose.addEventListener("click", () => {
  tosModal.classList.add("hidden");
});