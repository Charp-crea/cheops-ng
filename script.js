let agents = JSON.parse(localStorage.getItem("agentsCheops")) || {
    "7148946": {
    grade: "Commissaire Divisionnaire",
    nom: "DE VILLIERS",
    prenom: "Alain",

    niveau: 2,
    fonction: "Gestionnaire",

    qualificationJudiciaire: "OPJ",

    idutilisateurmcpn: "1124547"
},

    "7148947": {
    grade: "Commissaire Divisionnaire",
    nom: "DU PONT L'ABBEE",
    prenom: "Geoffroi",

    niveau: 2,
    fonction: "Gestionnaire",

    qualificationJudiciaire: "OPJ",

    idutilisateurmcpn: "1178531"
},
};

function sauvegarderAgents() {
    localStorage.setItem("agentsCheops", JSON.stringify(agents));
}

let matriculeActuel = "";

function verifierMatricule() {
    const matriculeInput = document.getElementById("matricule");
    const matricule = matriculeInput.value.trim().toUpperCase();

    if (matricule === "") {
        afficherErreur("Veuillez renseigner un matricule.");
        return;
    }

    if (!agents[matricule]) {
        afficherErreur("Matricule inconnu.");
        return;
    }

    matriculeActuel = matricule;

    document.getElementById("step-matricule").style.display = "none";
    document.getElementById("step-password").style.display = "block";

    const agent = agents[matriculeActuel];

    document.getElementById("matricule-display").innerHTML = `
        <strong>Connecté en tant que :</strong><br>
        ${agent.grade} ${agent.nom} ${agent.prenom}
    `;

    const motDePasseExistant = localStorage.getItem("mdp_" + matriculeActuel);

    if (!motDePasseExistant) {
        document.getElementById("auth-title").textContent = "Création du mot de passe";
        document.getElementById("first-login-fields").style.display = "block";
        document.getElementById("password").placeholder = "Créer un mot de passe";
    } else {
        document.getElementById("auth-title").textContent = "Mot de passe requis";
        document.getElementById("first-login-fields").style.display = "none";
        document.getElementById("password").placeholder = "Mot de passe";
    }
}

function verifierMotDePasse() {
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    const motDePasseExistant = localStorage.getItem("mdp_" + matriculeActuel);

    if (motDePasseExistant && verifierCleTemporaire(matriculeActuel, password)) {
        localStorage.removeItem("mdp_" + matriculeActuel);

        document.getElementById("auth-title").textContent = "Création d'un nouveau mot de passe";
        document.getElementById("first-login-fields").style.display = "block";
        document.getElementById("password").value = "";
        document.getElementById("password-confirm").value = "";
        document.getElementById("password").placeholder = "Nouveau mot de passe";

        afficherSucces("Clé temporaire acceptée. Veuillez créer un nouveau mot de passe.");
        return;
    }

    if (!motDePasseExistant) {
        if (password.length < 6) {
            afficherErreur("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        if (password !== passwordConfirm) {
            afficherErreur("Les mots de passe ne correspondent pas.");
            return;
        }

        localStorage.setItem("mdp_" + matriculeActuel, password);

        connecterAgent();
        return;
    }

    if (password === motDePasseExistant) {
        connecterAgent();
    } else {
        afficherErreur("Mot de passe incorrect.");
    }
}

function connecterAgent() {
    const agent = agents[matriculeActuel];

    sessionStorage.setItem("matriculeConnecte", matriculeActuel);
    sessionStorage.setItem("agentConnecte", JSON.stringify(agent));
    sessionStorage.setItem("heureConnexion", Date.now());

    afficherSucces("Connexion autorisée.");

    setTimeout(() => {
        window.location.href = "accueil.html";
    }, 800);
}

function afficherErreur(texte) {
    const message = document.getElementById("message");
    if (!message) return;

    message.style.color = "red";
    message.textContent = texte;
}

function afficherSucces(texte) {
    const message = document.getElementById("message");
    if (!message) return;

    message.style.color = "green";
    message.textContent = texte;
}

if (window.location.pathname.includes("accueil.html")) {
    chargerAccueil();
}

function chargerAccueil() {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");
    const heureConnexion = sessionStorage.getItem("heureConnexion");

    if (!matriculeConnecte || !heureConnexion || !agents[matriculeConnecte]) {
        window.location.href = "index.html";
        return;
    }

    const agent = agents[matriculeConnecte];

    sessionStorage.setItem("agentConnecte", JSON.stringify(agent));

    const connectedUser = document.getElementById("connected-user");
    const sessionTimer = document.getElementById("session-timer");

    if (connectedUser) {
        connectedUser.textContent =
            `Connecté en tant que : ${agent.grade} ${agent.nom} ${agent.prenom}`;
    }

    if (sessionTimer) {
        setInterval(() => {
            const maintenant = Date.now();
            const difference = maintenant - Number(heureConnexion);

            const secondes = Math.floor(difference / 1000) % 60;
            const minutes = Math.floor(difference / 1000 / 60) % 60;
            const heures = Math.floor(difference / 1000 / 60 / 60);

            sessionTimer.textContent =
                `Durée de connexion : ${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secondes).padStart(2, "0")}`;
        }, 1000);
    }

    const gestionApp = document.getElementById("gestion-app");

    if (gestionApp && agent.niveau !== 2) {
        gestionApp.style.display = "none";
    }
}

function deconnexion() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

function ouvrirGestionnaire() {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");

    if (!matriculeConnecte || !agents[matriculeConnecte]) {
        window.location.href = "index.html";
        return;
    }

    const agent = agents[matriculeConnecte];

    if (agent.niveau !== 2) {
        alert("ACCÈS REFUSÉ\nHabilitation Niveau 2 - Gestionnaire requise.");
        return;
    }

    window.location.href = "gestion.html";
}

if (window.location.pathname.includes("gestion.html")) {
    chargerGestion();
}

function chargerGestion() {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");

    if (!matriculeConnecte || !agents[matriculeConnecte]) {
        window.location.href = "index.html";
        return;
    }

    const agent = agents[matriculeConnecte];

    if (agent.niveau !== 2) {
        alert("Accès refusé. Habilitation Niveau 2 - Gestionnaire requise.");
        window.location.href = "accueil.html";
        return;
    }

    sessionStorage.setItem("agentConnecte", JSON.stringify(agent));
    afficherAgents();
}

function afficherAgents() {
    const container = document.getElementById("agents-list");

    if (!container) return;

    container.innerHTML = "";

    Object.keys(agents).forEach(matricule => {
        const agent = agents[matricule];
        const mdpExiste = localStorage.getItem("mdp_" + matricule);

        const statutMdp = mdpExiste
            ? `<span class="mdp-statut" onclick="ouvrirResetMdp('${matricule}')">Mot de passe créé</span>`
            : `<span class="mdp-non-cree">Aucun mot de passe créé</span>`;

        container.innerHTML += `
            <div class="agent-row">
                <div><strong>${matricule}</strong><br>${statutMdp}</div>
                <div>${agent.grade}</div>
                <div>${agent.nom} ${agent.prenom}</div>
                <div>Niveau ${agent.niveau} - ${agent.fonction}<br>${agent.qualificationJudiciaire}</div>
                <div>
                    <button onclick="voirDetailsAgent('${matricule}')">Détails</button>
                    <button onclick="supprimerAgent('${matricule}')">Supprimer</button>
                </div>
            </div>
        `;
    });
}

function ajouterAgent() {
    const matricule = document.getElementById("new-matricule").value.trim().toUpperCase();
    const grade = document.getElementById("new-grade").value.trim();
    const nom = document.getElementById("new-nom").value.trim().toUpperCase();
    const prenom = document.getElementById("new-prenom").value.trim();
    const niveau = Number(document.getElementById("new-niveau").value);
    const qualification = document.getElementById("new-qualification").value.trim().toUpperCase();

    if (!matricule || !grade || !nom || !prenom || !qualification) {
        alert("Tous les champs doivent être remplis.");
        return;
    }

    agents[matricule] = {
        grade: grade,
        nom: nom,
        prenom: prenom,
        niveau: niveau,
        fonction: niveau === 2 ? "Gestionnaire" : "Inscripteur",
        qualificationJudiciaire: qualification
    };

    sauvegarderAgents();
    afficherAgents();

    alert("Agent enregistré.");
}

function supprimerAgent(matricule) {
    if (!confirm("Supprimer l'agent " + matricule + " ?")) return;

    delete agents[matricule];
    localStorage.removeItem("mdp_" + matricule);

    sauvegarderAgents();
    afficherAgents();
}

function voirDetailsAgent(matricule) {
    const agent = agents[matricule];

    if (!agent) {
        alert("Agent introuvable.");
        return;
    }

    alert(
        "Détails utilisateur\n\n" +
        "Matricule : " + matricule + "\n" +
        "Grade : " + agent.grade + "\n" +
        "Nom Prénom : " + agent.nom + " " + agent.prenom + "\n" +
        "Qualification judiciaire : " + agent.qualificationJudiciaire + "\n" +
        "Niveau habilitation CHEOPS : Niveau " + agent.niveau + " - " + agent.fonction + "\n" +
        "ID Utilisateur MCPN : " + (agent.idutilisateurmcpn || "Non attribué")
    );
}

if (window.location.pathname.includes("mcpn.html")) {
    chargerMCPN();
}

function chargerMCPN() {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");

    if (!matriculeConnecte || !agents[matriculeConnecte]) {
        window.location.href = "index.html";
        return;
    }
    if (sessionStorage.getItem("mcpnConnecte") !== "true") {
    window.location.href = "mcpn-login.html";
    return;
    }
    const utilisateurMCPN = sessionStorage.getItem("mcpnUtilisateur");

if (utilisateurMCPN && agents[utilisateurMCPN]) {
    const agentMCPN = agents[utilisateurMCPN];
    const box = document.getElementById("mcpn-connected-user");

    if (box) {
        box.textContent =
            `Connecté en tant que : ${agentMCPN.idutilisateurmcpn} - ${agentMCPN.grade} ${agentMCPN.nom} ${agentMCPN.prenom} ${agentMCPN.qualificationJudiciaire}`;
    }
    const debutInput = document.getElementById("debut-service");
const finInput = document.getElementById("fin-service");

if (debutInput && finInput) {
    const maintenant = new Date();
    const minDate = maintenant.toISOString().slice(0, 16);

    debutInput.min = minDate;
    finInput.min = minDate;
}
}
}
function initialiserPriseService() {
    const bouton = document.getElementById("btn-initialiser");
    const texte = bouton.querySelector(".btn-text");
    const spinner = bouton.querySelector(".spinner");

    texte.textContent = "Initialisation...";
    spinner.style.display = "inline-block";
    bouton.disabled = true;

    setTimeout(() => {
        document.getElementById("prise-service-step1").style.display = "none";
        document.getElementById("prise-service-step2").style.display = "block";

        genererListeAgents();
        remplirEncadrementService();
        afficherServices();

        bouton.disabled = false;
        texte.textContent = "Initialiser";
        spinner.style.display = "none";
    }, 900);
}

function genererListeAgents() {
    const container = document.getElementById("agent-list");
    if (!container) return;

    container.innerHTML = "";

    Object.keys(agents).forEach(matricule => {
        const agent = agents[matricule];

        container.innerHTML += `
            <div class="agent-item" draggable="true" ondragstart="dragAgent(event)" id="agent-${matricule}">
                <input type="checkbox" class="agent-check">

                <div class="agent-avatar">
                    <svg viewBox="0 0 64 64">
                        <path d="M20 26V18L32 12L44 18V26" />
                        <path d="M18 26C22 30 42 30 46 26" />
                        <path d="M22 28V36C22 43 27 48 32 48C37 48 42 43 42 36V28" />
                        <path d="M24 50L16 56" />
                        <path d="M40 50L48 56" />
                        <path d="M28 50L32 56L36 50" />
                    </svg>
                </div>

                <div class="agent-info">
                    <strong>${matricule}</strong>

<div class="agent-qualif">
    ${agent.grade} ${agent.nom} ${agent.prenom}
    ${agent.qualificationJudiciaire}
</div>
                </div>
            </div>
        `;
    });
}

function dragAgent(event) {
    const selected = [];

    document.querySelectorAll(".agent-item").forEach(item => {
        const checkbox = item.querySelector(".agent-check");

        if (checkbox && checkbox.checked) {
            selected.push(item.id);
        }
    });

    if (selected.length === 0) {
        selected.push(event.target.closest(".agent-item").id);
    }

    event.dataTransfer.setData("agents", JSON.stringify(selected));
}

function allowDrop(event) {
    event.preventDefault();
}

function dropAgent(event, zoneId) {
    event.preventDefault();

    const data = event.dataTransfer.getData("agents");
    if (!data) return;

    const ids = JSON.parse(data);
    const zone = document.getElementById(zoneId);

    zone.classList.remove("preview-drop");

    ids.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            const checkbox = element.querySelector(".agent-check");

            if (checkbox) checkbox.checked = false;

            zone.appendChild(element);
        }
    });

    sauvegarderEffectifsMCPN();
}


