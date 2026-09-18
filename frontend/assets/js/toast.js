(() => {
  "use strict";
  function toast(msg, type = "success") {
    let c = document.querySelector(".toast-container");
    if (!c) {
      c = document.createElement("div");
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  window.toast = toast;
})();
