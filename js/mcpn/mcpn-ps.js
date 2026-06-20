function getEquipagesMCPN() {
    return JSON.parse(sessionStorage.getItem("equipagesMCPN")) || [];
}

function setEquipagesMCPN(equipages) {
    sessionStorage.setItem("equipagesMCPN", JSON.stringify(equipages));
}

function nettoyerEquipagesExpires() {
    let equipages = getEquipagesMCPN();
    const maintenant = new Date();

    equipages = equipages.filter(eq => {
        if (!eq.fin) return false;

        const fin = new Date(eq.fin);
        fin.setHours(fin.getHours() + 2);

        return maintenant < fin;
    });

    setEquipagesMCPN(equipages);
    return equipages;
}

function initialiserPriseService() {
    document.getElementById("ps-creation-equipage").style.display = "block";
    remplirCompositionEquipagePS();
}

function remplirCompositionEquipagePS() {
    const container = document.getElementById("ps-composition-list");
    if (!container) return;

    container.innerHTML = "";

    const equipages = nettoyerEquipagesExpires();

    Object.keys(agents).forEach(matricule => {
        const agent = agents[matricule];

        const dejaAffecte = equipages.find(eq =>
            (eq.composition || []).some(item => item.matricule === matricule)
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

function enregistrerEquipageDepuisPS() {
    const indicatif = document.getElementById("ps-indicatif").value.trim();
    const unite = document.getElementById("ps-unite").value;
    const vehicule = document.getElementById("ps-vehicule").value;
    const debut = document.getElementById("ps-debut").value;
    const fin = document.getElementById("ps-fin").value;

    if (!indicatif || !unite || !vehicule || !debut || !fin) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (new Date(fin) <= new Date(debut)) {
        alert("La fin doit être postérieure au début.");
        return;
    }

    const composition = [];
    let erreurRole = false;

    document.querySelectorAll("#ps-composition-list input:checked").forEach(input => {
        const bloc = input.closest(".equipage-agent-check");
        const role = bloc.querySelector(".role-equipage").value;

        if (!role) {
            erreurRole = true;
            return;
        }

        composition.push({
            matricule: input.value,
            role: role
        });
    });

    if (erreurRole) {
        alert("Veuillez renseigner la fonction de chaque agent sélectionné.");
        return;
    }

    if (composition.length === 0) {
        alert("Veuillez sélectionner au moins un effectif.");
        return;
    }

    const equipages = getEquipagesMCPN();

    equipages.push({
        indicatif,
        unite,
        vehicule,
        debut,
        fin,
        composition,
        activites: [],
        createurMatricule: sessionStorage.getItem("mcpnUtilisateur") || sessionStorage.getItem("matriculeConnecte"),
        dateCreation: new Date().toISOString()
    });

    setEquipagesMCPN(equipages);

    alert("Équipage créé.");

    document.getElementById("ps-creation-equipage").style.display = "none";
    document.getElementById("ps-indicatif").value = "";
    document.getElementById("ps-debut").value = "";
    document.getElementById("ps-fin").value = "";
    document.getElementById("ps-composition-list").innerHTML = "";

    afficherEquipagesPS();
}

function afficherEquipagesPS() {
    const container = document.getElementById("ps-equipages-en-cours");
    if (!container) return;

    const equipages = nettoyerEquipagesExpires();

    if (equipages.length === 0) {
        container.innerHTML = "<p>Aucun équipage en service.</p>";
        return;
    }

    container.innerHTML = "";

    equipages.forEach((eq, index) => {
        container.innerHTML += genererCarteEquipage(eq, index, false);
    });
}