function dragEnter(event) {
    event.preventDefault();

    const zone = event.currentTarget;
    zone.classList.add("preview-drop");
}

function dragLeave(event) {
    const zone = event.currentTarget;

    if (!zone.contains(event.relatedTarget)) {
        zone.classList.remove("preview-drop");
    }
}

if (window.location.pathname.includes("mcpn-login.html")) {
    chargerLoginMCPN();
}

function chargerLoginMCPN() {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");

    if (!matriculeConnecte || !agents[matriculeConnecte]) {
        window.location.href = "index.html";
        return;
    }

    const agent = agents[matriculeConnecte];

    const identifiant = document.getElementById("mcpn-identifiant");
    const habilitation = document.getElementById("mcpn-habilitation");

    identifiant.value = "";
identifiant.placeholder = "Identifiant Utilisateur";

    habilitation.value =
        agent.niveau === 2
            ? "Niveau 2 - Gestionnaire"
            : "Niveau 1 - Inscripteur";
}

function connexionMCPN() {
    const identifiant = document.getElementById("mcpn-identifiant")
        .value
        .trim();

    let agentTrouve = null;

    Object.keys(agents).forEach(matricule => {
        const agent = agents[matricule];

        if (agent.idutilisateurmcpn === identifiant) {
            agentTrouve = matricule;
        }
    });

    if (!agentTrouve) {
        alert("Identifiant MCPN inconnu.");
        return;
    }

    sessionStorage.setItem("mcpnUtilisateur", agentTrouve);
    sessionStorage.setItem("mcpnConnecte", "true");

    window.location.href = "mcpn.html";
}

function afficherAccueilMCPN() {
    document.getElementById("mcpn-home").style.display = "block";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ge").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    setActiveSidebarButton(0);
}

function afficherPriseService() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "block";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none"; 
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ge").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    setActiveSidebarButton(1);

    afficherServices();
}

function consulterDetailsService(index) {
    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];
    const service = services[index];

    if (!service) return;

    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("details-service").style.display = "block";
    document.getElementById("details-ge").style.display = "none";   
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    const createur = agents[service.createurMatricule];

    const presents = service.presents.map(matricule => {
    const agent = agents[matricule];
    return agent ? `${agent.grade} ${agent.nom} ${agent.prenom}` : matricule;
}).join("<br>");

const absents = service.absents.map(matricule => {
    const agent = agents[matricule];
    return agent ? `${agent.grade} ${agent.nom} ${agent.prenom}` : matricule;
}).join("<br>");

    document.getElementById("details-service-container").innerHTML = `
        <div class="service-card">
            <strong>${nomService(service)}</strong><br><br>

            <strong>Créé par :</strong><br>
            ${service.createurMatricule} - ${createur ? `${createur.grade} ${createur.nom} ${createur.prenom}` : "Inconnu"}<br><br>

            <strong>Date de création :</strong><br>
            ${formatDateHeure(service.dateCreation)}<br><br>

            <strong>Unité :</strong><br>
            ${service.unite}<br><br>

            <strong>Chef de service :</strong><br>
            ${service.chefService}<br><br>

            <strong>Horaires :</strong><br>
            ${formatDateHeure(service.debut)} → ${formatDateHeure(service.fin)}<br><br>

            <strong>Présents :</strong><br>
            ${presents || "Aucun"}<br><br>

            <strong>Absents :</strong><br>
            ${absents || "Aucun"}
        </div>
    `;
}

