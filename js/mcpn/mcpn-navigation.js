function cacherToutesSectionsMCPN() {

    const ids = [
        "mcpn-home",
        "prise-service-step1",
        "prise-service-step2",
        "gestion-activites",
        "gestion-evenement",
        "details-service",
        "details-equipage",
        "details-ge",
        "mention-service",
        "details-ms",
        "statistiques"
    ];

    ids.forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.style.display = "none";
        }
    });
}

function setActiveSidebarButton(index) {

    const buttons = document.querySelectorAll(".side-btn");

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    if (buttons[index]) {
        buttons[index].classList.add("active");
    }
}

function afficherAccueilMCPN() {

    cacherToutesSectionsMCPN();

    document.getElementById("mcpn-home").style.display = "block";

    setActiveSidebarButton(0);
}

function afficherPriseService() {

    cacherToutesSectionsMCPN();

    document.getElementById("prise-service-step1").style.display = "block";

    setActiveSidebarButton(1);

    afficherEquipagesPS();
}

function afficherGestionActivites() {

    cacherToutesSectionsMCPN();

    document.getElementById("gestion-activites").style.display = "block";

    setActiveSidebarButton(2);

    afficherEquipages();
}

function afficherGestionEvenement() {

    cacherToutesSectionsMCPN();

    document.getElementById("gestion-evenement").style.display = "block";

    setActiveSidebarButton(3);

    chargerEquipagesGE();
    afficherListeGE();
    resetFormulaireGE();
}

function afficherMentionService() {

    cacherToutesSectionsMCPN();

    document.getElementById("mention-service").style.display = "block";

    setActiveSidebarButton(4);

    resetFormulaireMS();
    afficherListeMS();
}

function afficherStatistiques() {

    cacherToutesSectionsMCPN();

    document.getElementById("statistiques").style.display = "block";

    setActiveSidebarButton(5);

    genererStatistiques();
}

function deconnexionMCPN() {

    sessionStorage.removeItem("mcpnConnecte");
    sessionStorage.removeItem("mcpnUtilisateur");

    window.location.href = "accueil.html";
}