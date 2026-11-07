const API = '/api/izdelki';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let geslo = sessionStorage.getItem('admin-geslo') || '';
let kategorije = [];

function sporocilo(el, besedilo, napaka) {
    el.textContent = besedilo;
    el.className = 'admin-msg' + (napaka ? ' error' : ' ok');
}

async function preveriGeslo(g) {
    try {
        const r = await fetch(API + '?auth=1', { headers: { Authorization: 'Bearer ' + g }, cache: 'no-store' });
        if (r.ok) return { ok: true };
        if (r.status === 401) return { ok: false, napaka: 'Napačno geslo.' };
        return { ok: false, napaka: 'Strežnik ni dosegljiv. Admin deluje samo na objavljeni strani (Netlify).' };
    } catch (e) {
        return { ok: false, napaka: 'Strežnik ni dosegljiv. Admin deluje samo na objavljeni strani (Netlify).' };
    }
}

function narisi() {
    $('kategorije-admin').innerHTML = kategorije.map((k, ki) => `
        <section class="admin-cat" data-ki="${ki}">
            <h2>${esc(k.naslov)}</h2>
            <div class="admin-rows">
                ${k.izdelki.map((i, ii) => vrstica(ki, ii, i)).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-small" data-dodaj="${ki}">+ Dodaj izdelek</button>
        </section>`).join('');
}

function vrstica(ki, ii, i) {
    return `<div class="admin-row" data-ki="${ki}" data-ii="${ii}">
        <input class="f-ime" type="text" placeholder="Ime izdelka" value="${esc(i.ime)}" aria-label="Ime">
        <input class="f-opis" type="text" placeholder="Opis (neobvezno)" value="${esc(i.opis)}" aria-label="Opis">
        <input class="f-cena" type="number" min="0" step="0.01" placeholder="Cena" value="${esc(i.cena)}" aria-label="Cena v evrih">
        <input class="f-enota" type="text" placeholder="kg" value="${esc(i.enota)}" maxlength="10" aria-label="Enota">
        <button type="button" class="admin-del" data-brisi title="Odstrani izdelek" aria-label="Odstrani izdelek">&times;</button>
    </div>`;
}

// Prebere trenutne vrednosti iz obrazca v podatke
function preberi() {
    document.querySelectorAll('.admin-row').forEach(v => {
        const i = kategorije[v.dataset.ki].izdelki[v.dataset.ii];
        i.ime = v.querySelector('.f-ime').value;
        i.opis = v.querySelector('.f-opis').value;
        i.cena = v.querySelector('.f-cena').value;
        i.enota = v.querySelector('.f-enota').value || 'kg';
    });
}

async function odpriUrejanje() {
    kategorije = JSON.parse(JSON.stringify(await naloziKategorije()));
    $('prijava').hidden = true;
    $('urejanje').hidden = false;
    $('odjava').hidden = false;
    narisi();
}

$('prijava').addEventListener('submit', async e => {
    e.preventDefault();
    const g = $('geslo').value;
    sporocilo($('prijava-napaka'), 'Preverjam …');
    const r = await preveriGeslo(g);
    if (!r.ok) return sporocilo($('prijava-napaka'), r.napaka, true);
    geslo = g;
    sessionStorage.setItem('admin-geslo', g);
    odpriUrejanje();
});

$('odjava').addEventListener('click', () => {
    sessionStorage.removeItem('admin-geslo');
    location.reload();
});

$('kategorije-admin').addEventListener('click', e => {
    preberi();
    const dodaj = e.target.closest('[data-dodaj]');
    const brisi = e.target.closest('[data-brisi]');
    if (dodaj) {
        kategorije[dodaj.dataset.dodaj].izdelki.push({ ime: '', opis: '', cena: '', enota: 'kg' });
        narisi();
        const vrstice = document.querySelectorAll(`.admin-row[data-ki="${dodaj.dataset.dodaj}"]`);
        vrstice[vrstice.length - 1].querySelector('.f-ime').focus();
    } else if (brisi) {
        const v = brisi.closest('.admin-row');
        const ime = kategorije[v.dataset.ki].izdelki[v.dataset.ii].ime || 'ta izdelek';
        if (confirm(`Odstranim "${ime}"?`)) {
            kategorije[v.dataset.ki].izdelki.splice(v.dataset.ii, 1);
            narisi();
        }
    }
});

$('ponastavi').addEventListener('click', async () => {
    kategorije = JSON.parse(JSON.stringify(await naloziKategorije()));
    narisi();
    sporocilo($('stanje'), 'Spremembe razveljavljene.');
});

$('shrani').addEventListener('click', async () => {
    preberi();
    const podatki = {};
    for (const k of kategorije) {
        podatki[k.id] = [];
        for (const i of k.izdelki) {
            const cena = parseFloat(String(i.cena).replace(',', '.'));
            if (!i.ime.trim() || !Number.isFinite(cena) || cena < 0) {
                return sporocilo($('stanje'), `Preverite izdelek v "${k.naslov}": potrebno je ime in veljavna cena.`, true);
            }
            podatki[k.id].push({ ime: i.ime.trim(), opis: i.opis.trim(), cena, enota: i.enota.trim() || 'kg' });
        }
    }
    sporocilo($('stanje'), 'Shranjujem …');
    try {
        const r = await fetch(API, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + geslo },
            body: JSON.stringify(podatki)
        });
        if (r.ok) sporocilo($('stanje'), 'Shranjeno.');
        else if (r.status === 401) { sessionStorage.removeItem('admin-geslo'); sporocilo($('stanje'), 'Seja je potekla, prijavite se znova.', true); }
        else sporocilo($('stanje'), (await r.json().catch(() => ({}))).error || 'Napaka pri shranjevanju.', true);
    } catch (e) {
        sporocilo($('stanje'), 'Strežnik ni dosegljiv.', true);
    }
});

// Samodejna prijava, če je geslo že v tej seji
if (geslo) {
    preveriGeslo(geslo).then(r => { if (r.ok) odpriUrejanje(); else sessionStorage.removeItem('admin-geslo'); });
}