function afficherGestionEvenement() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "block";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ge").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    setActiveSidebarButton(3);
    chargerEquipagesGE();
    afficherListeGE();
    resetFormulaireGE();
}

function afficherGestionActivites() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "block";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ge").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    setActiveSidebarButton(2);

    afficherEquipages();
}

function consulterGE(index) {
    const ges = nettoyerAnciennesGE();
    const ge = ges[index];

    if (!ge) return;

    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ge").style.display = "block";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");
    const agentConnecte = agents[matriculeConnecte];

    const boutonCloturer = agentConnecte && agentConnecte.niveau === 2
    ? `<button class="mcpn-button danger-button" onclick="cloturerGE(${index})">Clôturer</button>`
    : "";
    document.getElementById("details-ge-container").innerHTML = `
        <div class="service-card">
            <strong>${ge.numero}</strong><br><br>

            <strong>Créée par :</strong><br>
            ${ge.createurMatricule} - ${ge.createurGrade} ${ge.createurNom}<br><br>

            <strong>Date de création :</strong><br>
            ${formatDateHeure(ge.dateCreation)}<br><br>

            <strong>Motif :</strong><br>
            ${ge.motif}<br><br>

            <strong>Origine :</strong><br>
            ${ge.origine}<br><br>

            <strong>Adresse :</strong><br>
            ${ge.adresse}<br><br>

            <strong>Équipage initial :</strong><br>
            ${ge.equipageInitial}<br><br>

            <strong>Connaissance des faits :</strong><br>
            ${ge.connaissance}<br><br>

            <strong>Avis intervenants :</strong><br>
            ${formatDateHeure(ge.avis)}<br><br>

            <strong>Arrivée sur les lieux :</strong><br>
            ${formatDateHeure(ge.arrivee)}<br><br>

            <strong>Départ des lieux :</strong><br>
            ${formatDateHeure(ge.depart)}<br><br>

            <strong>Compte-rendu :</strong><br>
            ${ge.compteRendu}<br><br>

            <div class="ge-actions">
            <button class="mcpn-button" onclick="afficherGestionEvenement()">
            Retour
            </button>

            ${boutonCloturer}
        </div>
        </div>
    `;
}

function afficherMentionService() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("details-ms").style.display = "none";
    document.getElementById("statistiques").style.display = "none";

    const detailsGE = document.getElementById("details-ge");
    if (detailsGE) detailsGE.style.display = "none";

    document.getElementById("mention-service").style.display = "block";

    setActiveSidebarButton(4);

    resetFormulaireMS();
    afficherListeMS();
}

function consulterMS(index) {
    const mentions = JSON.parse(localStorage.getItem("mentionsServiceMCPN")) || [];
    const ms = mentions[index];

    if (!ms) return;

    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-service").style.display = "none";
    document.getElementById("statistiques").style.display = "none";
    

    const detailsGE = document.getElementById("details-ge");
    if (detailsGE) detailsGE.style.display = "none";

    document.getElementById("details-ms").style.display = "block";

    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");
    const agentConnecte = agents[matriculeConnecte];

    const boutonCloturerMS = agentConnecte && agentConnecte.niveau === 2
    ? `<button class="mcpn-button danger-button" onclick="cloturerMS(${index})">Clôturer</button>`
    : "";

    document.getElementById("details-ms-container").innerHTML = `
        <div class="service-card">

            <strong>${ms.numero}</strong><br><br>

            <strong>Créée par :</strong><br>
            ${ms.createurMatricule} - ${ms.createurGrade} ${ms.createurNom}<br><br>

            <strong>Date de création :</strong><br>
            ${formatDateHeure(ms.dateCreation)}<br><br>

            <strong>Date et heure :</strong><br>
            ${formatDateHeure(ms.dateMention)}<br><br>

            <strong>Motif :</strong><br>
            ${ms.motif}<br><br>

            <strong>Détails :</strong><br>
            ${ms.details}<br><br>

            <div class="ge-actions">
                <button class="mcpn-button" onclick="afficherMentionService()">
                    Retour
                </button>

                 ${boutonCloturerMS}
            </div>
    `;
}

function initialiserMS() {
    const date = document.getElementById("ms-date").value;
    const motif = document.getElementById("ms-motif").value;

    if (!date || !motif) {
        alert("Veuillez renseigner la date, l'heure et le motif.");
        return;
    }

    document.getElementById("ms-initialisation").style.display = "none";
    document.getElementById("ms-formulaire").style.display = "block";

    document.getElementById("ms-recap-date").textContent = formatDateHeure(date);
    document.getElementById("ms-recap-motif").textContent = motif;
}

function finaliserMS() {
    const bouton = document.getElementById("btn-finaliser-ms");
    const texte = bouton.querySelector(".btn-text");
    const spinner = bouton.querySelector(".spinner");

    const date = document.getElementById("ms-date").value;
    const motif = document.getElementById("ms-motif").value;
    const details = document.getElementById("ms-details").value.trim();

    if (!date || !motif || !details) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    texte.textContent = "Finalisation...";
    spinner.style.display = "inline-block";
    bouton.disabled = true;

    setTimeout(() => {
        const mentions = JSON.parse(localStorage.getItem("mentionsServiceMCPN")) || [];

        const createurMatricule = sessionStorage.getItem("mcpnUtilisateur") || sessionStorage.getItem("matriculeConnecte");
        const createur = agents[createurMatricule];

        const numero = genererNumeroMS(mentions.length + 1);

        mentions.push({
            numero,
            dateCreation: new Date().toISOString(),
            dateMention: date,
            motif,
            details,
            createurMatricule,
            createurNom: createur ? `${createur.nom} ${createur.prenom}` : "Inconnu",
            createurGrade: createur ? createur.grade : ""
        });

        localStorage.setItem("mentionsServiceMCPN", JSON.stringify(mentions));

        alert("Mention de Service créée avec succès.");

        bouton.disabled = false;
        texte.textContent = "Finaliser";
        spinner.style.display = "none";

        afficherListeMS();
        resetFormulaireMS();
    }, 900);
}

function genererNumeroMS(nombre) {
    return `MS/${String(nombre).padStart(4, "0")}`;
}

function cloturerMS(index) {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");
    const agentConnecte = agents[matriculeConnecte];

    if (!agentConnecte || agentConnecte.niveau !== 2) {
        alert("Accès refusé. Niveau 2 - Gestionnaire requis.");
        return;
    }

    if (!confirm("Clôturer cette Mention de Service ?")) return;

    const mentions = JSON.parse(localStorage.getItem("mentionsServiceMCPN")) || [];

    mentions.splice(index, 1);

    localStorage.setItem("mentionsServiceMCPN", JSON.stringify(mentions));

    alert("Mention de Service clôturée.");

    afficherMentionService();
}

function afficherListeMS() {
    const container = document.getElementById("ms-list-container");
    if (!container) return;

    const mentions = JSON.parse(localStorage.getItem("mentionsServiceMCPN")) || [];

    if (mentions.length === 0) {
        container.innerHTML = "<p>Aucune Mention de Service enregistrée.</p>";
        return;
    }

    container.innerHTML = "";

    mentions.forEach((ms, index) => {
        container.innerHTML += `
    <div class="service-card ge-list-card">
        <div>
            <strong>${ms.numero}</strong>
            ${ms.motif}
            — ${ms.createurNom}
            — ${formatDateHeure(ms.dateMention)}
        </div>

        <button class="mcpn-button" onclick="consulterMS(${index})">
            Détails
        </button>
    </div>
`;
    });
}

function resetFormulaireMS() {
    document.getElementById("ms-initialisation").style.display = "block";
    document.getElementById("ms-formulaire").style.display = "none";

    document.getElementById("ms-date").value = "";
    document.getElementById("ms-motif").value = "";
    document.getElementById("ms-details").value = "";
}

function setActiveSidebarButton(index) {
    const buttons = document.querySelectorAll(".side-btn");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[index]) {
        buttons[index].classList.add("active");
    }
}

