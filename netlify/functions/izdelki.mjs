// Netlify funkcija: javno branje izdelkov in shranjevanje z admin geslom.
// Geslo se nastavi v Netlify (Site configuration > Environment variables > ADMIN_PASSWORD).
import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });

const hash = s => createHash("sha256").update(String(s)).digest();
const enaka = (a, b) => timingSafeEqual(hash(a), hash(b));

function preveri(req) {
    const geslo = process.env.ADMIN_PASSWORD;
    if (!geslo) return false;
    const prejeto = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
    return enaka(prejeto, geslo);
}

// Sprejme samo pričakovano obliko: { "<id-kategorije>": [ { ime, opis, cena, enota } ] }
function ocisti(vhod) {
    if (!vhod || typeof vhod !== "object" || Array.isArray(vhod)) return null;
    const izhod = {};
    for (const [id, seznam] of Object.entries(vhod)) {
        if (!/^[a-z0-9-]{1,40}$/.test(id) || !Array.isArray(seznam) || seznam.length > 200) return null;
        izhod[id] = [];
        for (const i of seznam) {
            const ime = String(i?.ime ?? "").trim().slice(0, 120);
            const opis = String(i?.opis ?? "").trim().slice(0, 300);
            const enota = String(i?.enota ?? "kg").trim().slice(0, 10) || "kg";
            const cena = Number(i?.cena);
            if (!ime || !Number.isFinite(cena) || cena < 0 || cena > 100000) return null;
            izhod[id].push({ ime, opis, cena: Math.round(cena * 100) / 100, enota });
        }
    }
    return izhod;
}

export default async (req) => {
    const store = getStore("izdelki");
    const url = new URL(req.url);

    if (req.method === "GET") {
        if (url.searchParams.has("auth")) {
            if (preveri(req)) return json({ ok: true });
            await new Promise(r => setTimeout(r, 1000)); // upočasni ugibanje gesla
            return json({ error: "Napačno geslo" }, 401);
        }
        return json((await store.get("podatki", { type: "json" })) || {});
    }

    if (req.method === "PUT") {
        if (!preveri(req)) {
            await new Promise(r => setTimeout(r, 1000));
            return json({ error: "Napačno geslo" }, 401);
        }
        let telo;
        try { telo = await req.json(); } catch { return json({ error: "Neveljaven zapis" }, 400); }
        const podatki = ocisti(telo);
        if (!podatki) return json({ error: "Neveljavni podatki (preverite imena in cene)" }, 400);
        await store.setJSON("podatki", podatki);
        return json({ ok: true });
    }

    return json({ error: "Metoda ni dovoljena" }, 405);
};

export const config = { path: "/api/izdelki" };
