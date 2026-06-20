function chargerEquipagesGE() {
    const select = document.getElementById("ge-equipage");
    const selectSupp = document.getElementById("ge-equipage-supp");

    if (!select || !selectSupp) return;

    const equipages = nettoyerEquipagesExpires();

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

    const equipages = nettoyerEquipagesExpires();

    if (equipageIndex === "" || !connaissance) {
        alert("Veuillez sélectionner un équipage et renseigner la connaissance des faits.");
        return;
    }

    const eq = equipages[equipageIndex];

    if (!eq) {
        alert("Équipage introuvable.");
        return;
    }

    document.getElementById("ge-initialisation").style.display = "none";
    document.getElementById("ge-formulaire").style.display = "block";

    document.getElementById("ge-recap-connaissance").textContent = formatDateHeure(connaissance);
    document.getElementById("ge-recap-equipage").textContent = `${eq.indicatif} - ${eq.unite} - ${eq.vehicule}`;
}

function ajouterEquipageGE() {
    const index = document.getElementById("ge-equipage-supp").value;
    const equipages = nettoyerEquipagesExpires();

    if (index === "" || !equipages[index]) return;

    const eq = equipages[index];

    document.getElementById("ge-equipages-intervenants").innerHTML += `
        <div class="service-card">
            ${eq.indicatif} - ${eq.unite} - ${eq.vehicule}
        </div>
    `;
}