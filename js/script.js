// Funktio joka laskee kuluneet päivät joka on asetettu alkavaksi 1.1.2026
function updatePaivat() {

    // Hakee elementin ID perusteella
    const paivat = document.getElementById("days-since");

    // Asetettu aika mistä aloitetaan
    const startDate = new Date(2026, 0, 1);

    // Nykyhetken aika
    const now = new Date();

    // Laskee erotuksen nykyhetki - asetettu aika
    const aikaEro = now - startDate;

    // Kaava joka laskee eron pyöristettynä, 1000ms = 1s, 60s = 1min, 60min = 1h, 24h = 1vrk
    const paivatEro = Math.floor(aikaEro / (1000 * 60 * 60 * 24));

    // Päivittää tekstin HTML elementtiin
    paivat.textContent = `🕒 ${paivatEro} päivää katastrofista`;
}

let vari = "#39FF14";

function updateRadio() {
    const radio = document.getElementById("radio-signal");

    // Luodaan lista radio viesteistä
    const viestit = [
        { viesti: "Tuntematon signaali vastaanotettu" },
        { viesti: "Jos joku lukee tämän, pysykää poissa kaupungista" },
        { viesti: "Varoitus! Eteläinen sektori saastunut" },
        { viesti: "Pysykää turvassa. Älkää jääkö yksin ulos" },
        { viesti: "Juokaa vain käsiteltyä vettä, vedenpuhdistamot saastuneet" },
        { viesti: "Ryöstäjiä liikkeellä, pysykää piilossa" },
        { viesti: "Varoitus! Läntinen sektori saastunut" },
        { viesti: "Kaupunki vihamielinen, älkää liikkuko keskustassa" },
        { viesti: "Hälytys: Kaupungilla väijyviä ryhmiä, varokaa" },
        { viesti: "Vältä liikkumista etelä sektorilla, taloja sortunut" },
        { viesti: "Itäisellä sektorilla liikkuminen turvallista"},
        { viesti: "Pohjoisella sektorilla turvallista liikkua" }
    ];

    // Valitaan viestit listalta satunnainen viesti
    const randomIndex = Math.floor(Math.random() * viestit.length);
    const valittu = viestit[randomIndex];


    if ([
        "Tuntematon signaali vastaanotettu",
        "Itäisellä sektorilla liikkuminen turvallista",
        "Pohjoisella sektorilla turvallista liikkua"
    ].includes(valittu.viesti)) {
        vari = "#39FF14";
    } else if ([
        "Jos joku lukee tämän, pysykää poissa kaupungista",
        "Pysykää turvassa. Älkää jääkö yksin ulos",
        "Ryöstäjiä liikkeellä, pysykää piilossa",
        "Vältä liikkumista etelä sektorilla, taloja sortunut"
    ].includes(valittu.viesti)) {
        vari = "#FFD700";
    } else {
        vari = "#FF3B3B"
    }

    radio.style.color = vari;
    radio.textContent = `📻 ${valittu.viesti}`;

}

// Säteilyyn satunnaisia arvoja
function updateSateily() {
    const sateily = document.getElementById("radiation-level");

    const tasot = [
        { taso: "matala", warning: ""},
        { taso: "kohonnut", warning: " (ei suositella ulkona liikkumista!)" },
        { taso: "korkea", warning: " (säteily vaarallisella tasolla, älä liiku ulkona!)" }
    ];

    const randomIndex = Math.floor(Math.random() * tasot.length);
    const valitse = tasot[randomIndex];

    sateily.textContent = `☢️ Säteilyn taso: ${valitse.taso}${valitse.warning}`;

    if (valitse.taso === "matala") sateily.style.color = "#39FF14";
    else if (valitse.taso === "kohonnut") sateily.style.color = "#FFD700";
    else sateily.style.color = "#FF0000"
}

// Kuukausikohtaiset lämpötilat
const kkLampotilaKa = {
    0: { min: -30, max: -5 },
    1: { min: -25, max: 0 },
    2: { min: -15, max: 5 },
    3: { min: -10, max: 10 },
    4: { min: -5, max: 15 },
    5: { min: 10, max: 30 },
    6: { min: 15, max: 35 },
    7: { min: 10, max: 25 },
    8: { min: 5, max: 20 },
    9: { min: 0, max: 15 },
    10: { min: -10, max: 10 },
    11: { min: -25, max: -5 }
};

// Haetaan nykyinen kuukausi
function ulkoLampotila() {
    const now = new Date();
    const kuukausi = now.getMonth();
    const range = kkLampotilaKa[kuukausi];

    // Arvotaan lämpötila kuukauden min-max väliltä
    const lampotila = Math.random() * (range.max - range.min) + range.min;
    return lampotila.toFixed(1);
}

// Päivitetään UI:hin ulkolämpötila
function updateUlkoLampotila() {
    const ulkolampotila = document.getElementById("ulko-lampotila");
    const temp = ulkoLampotila();
    ulkolampotila.textContent = `❄️ Lämpötila ulkona: ${temp} °C`;
}

// Ladataan sivu ja käynnistetään funktiot
window.onload = () => {
    updatePaivat();
    updateRadio();
    updateSateily();
    updateUlkoLampotila();


    setInterval(updateRadio, 10000);
}