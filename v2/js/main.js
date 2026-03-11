// Globaalit muuttujat

// Resurssit
let virta = 0;
let polttoaine = 0;
let vesi = 0;
let jaahdytys = 0;
let lampotila = 18;
let ulkoLampotila = -12;

// Laitteiden tilat
let generaattoriPaalla = false;
let generaattoriKaynnistyy = false;
let jaahdytinPaalla = false;
let jaahdytinKaynnistyy = false;
let lammitinPaalla = false;
let lammitinKaynnistyy = false;
let jalostinPaalla = false;
let jalostinKaynnistyy = false;

// Sää
let sataa = false;

// Hätäkäynnistyksen cooldown - estetään spämmi
let hatakaynnistysCooldown = false;

// Hätävalaistus päällä
let hatavalaistus = false;

// Käynnistys - suoritetaan kun DOM latautunut
document.addEventListener("DOMContentLoaded", function () {
    kaynnistaSivu();
});

// Käynnistää kaiken järjestyksessä
function kaynnistaSivu() {

    // Arvotaan resurssit
    arvoResurssit();

    // Käynnistetään intro
    kaynnistaIntro();

    // Päivälaskuri
    paivitaPaivalaskuri();

    // Ulkolämpötila vaihtelee hitaasti
    kaynnistaUlkolampotila();

    // Sää vaihtuu satunnaisesti
    kaynnistaSaa();

    // Resurssien kulutus käyntiin
    kaynnistaResurssisilmukka();

    // Laitteiden kytkimet
    aktivoiLaitteet();

    // Päiväkirja
    haePaivakirjaMerkinnat();
    aktivoiTallennaBtn();
    aktivoiPinModal();

    // Glitch-efekti otsikkoon
    kaynnistaGlitch();

    // Satunnaiset järjestelmähälytykset
    kaynnistaSatunnaisHalytykset();

    // Hätäkäynnistys nappi
    aktivoiHatakaynnistys();
}

// Resurssien arvonta
function arvoResurssit() {

    // Virta 20-80%
    virta = Math.floor(Math.random() * 61) + 20;

    // Polttoaine 15-75%
    polttoaine = Math.floor(Math.random() * 61) + 15;

    // Vesi 10-80%
    vesi = Math.floor(Math.random() * 71) + 10;

    // Generaattorin lämpötila alkaa alhaisena
    jaahdytys = Math.floor(Math.random() * 20);

    // Säteilytaso arvotaan erikseen
    //arvoSateily();
}

// Intro - häivytetään ja tuodaan päänäkymä esiin
function kaynnistaIntro() {
    const intro = document.getElementById("intro");
    const mainContent = document.getElementById("main-content");
    const stickyNote = document.getElementById("sticky-note");

    // Intro
    setTimeout(() => {
        intro.classList.add("poistu");

        // Päänäkymä ja post-it tulee esiin intron jälkeen
        setTimeout(() => {
            mainContent.classList.add("nakyva");
            stickyNote.classList.add("nakyva");

            // Poistetaan intro kokonaan DOM:sta transition jälkeen
            setTimeout(() => intro.remove(), 1000);

            // Päivitetään barit heti kun näkymä tulee esiin
            paivitaKaikkiBarit();

        }, 600);
    }, 3200);
}

// Päivälaskuri
function paivitaPaivalaskuri() {
    const katastrofiPvm = new Date("2026-02-19");
    const nyt = new Date();
    const ero = nyt.getTime() - katastrofiPvm.getTime();
    const paivat = Math.max(0, Math.floor(ero / (1000 * 60 * 60 * 24)));

    const el = document.querySelector(".paiva");
    if (el) el.textContent = paivat + " Päivää";
}

// Palauttaa päivänumeron muissa funktioissa käytettäväksi
function getPaivat() {
    const katastrofiPvm = new Date("2026-02-19");
    const ero = new Date().getTime() - katastrofiPvm.getTime();
    return Math.max(0, Math.floor(ero / (1000 * 60 * 60 * 24)));
}

// Palauttaa nykyisen kellonajan muodossa HH:MM
function getKellonaika() {
    return new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" });
}

