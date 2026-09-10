(() => {
  "use strict";
  const API = "";

  /* ---------- Navigation + drawer ---------- */
  const pages = ["dashboard", "livres", "auteurs", "adherents", "emprunts"];
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const openDrawer = () => { sidebar.classList.add("open"); backdrop.classList.add("open"); };
  const closeDrawer = () => { sidebar.classList.remove("open"); backdrop.classList.remove("open"); };
  document.getElementById("hamburger").addEventListener("click", openDrawer);
  backdrop.addEventListener("click", closeDrawer);

  document.getElementById("nav").addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    pages.forEach((p) => document.getElementById(`page-${p}`).toggleAttribute("hidden", p !== btn.dataset.page));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n === btn));
    closeDrawer();
    window.scrollTo(0, 0);
    if (btn.dataset.page === "dashboard") loadDashboard();
    if (btn.dataset.page === "livres") loadLivres();
    if (btn.dataset.page === "auteurs") loadAuteurs();
    if (btn.dataset.page === "adherents") loadAdherents();
    if (btn.dataset.page === "emprunts") loadEmprunts();
  });

  /* ---------- Helpers ---------- */
  const errBox = document.getElementById("global-error");
  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
    setTimeout(() => { errBox.hidden = true; }, 5000);
  }
  async function api(path, options = {}) {
    const res = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data;
  }
  const esc = (s) => String(s ?? "—").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Dashboard ---------- */
  async function loadDashboard() {
    try {
      const s = await api("/api/stats");
      document.getElementById("kpi-livres").textContent = s.total_livres;
      document.getElementById("kpi-adherents").textContent = s.total_adherents;
      document.getElementById("kpi-encours").textContent = s.emprunts_en_cours;
      document.getElementById("kpi-retard").textContent = s.emprunts_en_retard;
      document.getElementById("top-livre").textContent = s.livre_plus_emprunte
        ? `${s.livre_plus_emprunte.titre} (${s.livre_plus_emprunte.nombre_emprunts} emprunts)` : "Aucune donnée";
      document.getElementById("top-adherent").textContent = s.adherent_plus_actif
        ? `${s.adherent_plus_actif.nom} (${s.adherent_plus_actif.nombre_emprunts} emprunts)` : "Aucune donnée";
      document.getElementById("dash-updated").textContent = "Mis à jour à " + new Date().toLocaleTimeString("fr-FR");
    } catch (e) { showError(e.message); }
  }
  document.getElementById("dash-refresh").addEventListener("click", loadDashboard);

  /* ---------- Livres (lecture + recherche + pagination) ---------- */
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
          <td style="white-space:nowrap;">
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

  /* ---------- Auteurs (lecture) ---------- */
  async function loadAuteurs() {
    try {
      const list = await api("/api/auteurs");
      document.getElementById("auteurs-total").textContent = `${list.length} au total`;
      document.getElementById("auteurs-body").innerHTML = list.length ? list.map((a) => `
        <tr>
          <td>${esc(a.nom)}</td>
          <td style="color:var(--muted)">${esc(a.nationalite)}</td>
          <td style="white-space:nowrap;">
            <button class="btn small" data-edit-auteur="${a.id}">Modifier</button>
            <button class="btn small danger" data-del-auteur="${a.id}">Supprimer</button>
          </td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="3">Aucun auteur.</td></tr>`;
    } catch (e) { showError(e.message); }
  }

  /* ---------- Adhérents (lecture) ---------- */
  async function loadAdherents() {
    try {
      const list = await api("/api/adherents");
      document.getElementById("adherents-total").textContent = `${list.length} au total`;
      document.getElementById("adherents-body").innerHTML = list.length ? list.map((a) => `
        <tr>
          <td>${esc(a.nom)}</td>
          <td style="color:var(--muted)">${esc(a.telephone || a.email || "—")}</td>
          <td style="white-space:nowrap;">
            <button class="btn small" data-history="${a.id}" data-name="${esc(a.nom)}">Historique</button>
            <button class="btn small" data-edit-adherent="${a.id}">Modifier</button>
            <button class="btn small danger" data-del-adherent="${a.id}">Supprimer</button>
          </td>
        </tr>`).join("") : `<tr class="empty-row"><td colspan="3">Aucun adhérent.</td></tr>`;
    } catch (e) { showError(e.message); }
  }

  document.getElementById("adherents-body").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-history]");
    if (!btn) return;
    try {
      const list = await api(`/api/adherents/${btn.dataset.history}/emprunts`);
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

  /* ---------- Emprunts (lecture) ---------- */
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
          <td style="color:var(--muted)">${esc(x.adherent_nom)}</td>
          <td style="color:var(--muted)">${new Date(x.date_retour_prevue).toLocaleDateString("fr-FR")}</td>
          <td>${statut}</td>
          <td>${!x.date_retour_effective ? `<button class="btn small success" data-retour="${x.id}">Retour</button>` : ""}</td>
        </tr>`;
      }).join("") : `<tr class="empty-row"><td colspan="5">Aucun emprunt.</td></tr>`;
    } catch (e) { showError(e.message); }
  }
  document.getElementById("emprunt-filtre").addEventListener("change", loadEmprunts);

  /* ---------- Export CSV des retards (bonus) ---------- */
  document.getElementById("btn-export-csv").addEventListener("click", async () => {
    try {
      const data = await api("/api/emprunts?statut=en_retard");
      if (!data.length) { showError("Aucun emprunt en retard à exporter."); return; }
      const rows = [["Livre", "Auteur", "Adherent", "Date emprunt", "Retour prevu"]];
      data.forEach((x) => rows.push([
        x.livre_titre, x.auteur_nom, x.adherent_nom,
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

  // Expose pour les étapes suivantes (formulaires J2/J3)
  window.Biblio = { api, showError, loadLivres, loadAuteurs, loadAdherents, loadEmprunts, loadDashboard, esc };

  /* ---------- Init ---------- */
  loadDashboard();
  loadLivres();
})();
