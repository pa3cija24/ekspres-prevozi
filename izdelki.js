// Seznam kategorij, izdelkov in cen. To je edino mesto, kjer se urejajo izdelki.
// Cena je v evrih; enota je npr. "kg" ali "kos".
const KATEGORIJE = [
    {
        id: "govedina",
        naslov: "Goveje meso",
        opis: "Zrezki, golaž, juhno meso in pečenke.",
        slika: "images/beef.jpg",
        izdelki: [
            { ime: "Goveji zrezek", opis: "Mehak zrezek za na žar ali ponev", cena: 18.00, enota: "kg" },
            { ime: "Goveji golaž", opis: "Kosi za golaž in enolončnice", cena: 10.50, enota: "kg" },
            { ime: "Goveja pečenka", opis: "Za počasno peko v pečici", cena: 13.00, enota: "kg" },
            { ime: "Juhno meso", opis: "Z in brez kosti", cena: 8.50, enota: "kg" },
            { ime: "Mleto goveje meso", opis: "Sveže mleto po naročilu", cena: 9.50, enota: "kg" }
        ]
    },
    {
        id: "svinjina",
        naslov: "Svinjsko meso",
        opis: "Vrat, kotleti, ribice, pleče in mleto meso.",
        slika: "images/pork.jpg",
        izdelki: [
            { ime: "Svinjski vrat", opis: "Za žar in peko", cena: 8.50, enota: "kg" },
            { ime: "Svinjski kotlet", opis: "S kostjo ali brez", cena: 7.50, enota: "kg" },
            { ime: "Svinjska ribica", opis: "Mehko meso za ocvrtje", cena: 6.50, enota: "kg" },
            { ime: "Svinjsko pleče", opis: "Za pečenko in golaž", cena: 6.50, enota: "kg" },
            { ime: "Svinjska rebra", opis: "Za peko in žar", cena: 6.00, enota: "kg" },
            { ime: "Mleto svinjsko meso", opis: "Sveže mleto po naročilu", cena: 6.90, enota: "kg" }
        ]
    },
    {
        id: "piscanec",
        naslov: "Piščančje meso",
        opis: "Cele piščance, prsi, bedra in krilca.",
        slika: "images/chicken.jpg",
        izdelki: [
            { ime: "Cel piščanec", opis: "Za peko ali kuhanje", cena: 5.00, enota: "kg" },
            { ime: "Piščančje prsi", opis: "Brez kosti in kože", cena: 8.50, enota: "kg" },
            { ime: "Piščančja bedra", opis: "Zgornja in spodnja", cena: 5.50, enota: "kg" },
            { ime: "Piščančja krilca", opis: "Za žar in pečico", cena: 4.50, enota: "kg" }
        ]
    },
    {
        id: "jagnjetina",
        naslov: "Jagnječje meso",
        opis: "Hrbet, stegno in rebra. Po naročilu.",
        slika: "images/lamb.jpg",
        izdelki: [
            { ime: "Jagnječji hrbet", opis: "Po naročilu", cena: 18.00, enota: "kg" },
            { ime: "Jagnječje stegno", opis: "Po naročilu", cena: 14.00, enota: "kg" },
            { ime: "Jagnječja rebra", opis: "Po naročilu", cena: 12.00, enota: "kg" }
        ]
    },
    {
        id: "domaci-izdelki",
        naslov: "Domače salame, klobase in špeh",
        opis: "Občasno na voljo. Vprašajte po trenutni ponudbi.",
        slika: "images/meat_products.jpg",
        izdelki: [
            { ime: "Domača salama", opis: "Občasno na voljo", cena: 18.00, enota: "kg" },
            { ime: "Domače klobase", opis: "Občasno na voljo", cena: 12.00, enota: "kg" },
            { ime: "Domači špeh", opis: "Občasno na voljo", cena: 6.00, enota: "kg" }
        ]
    },
    {
        id: "ostala-hrana",
        naslov: "Ostala hrana",
        opis: "Fižol in druga hrana po dogovoru.",
        slika: null,
        izdelki: [
            { ime: "Fižol", opis: "Po dogovoru", cena: 4.00, enota: "kg" }
        ]
    }
];

// Naloži izdelke, ki jih je admin shranil na strežniku. Če jih ni (ali strežnik ni dosegljiv,
// npr. pri lokalnem testiranju), se uporabi seznam zgoraj.
async function naloziKategorije() {
    try {
        const r = await fetch('/api/izdelki', { cache: 'no-store' });
        if (r.ok) {
            const shranjeno = await r.json();
            return KATEGORIJE.map(k => ({ ...k, izdelki: Array.isArray(shranjeno[k.id]) ? shranjeno[k.id] : k.izdelki }));
        }
    } catch (e) { /* uporabi privzeto */ }
    return KATEGORIJE;
}