// ASCII progress barit
// Rakentaa barit annetulla prosentilla ja värillä
function paivitaAsciibar(barEl, pctEl, arvo, tyyppi) {
    if (!barEl || !pctEl) return;
    
    const yhteensa = 20;
    const taytetty = Math.round((arvo / 100) * yhteensa);
    const tyhja = yhteensa - taytetty;

    // Bar span-elementeistä jotta väri toimii
    barEl.innerHTML =
        `[<span class="fill">${'█'.repeat(taytetty)}</span>` +
        `<span class="empty">${'░'.repeat(tyhja)}</span>]`;

    // Asetetaan väriluokka barin täyttöasteelle
    barEl.className = `ascii-bar bar-${tyyppi}`;

    // Prosenttiluku
    pctEl.textContent = Math.round(arvo) + "%";
    pctEl.className = `ascii-pct pct-${tyyppi === 'hot' ? 'danger' : tyyppi}`;
}

// Määrittää barin tyypin arvon ja kynnysarvojen perusteella
function maaritaBarTyyppi(arvo, suunta) {
    if (suunta === "korkea") {
        // Korkea arvo = huono (generaattorin lämpötila)
        if (arvo >= 75) return "hot";
        if (arvo >= 50) return "warning";
        return "ok";
    }
    // Matala arvo = huono (virta, polttoaine, vesi)
    if (arvo <= 20) return "danger";
    if (arvo <= 40) return "warning";
    return "ok";
}

// Päivittää kaikki barit kerralla
function paivitaKaikkiBarit() {
    paivitaAsciibar(
        document.getElementById("power-bar"),
        document.getElementById("power-pct"),
        virta,
        maaritaBarTyyppi(virta, "matala")
    );
    paivitaAsciibar(
        document.getElementById("fuel-bar"),
        document.getElementById("fuel-pct"),
        polttoaine,
        maaritaBarTyyppi(polttoaine, "matala")
    );
    paivitaAsciibar(
        document.getElementById("water-bar"),
        document.getElementById("water-pct"),
        vesi,
        maaritaBarTyyppi(vesi, "matala")
    );
    paivitaAsciibar(
        document.getElementById("coolant-bar"),
        document.getElementById("coolant-pct"),
        jaahdytys,
        maaritaBarTyyppi(jaahdytys, "korkea")
    );

    // Säteilybar päivitetään erikseen koska sillä on oma logiikka
    paivitaSateilyBar();

    // Hätävalaistus tarkistus
    tarkistaHatavalaistus();
}

// Tapahtumaloki
function lisaaLokiMerkinta(teksti, tyyppi) {

    console.log("[LOKI] " + teksti);
}

const SATEILY_TASOT = [
    { arvo: "MATALA",   taytto: 20, badge: "badge-ok",      bar: "ok" },
    { arvo: "KOHONNUT", taytto: 55, badge: "badge-warning",  bar: "warning" },
    { arvo: "KORKEA",   taytto: 88, badge: "badge-danger",   bar: "danger" },
];
let sateilyTaso = SATEILY_TASOT[0];

function arvoSateily() {
    sateilyTaso = SATEILY_TASOT[Math.floor(Math.random() * SATEILY_TASOT.length)];
}

function paivitaSateilyBar() {
    const badge = document.getElementById("radiation-badge");
    const barEl = document.getElementById("radiation-bar");
    const pctEl = document.getElementById("radiation-pct");

    if (badge) {
        badge.textContent = sateilyTaso.arvo;
        badge.className = "status-badge" + sateilyTaso.badge;
    }
    paivitaAsciibar(barEl, pctEl, sateilyTaso.taytto, sateilyTaso.bar);
}

// Hätävalaistus - vaihdetaan punaiseksi kun akut vähissä
function tarkistaHatavalaistus() {
    const pitaisiOllaPaalla = virta <= 20 && virta > 0;

    if (pitaisiOllaPaalla && !hatavalaistus) {
        hatavalaistus = true;
        document.body.classList.add("emergency-light");
        lisaaLokiMerkinta("⚠ AKKUVIRTA KRIITTINEN — HÄTÄVALAISTUS AKTIVOITU", "danger");
    } else if (!pitaisiOllaPaalla && hatavalaistus) {
        hatavalaistus = false;
        document.body.classList.remove("emergency-light");
    }
}

