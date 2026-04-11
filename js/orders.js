// ============================================================
//  GROEN & GEWOON DOEN — js/orders.js
//  Admin — orders beheren
// ============================================================

async function loadOrders() {
    const tbody    = document.getElementById('ordersTableBody');
    const statsDiv = document.getElementById('orderStats');
    if (!tbody) return;

    try {
        const res    = await fetch('./data/orders.json');
        if (!res.ok) throw new Error('orders.json niet gevonden');
        const orders = await res.json();

        renderOrderStats(orders, statsDiv);
        renderOrdersTable(orders, tbody);

        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            const fresh = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(fresh, searchInput);
            fresh.addEventListener('input', function () {
                const q = this.value.toLowerCase();
                const filtered = orders.filter(o =>
                    String(o.id).toLowerCase().includes(q) ||
                    o.klant.toLowerCase().includes(q)
                );
                renderOrdersTable(filtered, tbody);
            });
        }
    } catch (err) {
        console.error('Fout bij laden orders:', err);
        tbody.innerHTML = '<tr><td colspan="6" class="load-error">Orders konden niet worden geladen.</td></tr>';
    }
}

function renderOrderStats(orders, container) {
    if (!container) return;

    const afwachting = orders.filter(o => o.status === 'In afwachting').length;
    const ingepland  = orders.filter(o => o.status === 'Ingepland').length;
    const afgerond   = orders.filter(o => o.status === 'Klaar').length;
    const omzet      = orders
        .filter(o => o.status === 'Klaar')
        .reduce((sum, o) => sum + (parseFloat(o.offerte) || 0), 0);

    container.innerHTML =
        statCard('In afwachting', afwachting,           afwachting > 0 ? 'warn' : 'ok', 'Wacht op beoordeling') +
        statCard('Ingepland',     ingepland,             'ok', 'Deze week') +
        statCard('Afgerond',      afgerond,              'ok', 'Deze maand') +
        statCard('Omzet',         '&euro;' + fmt(omzet), 'ok', 'Afgeronde orders');
}

function statCard(label, value, modifier, sub) {
    return '<div class="stat-card">' +
        '<div class="stat-label">'                + label + '</div>' +
        '<div class="stat-value">'                + value + '</div>' +
        '<div class="stat-sub ' + modifier + '">' + sub   + '</div>' +
    '</div>';
}

function renderOrdersTable(orders, tbody) {
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="td-empty">Geen orders gevonden.</td></tr>';
        return;
    }

    orders.forEach(o => {
        const badge  = STATUS_BADGE[o.status] || 'badge-blue';
        const acties = buildOrderActions(o);
        const tr     = document.createElement('tr');
        tr.style.cursor = 'pointer';

        tr.innerHTML =
            '<td><strong>#' + o.id + '</strong></td>' +
            '<td>' + o.klant + '</td>' +
            '<td class="td-muted">' + (o.datum || '–') + '</td>' +
            '<td>&euro;&nbsp;' + parseFloat(o.offerte || 0).toFixed(2).replace('.', ',') + '</td>' +
            '<td><span class="badge ' + badge + '">' + o.status + '</span></td>' +
            '<td class="td-btns" onclick="event.stopPropagation()">' + acties + '</td>';

        tr.addEventListener('click', () => openOrderModal(o));
        tbody.appendChild(tr);
    });
}

function buildOrderActions(order) {
    switch (order.status) {
        case 'In afwachting':
            return btn('solid',  'Accepteren', 'acceptOrder(' + order.id + ')') +
                   btn('danger', 'Afwijzen',   'rejectOrder('  + order.id + ')');
        case 'Geaccepteerd':
        case 'Nieuw':
        case 'In behandeling':
            return btn('warn',  'Inplannen', 'planOrder('     + order.id + ')') +
                   btn('ghost', 'Bewerken',  'editOrder('     + order.id + ')');
        case 'Ingepland':
        case 'Wachtend':
            return btn('solid', 'Afgerond',  'completeOrder(' + order.id + ')') +
                   btn('ghost', 'Bewerken',  'editOrder('     + order.id + ')');
        case 'Klaar':
            return btn('ghost',  'Factuur',   'invoiceOrder('  + order.id + ')') +
                   btn('danger', 'Verwijder', 'deleteOrder('   + order.id + ')');
        default:
            return btn('ghost',  'Bewerken',  'editOrder('     + order.id + ')');
    }
}