function sauvegarderEffectifsMCPN() {
    const presents = [];

    document.querySelectorAll("#presents .agent-item").forEach(item => {
        const matricule = item.id.replace("agent-", "");
        presents.push(matricule);
    });

    sessionStorage.setItem("mcpnPresents", JSON.stringify(presents));
}

function genererTableauActivites() {
    const table = document.getElementById("activities-table");
    if (!table) return;

    const prises = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];

    if (prises.length === 0) {
        table.innerHTML = `
            <tr>
                <td>Aucune prise de service enregistrée.</td>
            </tr>
        `;
        return;
    }

    let html = "";

    prises.forEach((prise, index) => {
        const heures = genererCreneauxHoraires(prise.debut, prise.fin);

        html += `
            <tr>
                <th class="service-title" colspan="2">
                    Prise de service ${index + 1} — ${prise.unite}
                    | ${formatDateHeure(prise.debut)} → ${formatDateHeure(prise.fin)}
                </th>
            </tr>

            <tr>
                <th class="agent-cell">Effectifs présents</th>
                <th class="timeline-header">
                    ${heures.map(h => `<span>${h}</span>`).join("")}
                </th>
            </tr>
        `;

        prise.presents.forEach(matricule => {
            const agent = agents[matricule];
            if (!agent) return;

            html += `
                <tr>
                    <td class="agent-cell">
                        ${agent.nom} ${agent.prenom}<br>
                        ${agent.grade}
                    </td>

                    <td class="timeline-cell"
                        data-debut-service="${prise.debut}"
                        data-fin-service="${prise.fin}">
                        
                        <button class="activity-add unique-add" onclick="ouvrirBlocActivite('${matricule}', this)">
                            +
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
            <tr class="table-separator">
                <td colspan="2"></td>
            </tr>
        `;
    });

    table.innerHTML = html;
}

function choisirActivite(button) {
    const activites = [
        "7031 - Surveillance des gardes à vue",
        "7046 - Chef de Poste",
        "7036 - Intervention de police (sauf AVP)"
    ];

    const td = button.parentElement;

    let select = document.createElement("select");
    select.className = "activity-select";

    select.innerHTML = `<option value="">Sélectionner</option>`;

    activites.forEach(act => {
        select.innerHTML += `<option>${act}</option>`;
    });

    select.onchange = function () {
        if (this.value !== "") {
            td.innerHTML = this.value;
            td.style.background = "#eef3ff";
            td.style.fontWeight = "bold";
        }
    };

    td.innerHTML = "";
    td.appendChild(select);
}

function enregistrerPriseService() {
    const debut = document.getElementById("debut-service").value;
    const fin = document.getElementById("fin-service").value;
    const unite = document.getElementById("unite").value;
    const libelle = document.getElementById("libelle").value;

    const autorite = document.getElementById("autorite-permanence").value;
    const opj = document.getElementById("opj-permanence").value;
    const chefService = document.getElementById("chef-service").value.trim();

    if (!debut || !fin) {
        alert("Veuillez renseigner les horaires de service.");
        return;
    }

    if (!autorite || !opj || !chefService) {
        alert("Veuillez renseigner l'encadrement du service.");
        return;
    }

    const maintenant = new Date();
    const debutDate = new Date(debut);
    const finDate = new Date(fin);

    if (debutDate < maintenant) {
        alert("Le début de service ne peut pas être antérieur à maintenant.");
        return;
    }

    if (finDate <= debutDate) {
        alert("La fin de service doit être postérieure au début de service.");
        return;
    }

    const presents = [];
    const absents = [];

    document.querySelectorAll("#presents .agent-item").forEach(item => {
        presents.push(item.id.replace("agent-", ""));
    });

    document.querySelectorAll("#absents .agent-item").forEach(item => {
        absents.push(item.id.replace("agent-", ""));
    });

    if (presents.length === 0) {
        alert("Aucun effectif présent renseigné.");
        return;
    }

    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];

    const createurMatricule = sessionStorage.getItem("mcpnUtilisateur") || sessionStorage.getItem("matriculeConnecte");

    services.push({
        libelle,
        unite,
        debut,
        fin,
        autorite,
        opj,
        chefService,
        presents,
        absents,
        createurMatricule,
        dateCreation: new Date().toISOString(),
    });

    sessionStorage.setItem("prisesServiceMCPN", JSON.stringify(services));

    alert("Service créé.");
    afficherServices();

    document.getElementById("prise-service-step2").style.display = "none";
document.getElementById("prise-service-step1").style.display = "block";

document.getElementById("agent-list").innerHTML = "";
document.getElementById("absents").innerHTML = "<h3>Absents</h3>";
document.getElementById("presents").innerHTML = "<h3>Présents</h3>";

document.getElementById("chef-service").value = "";
document.getElementById("debut-service").value = "";
document.getElementById("fin-service").value = "";
}

function genererCreneauxHoraires(debut, fin) {
    const creneaux = [];

    let current = new Date(debut);
    const end = new Date(fin);

    while (current <= end) {
        const h = String(current.getHours()).padStart(2, "0");
        const m = String(current.getMinutes()).padStart(2, "0");

        creneaux.push(`${h}h${m}`);

        current.setMinutes(current.getMinutes() + 30);
    }

    return creneaux;
}

function formatDateHeure(value) {
    const date = new Date(value);

    return date.toLocaleString("fr-FR", {
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"
    });
}

let agentActiviteSelectionne = null;
let celluleActiviteSelectionnee = null;

function ouvrirBlocActivite(matricule, bouton) {
    agentActiviteSelectionne = matricule;
    celluleActiviteSelectionnee = bouton.parentElement;

    document.getElementById("activity-modal").style.display = "flex";

    document.getElementById("activity-start").value = "";
    document.getElementById("activity-end").value = "";
    document.getElementById("activity-type").value = "";
}

function fermerBlocActivite() {
    document.getElementById("activity-modal").style.display = "none";
    agentActiviteSelectionne = null;
}

function validerActivite() {
    const debut = document.getElementById("activity-start").value;
    const fin = document.getElementById("activity-end").value;
    const type = document.getElementById("activity-type").value;

    if (!debut || !fin || !type) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const debutActivite = new Date(debut);
    const finActivite = new Date(fin);

    if (debutActivite.getMinutes() % 5 !== 0 || finActivite.getMinutes() % 5 !== 0) {
        alert("Les horaires d'activité doivent être renseignés par créneaux de 5 minutes.");
        return;
    }

    if (finActivite <= debutActivite) {
        alert("La fin doit être postérieure au début.");
        return;
    }

    if (!celluleActiviteSelectionnee) {
        alert("Erreur : aucune cellule sélectionnée.");
        return;
    }

    const debutService = new Date(celluleActiviteSelectionnee.dataset.debutService);
    const finService = new Date(celluleActiviteSelectionnee.dataset.finService);

    if (debutActivite < debutService || finActivite > finService) {
        alert("L'activité doit être comprise dans les horaires de service.");
        return;
    }

    const dureeService = finService - debutService;
    const decalage = debutActivite - debutService;
    const dureeActivite = finActivite - debutActivite;

    const left = (decalage / dureeService) * 100;
    const width = (dureeActivite / dureeService) * 100;

    const boutonPlus = celluleActiviteSelectionnee.querySelector(".unique-add");
    if (boutonPlus) boutonPlus.remove();

    celluleActiviteSelectionnee.innerHTML += `
        <div class="activity-block" style="left:${left}%; width:${width}%;">
            <strong>${type}</strong><br>
            ${formatDateHeure(debut)} → ${formatDateHeure(fin)}
        </div>

        <button class="activity-add unique-add" onclick="ouvrirBlocActivite('${agentActiviteSelectionne}', this)">
            +
        </button>
    `;

    fermerBlocActivite();
}

function afficherCreationEquipage() {
    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];

    if (services.length === 0) {
        alert("Aucun service enregistré.");
        return;
    }

    document.getElementById("creation-equipage-panel").style.display = "block";

    const select = document.getElementById("equipage-service");
    select.innerHTML = `<option value="">Sélectionner un service</option>`;

    services.forEach((service, index) => {
        select.innerHTML += `
            <option value="${index}">
                ${nomService(service)}
            </option>
        `;
    });

    document.getElementById("equipage-unite").value = "";
    document.getElementById("equipage-debut").value = "";
    document.getElementById("equipage-fin").value = "";
    document.getElementById("equipage-composition-list").innerHTML = "";
}

