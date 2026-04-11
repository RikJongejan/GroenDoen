// ============================================================
//  GROEN & GEWOON DOEN — js/utils.js
//  Gedeelde constanten en hulpfuncties
// ============================================================

const STATUS_BADGE = {
    'In afwachting':  'badge-yellow',
    'Geaccepteerd':   'badge-green',
    'Afgewezen':      'badge-red',
    'Nieuw':          'badge-blue',
    'In behandeling': 'badge-blue',
    'Ingepland':      'badge-blue',
    'Wachtend':       'badge-yellow',
    'Klaar':          'badge-green',
    'Geannuleerd':    'badge-red',
    'Akkoord':        'badge-green',
    'Niet akkoord':   'badge-red'
};

function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    const target = document.getElementById(id);
    if (target) { target.style.display = 'block'; target.classList.add('active'); }

    document.querySelectorAll('.forms-nav button[id^="tab-"]').forEach(b => b.classList.remove('tab-active'));
    const tab = document.getElementById('tab-' + id);
    if (tab) tab.classList.add('tab-active');

    document.querySelectorAll('nav ul button[id^="nav-"]').forEach(b => b.classList.remove('nav-active'));
    const nav = document.getElementById('nav-' + id);
    if (nav) nav.classList.add('nav-active');
}

function logoutAdmin() {
    if (confirm('Weet u zeker dat u wilt uitloggen?')) {
        window.location.href = 'index.html';
    }
}

function fmt(n)        { return Number(n).toFixed(2).replace('.', ','); }
function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }
function setVal(id, v) { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; }

function showToast(title, msg, type) {
    type = type || 'success';
    var duration = 4000;
    var icons = { success: '✅', error: '❌', warning: '⚠️' };

    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.style.position = 'relative';
    toast.innerHTML =
        '<span class="toast-icon">' + (icons[type] || 'ℹ️') + '</span>' +
        '<div class="toast-body">' +
            '<div class="toast-title">' + title + '</div>' +
            (msg ? '<div class="toast-msg">' + msg + '</div>' : '') +
        '</div>' +
        '<button class="toast-close" onclick="this.closest(\'.toast\').remove()">&times;</button>' +
        '<div class="toast-progress" style="animation-duration:' + duration + 'ms"></div>';

    container.appendChild(toast);
    requestAnimationFrame(function() {
        requestAnimationFrame(function() { toast.classList.add('toast-show'); });
    });

    setTimeout(function() {
        toast.classList.add('toast-hide');
        toast.addEventListener('transitionend', function() { toast.remove(); }, { once: true });
    }, duration);
}
