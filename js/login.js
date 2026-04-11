// ============================================================
//  GROEN & GEWOON DOEN — js/login.js
//  Inloggen en authenticatie
// ============================================================

async function getInfo() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('./data/users.json');
        if (!res.ok) throw new Error('Kon gebruikerslijst niet laden');
        const users = await res.json();

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log(user.username + ' ingelogd als: ' + user.role);
            const popup = document.querySelector('.popup');
            if (popup) popup.style.display = 'none';

            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                sessionStorage.setItem('klant', JSON.stringify(user));
                onKlantIngelogd(user);
            }
        } else {
            showToast('Inloggen mislukt', 'Onjuiste gebruikersnaam of wachtwoord.', 'error');
        }
    } catch (err) {
        console.error('Fout bij inloggen:', err);
        showToast('Technisch probleem', 'Er is een fout opgetreden bij het inloggen.', 'error');
    }
}

function onKlantIngelogd(user) {
    const loginBtn = document.getElementById('button');
    if (loginBtn) {
        loginBtn.textContent = '👤 ' + user.username;
        loginBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Uitloggen?')) {
                sessionStorage.removeItem('klant');
                window.location.reload();
            }
        };
    }

    const headerOrdersBtn = document.getElementById('btn-mijn-orders-header');
    const tabOrdersBtn    = document.getElementById('tab-mijn-orders');
    if (headerOrdersBtn) headerOrdersBtn.style.display = 'inline-block';
    if (tabOrdersBtn)    tabOrdersBtn.style.display    = '';

    showSection('mijn-orders');
    laadMijnOrders(user);
}

function initPopup() {
    const btn   = document.getElementById('button');
    const popup = document.querySelector('.popup');
    const close = document.querySelector('.close-btn');
    if (!btn || !popup) return;

    btn.addEventListener('click', e => { e.preventDefault(); popup.style.display = 'flex'; });
    if (close) close.addEventListener('click', () => { popup.style.display = 'none'; });
    popup.addEventListener('click', e => { if (e.target === popup) popup.style.display = 'none'; });
}
