const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const port = 3000;

// Serveer statische bestanden vanuit de project-root (één map omhoog)
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());

// Data-bestanden staan in <root>/data/
const dataDir = path.join(__dirname, '..', 'data');

function readJson(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filename, data) {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ── Routes ──────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// GET tarieven
app.get('/api/tarieven', (req, res) => {
    const data = readJson('tarieven.json');
    if (!data) return res.status(404).json({ error: 'Tarieven niet gevonden' });
    res.json(data);
});

// POST tarieven (admin update)
app.post('/api/tarieven', (req, res) => {
    const { gras, tegels, heg, uurtarief } = req.body;
    if (gras === undefined || tegels === undefined || heg === undefined || uurtarief === undefined) {
        return res.status(400).json({ error: 'Alle tarieven zijn verplicht' });
    }
    writeJson('tarieven.json', { gras, tegels, heg, uurtarief });
    res.json({ success: true, message: 'Tarieven opgeslagen' });
});

// GET packages
app.get('/api/packages', (req, res) => {
    const data = readJson('packages.json');
    if (!data) return res.status(404).json({ error: 'Packages niet gevonden' });
    res.json(data);
});

// POST packages (volledige array vervangen)
app.post('/api/packages', (req, res) => {
    const packages = req.body;
    if (!Array.isArray(packages)) {
        return res.status(400).json({ error: 'Packages moeten een array zijn' });
    }
    for (const pkg of packages) {
        if (!pkg.id || !pkg.naam || pkg.prijs === undefined) {
            return res.status(400).json({ error: 'Elk pakket moet id, naam en prijs hebben' });
        }
    }
    writeJson('packages.json', packages);
    res.json({ success: true, message: 'Packages opgeslagen' });
});

// POST single package (nieuw toevoegen) — vóór PUT :id definiëren
app.post('/api/packages/add', (req, res) => {
    const { naam, beschrijving, prijs } = req.body;
    if (!naam || prijs === undefined) {
        return res.status(400).json({ error: 'Naam en prijs zijn verplicht' });
    }
    const packages = readJson('packages.json') || [];
    const newId    = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
    packages.push({ id: newId, naam, beschrijving: beschrijving || '', prijs: parseFloat(prijs) });
    writeJson('packages.json', packages);
    res.json({ success: true, message: 'Pakket toegevoegd', id: newId });
});

// PUT update enkel pakket
app.put('/api/packages/:id', (req, res) => {
    const id       = parseInt(req.params.id);
    const { naam, beschrijving, prijs } = req.body;
    const packages = readJson('packages.json') || [];
    const index    = packages.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pakket niet gevonden' });
    packages[index] = { ...packages[index], naam, beschrijving, prijs: parseFloat(prijs) };
    writeJson('packages.json', packages);
    res.json({ success: true, message: 'Pakket bijgewerkt' });
});

// DELETE pakket
app.delete('/api/packages/:id', (req, res) => {
    const id       = parseInt(req.params.id);
    let packages   = readJson('packages.json') || [];
    const index    = packages.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pakket niet gevonden' });
    packages.splice(index, 1);
    writeJson('packages.json', packages);
    res.json({ success: true, message: 'Pakket verwijderd' });
});

// ── Orders ──────────────────────────────────────────────────

// POST /api/orders — klant dient nieuwe offerte-aanvraag in
app.post('/api/orders', (req, res) => {
    const { klant, email, telefoon, adres, datum, details, offerte } = req.body;
    if (!klant) {
        return res.status(400).json({ success: false, error: 'Naam is verplicht' });
    }
    const orders   = readJson('orders.json') || [];
    const newOrder = {
        id:       orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        klant:    klant,
        email:    email    || '',
        telefoon: telefoon || '',
        adres:    adres    || '',
        datum:    datum    || '',
        details:  details  || '',
        offerte:  parseFloat(offerte) || 0,
        status:   'In afwachting'
    };
    orders.push(newOrder);
    writeJson('orders.json', orders);
    res.json({ success: true, id: newOrder.id });
});

// PATCH /api/orders/:id — admin of klant updaten status/veld
app.patch('/api/orders/:id', (req, res) => {
    const id      = parseInt(req.params.id);
    const orders  = readJson('orders.json') || [];
    const order   = orders.find(o => o.id === id);

    if (!order) {
        return res.status(404).json({ success: false, error: 'Order #' + id + ' niet gevonden' });
    }

    const allowed = ['status', 'datum', 'offerte', 'details', 'adres'];
    allowed.forEach(field => {
        if (req.body[field] !== undefined) order[field] = req.body[field];
    });

    writeJson('orders.json', orders);
    res.json({ success: true });
});

// ── Start ────────────────────────────────────────────────────

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
