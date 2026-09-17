(() => {
  "use strict";
  const { api, showError, esc, canEdit, isStaff, openModal, closeModal, formError } = window.Biblio;

  if (!canEdit()) document.getElementById("btn-add-adherent").hidden = true;

  async function loadAdherents() {
    try {
      const data = await api("/api/users?role=adherent&limit=100");
      const list = data.users;
      document.getElementById("adherents-total").textContent = `${list.length} au total`;
      document.getElementById("adherents-body").innerHTML = list.length ? list.map((a) => `
        <tr>
          <td>${esc(a.nom)}</td>
          <td style="color:var(--muted)">${esc(a.telephone || a.email || "—")}</td>
          <td style="white-space:nowrap;" ${canEdit() ? "" : "hidden"}>
            <button class="btn small" data-history="${a.id}" data-name="${esc(a.nom)}">Historique</button>
            <button class="btn small" data-edit-adherent="${a.id}">Modifier</button>
            <button class="btn small danger" data-del-adherent="${a.id}">Supprimer</button>
          </td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="3">Aucun adhérent.</td></tr>`;
    } catch (e) { showError(e.message); }
  }

  /* ---------- Ajout ---------- */
  document.getElementById("btn-add-adherent").addEventListener("click", () => {
    openModal("Ajouter un adhérent", `
      <div class="alert danger" hidden></div>
      <label>Nom<input class="field" id="f-adh-nom" placeholder="Ex. Aminata Diallo"></label>
      <label>Téléphone<input class="field" id="f-adh-tel" placeholder="Ex. 77 123 45 67"></label>
      <label>Email<input class="field" id="f-adh-email" placeholder="Ex. aminata@email.com"></label>
      <label>Mot de passe<input class="field" id="f-adh-pwd" type="password" placeholder="Min. 6 caractères"></label>
      <button class="btn accent" id="f-adh-save">Enregistrer</button>
    `);
    document.getElementById("f-adh-save").addEventListener("click", async () => {
      try {
        const nom = document.getElementById("f-adh-nom").value.trim();
        const telephone = document.getElementById("f-adh-tel").value.trim() || null;
        const email = document.getElementById("f-adh-email").value.trim();
        const password = document.getElementById("f-adh-pwd").value;
        if (!nom) return formError("Le nom est obligatoire.");
        if (!email) return formError("L'email est obligatoire.");
        if (!password || password.length < 6) return formError("Mot de passe requis (min. 6 caractères).");
        await api("/api/users", { method: "POST", body: JSON.stringify({ nom, telephone, email, password, role: "adherent" }) });
        toast("Enregistré !"); closeModal();
        loadAdherents();
      } catch (e) { formError(e.message); }
    });
  });

  /* ---------- Modification / suppression ---------- */
  document.getElementById("adherents-body").addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-adherent]");
    const delBtn = e.target.closest("[data-del-adherent]");
    if (editBtn) {
      try {
        const a = await api(`/api/users/${editBtn.dataset.editAdherent}`);
        openModal("Modifier un adhérent", `
          <div class="alert danger" hidden></div>
          <label>Nom<input class="field" id="f-adh-nom" value="${esc(a.nom)}"></label>
          <label>Téléphone<input class="field" id="f-adh-tel" value="${esc(a.telephone)}"></label>
          <label>Email<input class="field" id="f-adh-email" value="${esc(a.email)}"></label>
          <label>Mot de passe (laisser vide pour ne pas changer)<input class="field" id="f-adh-pwd" type="password" placeholder="••••••••"></label>
          <button class="btn accent" id="f-adh-save">Enregistrer</button>
        `);
        document.getElementById("f-adh-save").addEventListener("click", async () => {
          try {
            const nom = document.getElementById("f-adh-nom").value.trim();
            const telephone = document.getElementById("f-adh-tel").value.trim() || null;
            const email = document.getElementById("f-adh-email").value.trim();
            const password = document.getElementById("f-adh-pwd").value || undefined;
            if (!nom) return formError("Le nom est obligatoire.");
            await api(`/api/users/${a.id}`, { method: "PUT", body: JSON.stringify({ nom, telephone, email, password }) });
            toast("Enregistré !"); closeModal();
            loadAdherents();
          } catch (err) { formError(err.message); }
        });
      } catch (err) { showError(err.message); }
    }
    if (delBtn) {
      if (!confirm("Supprimer cet adhérent ?")) return;
      try {
        await api(`/api/users/${delBtn.dataset.delAdherent}`, { method: "DELETE" });
        loadAdherents();
      } catch (err) { showError(err.message); }
    }
  });

  /* ---------- Historique ---------- */
  document.getElementById("adherents-body").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-history]");
    if (!btn) return;
    try {
      const list = await api(`/api/users/${btn.dataset.history}/emprunts`);
      document.getElementById("history-title").textContent = `Historique — ${btn.dataset.name}`;
      document.getElementById("history-body").innerHTML = list.length ? `
        <table><thead><tr><th>Livre</th><th>Emprunté le</th><th>Retour prévu</th><th>Rendu le</th></tr></thead>
        <tbody>${list.map((x) => `
          <tr>
            <td>${esc(x.livre_titre)}</td>
            <td style="color:var(--muted)">${new Date(x.date_emprunt).toLocaleDateString("fr-FR")}</td>
            <td style="color:var(--muted)">${new Date(x.date_retour_prevue).toLocaleDateString("fr-FR")}</td>
            <td>${x.date_retour_effective ? new Date(x.date_retour_effective).toLocaleDateString("fr-FR") : '<span class="badge accent">En cours</span>'}</td>
          </tr>`).join("")}</tbody></table>`
        : "<p style='color:var(--muted)'>Aucun emprunt pour cet adhérent.</p>";
      document.getElementById("history-backdrop").classList.add("open");
    } catch (err) { showError(err.message); }
  });
  document.getElementById("history-close").addEventListener("click", () => document.getElementById("history-backdrop").classList.remove("open"));
  document.getElementById("history-backdrop").addEventListener("click", (e) => { if (e.target.id === "history-backdrop") e.target.classList.remove("open"); });

  loadAdherents();
})();