function enregistrerEquipage() {
    const serviceIndex = document.getElementById("equipage-service").value;

    if (serviceIndex === "") {
    alert("Veuillez sélectionner un service affilié.");
    return;
}
    const createurMatricule = sessionStorage.getItem("mcpnUtilisateur") || sessionStorage.getItem("matriculeConnecte");
    const indicatif = document.getElementById("equipage-indicatif").value.trim();
    const unite = document.getElementById("equipage-unite").value;
    const vehicule = document.getElementById("equipage-vehicule").value;
    const debut = document.getElementById("equipage-debut").value;
    const fin = document.getElementById("equipage-fin").value;

    const composition = [];

    document.querySelectorAll("#equipage-composition-list input:checked").forEach(input => {
    const bloc = input.closest(".equipage-agent-check");
    const role = bloc.querySelector(".role-equipage").value;

    if (!role) {
        alert("Veuillez renseigner la fonction.");
        composition.length = 0;
        return;
    }

    composition.push({
        matricule: input.value,
        role: role
    });
});

    if (!indicatif) {
        alert("Veuillez renseigner un indicatif.");
        return;
    }

    if (composition.length === 0) {
        alert("Veuillez sélectionner au moins un effectif.");
        return;
    }

    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

    equipages.push({
        serviceIndex,
        indicatif,
        unite,
        vehicule,
        debut,
        fin,
        composition,
        createurMatricule,
        dateCreation: new Date().toISOString(),
    });

    sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));

    alert("Équipage enregistré.");

    document.getElementById("creation-equipage-panel").style.display = "none";
    afficherEquipages();
}

function afficherEquipages() {
    const container = document.getElementById("equipages-container");
    if (!container) return;

    let equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];
const maintenant = new Date();

equipages = equipages.filter(eq => {
    const service = services[eq.serviceIndex];

    if (!service) return false;

    return new Date(service.fin) >= maintenant;
});

sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));

    equipages = equipages.filter(eq => {
        const fin = new Date(eq.fin);
        fin.setHours(fin.getHours() + 2);
        return maintenant < fin;
    });

    sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));

    if (equipages.length === 0) {
        container.innerHTML = "<p>Aucun équipage créé.</p>";
        return;
    }

    container.innerHTML = "";

    equipages.forEach((eq, index) => {
        const noms = eq.composition.map(item => {
    const agent = agents[item.matricule];

    return agent
        ? `${item.role} : ${agent.nom} ${agent.prenom}`
        : item.matricule;
}).join(", ");

        container.innerHTML += `
            <div class="service-card">
                <strong>${eq.indicatif}</strong><br>
                Unité : ${eq.unite}<br>
                Véhicule : ${eq.vehicule}<br>
                Horaires : ${formatDateHeure(eq.debut)} → ${formatDateHeure(eq.fin)}<br>
                Composition : ${noms}<br>

                <button class="mcpn-button" onclick="consulterActiviteEquipage(${index})">
                    Consulter l'activité <button class="mcpn-button" onclick="consulterDetailsEquipage(${index})">
    Détails
</button>
                </button>
            </div>
        `;
    });
}

function consulterDetailsEquipage(index) {
    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];
    const eq = equipages[index];

    if (!eq) return;

    const createur = agents[eq.createurMatricule];

    alert(
        `Détails équipage\n\n` +
        `Créé par : ${eq.createurMatricule} - ${createur ? `${createur.grade} ${createur.nom} ${createur.prenom}` : "Inconnu"}\n` +
        `Date création : ${formatDateHeure(eq.dateCreation)}\n` +
        `Indicatif : ${eq.indicatif}\n` +
        `Unité : ${eq.unite}\n` +
        `Véhicule : ${eq.vehicule}`
    );
}

let equipageSelectionneIndex = null;

function consulterActiviteEquipage(index) {
    equipageSelectionneIndex = index;

    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];
    const eq = equipages[index];

    if (!eq) return;

    if (!eq.activites) {
        eq.activites = [];
        sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));
    }

    document.getElementById("activite-equipage-panel").style.display = "block";
    document.getElementById("activite-equipage-title").textContent =
        `Activité de l’équipage ${eq.indicatif}`;

    afficherTimelineEquipage();
}

function afficherTimelineEquipage() {
    const container = document.getElementById("activite-timeline");
    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];
    const eq = equipages[equipageSelectionneIndex];

    if (!container || !eq) return;

    const debutService = new Date(eq.debut);
    const finService = new Date(eq.fin);

    const activites = (eq.activites || []).sort((a, b) => new Date(a.debut) - new Date(b.debut));

    let html = "";
    let curseur = new Date(debutService);

    activites.forEach((act, actIndex) => {
        const debutAct = new Date(act.debut);
        const finAct = new Date(act.fin);

        if (curseur < debutAct) {
            html += blocVideActivite(curseur, debutAct);
        }

        html += `
            <div class="activity-vertical-block">
                <strong>${act.type}</strong><br>
                ${formatDateHeure(act.debut)} → ${formatDateHeure(act.fin)}
            </div>
        `;

        curseur = finAct;
    });

    if (curseur < finService) {
        html += blocVideActivite(curseur, finService);
    }

    container.innerHTML = html;
}

function blocVideActivite(debut, fin) {
    return `
        <div class="activity-empty-block">
            <span>${formatDateHeure(debut)} → ${formatDateHeure(fin)}</span>
            <button class="activity-add" onclick="ouvrirAjoutActiviteEquipage('${debut.toISOString()}', '${fin.toISOString()}')">
                +
            </button>
        </div>
    `;
}

let activiteDebutDisponible = null;
let activiteFinDisponible = null;

function ouvrirAjoutActiviteEquipage(debutDefaut, finDefaut) {
    activiteDebutDisponible = debutDefaut;
    activiteFinDisponible = finDefaut;

    const start = document.getElementById("equipage-activity-start");
    const end = document.getElementById("equipage-activity-end");
    const type = document.getElementById("equipage-activity-type");

    start.value = debutDefaut.slice(0, 16);
    end.value = finDefaut.slice(0, 16);

    start.min = debutDefaut.slice(0, 16);
    start.max = finDefaut.slice(0, 16);

    end.min = debutDefaut.slice(0, 16);
    end.max = finDefaut.slice(0, 16);

    type.value = "";

    document.getElementById("equipage-activity-modal").style.display = "flex";
}

function fermerAjoutActiviteEquipage() {
    document.getElementById("equipage-activity-modal").style.display = "none";
}

function validerAjoutActiviteEquipage() {
    const debut = document.getElementById("equipage-activity-start").value;
    const fin = document.getElementById("equipage-activity-end").value;
    const type = document.getElementById("equipage-activity-type").value;

    if (!debut || !fin || !type) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    ajouterActiviteEquipage(debut, fin, type);

    fermerAjoutActiviteEquipage();
}

function ajouterActiviteEquipage(debut, fin, type) {
    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];
    const eq = equipages[equipageSelectionneIndex];

    if (!eq) return;

    const debutDate = new Date(debut);
    const finDate = new Date(fin);
    const debutService = new Date(eq.debut);
    const finService = new Date(eq.fin);

    if (debutDate.getMinutes() % 5 !== 0 || finDate.getMinutes() % 5 !== 0) {
        alert("Les horaires doivent être par créneaux de 5 minutes.");
        return;
    }

    if (finDate <= debutDate) {
        alert("La fin doit être postérieure au début.");
        return;
    }

    if (debutDate < debutService || finDate > finService) {
        alert("L'activité doit être comprise dans les horaires de l’équipage.");
        return;
    }

    eq.activites = eq.activites || [];

    const chevauchement = eq.activites.some(act => {
        const aDebut = new Date(act.debut);
        const aFin = new Date(act.fin);

        return debutDate < aFin && finDate > aDebut;
    });

    if (chevauchement) {
        alert("Impossible : cette activité chevauche une activité existante.");
        return;
    }

    eq.activites.push({
        debut,
        fin,
        type
    });

    sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));

    afficherTimelineEquipage();
}

