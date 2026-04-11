// ============================================================
//  GROEN & GEWOON DOEN — js/app.js
//  Initialisatie — wordt als laatste geladen
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = document.body.classList.contains('admin-body');

    if (isAdmin) {
        await Promise.all([ loadPackages(), loadOrders(), loadRates() ]);
        showSection('orders');
    } else {
        initPopup();
        initPriceCalc();

        await Promise.all([ loadDiensten(), loadPackages(), loadRates() ]);

        const packageForm = document.getElementById('packageForm');
        const customForm  = document.getElementById('customForm');
        if (packageForm) packageForm.addEventListener('submit', handlePackageForm);
        if (customForm)  customForm.addEventListener('submit', handleCustomForm);

        showSection('standaard');
        renderCalendar();
        updateDateDisplay();

        // Herstel sessie als klant al eerder inlogde
        const opgeslagen = sessionStorage.getItem('klant');
        if (opgeslagen) {
            try {
                const user = JSON.parse(opgeslagen);
                if (user.role !== 'admin') onKlantIngelogd(user);
            } catch (e) {
                sessionStorage.removeItem('klant');
            }
        }
    }
});
