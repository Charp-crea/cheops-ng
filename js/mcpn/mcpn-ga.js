window.equipageSelectionneIndexMCPN = null;

function genererCarteEquipage(eq, index, avecActivite) {
    const noms = (eq.composition || []).map(item => {
        const agent = agents[item.matricule];

        return agent
            ? `${item.role} : ${agent.nom} ${agent.prenom}`
            : `${item.role} : ${item.matricule}`;
    }).join(", ");

    const boutonActivite = avecActivite
        ? `<button class="mcpn-button" onclick="consulterActiviteEquipage(${index})">Consulter l'activité</button>`
        : "";

    return `
        <div class="service-card">
            <strong>${eq.indicatif}</strong><br>
            Unité : ${eq.unite}<br>
            Véhicule : ${eq.vehicule}<br>
            Horaires : ${formatDateHeure(eq.debut)} → ${formatDateHeure(eq.fin)}<br>
            Composition : ${noms || "Aucun effectif"}<br><br>

            ${boutonActivite}

            <button class="mcpn-button" onclick="consulterDetailsEquipage(${index})">
                Détails
            </button>
        </div>
    `;
}

function afficherEquipages() {
    const container = document.getElementById("equipages-container");
    if (!container) return;

    const equipages = nettoyerEquipagesExpires();

    if (equipages.length === 0) {
        container.innerHTML = "<p>Aucun équipage créé.</p>";
        return;
    }

    container.innerHTML = "";

    equipages.forEach((eq, index) => {
        container.innerHTML += genererCarteEquipage(eq, index, true);
    });
}

function consulterDetailsEquipage(index) {
    const equipages = getEquipagesMCPN();
    const eq = equipages[index];

    if (!eq) {
        alert("Équipage introuvable.");
        return;
    }

    const createur = agents[eq.createurMatricule];

    const composition = (eq.composition || []).map(item => {
        const agent = agents[item.matricule];

        return agent
            ? `${item.role} : ${agent.grade} ${agent.nom} ${agent.prenom}`
            : `${item.role} : ${item.matricule}`;
    }).join("\n");

    alert(
        `DÉTAILS ÉQUIPAGE\n\n` +
        `Indicatif : ${eq.indicatif}\n` +
        `Unité : ${eq.unite}\n` +
        `Véhicule : ${eq.vehicule}\n\n` +
        `Créé par : ${eq.createurMatricule || "Inconnu"} - ${createur ? `${createur.grade} ${createur.nom} ${createur.prenom}` : "Inconnu"}\n` +
        `Date de création : ${eq.dateCreation ? formatDateHeure(eq.dateCreation) : "Non renseignée"}\n\n` +
        `Horaires :\n${formatDateHeure(eq.debut)} → ${formatDateHeure(eq.fin)}\n\n` +
        `Composition :\n${composition || "Aucun effectif"}`
    );
}

function consulterActiviteEquipage(index) {
    window.equipageSelectionneIndexMCPN = index;

    const equipages = getEquipagesMCPN();
    const eq = equipages[index];

    if (!eq) return;

    const panel = document.getElementById("activite-equipage-panel");
    const title = document.getElementById("activite-equipage-title");

    panel.style.display = "block";
    title.textContent = `Activité de l’équipage ${eq.indicatif}`;

    afficherTimelineEquipage();
}

function afficherTimelineEquipage() {
    const container = document.getElementById("activite-timeline");
    const equipages = getEquipagesMCPN();
    const eq = equipages[window.equipageSelectionneIndexMCPN];

    if (!container || !eq) return;

    const debutService = new Date(eq.debut);
    const finService = new Date(eq.fin);

    const activites = (eq.activites || []).sort((a, b) => new Date(a.debut) - new Date(b.debut));

    let html = "";
    let curseur = new Date(debutService);

    activites.forEach(act => {
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

function ouvrirAjoutActiviteEquipage(debutDefaut, finDefaut) {
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
    const equipages = getEquipagesMCPN();
    const eq = equipages[window.equipageSelectionneIndexMCPN];

    if (!eq) return;

    const debutDate = new Date(debut);
    const finDate = new Date(fin);
    const debutService = new Date(eq.debut);
    const finService = new Date(eq.fin);

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
        alert("Cette activité chevauche une activité existante.");
        return;
    }

    eq.activites.push({
        debut,
        fin,
        type
    });

    setEquipagesMCPN(equipages);

    afficherTimelineEquipage();
}