// Ulkolämpötila
function kaynnistaUlkolampotila() {
    paivitaUlkolampotilaUI();

    setInterval(() => {
        const muutos = (Math.random() - 0.5) * 2;
        ulkoLampotila = Math.max(-30, Math.min(-2, ulkoLampotila + muutos));
        paivitaUlkolampotilaUI();
    }, 15000);
}

function paivitaUlkolampotilaUI() {
    const el = document.getElementById("outside-temp");
    if (!el) return;
    const pyoristetty = Math.round(ulkoLampotila);
    el.textContent = pyoristetty + "°C";
    el.style.color = ulkoLampotila < -20 ? "var(--blue)" : "var(--amber-bright)";
}

// Sää sataa / ei sada
/*function kaynnistaSaa() {
    sataa = Math.random() < 0.6;
    paivitaSaaUI();

    // Vaihtuu 2-4 min välein
    setInterval(() => {
        const vanhaSataa = sataa;
        sataa = Math.random() < 0.6;

        if (sataa !== vanhaSataa) {
            paivitaSaaUI();
            if (sataa) {
                lisaaLokiMerkinta("Sää muuttunut: LUMISADETTA — käynnistä lämmitin lumensulatukseen", "ok");
            } else {
                lisaaLokiMerkinta("Sää muuttunut: KUIVA — vesivarasto ei täyty", "warn");
            }
        }
    }, Math.random() * 30000 + 30000);
}*/
function kaynnistaSaa() {
    sataa = Math.random() < 0.6;
    paivitaSaaUI();

    function seuraavaMuutos() {
        setTimeout(() => {
            sataa = Math.random() < 0.6;
            paivitaSaaUI();

            if (sataa) {
                lisaaLokiMerkinta("Sää muuttunut: LUMISADETTA — käynnistä lämmitin lumensulatukseen", "ok");
            } else {
                lisaaLokiMerkinta("Sää muuttunut: KUIVA — vesivarasto ei täyty", "warn");
            }

            seuraavaMuutos();
        }, Math.random() * 30000 + 30000);
    }
    seuraavaMuutos();
}

function paivitaSaaUI() {
    const el = document.getElementById("weather-status");
    if (!el) return;
    if (sataa) {
        el.textContent = "[ LUMISADETTA ]";
        el.style.color = "var(--blue)";
    } else {
        el.textContent = "[ KUIVA ]";
        el.style.color = "var(--amber-bright)";
    }
}

// Resurssien kulutussilmukka
function kaynnistaResurssisilmukka() {
    setInterval(() => {
        let virtaMuutos = -0.3;
        let polttoaineMuutos = 0;
        let vesiMuutos = 0;
        let jaahdytinMuutos = 0;
        let lampotilaMuutos = 0;

        // Generaattori: lataa akkuja, kuluttaa polttoainetta
        if (generaattoriPaalla) {
            if (polttoaine <= 0) {
                sammutaLaite("generaattori", "Generaattori sammui — polttoaine loppui");
            } else if (jaahdytys >= 90) {
                sammutaLaite("generaattori", "VAROITUS: Generaattori ylikuumeni ja sammui");
            } else {
                virtaMuutos += 1.5;
                polttoaineMuutos -= 0.8;
                jaahdytinMuutos += jaahdytinPaalla ? -1.0 : 0.6;
            }
        } else {
            jaahdytinMuutos -= 0.3;
        }

        // Jäähdytin: kuluttaa virtaa ja vettä, laskee generaattorin lämpöä
        if (jaahdytinPaalla) {
            if (vesi <= 0) {
                sammutaLaite("jaahdytin", "Jäähdytin sammui — vesivarasto tyhjä");
            } else {
                virtaMuutos -= 0.3;
                vesiMuutos -= 0.4;
            }
        }

        // Lämmitin: kuluttaa virtaa, kulutus riippuu ulkolämpötilasta
        if (lammitinPaalla) {
            const ulkoVaikutus = Math.abs(ulkoLampotila) / 30;
            virtaMuutos -= 0.3 + ulkoVaikutus * 0.4;
            lampotilaMuutos = 0.15;
        } else {
            lampotilaMuutos = (ulkoLampotila - lampotila) * 0.01;
        }

        // Jalostus: kuluttaa virtaa, tuottaa polttoainetta
        if (jalostinPaalla) {
            if (virta <= 5) {
                sammutaLaite("jalostin", "Jalostus sammui — liian vähän virtaa");
            } else {
                virtaMuutos -= 0.6;
                polttoaineMuutos += 0.9;
                if (sataa) vesiMuutos += 0.1;
            }
        }

        // Uusi - lumi sulaa vain kun lämmitin päällä:
        if (sataa && lammitinPaalla) vesiMuutos += 0.4;

        // Päivitetään arvot
        virta = Math.min(100, Math.max(0, virta + virtaMuutos));
        polttoaine = Math.min(100, Math.max(0, polttoaine + polttoaineMuutos));
        vesi = Math.min(100, Math.max(0, vesi + vesiMuutos));
        jaahdytys = Math.min(100, Math.max(0, jaahdytys + jaahdytinMuutos));
        lampotila = Math.min(25,  Math.max(5, lampotila + lampotilaMuutos));

        // Virta loppu - kaikki sammuu
        if (virta === 0) sammutaKaikki();

        paivitaKaikkiBarit();
        paivitaLampotilaUI();
        paivitaVirransaastotila();
        paivitaHuurtuminen();
    }, 1000);
}

