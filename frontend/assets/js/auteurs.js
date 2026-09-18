(() => {
  "use strict";
  const { api, showError, esc, canEdit, openModal, closeModal, formError } = window.Biblio;

  if (!canEdit()) document.getElementById("btn-add-auteur").hidden = true;

  async function loadAuteurs() {
    try {
      const list = await api("/api/auteurs");
      document.getElementById("auteurs-total").textContent = `${list.length} au total`;
      document.getElementById("auteurs-body").innerHTML = list.length ? list.map((a) => `
        <tr>
          <td>${esc(a.nom)}</td>
          <td style="color:var(--muted)">${esc(a.nationalite)}</td>
          <td style="white-space:nowrap;" ${canEdit() ? "" : "hidden"}>
            <button class="btn small" data-edit-auteur="${a.id}">Modifier</button>
            <button class="btn small danger" data-del-auteur="${a.id}">Supprimer</button>
          </td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="3">Aucun auteur.</td></tr>`;
    } catch (e) { showError(e.message); }
  }

  /* ---------- Ajout ---------- */
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
        toast("Enregistré !"); closeModal();
        loadAuteurs();
      } catch (e) { formError(e.message); }
    });
  });

  /* ---------- Modification / suppression ---------- */
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
            toast("Enregistré !"); closeModal();
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

  loadAuteurs();
})();