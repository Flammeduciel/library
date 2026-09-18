(() => {
  "use strict";
  const { api, showError, esc, canEdit, openModal, closeModal, formError } = window.Biblio;

  if (!canEdit()) {
    document.getElementById("btn-add-emprunt").hidden = true;
    document.getElementById("btn-export-csv").hidden = true;
  }

  async function loadEmprunts() {
    try {
      const filtre = document.getElementById("emprunt-filtre").value;
      const data = await api("/api/emprunts" + (filtre ? `?statut=${filtre}` : ""));
      const nbRetard = data.filter((x) => !x.date_retour_effective && new Date(x.date_retour_prevue) < new Date()).length;
      document.getElementById("emprunts-total").textContent = nbRetard
        ? `${data.length} affiché(s) — ${nbRetard} en retard`
        : `${data.length} affiché(s)`;
      document.getElementById("emprunts-body").innerHTML = data.length ? data.map((x) => {
        const enRetard = !x.date_retour_effective && new Date(x.date_retour_prevue) < new Date();
        const statut = x.date_retour_effective
          ? '<span class="badge success">Rendu</span>'
          : enRetard ? '<span class="badge danger">En retard</span>' : '<span class="badge accent">En cours</span>';
        return `
        <tr class="${enRetard ? "late" : ""}">
          <td>${esc(x.livre_titre)}</td>
          <td style="color:var(--muted)">${esc(x.user_nom)}</td>
          <td style="color:var(--muted)">${new Date(x.date_retour_prevue).toLocaleDateString("fr-FR")}</td>
          <td>${statut}</td>
          <td>${!x.date_retour_effective ? `<button class="btn small success" data-retour="${x.id}">Retour</button>` : ""}</td>
        </tr>`;
      }).join("") : `<tr class="empty-row"><td colspan="5">Aucun emprunt.</td></tr>`;
    } catch (e) { showError(e.message); }
  }

  document.getElementById("emprunt-filtre").addEventListener("change", loadEmprunts);

  /* ---------- Nouvel emprunt ---------- */
  document.getElementById("btn-add-emprunt").addEventListener("click", async () => {
    try {
      const [usersData, livresData] = await Promise.all([api("/api/users?role=adherent&limit=100"), api("/api/livres?limit=100")]);
      const adherents = usersData.users;
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
          const user_id = document.getElementById("f-emp-adh").value;
          const livre_id = document.getElementById("f-emp-livre").value;
          const date_retour_prevue = document.getElementById("f-emp-date").value;
          if (!user_id || !livre_id) return formError("Adhérent et livre obligatoires.");
          if (!date_retour_prevue) return formError("La date de retour prévue est obligatoire.");
          await api("/api/emprunts", { method: "POST", body: JSON.stringify({ user_id, livre_id, date_retour_prevue }) });
          toast("Enregistré !"); closeModal();
          loadEmprunts();
        } catch (e) { formError(e.message); }
      });
    } catch (e) { showError(e.message); }
  });

  /* ---------- Retour ---------- */
  document.getElementById("emprunts-body").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-retour]");
    if (!btn) return;
    if (!confirm("Confirmer le retour de ce livre ?")) return;
    try {
      await api(`/api/emprunts/${btn.dataset.retour}/retour`, { method: "PUT" });
      loadEmprunts();
    } catch (err) { showError(err.message); }
  });

  /* ---------- Export CSV des retards (bonus) ---------- */
  document.getElementById("btn-export-csv").addEventListener("click", async () => {
    try {
      const data = await api("/api/emprunts?statut=en_retard");
      if (!data.length) { showError("Aucun emprunt en retard à exporter."); return; }
      const rows = [["Livre", "Auteur", "Adherent", "Date emprunt", "Retour prevu"]];
      data.forEach((x) => rows.push([
        x.livre_titre, x.auteur_nom, x.user_nom,
        new Date(x.date_emprunt).toLocaleDateString("fr-FR"),
        new Date(x.date_retour_prevue).toLocaleDateString("fr-FR"),
      ]));
      const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "emprunts-en-retard.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { showError(e.message); }
  });

  loadEmprunts();
})();