// Laitteet
function sammutaLaite(laite, viesti) {
    if (laite === "generaattori") {
        generaattoriPaalla = false;
        paivitaLaiteUI("generator-status", false);
    } else if (laite === "jaahdytin") {
        jaahdytinPaalla = false;
        paivitaLaiteUI("coolant-status", false);
    } else if (laite === "jalostin") {
        jalostinPaalla = false;
        paivitaLaiteUI("refinery-status", false);
    }
    lisaaLokiMerkinta(viesti, "dange");
}

function sammutaKaikki() {
    if (generaattoriPaalla || jaahdytinPaalla || lammitinPaalla || jalostinPaalla) {
        generaattoriPaalla = false;
        jaahdytinPaalla = false;
        lammitinPaalla = false;
        jalostinPaalla = false;
        paivitaLaiteUI("generator-status", false);
        paivitaLaiteUI("coolant-status", false);
        paivitaLaiteUI("heater-status", false);
        paivitaLaiteUI("refinery-status", false);
        lisaaLokiMerkinta("KRIITTINEN: Akkuvirta loppui — kaikki laitteet sammuivat", "danger");
    }
}

function paivitaLaiteUI(elementtiId, paalla, kaynnistyy = false) {
    const el = document.getElementById(elementtiId);
    if (!el) return;

    if (kaynnistyy) {
        el.textContent = "[ KÄYNNISTYY... ]";
        el.className = "device-status starting";
    } else if (paalla) {
        el.textContent = "[ PÄÄLLÄ ]";
        el.className = "device-status on";
    } else {
        el.textContent = "[ POIS ]";
        el.className = "device-status off";
    }
}

function aktivoiLaitteet() {
    aktivoiLaiteKlikkaus(
        "generator-status",
        () => generaattoriPaalla,
        () => generaattoriKaynnistyy,
        (tila) => { generaattoriPaalla = tila; },
        (tila) => { generaattoriKaynnistyy = tila; },
        3000,
        "Generaattori käynnistetty",
        "Generaattori sammutettu",
        () => {
            if (polttoaine <= 0) {
                lisaaLokiMerkinta("Generaattori ei käynnisty — ei polttoainetta", "danger");
                return false;
            }
            if (jaahdytys >= 80) {
                lisaaLokiMerkinta("Generaattori ei käynnisty — liian kuuma", "danger");
                return false;
            }
            return true;
        }
    );
    aktivoiLaiteKlikkaus(
        "coolant-status",
        () => jaahdytinPaalla,
        () => jaahdytinKaynnistyy,
        (tila) => { jaahdytinPaalla = tila; },
        (tila) => { jaahdytinKaynnistyy = tila; },
        2000,
        "Jäähdytin käynnistetty",
        "Jäähdytin sammutettu",
        () => {
            if (vesi <= 0) {
                lisaaLokiMerkinta("Jäähdytin ei käynnisty — ei vettä", "danger");
                return false;
            }
            return true;
        }
    );
    aktivoiLaiteKlikkaus(
        "heater-status",
        () => lammitinPaalla,
        () => lammitinKaynnistyy,
        (tila) => { lammitinPaalla = tila; },
        (tila) => { lammitinKaynnistyy = tila; },
        2000,
        "Lämmitin käynnistetty",
        "Lämmitin sammutettu",
        null
    );
    aktivoiLaiteKlikkaus(
        "refinery-status",
        () => jalostinPaalla,
        () => jalostinKaynnistyy,
        (tila) => { jalostinPaalla = tila; },
        (tila) => { jalostinKaynnistyy = tila; },
        2500,
        "Polttoaineen jalostus käynnistetty",
        "Polttoaineen jalostus sammutettu",
        () => {
            if (virta <= 10) {
                lisaaLokiMerkinta("Jalostus ei käynnisty — liian vähän virtaa", "danger");
                return false;
            }
            return true;
        }
    );
}

