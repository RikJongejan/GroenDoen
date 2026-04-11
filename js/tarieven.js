// ============================================================
//  GROEN & GEWOON DOEN — js/tarieven.js
//  Tarieven laden en opslaan
// ============================================================

async function loadRates() {
    try {
        const res = await fetch('./data/tarieven.json');
        if (!res.ok) throw new Error('tarieven.json niet gevonden');
        const rates = await res.json();

        window.rates = rates;

        setText('eGRate', fmt(rates.gras));
        setText('eTRate', fmt(rates.tegels));
        setText('eHRate', fmt(rates.heg));

        setVal('tGras',      rates.gras);
        setVal('tTegels',    rates.tegels);
        setVal('tHeg',       rates.heg);
        setVal('tUurtarief', rates.uurtarief);

        calculateQuote();
    } catch (err) {
        console.error('Fout bij laden rates:', err);
    }
}

async function saveTarieven() {
    const data = {
        gras:      parseFloat(document.getElementById('tGras').value)      || 0,
        tegels:    parseFloat(document.getElementById('tTegels').value)    || 0,
        heg:       parseFloat(document.getElementById('tHeg').value)       || 0,
        uurtarief: parseFloat(document.getElementById('tUurtarief').value) || 0
    };
    try {
        const res = await fetch('/api/tarieven', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Tarieven opgeslagen!', 'De nieuwe tarieven zijn actief.', 'success');
            window.rates = { ...data };
        } else {
            showToast('Fout', result.error, 'error');
        }
    } catch (err) {
        console.error('Fout bij opslaan tarieven:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden bij het opslaan.', 'error');
    }
}