function remplirEncadrementService() {
    const autoriteSelect = document.getElementById("autorite-permanence");
    const opjSelect = document.getElementById("opj-permanence");

    if (!autoriteSelect || !opjSelect) return;

    autoriteSelect.innerHTML = `
    <option value="">Sélectionner une autorité</option>
    <option value="AUCUNE">Aucune Autorité de Permanence</option>`;
    opjSelect.innerHTML = `<option value="">Sélectionner un OPJ</option>`;

    Object.keys(agents).forEach(matricule => {
        const agent = agents[matricule];

        const identite = `${agent.grade} ${agent.nom} ${agent.prenom}`;

        if (
            agent.grade.toLowerCase().includes("capitaine") ||
            agent.grade.toLowerCase().includes("commandant") ||
            agent.grade.toLowerCase().includes("commissaire")
        ) {
            autoriteSelect.innerHTML += `<option value="${matricule}">${identite}</option>`;
        }

        if (agent.qualificationJudiciaire === "OPJ") {
            opjSelect.innerHTML += `<option value="${matricule}">${identite}</option>`;
        }
    });
}

function afficherServices() {
    const aVenirContainer = document.getElementById("services-a-venir-container");
    const container = document.getElementById("services-container");
    const terminesContainer = document.getElementById("services-termines-container");

    if (!aVenirContainer || !container || !terminesContainer) return;

    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];
    const maintenant = new Date();

    const servicesAVenir = [];
    const servicesEnCours = [];
    const servicesTermines = [];

    services.forEach((service, index) => {
        const debutService = new Date(service.debut);
        const finService = new Date(service.fin);

        if (debutService > maintenant) {
            servicesAVenir.push({ service, index });
        } else if (finService < maintenant) {
            servicesTermines.push({ service, index });
        } else {
            servicesEnCours.push({ service, index });
        }
    });

    aVenirContainer.innerHTML = "";
    container.innerHTML = "";
    terminesContainer.innerHTML = "";

    if (servicesAVenir.length === 0) {
        aVenirContainer.innerHTML = "<p>Aucun service à venir.</p>";
    }

    if (servicesEnCours.length === 0) {
        container.innerHTML = "<p>Aucun service en cours.</p>";
    }

    if (servicesTermines.length === 0) {
        terminesContainer.innerHTML = "<p>Aucun service terminé.</p>";
    }

    servicesAVenir.forEach(item => {
        aVenirContainer.innerHTML += genererCarteService(item.service, item.index);
    });

    servicesEnCours.forEach(item => {
        container.innerHTML += genererCarteService(item.service, item.index);
    });

    servicesTermines.forEach(item => {
        terminesContainer.innerHTML += genererCarteService(item.service, item.index);
    });
}

function genererCarteService(service, index) {
    const autorite = agents[service.autorite];
    const opj = agents[service.opj];

    const autoriteTexte = service.autorite === "AUCUNE"
        ? "Aucune Autorité de Permanence"
        : autorite
            ? `${autorite.grade} ${autorite.nom} ${autorite.prenom}`
            : "Non renseignée";

    const presents = service.presents.map(matricule => {
        const agent = agents[matricule];
        return agent ? `${agent.nom} ${agent.prenom}` : matricule;
    }).join(", ");

    const absents = service.absents.map(matricule => {
        const agent = agents[matricule];
        return agent ? `${agent.nom} ${agent.prenom}` : matricule;
    }).join(", ");

    return `
        <div class="service-card service-card-hover">
            <strong>${nomService(service)}</strong><br>
            Unité : ${service.unite}<br>
            Chef de Service : ${service.chefService}<br>
            Autorité de Permanence : ${autoriteTexte}<br>
            OPJ de Permanence : ${opj ? `${opj.grade} ${opj.nom} ${opj.prenom}` : "Non renseigné"}<br>
            Horaires : ${formatDateHeure(service.debut)} → ${formatDateHeure(service.fin)}<br>
            Présents : ${presents || "Aucun"}<br>
            Absents : ${absents || "Aucun"}

            <button class="details-hover-button" onclick="consulterDetailsService(${index})">
                Consulter les détails du service
            </button>
        </div>
    `;
}

function chargerServiceEquipage() {
    const index = document.getElementById("equipage-service").value;
    const services = JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [];

    if (index === "" || !services[index]) return;

    const service = services[index];

    document.getElementById("equipage-unite").value = service.unite;
    document.getElementById("equipage-debut").value = service.debut;
    document.getElementById("equipage-fin").value = service.fin;

    const container = document.getElementById("equipage-composition-list");
    container.innerHTML = "";

    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

service.presents.forEach(matricule => {
    const agent = agents[matricule];
    if (!agent) return;

    const dejaAffecte = equipages.find(eq =>
        String(eq.serviceIndex) === String(index) &&
        eq.composition.some(item => item.matricule === matricule)
    );

    if (dejaAffecte) {
        container.innerHTML += `
            <div class="equipage-agent-check disabled-agent">
                ${agent.grade} ${agent.nom} ${agent.prenom} - ${agent.qualificationJudiciaire}
                <br>
                <small>Déjà affecté : ${dejaAffecte.indicatif}</small>
            </div>
        `;
        return;
    }

    container.innerHTML += `
        <div class="equipage-agent-check">
            <label>
                <input type="checkbox" value="${matricule}" onchange="toggleRoleEquipage(this)">
                ${agent.grade} ${agent.nom} ${agent.prenom} - ${agent.qualificationJudiciaire}
            </label>

            <select class="role-equipage" style="display:none;">
                <option value="">Fonction dans l'équipage</option>
                <option>Conducteur</option>
                <option>Chef de Bord</option>
                <option>Équipier 1</option>
                <option>Équipier 2</option>
            </select>
        </div>
    `;
});
}

function toggleRoleEquipage(checkbox) {
    const bloc = checkbox.closest(".equipage-agent-check");
    const select = bloc.querySelector(".role-equipage");

    if (checkbox.checked) {
        select.style.display = "block";
    } else {
        select.style.display = "none";
        select.value = "";
    }
}  

function chargerEquipagesGE() {
    const select = document.getElementById("ge-equipage");
    const selectSupp = document.getElementById("ge-equipage-supp");

    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

    select.innerHTML = `<option value="">Sélectionner un équipage</option>`;
    selectSupp.innerHTML = `<option value="">Sélectionner un équipage</option>`;

    equipages.forEach((eq, index) => {
        const label = `${eq.indicatif} - ${eq.unite} - ${eq.vehicule}`;
        select.innerHTML += `<option value="${index}">${label}</option>`;
        selectSupp.innerHTML += `<option value="${index}">${label}</option>`;
    });
}

function initialiserGE() {
    const equipageIndex = document.getElementById("ge-equipage").value;
    const connaissance = document.getElementById("ge-connaissance").value;

    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

    if (equipageIndex === "" || !connaissance) {
        alert("Veuillez sélectionner un équipage et renseigner la connaissance des faits.");
        return;
    }

    const eq = equipages[equipageIndex];

    document.getElementById("ge-initialisation").style.display = "none";
    document.getElementById("ge-formulaire").style.display = "block";

    document.getElementById("ge-recap-connaissance").textContent = formatDateHeure(connaissance);
    document.getElementById("ge-recap-equipage").textContent = `${eq.indicatif} - ${eq.unite} - ${eq.vehicule}`;
}

function ajouterEquipageGE() {
    const index = document.getElementById("ge-equipage-supp").value;
    const equipages = JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];

    if (index === "" || !equipages[index]) return;

    const eq = equipages[index];

    document.getElementById("ge-equipages-intervenants").innerHTML += `
        <div class="service-card">
            ${eq.indicatif} - ${eq.unite} - ${eq.vehicule}
        </div>
    `;
}

