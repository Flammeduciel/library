(() => {
  "use strict";
  const { api, showError, loadAuteurs, loadAdherents, loadLivres, loadEmprunts, esc } = window.Biblio;

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

  /* ---------- Adhérent : ajout / modification ---------- */
  document.getElementById("btn-add-adherent").addEventListener("click", () => {
    openModal("Ajouter un adhérent", `
      <div class="alert danger" hidden></div>
      <label>Nom<input class="field" id="f-adh-nom" placeholder="Ex. Aminata Diallo"></label>
      <label>Téléphone<input class="field" id="f-adh-tel" placeholder="Ex. 77 123 45 67"></label>
      <label>Email<input class="field" id="f-adh-email" placeholder="Ex. aminata@email.com"></label>
      <button class="btn accent" id="f-adh-save">Enregistrer</button>
    `);
    document.getElementById("f-adh-save").addEventListener("click", async () => {
      try {
        const nom = document.getElementById("f-adh-nom").value.trim();
        const telephone = document.getElementById("f-adh-tel").value.trim() || null;
        const email = document.getElementById("f-adh-email").value.trim() || null;
        if (!nom) return formError("Le nom est obligatoire.");
        await api("/api/adherents", { method: "POST", body: JSON.stringify({ nom, telephone, email }) });
        backdrop.classList.remove("open");
        loadAdherents();
      } catch (e) { formError(e.message); }
    });
  });

  document.getElementById("adherents-body").addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-adherent]");
    const delBtn = e.target.closest("[data-del-adherent]");
    if (editBtn) {
      try {
        const a = await api(`/api/adherents/${editBtn.dataset.editAdherent}`);
        openModal("Modifier un adhérent", `
          <div class="alert danger" hidden></div>
          <label>Nom<input class="field" id="f-adh-nom" value="${esc(a.nom)}"></label>
          <label>Téléphone<input class="field" id="f-adh-tel" value="${esc(a.telephone)}"></label>
          <label>Email<input class="field" id="f-adh-email" value="${esc(a.email)}"></label>
          <button class="btn accent" id="f-adh-save">Enregistrer</button>
        `);
        document.getElementById("f-adh-save").addEventListener("click", async () => {
          try {
            const nom = document.getElementById("f-adh-nom").value.trim();
            const telephone = document.getElementById("f-adh-tel").value.trim() || null;
            const email = document.getElementById("f-adh-email").value.trim() || null;
            if (!nom) return formError("Le nom est obligatoire.");
            await api(`/api/adherents/${a.id}`, { method: "PUT", body: JSON.stringify({ nom, telephone, email }) });
            backdrop.classList.remove("open");
            loadAdherents();
          } catch (err) { formError(err.message); }
        });
      } catch (err) { showError(err.message); }
    }
    if (delBtn) {
      if (!confirm("Supprimer cet adhérent ?")) return;
      try {
        await api(`/api/adherents/${delBtn.dataset.delAdherent}`, { method: "DELETE" });
        loadAdherents();
      } catch (err) { showError(err.message); }
    }
  });

  /* ---------- Livre : ajout / modification ---------- */
  async function auteurOptions(selected = "") {
    const list = await api("/api/auteurs");
    return list.map((a) => `<option value="${a.id}" ${String(a.id) === String(selected) ? "selected" : ""}>${esc(a.nom)}</option>`).join("");
  }

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
          backdrop.classList.remove("open");
          loadLivres();
        } catch (e) { formError(e.message); }
      });
    } catch (e) { showError(e.message); }
  });

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
            backdrop.classList.remove("open");
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

  /* ---------- Emprunt : nouvel emprunt + retour ---------- */
  document.getElementById("btn-add-emprunt").addEventListener("click", async () => {
    try {
      const [adherents, livresData] = await Promise.all([api("/api/adherents"), api("/api/livres?limit=100")]);
      const dispo = livresData.livres.filter((l) => l.disponible);
      openModal("Nouvel emprunt", `
        <div class="alert danger" hidden></div>
        <label>Adhérent<select class="field" id="f-emp-adh">${adherents.map((a) => `<option value="${a.id}">${esc(a.nom)}</option>`).join("")}</select></label>
        <label>Livre<select class="field" id="f-emp-livre">${dispo.length ? dispo.map((l) => `<option value="${l.id}">${esc(l.titre)} — ${esc(l.auteur_nom)}</option>`).join("") : `<option value="">Aucun livre disponible</option>`}</select></label>
        <label>Date de retour prévue<input class="field" id="f-emp-date" type="date"></label>
        <button class="btn accent" id="f-emp-save">Enregistrer l'emprunt</button>
      `);
      document.getElementById("f-emp-save").addEventListener("click", async () => {
        try {
          const adherent_id = document.getElementById("f-emp-adh").value;
          const livre_id = document.getElementById("f-emp-livre").value;
          const date_retour_prevue = document.getElementById("f-emp-date").value;
          if (!adherent_id || !livre_id) return formError("Adhérent et livre obligatoires.");
          if (!date_retour_prevue) return formError("La date de retour prévue est obligatoire.");
          await api("/api/emprunts", { method: "POST", body: JSON.stringify({ adherent_id, livre_id, date_retour_prevue }) });
          backdrop.classList.remove("open");
          loadEmprunts();
          loadLivres();
        } catch (e) { formError(e.message); }
      });
    } catch (e) { showError(e.message); }
  });

  document.getElementById("emprunts-body").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-retour]");
    if (!btn) return;
    if (!confirm("Confirmer le retour de ce livre ?")) return;
    try {
      await api(`/api/emprunts/${btn.dataset.retour}/retour`, { method: "PUT" });
      loadEmprunts();
      loadLivres();
    } catch (err) { showError(err.message); }
  });
})();
