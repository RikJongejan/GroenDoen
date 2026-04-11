// ============================================================
//  GROEN & GEWOON DOEN — js/offerte.js
//  Bestelformulier en prijsschatter
// ============================================================

async function handlePackageForm(e) {
    e.preventDefault();

    if (!selectedDay) {
        highlightDateError();
        showToast('Datum vereist', 'Selecteer eerst een datum in de kalender.', 'error');
        return;
    }

    const sessieKlant = sessionStorage.getItem('klant');
    if (!sessieKlant) {
        showToast('Niet ingelogd', 'Log eerst in om een bestelling te plaatsen.', 'error');
        document.querySelector('.popup').style.display = 'flex';
        return;
    }

    const form  = e.target;
    const pkgId = form.querySelector('#packages')?.value;
    if (!pkgId) { showToast('Pakket vereist', 'Selecteer eerst een pakket.', 'error'); return; }

    const pkgSel   = form.querySelector('#packages');
    const pkgNaam  = pkgSel ? pkgSel.options[pkgSel.selectedIndex].text  : 'Pakket #' + pkgId;
    const pkgPrijs = pkgSel ? parseFloat(pkgSel.options[pkgSel.selectedIndex].dataset.prijs) || 0 : 0;

    const naam     = (form.querySelector('#orderName')?.value    || '').trim();
    const email    = (form.querySelector('#orderEmail')?.value   || '').trim();
    const telefoon = (form.querySelector('#orderPhone')?.value   || '').trim();
    const locatie  = (form.querySelector('#orderLocatie')?.value || '').trim();

    if (!naam)    { showToast('Naam vereist',    'Vul uw naam in.',     'error'); return; }
    if (!email)   { showToast('E-mail vereist',  'Vul uw e-mailadres in.', 'error'); return; }
    if (!locatie) { showToast('Locatie vereist', 'Vul uw locatie in.', 'error'); return; }

    const order = {
        klant:    naam,
        email:    email,
        telefoon: telefoon,
        adres:    locatie,
        datum:    getSelectedDateString(),
        pakket:   pkgNaam,
        details:  'Pakket: ' + pkgNaam,
        offerte:  pkgPrijs,
        status:   'In afwachting'
    };

    try {
        const res    = await fetch('/api/orders', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(order)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Bestelling geplaatst!', 'We nemen spoedig contact met u op.', 'success');
            form.reset();
            selectedDay = null;
            renderCalendar();
            updateDateDisplay();
        } else {
            showToast('Fout', result.error, 'error');
        }
    } catch (err) {
        console.error('Fout bij versturen pakket order:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    }
}

function validateCustomForm() {
    const fields = ['grassV', 'tilesV', 'hedgeV'];
    var valid = true;

    fields.forEach(function (id) {
        const input = document.getElementById(id);
        if (!input) return;
        input.classList.remove('error');
        const old = input.parentElement.querySelector('.error-msg');
        if (old) old.remove();
    });

    const grassV = parseFloat(document.getElementById('grassV').value) || 0;
    const tilesV = parseFloat(document.getElementById('tilesV').value) || 0;
    const hedgeV = parseFloat(document.getElementById('hedgeV').value) || 0;

    if (grassV === 0 && tilesV === 0 && hedgeV === 0) {
        showToast('Veld vereist', 'Vul minimaal één oppervlakte in (min. 10).', 'error');
        return false;
    }

    var limits = { grassV: { max: 1000 }, tilesV: { max: 1000 }, hedgeV: { max: 1000 } };
    var vals   = { grassV: grassV, tilesV: tilesV, hedgeV: hedgeV };
    var labels = { grassV: 'Gras', tilesV: 'Tegels', hedgeV: 'Heg' };
    fields.forEach(function (id) {
        var v = vals[id];
        if (v === 0) return;
        if (v < 10) {
            const input = document.getElementById(id);
            if (input) { input.classList.add('error'); }
            showToast(labels[id] + ': te weinig', 'Minimaal 10 m² of meter invullen.', 'error');
            valid = false;
        } else if (v > limits[id].max) {
            const input = document.getElementById(id);
            if (input) { input.classList.add('error'); }
            showToast(labels[id] + ': te veel', 'Maximum is ' + limits[id].max + '.', 'error');
            valid = false;
        }
    });

    return valid;
}

function handleCustomForm(e) {
    e.preventDefault();

    if (!selectedDay) {
        highlightDateError();
        showToast('Datum vereist', 'Selecteer eerst een datum in de kalender.', 'error');
        return;
    }

    const sessieKlantCustom = sessionStorage.getItem('klant');
    if (!sessieKlantCustom) {
        showToast('Niet ingelogd', 'Log eerst in om een offerte aan te vragen.', 'error');
        document.querySelector('.popup').style.display = 'flex';
        return;
    }

    const adresVal = document.getElementById('cAdres') ? document.getElementById('cAdres').value.trim() : '';
    if (!adresVal) {
        const adresEl = document.getElementById('cAdres');
        if (adresEl) adresEl.classList.add('error');
        showToast('Adres vereist', 'Vul het adres van de tuin in.', 'error');
        return;
    }

    if (!validateCustomForm()) return;

    syncVisibleToHidden();

    const order = {
        klant:    document.getElementById('cNaam')  ? document.getElementById('cNaam').value  : '',
        email:    document.getElementById('cEmail') ? document.getElementById('cEmail').value : '',
        telefoon: document.getElementById('cTel')   ? document.getElementById('cTel').value   : '',
        adres:    document.getElementById('cAdres') ? document.getElementById('cAdres').value : '',
        datum:    getSelectedDateString(),
        details:
            'Gras: '   + (document.getElementById('grass').value  || 0) + 'm², ' +
            'Tegels: ' + (document.getElementById('tiles').value  || 0) + 'm², ' +
            'Heg: '    + (document.getElementById('hedge').value  || 0) + 'm',
        offerte: document.getElementById('eTot')
                    ? document.getElementById('eTot').textContent.replace(',', '.')
                    : '0',
        status: 'In afwachting'
    };

    fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(order)
    })
    .then(function (res) { return res.json(); })
    .then(function (result) {
        if (result.success) {
            showToast('Offerte aangevraagd!', 'We nemen spoedig contact met u op.', 'success');
            document.getElementById('customForm').reset();
            calculateQuote();
            selectedDay = null;
            renderCalendar();
            updateDateDisplay();
        } else {
            showToast('Fout', result.error, 'error');
        }
    })
    .catch(function (err) {
        console.error('Fout bij versturen:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    });
}

function syncVisibleToHidden() {
    const map = { grassV: 'grass', tilesV: 'tiles', hedgeV: 'hedge', options1V: 'options1' };
    Object.entries(map).forEach(([visId, hidId]) => {
        const vis = document.getElementById(visId);
        const hid = document.getElementById(hidId);
        if (vis && hid) hid.value = vis.value;
    });
}

function calculateQuote() {
    syncVisibleToHidden();

    const grassV = parseFloat(document.getElementById('grassV')?.value) || 0;
    const tilesV = parseFloat(document.getElementById('tilesV')?.value) || 0;
    const hedgeV = parseFloat(document.getElementById('hedgeV')?.value) || 0;

    const rates = window.rates || { gras: 0, tegels: 0, heg: 0 };

    const grassTotal = grassV * rates.gras;
    const tilesTotal = tilesV * rates.tegels;
    const hedgeTotal = hedgeV * rates.heg;

    setText('eGM',  grassV);
    setText('eTM',  tilesV);
    setText('eHM',  hedgeV);
    setText('eGP',  fmt(grassTotal));
    setText('eTP',  fmt(tilesTotal));
    setText('eHP',  fmt(hedgeTotal));
    setText('eTot', fmt(grassTotal + tilesTotal + hedgeTotal));
}

function updateRangeBar(inputId, barId, hintId, min, max) {
    const input = document.getElementById(inputId);
    const bar   = document.getElementById(barId);
    const hint  = document.getElementById(hintId);
    if (!input || !bar || !hint) return;

    const val = parseFloat(input.value);

    if (!input.value || isNaN(val)) {
        bar.style.width = '0%';
        bar.className = 'range-bar';
        hint.textContent = '';
        hint.className = 'range-hint';
        input.classList.remove('error');
        return;
    }

    const pct = Math.min(Math.max((val / max) * 100, 0), 100);
    bar.style.width = pct + '%';

    if (val < min) {
        bar.className = 'range-bar bar-error';
        hint.textContent = 'Minimaal ' + min + (inputId === 'hedgeV' ? ' m' : ' m²');
        hint.className = 'range-hint hint-error';
        input.classList.add('error');
    } else if (val > max) {
        bar.className = 'range-bar bar-error';
        hint.textContent = 'Maximaal ' + max + (inputId === 'hedgeV' ? ' m' : ' m²');
        hint.className = 'range-hint hint-error';
        input.classList.add('error');
    } else if (val >= max * 0.85) {
        bar.className = 'range-bar bar-warn';
        hint.textContent = val + (inputId === 'hedgeV' ? ' m' : ' m²') + ' — bijna maximum';
        hint.className = 'range-hint hint-warn';
        input.classList.remove('error');
    } else {
        bar.className = 'range-bar';
        hint.textContent = val + (inputId === 'hedgeV' ? ' m' : ' m²');
        hint.className = 'range-hint';
        input.classList.remove('error');
    }
}

function initPriceCalc() {
    var fieldCfg = [
        { id: 'grassV', bar: 'barGrassV', hint: 'hintGrassV', min: 10, max: 1000 },
        { id: 'tilesV', bar: 'barTilesV', hint: 'hintTilesV', min: 10, max: 1000 },
        { id: 'hedgeV', bar: 'barHedgeV', hint: 'hintHedgeV', min: 10, max: 1000 },
    ];

    fieldCfg.forEach(function(cfg) {
        const el = document.getElementById(cfg.id);
        if (!el) return;
        el.addEventListener('input', function() {
            calculateQuote();
            updateRangeBar(cfg.id, cfg.bar, cfg.hint, cfg.min, cfg.max);
            const msg = this.parentElement.querySelector('.error-msg');
            if (msg) msg.remove();
        });
    });

    const opt1 = document.getElementById('options1V');
    if (opt1) opt1.addEventListener('input', () => {
        const h = document.getElementById('options1');
        if (h) h.value = opt1.value;
    });
}
