const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const tosOpen = document.getElementById("tos-open");
const tosClose = document.getElementById("tos-close");
const tosModal = document.getElementById("tos-modal");
const tosText = document.getElementById("tos-text");
const tosCheck = document.getElementById("tos-check");

const setStatus = (msg, isError = false) => {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#b00020" : "#1a7f37";
};

const getPayload = () => ({
  username: $("username").value,
  password: $("password").value,
  diceColor: $("diceColor").value
});

$("btn-signup").addEventListener("click", async () => {
  try {
    const res = await fetch("/acc/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload())
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Signup failed", true);
    setStatus("Account created");
  } catch {
    setStatus("Network error", true);
  }
});

$("btn-login").addEventListener("click", async () => {
  try {
    const res = await fetch("/acc/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload())
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Login failed", true);
    setStatus("Logged in");
  } catch {
    setStatus("Network error", true);
  }
});

$("btn-delete").addEventListener("click", async () => {
  try {
    const res = await fetch("/acc/delete", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Delete failed", true);
    setStatus("Account deleted");
  } catch {
    setStatus("Network error", true);
  }
});

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

if (!tosCheck.checked) {
  return setStatus("You must accept the Terms of Service.", true);
}