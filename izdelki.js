// Seznam kategorij, izdelkov in cen. To je edino mesto, kjer se urejajo izdelki.
// Cena je v evrih; enota je npr. "kg" ali "kos".
const KATEGORIJE = [
    {
        id: "govedina",
        naslov: "Goveje meso",
        opis: "Zrezki, golaž, juhno meso in pečenke.",
        slika: "images/beef.jpg",
        izdelki: [
            { ime: "Goveji zrezek", cena: 18.00, enota: "kg" },
            { ime: "Goveji golaž", cena: 10.50, enota: "kg" },
            { ime: "Goveja pečenka", cena: 13.00, enota: "kg" },
            { ime: "Juhno meso", cena: 8.50, enota: "kg" },
            { ime: "Mleto goveje meso", cena: 9.50, enota: "kg" }
        ]
    },
    {
        id: "svinjina",
        naslov: "Svinjsko meso",
        opis: "Vrat, kotleti, ribice, pleče in mleto meso.",
        slika: "images/pork.jpg",
        izdelki: [
            { ime: "Svinjski vrat", cena: 8.50, enota: "kg" },
            { ime: "Svinjski kotlet", cena: 7.50, enota: "kg" },
            { ime: "Svinjska ribica", cena: 6.50, enota: "kg" },
            { ime: "Svinjsko pleče", cena: 6.50, enota: "kg" },
            { ime: "Svinjska rebra", cena: 6.00, enota: "kg" },
            { ime: "Mleto svinjsko meso", cena: 6.90, enota: "kg" }
        ]
    },
    {
        id: "piscanec",
        naslov: "Piščančje meso",
        opis: "Cele piščance, prsi, bedra in krilca.",
        slika: "images/chicken.jpg",
        izdelki: [
            { ime: "Cel piščanec", cena: 5.00, enota: "kg" },
            { ime: "Piščančje prsi", cena: 8.50, enota: "kg" },
            { ime: "Piščančja bedra", cena: 5.50, enota: "kg" },
            { ime: "Piščančja krilca", cena: 4.50, enota: "kg" }
        ]
    },
    {
        id: "jagnjetina",
        naslov: "Jagnječje meso",
        opis: "Hrbet, stegno in rebra. Po naročilu.",
        slika: "images/lamb.jpg",
        izdelki: [
            { ime: "Jagnječji hrbet", cena: 18.00, enota: "kg" },
            { ime: "Jagnječje stegno", cena: 14.00, enota: "kg" },
            { ime: "Jagnječja rebra", cena: 12.00, enota: "kg" }
        ]
    },
    {
        id: "domaci-izdelki",
        naslov: "Domače salame, klobase in špeh",
        opis: "Občasno na voljo. Vprašajte po trenutni ponudbi.",
        slika: "images/meat_products.jpg",
        izdelki: [
            { ime: "Domača salama", cena: 18.00, enota: "kg" },
            { ime: "Domače klobase", cena: 12.00, enota: "kg" },
            { ime: "Domači špeh", cena: 6.00, enota: "kg" }
        ]
    },
    {
        id: "ostala-hrana",
        naslov: "Ostala hrana",
        opis: "Fižol in druga hrana po dogovoru.",
        slika: null,
        izdelki: [
            { ime: "Fižol", cena: 4.00, enota: "kg" }
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
