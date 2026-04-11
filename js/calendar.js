// ============================================================
//  GROEN & GEWOON DOEN — js/calendar.js
//  Kalender — datumkiezer
// ============================================================

const MAANDEN = [
    'Januari','Februari','Maart','April','Mei','Juni',
    'Juli','Augustus','September','Oktober','November','December'
];
const DAGEN = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];

const busyDays = {
    '7-2025': [3, 10, 17, 24],
    '8-2025': [5, 12, 19, 26]
};

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();
let selectedDay  = null;

function renderCalendar() {
    const label = document.getElementById('monthLabel');
    if (!label) return;

    label.innerHTML = MAANDEN[currentMonth] + '<br><span class="month-year">' + currentYear + '</span>';

    const list        = document.getElementById('calendarDays');
    list.innerHTML    = '';
    const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
    const offset      = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today       = new Date();
    const busy        = busyDays[currentMonth + '-' + currentYear] || [];

    for (let i = 0; i < offset; i++) {
        const li = document.createElement('li');
        li.className = 'empty';
        list.appendChild(li);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const li      = document.createElement('li');
        const dayDate = new Date(currentYear, currentMonth, d);
        const isWeekend  = dayDate.getDay() === 0 || dayDate.getDay() === 6;
        const isBusy     = busy.includes(d);
        const isPast     = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isToday    = dayDate.toDateString() === today.toDateString();
        const isSelected = selectedDay &&
                           selectedDay.d === d &&
                           selectedDay.m === currentMonth &&
                           selectedDay.y === currentYear;

        if (isToday)    li.classList.add('today');
        if (isSelected) li.classList.add('selected');

        if (isBusy || isWeekend || isPast) {
            li.classList.add('busy');
        } else {
            li.classList.add('available');
            li.addEventListener('click', () => selectDay(d, currentMonth, currentYear, dayDate));
        }

        li.innerHTML = '<span>' + d + '</span>';
        list.appendChild(li);
    }
}

function selectDay(d, m, y, dateObj) {
    selectedDay = { d, m, y, dateObj };
    updateDateDisplay();
    renderCalendar();
}

function updateDateDisplay() {
    const display = document.getElementById('chosenDateDisplay');
    if (!display) return;

    if (selectedDay) {
        display.textContent = DAGEN[selectedDay.dateObj.getDay()] + ' ' +
                              selectedDay.d + ' ' +
                              MAANDEN[selectedDay.m] + ' ' +
                              selectedDay.y;
        display.classList.remove('error');
    } else {
        display.textContent = 'Geen datum geselecteerd';
        display.classList.remove('error');
    }
}

function highlightDateError() {
    const display = document.getElementById('chosenDateDisplay');
    if (display) {
        display.textContent = 'Kies een datum om door te gaan';
        display.classList.add('error');
        display.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function getSelectedDateString() {
    if (!selectedDay) return '';
    return DAGEN[selectedDay.dateObj.getDay()] + ' ' +
           selectedDay.d + ' ' +
           MAANDEN[selectedDay.m] + ' ' +
           selectedDay.y;
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    renderCalendar();
}
