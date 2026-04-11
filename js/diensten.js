// ============================================================
//  GROEN & GEWOON DOEN — js/diensten.js
//  Diensten laden en tonen
// ============================================================

async function loadDiensten() {
    const grid = document.getElementById('dienstenGrid');
    if (!grid) return;

    try {
        const res      = await fetch('./data/diensten.json');
        if (!res.ok) throw new Error('diensten.json niet gevonden');
        const diensten = await res.json();

        grid.innerHTML = '';
        diensten.forEach(d => {
            const div = document.createElement('div');
            div.className = 'dienst';
            div.innerHTML =
                '<div class="dienst-bar"></div>' +
                '<h4>' + d.naam + '</h4>' +
                '<p>'  + d.beschrijving + '</p>';
            grid.appendChild(div);
        });
    } catch (err) {
        console.error('Fout bij laden diensten:', err);
        grid.innerHTML = '<p class="load-error">Diensten konden niet worden geladen.</p>';
    }
}
