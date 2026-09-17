(() => {
  "use strict";
  const { api, showError } = window.Biblio;

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
  loadDashboard();
})();