// Yleinen laiteklikkauskäsittelijä
function aktivoiLaiteKlikkaus(id, getPaalla, getKaynnistyy, setPaalla, setKaynnistyy, viive, lokiPaalle, lokiPois, tarkistus) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", function () {
        if (virta === 0) return;

        if (!getPaalla() && !getKaynnistyy()) {
            if (tarkistus && !tarkistus()) return;

            setKaynnistyy(true);
            paivitaLaiteUI(id, false, true);

            setTimeout(() => {
                setKaynnistyy(false);
                setPaalla(true);
                paivitaLaiteUI(id, true);
                lisaaLokiMerkinta(lokiPaalle, "ok");
            }, viive);

        } else if (getPaalla()) {
            setPaalla(false);
            paivitaLaiteUI(id, false);
            lisaaLokiMerkinta(lokiPois, "warn");
        }
    });
}

// Lämpötila UI
function paivitaLampotilaUI() {
    const el = document.getElementById("temp-display");
    if (!el) return;

    const pyoristetty = Math.round(lampotila);
    el.textContent = `SISÄLÄMPÖTILA: ${pyoristetty > 0 ? '+' : ''}${pyoristetty}°C`;

    if (lampotila < 8) {
        el.className = "temp-display temp-critical";
    } else if (lampotila < 14) {
        el.className = "temp-display temp-cold";
    } else {
        el.className = "temp-display temp-ok";
    }
}

// Virransäästötila
function paivitaVirransaastotila() {
    const overlay = document.getElementById("power-saving-overlay");
    if (!overlay) return;

    if (virta === 0) {
        overlay.classList.add("aktiivinen");
    } else {
        overlay.classList.remove("aktiivinen");
    }
}

// Huurtuminen
function paivitaHuurtuminen() {
    const frost   = document.getElementById("frost-overlay");
    const warning = document.getElementById("cold-warning");
    if (!frost || !warning) return;

    frost.classList.remove("frost-light", "frost-medium", "frost-heavy");

    if (lampotila < 6) {
        frost.classList.add("frost-heavy");
        warning.classList.add("nakyva");
    } else if (lampotila < 8) {
        frost.classList.add("frost-medium");
        warning.classList.add("nakyva");
    } else if (lampotila < 11) {
        frost.classList.add("frost-light");
        warning.classList.remove("nakyva");
    } else {
        warning.classList.remove("nakyva");
    }
}

// Tapahtumaloki
function lisaaLokiMerkinta(teksti, tyyppi) {
    const loki = document.getElementById("event-log");
    if (!loki) return;

    const rivi = document.createElement("div");
    rivi.className = "log-entry" + (tyyppi ? " log-" + tyyppi : "");

    const aika = document.createElement("span");
    aika.className = "log-time";
    aika.textContent = `[PV ${getPaivat()} | ${getKellonaika()}]`;

    const viesti = document.createElement("span");
    viesti.className = "log-msg";
    viesti.textContent = " " + teksti;

    rivi.appendChild(aika);
    rivi.appendChild(viesti);

    // Uusin merkintä ylös
    loki.insertBefore(rivi, loki.firstChild);

    // Max 30 merkintää
    while (loki.children.length > 30) {
        loki.removeChild(loki.lastChild);
    }
}

// Otsikon glitch
function kaynnistaGlitch() {
    const title = document.getElementById("terminal-title");
    if (!title) return;

    setInterval(() => {
        if (Math.random() < 0.25) {
            title.classList.add("glitch");
            setTimeout(() => title.classList.remove("glitch"), 150);
        }
    }, 7000);
}

