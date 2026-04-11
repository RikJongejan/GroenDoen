// ============================================================
//  GROEN & GEWOON DOEN — js/pakketten.js
//  Pakketten laden en beheren
// ============================================================

async function loadPackages() {
    try {
        const res      = await fetch('./data/packages.json');
        if (!res.ok) throw new Error('packages.json niet gevonden');
        const packages = await res.json();

        const isAdmin = document.body.classList.contains('admin-body');

        if (isAdmin) {
            renderAdminPackageTable(packages);
        } else {
            renderPackageTable(packages);
            renderPackageSelect(packages);
        }
    } catch (err) {
        console.error('Fout bij laden pakketten:', err);
    }
}

function renderPackageTable(packages) {
    const tbody = document.getElementById('packageTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    packages.forEach((pkg, index) => {
        const tr = document.createElement('tr');

        const isAanbevolen = packages.length >= 3
            ? index === Math.floor(packages.length / 2)
            : index === 0;

        if (isAanbevolen) tr.classList.add('tr-featured');

        tr.innerHTML =
            '<td>' +
                '<strong>' + pkg.naam + '</strong>' +
                (isAanbevolen ? '<span class="badge-pop">Aanbevolen</span>' : '') +
            '</td>' +
            '<td class="td-muted">' + pkg.beschrijving + '</td>' +
            '<td>' +
                '<span class="pkg-price">&euro;&nbsp;' + pkg.prijs + '</span>' +
                ' <span class="pkg-unit">' + (pkg.uren ? pkg.uren + ' uur' : '/bezoek') + '</span>' +
            '</td>' +
            '<td>' +
                '<button class="btn btn-' + (isAanbevolen ? 'solid' : 'outline') + ' btn-sm"' +
                    ' onclick="selectPkg(' + pkg.id + ')">' +
                    'Kiezen' +
                '</button>' +
            '</td>';

        tbody.appendChild(tr);
    });
}

function renderPackageSelect(packages) {
    const sel = document.getElementById('packages');
    if (!sel) return;

    sel.innerHTML = '<option value="">Selecteer pakket...</option>';
    packages.forEach(pkg => {
        const opt = document.createElement('option');
        opt.value = pkg.id;
        opt.dataset.prijs = pkg.prijs;
        opt.textContent = pkg.naam + ' — \u20ac' + pkg.prijs;
        sel.appendChild(opt);
    });
}

function renderAdminPackageTable(packages) {
    const tbody = document.getElementById('packageTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    packages.forEach(pkg => {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td><strong>' + pkg.naam + '</strong></td>' +
            '<td class="td-muted">' + pkg.beschrijving + '</td>' +
            '<td>&euro;&nbsp;' + pkg.prijs + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" onclick="editPackage(' + pkg.id + ')">Bewerken</button></td>' +
            '<td><button class="btn btn-danger btn-sm" onclick="deletePackage(' + pkg.id + ', \'' + pkg.naam + '\')">Verwijder</button></td>' +
            '<td><button class="btn btn-ghost btn-sm" onclick="viewPackageQuestions(' + pkg.id + ')">Vragen</button></td>';
        tbody.appendChild(tr);
    });
}

function selectPkg(id) {
    const sel = document.getElementById('packages');
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
        if (parseInt(sel.options[i].value) === id) { sel.selectedIndex = i; break; }
    }
    const form = document.getElementById('packageForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function editPackage(id) {
    const naam = prompt('Nieuwe naam:');
    if (!naam) return;
    const beschrijving = prompt('Nieuwe beschrijving:');
    const prijs = prompt('Nieuwe prijs (€):');
    if (!prijs) return;
    try {
        const res = await fetch('/api/packages/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ naam, beschrijving, prijs: parseFloat(prijs) })
        });
        const result = await res.json();
        if (result.success) { showToast('Pakket bijgewerkt!', '', 'success'); loadPackages(); }
        else showToast('Fout', result.error, 'error');
    } catch (err) {
        console.error('Fout bij bewerken pakket:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    }
}

async function deletePackage(id, naam) {
    if (!confirm('Verwijder pakket "' + naam + '"?')) return;
    try {
        const res = await fetch('/api/packages/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { showToast('Pakket verwijderd!', '', 'success'); loadPackages(); }
        else showToast('Fout', result.error, 'error');
    } catch (err) {
        console.error('Fout bij verwijderen pakket:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    }
}

function viewPackageQuestions(id) { showToast('Nog te implementeren', 'Vragen voor pakket #' + id, 'warning'); }

async function handleNewPackage() {
    const naam         = document.getElementById('naam').value;
    const beschrijving = document.getElementById('beschrijving').value;
    const prijs        = document.getElementById('prijs').value;
    try {
        const res = await fetch('/api/packages/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ naam, beschrijving, prijs: parseFloat(prijs) })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Pakket toegevoegd!', naam, 'success');
            document.getElementById('newPackageForm').reset();
            loadPackages();
        } else {
            showToast('Fout', result.error, 'error');
        }
    } catch (err) {
        console.error('Fout bij toevoegen pakket:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    }
}

function openNewOrderForm() { showToast('Nog te implementeren', 'Nieuwe order formulier.', 'warning'); }
