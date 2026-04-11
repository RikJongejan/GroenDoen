// ============================================================
//  GROEN & GEWOON DOEN — js/mijn-orders.js
//  Klantportaal — eigen orders bekijken en reageren
// ============================================================

let huidigKlantOrder = null;

async function laadMijnOrders(user) {
    const container = document.getElementById('mijnOrdersLijst');
    if (!container) return;

    const titel = document.getElementById('mijnOrdersTitel');
    if (titel) titel.textContent = 'Welkom, ' + user.username;

    container.innerHTML = '<p style="color:var(--muted);font-size:14px;">Orders laden...</p>';

    try {
        const res    = await fetch('./data/orders.json');
        if (!res.ok) throw new Error('orders.json niet gevonden');
        const orders = await res.json();

        renderMijnOrders(orders, container);
    } catch (err) {
        console.error('Fout bij laden orders:', err);
        container.innerHTML = '<p style="color:var(--danger);font-size:14px;">Orders konden niet worden geladen.</p>';
    }
}

function renderMijnOrders(orders, container) {
    if (orders.length === 0) {
        container.innerHTML =
            '<p style="color:var(--muted);font-size:14px;padding:20px 0;">' +
            'U heeft nog geen orders. Vraag hieronder een offerte aan.' +
            '</p>';
        return;
    }

    let html = '<div class="mijn-orders-lijst">';
    orders.forEach(o => {
        const badge = STATUS_BADGE[o.status] || 'badge-blue';
        html +=
            '<div class="mijn-order-rij" onclick="openKlantModal(' + o.id + ')" style="cursor:pointer">' +
                '<div class="mijn-order-rij-links">' +
                    '<span class="mijn-order-nr">#' + o.id + '</span>' +
                    '<span class="mijn-order-datum">' + (o.datum || 'Geen datum') + '</span>' +
                    '<span class="mijn-order-details">' + (o.details || '–') + '</span>' +
                '</div>' +
                '<div class="mijn-order-rij-rechts">' +
                    '<span class="mijn-order-prijs">&euro;&nbsp;' + parseFloat(o.offerte || 0).toFixed(2).replace('.', ',') + '</span>' +
                    '<span class="badge ' + badge + '">' + o.status + '</span>' +
                '</div>' +
            '</div>';
    });
    html += '</div>';
    html += '<p class="mijn-orders-hint">Klik op een order om details te bekijken en te reageren.</p>';
    container.innerHTML = html;
}

async function openKlantModal(orderId) {
    const res    = await fetch('./data/orders.json');
    const orders = await res.json();
    const o      = orders.find(x => x.id === orderId);
    if (!o) return;

    huidigKlantOrder = o;

    const modal = document.getElementById('klantOrderModal');
    if (!modal) return;

    document.getElementById('klantModalTitel').textContent = 'Order #' + o.id;

    const badgeEl = document.getElementById('klantModalBadge');
    badgeEl.textContent = o.status;
    badgeEl.className   = 'badge ' + (STATUS_BADGE[o.status] || 'badge-blue');

    document.getElementById('klantModalDatum').textContent   = o.datum    || '–';
    document.getElementById('klantModalDetails').textContent = o.details  || '–';
    document.getElementById('klantModalAdres').textContent   = o.adres    || '–';
    document.getElementById('klantModalOfferte').textContent = '€ ' + parseFloat(o.offerte || 0).toFixed(2).replace('.', ',');

    const datumInput = document.getElementById('klantDatumInput');
    if (datumInput) datumInput.value = '';

    const actieBalk = document.getElementById('klantModalActies');
    actieBalk.style.display = 'none';

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function sluitKlantModal() {
    const modal = document.getElementById('klantOrderModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.addEventListener('transitionend', () => { modal.style.display = 'none'; }, { once: true });
}

async function klantGeeftAkkoord() {
    if (!huidigKlantOrder) return;
    if (!confirm('Geeft u akkoord op deze offerte?')) return;
    await klantPatchOrder(huidigKlantOrder.id, { status: 'Akkoord' });
}

async function klantGeeftNietAkkoord() {
    if (!huidigKlantOrder) return;
    if (!confirm('Weet u zeker dat u deze offerte afwijst?')) return;
    await klantPatchOrder(huidigKlantOrder.id, { status: 'Niet akkoord' });
}

async function klantSlaatDatumOp() {
    if (!huidigKlantOrder) return;
    const input = document.getElementById('klantDatumInput');
    if (!input || !input.value) { showToast('Datum vereist', 'Kies eerst een datum.', 'error'); return; }
    if (!confirm('Weet u zeker dat u de datum wilt wijzigen?')) return;
    const ok = await klantPatchOrder(huidigKlantOrder.id, { datum: input.value });
    if (ok) showToast('Datum opgeslagen!', 'De nieuwe datum is verwerkt.', 'success');
}

async function klantPatchOrder(id, data) {
    try {
        const res    = await fetch('/api/orders/' + id, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            sluitKlantModal();
            const opgeslagenUser = JSON.parse(sessionStorage.getItem('klant'));
            if (opgeslagenUser) laadMijnOrders(opgeslagenUser);
            return true;
        } else {
            showToast('Fout', result.error, 'error');
            return false;
        }
    } catch (err) {
        console.error('Fout bij opslaan:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
        return false;
    }
}