function ajouterPersonneGE() {
    const container = document.getElementById("ge-personnes");

    container.innerHTML += `
        <div class="ge-card personne-ge-card">

            <label>Qualité</label>
            <select class="personne-qualite">
                <option>Requérant</option>
                <option>Auteur</option>
                <option>Co-Auteur</option>
                <option>Victime</option>
                <option>Complice</option>
            </select>

            <label>Type de personne</label>
            <div class="toggle-personne">
                <button type="button" onclick="switchPersonneType(this, 'physique')">Personne Physique</button>
                <button type="button" onclick="switchPersonneType(this, 'morale')">Personne Morale</button>
            </div>

            <div class="personne-fields"></div>

        </div>
    `;
}

function switchPersonneType(button, type) {
    const card = button.closest(".ge-card");
    const fields = card.querySelector(".personne-fields");

    card.dataset.typePersonne = type;

    if (type === "physique") {
        fields.innerHTML = `
            <label class="inline-check">
                <input type="checkbox" class="identite-declaree">
                Identité Déclarée
            </label>

            <input class="personne-nom" placeholder="NOM DE FAMILLE *">
            <input class="personne-nom-usage" placeholder="NOM D'USAGE OU DE JEUNE FILLE">
            <input class="personne-prenom" placeholder="PRÉNOM *">
            <input class="personne-date-naissance" type="date">
            <input class="personne-lieu-naissance" placeholder="LIEU DE NAISSANCE">
            <input class="personne-profession" placeholder="PROFESSION">
            <input class="personne-adresse" placeholder="ADRESSE">
            <input class="personne-telephone" placeholder="TÉLÉPHONE">
            <input class="personne-email" placeholder="ADRESSE EMAIL">
        `;
    } else {
        fields.innerHTML = `
            <label class="inline-check">
                <input type="checkbox" class="identite-declaree">
                Identité Déclarée
            </label>

            <input class="personne-siret" placeholder="N° SIRET *">

            <select class="personne-forme-juridique">
                <option value="">Forme juridique</option>
                <option>SARL</option>
                <option>SA</option>
                <option>GIE</option>
                <option>SCI</option>
            </select>

            <input class="personne-representant" placeholder="REPRÉSENTANT *">
            <input class="personne-adresse" placeholder="ADRESSE">
            <input class="personne-telephone" placeholder="TÉLÉPHONE">
            <input class="personne-email" placeholder="ADRESSE EMAIL">
        `;
    }
}

function ajouterVehiculeGE() {
    const container = document.getElementById("ge-vehicules");

    container.innerHTML += `
        <div class="ge-card vehicule-ge-card">

            <input class="vehicule-marque" placeholder="MARQUE *">
            <input class="vehicule-modele" placeholder="MODÈLE *">
            <input class="vehicule-annee" placeholder="ANNÉE">
            <input class="vehicule-couleur" placeholder="COULEUR">

            <label class="inline-check">
                <input type="checkbox" class="immat-illisible" onchange="toggleImmatriculationIllisible(this)">
                Immatriculation illisible
            </label>

            <input class="vehicule-immatriculation" placeholder="IMMATRICULATION *">

            <input class="vehicule-police-assurance" placeholder="N° POLICE ASSURANCE *">
            <input class="vehicule-contrat" placeholder="N° CONTRAT">
            <input class="vehicule-assurance" placeholder="SOCIÉTÉ D'ASSURANCE *">
            <input class="vehicule-expiration" type="date">
            <input class="vehicule-proprietaire" placeholder="PROPRIÉTAIRE *">

        </div>
    `;
}

function nomService(service) {
    const date = new Date(service.debut).toLocaleDateString("fr-FR");
    return `Service du ${date} - ${service.unite} - ${service.libelle}`;
}

function toggleImmatriculationIllisible(checkbox) {
    const card = checkbox.closest(".vehicule-ge-card");
    const immat = card.querySelector(".vehicule-immatriculation");

    if (checkbox.checked) {
        immat.value = "IMMATRICULATION ILLISIBLE";
        immat.disabled = true;
    } else {
        immat.value = "";
        immat.disabled = false;
    }
}

function finaliserGE() {
    const bouton = document.getElementById("btn-finaliser-ge");
    const texte = bouton.querySelector(".btn-text");
    const spinner = bouton.querySelector(".spinner");

    const equipagePrincipal = document.getElementById("ge-recap-equipage").textContent;
    const connaissance = document.getElementById("ge-recap-connaissance").textContent;
    const avis = document.getElementById("ge-avis-intervenants").value;
    const motif = document.getElementById("ge-motif").value;
    const origine = document.getElementById("ge-origine").value;
    const adresse = document.getElementById("ge-adresse").value.trim();
    const arrivee = document.getElementById("ge-arrivee").value;
    const compteRendu = document.getElementById("ge-compte-rendu").value.trim();
    const depart = document.getElementById("ge-depart").value;

    if (!equipagePrincipal || !connaissance || !avis || !motif || !origine || !adresse || !arrivee || !depart || !compteRendu) {
        alert("Veuillez remplir tous les champs obligatoires de la GE.");
        return;
    }

    if (!validerPersonnesGE()) return;
    if (!validerVehiculesGE()) return;

    texte.textContent = "Finalisation...";
    spinner.style.display = "inline-block";
    bouton.disabled = true;

    setTimeout(() => {
        const ges = nettoyerAnciennesGE();

        const createurMatricule = sessionStorage.getItem("mcpnUtilisateur") || sessionStorage.getItem("matriculeConnecte");
        const createur = agents[createurMatricule];

        const numero = genererNumeroGE(ges.length + 1);

        ges.push({
            numero,
            dateCreation: new Date().toISOString(),
            createurMatricule,
            createurNom: createur ? `${createur.nom} ${createur.prenom}` : "Inconnu",
            createurGrade: createur ? createur.grade : "",
            motif,
            origine,
            adresse,
            equipageInitial: equipagePrincipal,
            connaissance,
            avis,
            arrivee,
            depart,
            compteRendu
        });

        localStorage.setItem("gesMCPN", JSON.stringify(ges));

        alert("Évènement créé avec succès.");

        bouton.disabled = false;
        texte.textContent = "Finaliser";
        spinner.style.display = "none";

        afficherListeGE();
    }, 900);
}

function validerPersonnesGE() {
    const personnes = document.querySelectorAll(".personne-ge-card");

    for (const card of personnes) {
        const type = card.dataset.typePersonne;

        if (!type) {
            alert("Veuillez sélectionner le type de chaque personne impliquée.");
            return false;
        }

        if (type === "physique") {
            const nom = card.querySelector(".personne-nom").value.trim();
            const prenom = card.querySelector(".personne-prenom").value.trim();
            const naissance = card.querySelector(".personne-date-naissance").value;

            if (!nom || !prenom || !naissance) {
                alert("Personne physique : NOM, PRÉNOM et DATE DE NAISSANCE sont obligatoires.");
                return false;
            }
        }

        if (type === "morale") {
            const siret = card.querySelector(".personne-siret").value.trim();
            const representant = card.querySelector(".personne-representant").value.trim();

            if (!siret || !representant) {
                alert("Personne morale : N° SIRET et REPRÉSENTANT sont obligatoires.");
                return false;
            }
        }
    }

    return true;
}

function validerVehiculesGE() {
    const vehicules = document.querySelectorAll(".vehicule-ge-card");

    for (const card of vehicules) {
        const marque = card.querySelector(".vehicule-marque").value.trim();
        const modele = card.querySelector(".vehicule-modele").value.trim();
        const immat = card.querySelector(".vehicule-immatriculation").value.trim();
        const police = card.querySelector(".vehicule-police-assurance").value.trim();
        const assurance = card.querySelector(".vehicule-assurance").value.trim();
        const proprio = card.querySelector(".vehicule-proprietaire").value.trim();

        if (!marque || !modele || !immat || !police || !assurance || !proprio) {
            alert("Véhicule : MARQUE, MODÈLE, IMMATRICULATION, N° POLICE ASSURANCE, SOCIÉTÉ D'ASSURANCE et PROPRIÉTAIRE sont obligatoires.");
            return false;
        }
    }

    return true;
}   

function nettoyerAnciennesGE() {
    const ges = JSON.parse(localStorage.getItem("gesMCPN")) || [];
    const maintenant = new Date();

    const gardees = ges.filter(ge => {
        const dateCreation = new Date(ge.dateCreation);
        const expiration = new Date(dateCreation);
        expiration.setMonth(expiration.getMonth() + 3);

        return maintenant < expiration;
    });

    localStorage.setItem("gesMCPN", JSON.stringify(gardees));
    return gardees;
}