// Satunnaiset järjestelmähälytykset
const HALYTYKSET = [
    "⚠ VAROITUS: Polttoainepumppu epävakaa",
    "⚠ VAROITUS: Sensoriyhteys katkennut — tarkista laitteet",
    "⚠ VAROITUS: Ulko-oven tiiviste vaurioitunut",
    "⚠ VAROITUS: Radioaktiivinen pölykertymä — suodata ilma",
    "⚠ VAROITUS: Generaattorin värinätaso kohonnut",
    "⚠ VAROITUS: Vesivaraston pumppu ylikuumenee",
    "⚠ VAROITUS: Akkukenno C-7 heikentynyt",
    "⚠ VAROITUS: Tuuletuskanava tukossa — tarkista suodatin",
];

function kaynnistaSatunnaisHalytykset() {
    const alertEl = document.getElementById("system-alert");
    if (!alertEl) return;

    function ajastaSeuraaava() {
        const viive = Math.random() * 60000 + 30000;
        setTimeout(() => {
            naytaHalytys(alertEl);
            ajastaSeuraaava();
        }, viive);
    }
    ajastaSeuraaava();
}

function naytaHalytys(el) {
    const teksti = HALYTYKSET[Math.floor(Math.random() * HALYTYKSET.length)];
    el.textContent = teksti;
    el.classList.add("nakyva");
    lisaaLokiMerkinta(teksti, "warn");
    setTimeout(() => el.classList.remove("nakyva"), 4000);
}

// Hätäkäynnistys
function aktivoiHatakaynnistys() {
    const btn = document.getElementById("emergency-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
        if (hatakaynnistysCooldown) return;

        virta = 18;
        hatakaynnistysCooldown = true;
        btn.disabled = true;
        btn.textContent = "⚡ LADATAAN... (60s)";

        // Glitch-animaatio kun järjestelmä herää
        const main = document.getElementById("main-content");
        if (main) {
            main.classList.add("boot-glitch");
            setTimeout(() => main.classList.remove("boot-glitch"), 600);
        }

        lisaaLokiMerkinta("HÄTÄKÄYNNISTYS aktivoitu — varavirta käytössä", "danger");
        paivitaVirransaastotila();
        paivitaKaikkiBarit();

        // 60s cooldown
        setTimeout(() => {
            hatakaynnistysCooldown = false;
            btn.disabled = false;
            btn.textContent = "⚡ HÄTÄKÄYNNISTYS";
        }, 60000);
    });
}

// Päiväkirja
function haePaivakirjaMerkinnat() {
    const listaEl = document.getElementById("journal-entries");
    if (!listaEl) return;

    listaEl.innerHTML = `
        <div class="journal-entry">
            <div class="entry-meta">HAETAAN TIETOJA...</div>
        </div>`;

    fetch("api/api.php")
        .then(vastaus => {
            if (!vastaus.ok) throw new Error("Verkkovirhe: " + vastaus.status);
            return vastaus.json();
        })
        .then(merkinnat => piirraMerkinnat(merkinnat))
        .catch(virhe => {
            console.error("Merkintöjen haku epäonnistui:", virhe);
            listaEl.innerHTML = `
                <div class="journal-entry">
                    <div class="entry-meta">VIRHE</div>
                    <div class="entry-text">Tietokantayhteys katkesi. Tiedostot vioittuneet.</div>
                </div>`;
        });
}

function piirraMerkinnat(merkinnat) {
    const listaEl = document.getElementById("journal-entries");
    if (!listaEl) return;

    if (!merkinnat || merkinnat.length === 0) {
        listaEl.innerHTML = `
            <div class="journal-entry">
                <div class="entry-meta">EI MERKINTÖJÄ</div>
                <div class="entry-text">Kirjoita ensimmäinen merkintäsi alle.</div>
            </div>`;
        return;
    }

    listaEl.innerHTML = "";

    merkinnat.forEach(merkinta => {
        const pvm = new Date(merkinta.created_at);
        const klo = pvm.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" });
        const metaTeksti = `[ PV_${String(merkinta.day_number).padStart(3, '0')} | KLO ${klo} ]`;

        const merkintaDiv = document.createElement("div");
        merkintaDiv.className = "journal-entry";

        const metaDiv = document.createElement("div");
        metaDiv.className = "entry-meta";
        metaDiv.textContent = metaTeksti;

        const tekstiP = document.createElement("div");
        tekstiP.className = "entry-text";
        tekstiP.textContent = merkinta.merkinta;

        merkintaDiv.appendChild(metaDiv);
        merkintaDiv.appendChild(tekstiP);
        listaEl.appendChild(merkintaDiv);
    });

    listaEl.scrollTop = 0;
}

