(() => {
  "use strict";
  const { api, showError, loadAuteurs, esc } = window.Biblio;

  const backdrop = document.getElementById("modal-backdrop");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");
  document.getElementById("modal-close").addEventListener("click", () => backdrop.classList.remove("open"));
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.classList.remove("open"); });

  function openModal(t, html) {
    title.textContent = t;
    body.innerHTML = html;
    backdrop.classList.add("open");
  }
  function formError(msg) {
    let el = body.querySelector(".alert.danger");
    if (!el) {
      el = document.createElement("div");
      el.className = "alert danger";
      body.prepend(el);
    }
    el.textContent = msg;
  }
  window.BiblioModal = { openModal, formError, backdrop, body };

  /* ---------- Auteur : ajout / modification ---------- */
  document.getElementById("btn-add-auteur").addEventListener("click", () => {
    openModal("Ajouter un auteur", `
      <div class="alert danger" hidden></div>
      <label>Nom<input class="field" id="f-auteur-nom" placeholder="Ex. Mariama Ba"></label>
      <label>Nationalité<input class="field" id="f-auteur-nat" placeholder="Ex. Sénégal"></label>
      <button class="btn accent" id="f-auteur-save">Enregistrer</button>
    `);
    document.getElementById("f-auteur-save").addEventListener("click", async () => {
      try {
        const nom = document.getElementById("f-auteur-nom").value.trim();
        const nationalite = document.getElementById("f-auteur-nat").value.trim() || null;
        if (!nom) return formError("Le nom est obligatoire.");
        await api("/api/auteurs", { method: "POST", body: JSON.stringify({ nom, nationalite }) });
        backdrop.classList.remove("open");
        loadAuteurs();
      } catch (e) { formError(e.message); }
    });
  });

  document.getElementById("auteurs-body").addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-auteur]");
    const delBtn = e.target.closest("[data-del-auteur]");
    if (editBtn) {
      try {
        const a = await api(`/api/auteurs/${editBtn.dataset.editAuteur}`);
        openModal("Modifier un auteur", `
          <div class="alert danger" hidden></div>
          <label>Nom<input class="field" id="f-auteur-nom" value="${esc(a.nom)}"></label>
          <label>Nationalité<input class="field" id="f-auteur-nat" value="${esc(a.nationalite)}"></label>
          <button class="btn accent" id="f-auteur-save">Enregistrer</button>
        `);
        document.getElementById("f-auteur-save").addEventListener("click", async () => {
          try {
            const nom = document.getElementById("f-auteur-nom").value.trim();
            const nationalite = document.getElementById("f-auteur-nat").value.trim() || null;
            if (!nom) return formError("Le nom est obligatoire.");
            await api(`/api/auteurs/${a.id}`, { method: "PUT", body: JSON.stringify({ nom, nationalite }) });
            backdrop.classList.remove("open");
            loadAuteurs();
          } catch (err) { formError(err.message); }
        });
      } catch (err) { showError(err.message); }
    }
    if (delBtn) {
      if (!confirm("Supprimer cet auteur ?")) return;
      try {
        await api(`/api/auteurs/${delBtn.dataset.delAuteur}`, { method: "DELETE" });
        loadAuteurs();
      } catch (err) { showError(err.message); }
    }
  });
})();
