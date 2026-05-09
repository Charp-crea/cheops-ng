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
        const mdp = localStorage.getItem("mdp_" + matricule) || "Aucun mot de passe créé";

        container.innerHTML += `
            <div class="agent-row">
                <div><strong>${matricule}</strong><br>${mdp}</div>
                <div>${agent.grade}</div>
                <div>${agent.nom} ${agent.prenom}</div>
                <div>Niveau ${agent.niveau} - ${agent.fonction}<br>${agent.qualificationJudiciaire}</div>
                <button onclick="supprimerAgent('${matricule}')">Supprimer</button>
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

    setActiveSidebarButton(0);
}

function afficherPriseService() {
    document.getElementById("mcpn-home").style.display = "none";
    document.getElementById("prise-service-step1").style.display = "block";
    document.getElementById("prise-service-step2").style.display = "none";

    setActiveSidebarButton(1);
}

function setActiveSidebarButton(index) {
    const buttons = document.querySelectorAll(".side-btn");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[index]) {
        buttons[index].classList.add("active");
    }
}