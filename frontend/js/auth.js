(() => {
  "use strict";
  const TOKEN_KEY = "biblio_token";
  const USER_KEY = "biblio_user";
  const API = (window.APP_API_URL || "").replace(/\/+$/, "");

  const form = document.getElementById("login-form");
  const errBox = document.getElementById("login-error");

  async function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    if (!email || !email.includes("@")) return formError("Format email invalide.");
    if (!password) return formError("Le mot de passe est obligatoire.");

    errBox.hidden = true;
    try {
      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);

      localStorage.setItem(TOKEN_KEY, data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
      location.href = "index.html";
    } catch (err) {
      formError(err.message);
    }
  }

  function formError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
  });
})();