function lahetaMerkinta(tekstiSisalto, pin, dayNumber) {
    return fetch("api/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, merkinta: tekstiSisalto, day_number: dayNumber })
    })
    .then(vastaus => vastaus.json().then(data => ({ status: vastaus.status, data })));
}

// Tallenna nappi - avaan PIN modalin
function aktivoiTallennaBtn() {
    const btn = document.getElementById("add-entry-btn");
    const textarea = document.getElementById("new-entry-text");
    const modal = document.getElementById("pin-modal");
    if (!btn || !textarea || !modal) return;

    btn.addEventListener("click", function () {
        const teksti = textarea.value.trim();

        if (!teksti) {
            naytaKenttaViesti("Kirjoita ensin merkintä tekstikenttään.");
            return;
        }

        document.getElementById("pin-input").value = "";
        document.getElementById("pin-viesti").textContent = "";
        document.getElementById("pin-viesti").className = "pin-viesti";

        modal.classList.add("active");
        document.getElementById("pin-input").focus();
    });
}

function naytaKenttaViesti(teksti) {
    const textarea = document.getElementById("new-entry-text");
    let viesti = document.getElementById("kentta-viesti");

    if (!viesti) {
        viesti = document.createElement("div");
        viesti.id = "kentta-viesti";
        viesti.style.cssText = "font-size:0.7rem;color:var(--amber);margin-bottom:0.3rem;letter-spacing:0.06em;";
        textarea.parentNode.insertBefore(viesti, textarea);
    }

    viesti.textContent = teksti;
    setTimeout(() => { viesti.textContent = ""; }, 3000);
}

// PIN modal
function aktivoiPinModal() {
    const modal = document.getElementById("pin-modal");
    const suljeBtn = document.getElementById("pin-sulje");
    const vahvistaBtn = document.getElementById("pin-vahvista");
    const pinInput = document.getElementById("pin-input");
    const pinViesti = document.getElementById("pin-viesti");
    const textarea = document.getElementById("new-entry-text");
    if (!modal) return;

    suljeBtn.addEventListener("click", () => modal.classList.remove("active"));

    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
    });

    vahvistaBtn.addEventListener("click", lahetaModalista);
    pinInput.addEventListener("keydown", e => {
        if (e.key === "Enter") lahetaModalista();
    });

    function lahetaModalista() {
        const pin = pinInput.value.trim();
        const teksti = textarea.value.trim();
        const paivat = getPaivat();

        if (!pin) {
            naytaPinViesti("Anna PIN-koodi.", "varoitus");
            return;
        }

        vahvistaBtn.disabled = true;
        vahvistaBtn.textContent = "LÄHETETÄÄN...";

        lahetaMerkinta(teksti, pin, paivat)
            .then(({ status, data }) => {
                if (status === 201 && data.ok) {
                    modal.classList.remove("active");
                    textarea.value = "";
                    lisaaLokiMerkinta("Päiväkirjamerkintä tallennettu", "ok");
                    haePaivakirjaMerkinnat();
                } else if (data.koodi === "VAARA_PIN") {
                    naytaPinViesti("⚠ PÄÄSY EVÄTTY — VÄÄRÄ PIN", "virhe");
                    pinInput.value = "";
                    pinInput.focus();
                } else {
                    naytaPinViesti("Virhe: " + (data.virhe || "Tuntematon virhe"), "virhe");
                }
            })
            .catch(() => naytaPinViesti("Verkkovirhe. Tarkista yhteys.", "virhe"))
            .finally(() => {
                vahvistaBtn.disabled = false;
                vahvistaBtn.textContent = "VAHVISTA";
            });
    }

    function naytaPinViesti(teksti, tyyppi) {
        pinViesti.textContent = teksti;
        pinViesti.className = "pin-viesti pin-viesti--" + tyyppi;
    }
}