function genererNumeroGE(nombre) {
    return `GE/${String(nombre).padStart(5, "0")}`;
}

function afficherListeGE() {
    const ges = nettoyerAnciennesGE();

    const containers = [
        document.getElementById("ge-list-container"),
        document.getElementById("ge-list-container-home")
    ];

    containers.forEach(container => {
        if (!container) return;

        if (ges.length === 0) {
            container.innerHTML = "<p>Aucune Gestion d'Évènement enregistrée.</p>";
            return;
        }

        container.innerHTML = "";

        ges.forEach((ge, index) => {
            container.innerHTML += `
                <div class="service-card ge-list-card">
                    <div>
                        <strong>${ge.numero}</strong>
                        ${ge.createurMatricule} ${ge.createurNom}
                        — ${ge.motif}
                        — ${ge.adresse}
                        — ${ge.equipageInitial}
                    </div>

                    <button class="mcpn-button" onclick="consulterGE(${index})">
                        Consulter
                    </button>
                </div>
            `;
        });
    });
}

function resetFormulaireGE() {
    document.getElementById("ge-initialisation").style.display = "block";
    document.getElementById("ge-formulaire").style.display = "none";

    const fields = [
        "ge-equipage",
        "ge-connaissance",
        "ge-avis-intervenants",
        "ge-adresse",
        "ge-complement-adresse",
        "ge-arrivee",
        "ge-compte-rendu",
        "ge-depart"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    const personnes = document.getElementById("ge-personnes");
    const vehicules = document.getElementById("ge-vehicules");
    const intervenants = document.getElementById("ge-equipages-intervenants");

    if (personnes) personnes.innerHTML = "";
    if (vehicules) vehicules.innerHTML = "";
    if (intervenants) intervenants.innerHTML = "";
}

function deconnexionMCPN() {
    sessionStorage.removeItem("mcpnConnecte");
    sessionStorage.removeItem("mcpnUtilisateur");

    window.location.href = "accueil.html";
}

function cloturerGE(index) {
    const matriculeConnecte = sessionStorage.getItem("matriculeConnecte");
    const agentConnecte = agents[matriculeConnecte];

    if (!agentConnecte || agentConnecte.niveau !== 2) {
        alert("Accès refusé. Niveau 2 - Gestionnaire requis.");
        return;
    }

    if (!confirm("Clôturer cette Gestion d'Évènement ?")) return;

    const ges = nettoyerAnciennesGE();

    ges.splice(index, 1);

    localStorage.setItem("gesMCPN", JSON.stringify(ges));

    alert("Gestion d'Évènement clôturée.");

    afficherGestionEvenement();
}

let chartActivite = null;
let chartBrigades = null;
let chartGEMotifs = null;

function afficherStatistiques() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "none";
    document.getElementById("prise-service-step2").style.display = "none";
    document.getElementById("gestion-activites").style.display = "none";
    document.getElementById("gestion-evenement").style.display = "none";
    document.getElementById("mention-service").style.display = "none";
    document.getElementById("details-service").style.display = "none";

    const detailsGE = document.getElementById("details-ge");
    if (detailsGE) detailsGE.style.display = "none";

    const detailsMS = document.getElementById("details-ms");
    if (detailsMS) detailsMS.style.display = "none";

    document.getElementById("statistiques").style.display = "block";

    setActiveSidebarButton(5);

    genererStatistiques();
}

function estCetteSemaine(dateValue) {
    const date = new Date(dateValue);
    const maintenant = new Date();

    const debutSemaine = new Date(maintenant);
    debutSemaine.setDate(maintenant.getDate() - maintenant.getDay() + 1);
    debutSemaine.setHours(0, 0, 0, 0);

    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 7);

    return date >= debutSemaine && date < finSemaine;
}

function genererStatistiques() {
    const services = (JSON.parse(sessionStorage.getItem("prisesServiceMCPN")) || [])
        .filter(s => estCetteSemaine(s.dateCreation || s.debut));

    const equipages = (JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [])
        .filter(e => estCetteSemaine(e.dateCreation || e.debut));

    const ges = (JSON.parse(localStorage.getItem("gesMCPN")) || [])
        .filter(ge => estCetteSemaine(ge.dateCreation));

    const ms = (JSON.parse(localStorage.getItem("mentionsServiceMCPN")) || [])
        .filter(m => estCetteSemaine(m.dateCreation));

    genererCamembertActivite(services, equipages, ges, ms);
    genererCamembertBrigades(services);
    genererCamembertMotifsGE(ges);
}

function genererCamembertActivite(services, equipages, ges, ms) {
    const ctx = document.getElementById("chart-activite");

    if (chartActivite) chartActivite.destroy();

    chartActivite = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Prises de Service", "GA", "GE", "MS"],
            datasets: [{
                data: [services.length, equipages.length, ges.length, ms.length],
                backgroundColor: ["#1E3A8A", "#2563EB", "#60A5FA", "#93C5FD"]
            }]
        }
    });
}

function genererCamembertBrigades(services) {
    const compteur = {};
    const chefs = {};

    services.forEach(service => {
        compteur[service.unite] = (compteur[service.unite] || 0) + 1;

        if (!chefs[service.unite]) chefs[service.unite] = {};
        chefs[service.unite][service.chefService] =
            (chefs[service.unite][service.chefService] || 0) + 1;
    });

    const labels = Object.keys(compteur);

    const chefPrincipal = labels.map(unite => {
        const liste = chefs[unite];
        return Object.keys(liste).sort((a, b) => liste[b] - liste[a])[0];
    });

    const ctx = document.getElementById("chart-brigades");

    if (chartBrigades) chartBrigades.destroy();

    chartBrigades = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: labels.map(l => compteur[l]),
                backgroundColor: ["#0F172A", "#1D4ED8", "#3B82F6", "#7DD3FC", "#BFDBFE", "#DBEAFE"]
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const unite = context.label;
                            const count = compteur[unite];
                            const chef = chefPrincipal[context.dataIndex] || "Non renseigné";
                            return `${unite} : ${count} service(s) | Chef le plus présent : ${chef}`;
                        }
                    }
                }
            }
        }
    });
}

function genererCamembertMotifsGE(ges) {
    const compteur = {};

    ges.forEach(ge => {
        compteur[ge.motif] = (compteur[ge.motif] || 0) + 1;
    });

    const labels = Object.keys(compteur);

    const ctx = document.getElementById("chart-ge-motifs");

    if (chartGEMotifs) chartGEMotifs.destroy();

    chartGEMotifs = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: labels.map(l => compteur[l]),
                backgroundColor: ["#1E40AF", "#2563EB", "#38BDF8", "#60A5FA", "#93C5FD", "#0EA5E9", "#0369A1"]
            }]
        }
    });
}

let matriculeResetEnCours = null;

function ouvrirResetMdp(matricule) {
    matriculeResetEnCours = matricule;

    document.getElementById("resetMdpMatricule").textContent =
        "Matricule concerné : " + matricule;

    document.getElementById("zoneCleTemporaire").classList.add("hidden");
    document.getElementById("cleTemporaireAffichee").textContent = "";

    document.getElementById("popupResetMdp").classList.remove("hidden");
}

function fermerResetMdp() {
    matriculeResetEnCours = null;
    document.getElementById("popupResetMdp").classList.add("hidden");
}

function genererCleTemporaire() {
    if (!matriculeResetEnCours) return;

    const cle = creerCleTemporaire(matriculeResetEnCours);

    document.getElementById("cleTemporaireAffichee").textContent = cle;
    document.getElementById("zoneCleTemporaire").classList.remove("hidden");
}

function creerCleTemporaire(matricule) {
    const date = new Date();
    const jour = date.getDate();
    const mois = date.getMonth() + 1;
    const annee = date.getFullYear();

    const base = Number(matricule) + jour * 17 + mois * 31 + annee;
    const code = String(base % 900000 + 100000);

    return "SSI" + code;
}

function verifierCleTemporaire(matricule, cleSaisie) {
    return cleSaisie === creerCleTemporaire(matricule);
}