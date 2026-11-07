const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
});

nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
    })
);

document.getElementById('leto').textContent = new Date().getFullYear();

// --- Izdelki (privzeti podatki so v izdelki.js, admin jih lahko spremeni) ---
const evro = n => n.toLocaleString('sl-SI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

naloziKategorije().then(kategorije => {
    // Naslovnica: kartice kategorij
    const mreza = document.getElementById('kategorije');
    if (mreza) {
        mreza.innerHTML = kategorije.map(k => {
            let od = '';
            if (k.izdelki.length) {
                const najcenejsi = k.izdelki.reduce((a, b) => (b.cena < a.cena ? b : a));
                od = `<p class="price">od ${evro(najcenejsi.cena)} €/${esc(najcenejsi.enota)}</p>`;
            }
            return `<a class="card${k.slika ? '' : ' card-plain'}" href="kategorija.html?k=${esc(k.id)}">
                ${k.slika ? `<img src="${esc(k.slika)}" alt="${esc(k.naslov)}" loading="lazy">` : ''}
                <div class="card-body">
                    <h3>${esc(k.naslov)}</h3>
                    <p>${esc(k.opis)}</p>
                    ${od}
                    <span class="more">Poglej izdelke &rarr;</span>
                </div>
            </a>`;
        }).join('');
    }

    // Stran kategorije: seznam izdelkov s cenami
    const seznam = document.getElementById('kat-seznam');
    if (seznam) {
        const id = new URLSearchParams(location.search).get('k');
        const kat = kategorije.find(k => k.id === id);
        if (!kat) {
            document.getElementById('kat-naslov').textContent = 'Kategorija ni najdena';
            seznam.innerHTML = '<p><a href="index.html#izdelki">Nazaj na vse izdelke</a></p>';
        } else {
            document.title = `${kat.naslov} | Ekspres prevozi Marko Prpar s.p.`;
            document.getElementById('kat-naslov').textContent = kat.naslov;
            document.getElementById('kat-opis').textContent = kat.opis;
            seznam.innerHTML = kat.izdelki.map(i => `
                <div class="price-row">
                    <div><h3>${esc(i.ime)}</h3>${i.opis ? `<p>${esc(i.opis)}</p>` : ''}</div>
                    <div class="price-value">${evro(i.cena)} €<span>/${esc(i.enota)}</span></div>
                </div>`).join('') || '<p>Trenutno ni izdelkov v tej kategoriji.</p>';
            document.getElementById('druge-kategorije').innerHTML =
                '<h2>Druge kategorije</h2>' +
                kategorije.filter(k => k.id !== kat.id)
                    .map(k => `<a href="kategorija.html?k=${esc(k.id)}">${esc(k.naslov)}</a>`).join('');
        }
    }
});

// Kontaktni obrazec (Web3Forms): pošlje sporočilo in odpre stran "Hvala"
const obrazec = document.getElementById('kontaktni-obrazec');
if (obrazec) {
    obrazec.addEventListener('submit', async e => {
        e.preventDefault();
        const stanje = document.getElementById('obrazec-stanje');
        const gumb = obrazec.querySelector('button[type=submit]');
        gumb.disabled = true;
        stanje.className = 'admin-msg';
        stanje.textContent = 'Pošiljam …';
        try {
            const r = await fetch(obrazec.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new FormData(obrazec)
            });
            const d = await r.json();
            if (r.ok && d.success) {
                location.href = 'hvala.html';
                return;
            }
            throw new Error(d.message || 'Napaka');
        } catch (err) {
            stanje.className = 'admin-msg error';
            stanje.textContent = 'Sporočila ni bilo mogoče poslati. Poskusite znova ali nas pokličite na 031 652 949.';
            gumb.disabled = false;
        }
    });
}
