(() => {
  "use strict";
  const { api, showError, esc, canEdit, isStaff, openModal, closeModal, formError } = window.Biblio;

  if (!canEdit()) document.getElementById("btn-add-livre").hidden = true;

  /* ---------- Lecture + recherche + pagination ---------- */
  let livrePage = 1, livreQ = "", livreAuteur = "", livreDispo = "";
  const LIVRE_LIMIT = 10;
  async function loadLivres() {
    try {
      const params = new URLSearchParams({ page: livrePage, limit: LIVRE_LIMIT });
      if (livreQ) params.set("q", livreQ);
      if (livreAuteur) params.set("auteur", livreAuteur);
      if (livreDispo) params.set("disponible", livreDispo);
      const data = await api("/api/livres?" + params.toString());
      document.getElementById("livres-total").textContent = `${data.pagination.total} au total`;
      document.getElementById("livres-page-info").textContent = `Page ${data.pagination.page} / ${Math.max(1, data.pagination.pages)}`;
      document.getElementById("livres-prev").disabled = data.pagination.page <= 1;
      document.getElementById("livres-next").disabled = data.pagination.page >= data.pagination.pages;
      document.getElementById("livres-body").innerHTML = data.livres.length ? data.livres.map((l) => `
        <tr>
          <td>${esc(l.titre)}</td>
          <td style="color:var(--muted)">${esc(l.auteur_nom)}</td>
          <td class="num">${esc(l.annee_publication)}</td>
          <td>${l.disponible ? '<span class="badge success">Disponible</span>' : '<span class="badge danger">Emprunté</span>'}</td>
          <td style="white-space:nowrap;" ${canEdit() ? "" : "hidden"}>
            <button class="btn small" data-edit-livre="${l.id}">Modifier</button>
            <button class="btn small danger" data-del-livre="${l.id}">Supprimer</button>
          </td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="5">Aucun livre trouvé.</td></tr>`;
      document.getElementById("livre-clear").hidden = !(livreQ || livreAuteur || livreDispo);
    } catch (e) { showError(e.message); }
  }
  document.getElementById("livre-search-btn").addEventListener("click", () => {
    livreQ = document.getElementById("livre-search").value.trim();
    livreAuteur = document.getElementById("livre-auteur").value.trim();
    livreDispo = document.getElementById("livre-dispo").value;
    livrePage = 1;
    loadLivres();
  });
  document.getElementById("livre-dispo").addEventListener("change", () => {
    livreDispo = document.getElementById("livre-dispo").value;
    livrePage = 1;
    loadLivres();
  });
  document.getElementById("livre-clear").addEventListener("click", () => {
    document.getElementById("livre-search").value = "";
    document.getElementById("livre-auteur").value = "";
    document.getElementById("livre-dispo").value = "";
    livreQ = ""; livreAuteur = ""; livreDispo = ""; livrePage = 1;
    loadLivres();
  });
  document.getElementById("livres-prev").addEventListener("click", () => { livrePage--; loadLivres(); });
  document.getElementById("livres-next").addEventListener("click", () => { livrePage++; loadLivres(); });

  /* ---------- Auteur options pour le formulaire ---------- */
  async function auteurOptions(selected = "") {
    const list = await api("/api/auteurs");
    return list.map((a) => `<option value="${a.id}" ${String(a.id) === String(selected) ? "selected" : ""}>${esc(a.nom)}</option>`).join("");
  }

  /* ---------- Ajout ---------- */
  document.getElementById("btn-add-livre").addEventListener("click", async () => {
    try {
      const opts = await auteurOptions();
      openModal("Ajouter un livre", `
        <div class="alert danger" hidden></div>
        <label>Titre<input class="field" id="f-livre-titre" placeholder="Ex. So Long a Letter"></label>
        <label>Auteur<select class="field" id="f-livre-auteur">${opts}</select></label>
        <label>Année de publication<input class="field" id="f-livre-annee" type="number" placeholder="Ex. 1979"></label>
        <button class="btn accent" id="f-livre-save">Enregistrer</button>
      `);
      document.getElementById("f-livre-save").addEventListener("click", async () => {
        try {
          const titre = document.getElementById("f-livre-titre").value.trim();
          const auteur_id = document.getElementById("f-livre-auteur").value;
          const annee = document.getElementById("f-livre-annee").value;
          if (!titre) return formError("Le titre est obligatoire.");
          if (!auteur_id) return formError("L'auteur est obligatoire.");
          await api("/api/livres", { method: "POST", body: JSON.stringify({ titre, auteur_id, annee_publication: annee || null }) });
          toast("Enregistré !"); closeModal();
          loadLivres();
        } catch (e) { formError(e.message); }
      });
    } catch (e) { showError(e.message); }
  });

  /* ---------- Modification / suppression ---------- */
  document.getElementById("livres-body").addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-livre]");
    const delBtn = e.target.closest("[data-del-livre]");
    if (editBtn) {
      try {
        const l = await api(`/api/livres/${editBtn.dataset.editLivre}`);
        const opts = await auteurOptions(l.auteur_id);
        openModal("Modifier un livre", `
          <div class="alert danger" hidden></div>
          <label>Titre<input class="field" id="f-livre-titre" value="${esc(l.titre)}"></label>
          <label>Auteur<select class="field" id="f-livre-auteur">${opts}</select></label>
          <label>Année de publication<input class="field" id="f-livre-annee" type="number" value="${esc(l.annee_publication)}"></label>
          <button class="btn accent" id="f-livre-save">Enregistrer</button>
        `);
        document.getElementById("f-livre-save").addEventListener("click", async () => {
          try {
            const titre = document.getElementById("f-livre-titre").value.trim();
            const auteur_id = document.getElementById("f-livre-auteur").value;
            const annee = document.getElementById("f-livre-annee").value;
            if (!titre) return formError("Le titre est obligatoire.");
            await api(`/api/livres/${l.id}`, { method: "PUT", body: JSON.stringify({ titre, auteur_id, annee_publication: annee || null }) });
            toast("Enregistré !"); closeModal();
            loadLivres();
          } catch (err) { formError(err.message); }
        });
      } catch (err) { showError(err.message); }
    }
    if (delBtn) {
      if (!confirm("Supprimer ce livre ?")) return;
      try {
        await api(`/api/livres/${delBtn.dataset.delLivre}`, { method: "DELETE" });
        loadLivres();
      } catch (err) { showError(err.message); }
    }
  });

  loadLivres();
})();