function btn(style, label, onclick) {
    return '<button class="btn btn-' + style + ' btn-sm" onclick="' + onclick + '">' + label + '</button>';
}

function openOrderModal(o) {
    const existing = document.getElementById('orderModal');
    if (existing) existing.remove();

    const badge  = STATUS_BADGE[o.status] || 'badge-blue';
    const acties = buildOrderActions(o);

    const modal = document.createElement('div');
    modal.id = 'orderModal';
    modal.className = 'order-modal-overlay';
    modal.innerHTML =
        '<div class="order-modal">' +
            '<div class="order-modal-head">' +
                '<div>' +
                    '<h3>Order #' + o.id + '</h3>' +
                    '<span class="badge ' + badge + '">' + o.status + '</span>' +
                '</div>' +
                '<button class="order-modal-close" onclick="closeOrderModal()">&times;</button>' +
            '</div>' +
            '<div class="order-modal-body">' +
                '<div class="order-modal-section">' +
                    '<h4>Klantgegevens</h4>' +
                    modalRow('Naam',     o.klant    || '–') +
                    modalRow('E-mail',   o.email    || '–') +
                    modalRow('Telefoon', o.telefoon || '–') +
                    modalRow('Adres',    o.adres    || '–') +
                '</div>' +
                '<div class="order-modal-section">' +
                    '<h4>Opdracht</h4>' +
                    modalRow('Datum',   o.datum   || '–') +
                    modalRow('Details', o.details || o.pakket || '–') +
                    modalRow('Offerte', '€ ' + parseFloat(o.offerte || 0).toFixed(2).replace('.', ',')) +
                '</div>' +
            '</div>' +
            '<div class="order-modal-foot">' +
                acties +
            '</div>' +
        '</div>';

    modal.addEventListener('click', e => { if (e.target === modal) closeOrderModal(); });
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
}

function modalRow(label, value) {
    return '<div class="modal-row">' +
        '<span class="modal-label">' + label + '</span>' +
        '<span class="modal-value">' + value + '</span>' +
    '</div>';
}

async function updateOrderStatus(id, newStatus) {
    try {
        const res = await fetch('/api/orders/' + id, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) loadOrders();
        else showToast('Fout', result.error, 'error');
    } catch (err) {
        console.error('Fout bij bijwerken status:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden.', 'error');
    }
}

function acceptOrder(id) {
    if (confirm('Order #' + id + ' accepteren?')) {
        closeOrderModal();
        updateOrderStatus(id, 'Geaccepteerd');
    }
}

function rejectOrder(id) {
    if (confirm('Order #' + id + ' afwijzen?')) {
        closeOrderModal();
        updateOrderStatus(id, 'Afgewezen');
    }
}

function planOrder(id)     { showToast('Nog te implementeren', 'Inplannen: order #' + id, 'warning'); }
function editOrder(id)     { showToast('Nog te implementeren', 'Bewerken: order #' + id, 'warning'); }
function completeOrder(id) { showToast('Nog te implementeren', 'Afgerond: order #' + id, 'warning'); }
function invoiceOrder(id)  { showToast('Nog te implementeren', 'Factuur: order #' + id, 'warning'); }
function deleteOrder(id)   { if (confirm('Order #' + id + ' verwijderen?')) showToast('Nog te implementeren', 'Verwijder order #' + id, 'warning'); }
