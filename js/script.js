// Vaihdetaan aloitusnäyttö päänäkymään
setTimeout(() => {
    const intro = document.querySelector(".intro-container");
    const main = document.querySelector(".main-content");
    intro.classList.add("intro-fade-out");
    main.classList.add("main-fade-in");

    setTimeout(() => {
        intro.remove();
    }, 1000);
}, 4000);


// Funktiot jotka suoritetaan kun sivu avautunut
document.addEventListener("DOMContentLoaded", function () {
    sateilyArvo();
    alustaVirta();
    aktivoiIlmansuodatin();
    aktivoiLammitin();
    aktivoiJalostin();
});


// Globaalit muuttujat
let sateilytaso = "MATALA";
let generaattoriPaalla = false;
let generaattoriKaynnistyy = false;
let ilmansuodatinPaalla = false;
let ilmansuodatinKaynnistyy = false;
let lammitinPaalla = false;
let lammitinKaynnistyy = false;
let jalostinPaalla = false;
let jalostinKaynnistyy = false;
let virta = 0;
let polttoaine = 50;
let lampotila = 18;


// Arvotaan säteilynmäärä
function sateilyArvo() {

    const sateilyOpt = [
        {
            arvo: "MATALA",
            taytto: 20,
            badgeVari: "bg-radiation-green",
            barVari: "bg-radiation-green",
            tekstiVari: "",
            glitchLuokka: ""
        },
        {
            arvo: "KOHONNUT",
            taytto: 50,
            badgeVari: "bg-warning",
            barVari: "bg-radiation-green",
            tekstiVari: "text-dark",
            glitchLuokka: "glitch-medium"
        },
        {
            arvo: "KORKEA",
            taytto: 85,
            badgeVari: "bg-danger",
            barVari: "bg-danger",
            tekstiVari: "text-light",
            glitchLuokka: "glitch-high"
        }
    ];

    const randOpt = Math.floor(Math.random() * sateilyOpt.length);
    const tila = sateilyOpt[randOpt];
    sateilytaso = tila.arvo;

    const badge = document.getElementById("radiation-badge");
    const radBar = document.getElementById("radiation-bar");
    const dashboard = document.getElementById("dashboard");

    badge.textContent = tila.arvo;
    badge.className = "badge float-end " + tila.badgeVari + " " + tila.tekstiVari;

    radBar.style.width = tila.taytto + "%";
    radBar.className = "progress-bar " + tila.barVari;

    if (tila.glitchLuokka) {
        dashboard.classList.add(tila.glitchLuokka);
    }
    tarkistaGlitchTila();
}


// Poistetaan häiriö jos ilmansuodatin päällä ja lisätään no-glitch
// Ja määritellään glitchin taso säteilytason mukaan
function tarkistaGlitchTila() {
    const dashboard = document.getElementById("dashboard");

    if (ilmansuodatinPaalla) {
        dashboard.classList.remove("glitch-medium", "glitch-high");
        dashboard.classList.add("no-glitch");
    } else {
        dashboard.classList.remove("no-glitch");
    }

    if (sateilytaso === "KOHONNUT") {
        dashboard.classList.add("glitch-medium");
    } else if (sateilytaso === "KORKEA") {
        dashboard.classList.add("glitch-high");
    }
}


// Arvotaan virran määrä
function alustaVirta() {
    virta = Math.floor(Math.random() * 61) + 20;
    paivitaVirta();
    paivitaPolttoaine();
    kaynnistaVirranKulutus();
    aktivoiGeneraattoriKlikkaus();
}


// Päivitetään virran status ja power saving mode
function paivitaVirta() {
    const powerBar = document.getElementById("power-bar");
    const genStatus = document.getElementById("generator-status");
    const powerSavingOverlay = document.getElementById("power-saving-overlay");

    if (!powerBar || !genStatus) return;

    powerBar.style.width = virta + "%";

    if (virta < 25) {
        powerBar.className = "progress-bar bg-danger";
    } else if (virta <= 60) {
        powerBar.className = "progress-bar bg-warning";
    } else {
        powerBar.className = "progress-bar bg-radiation-green";
    }

    if (generaattoriPaalla) {
        genStatus.textContent = "[ PÄÄLLÄ ]";
        genStatus.className = "status-indicator on";
    } else {
        genStatus.textContent = "[ POIS ]";
        genStatus.className = "status-indicator off";
    }

    if (virta === 0) {
        if (powerSavingOverlay && !powerSavingOverlay.classList.contains("active")) {
            powerSavingOverlay.classList.add("active");
        }
    } else {
        if (powerSavingOverlay && powerSavingOverlay.classList.contains("active")) {
            powerSavingOverlay.classList.remove("active");
        }
    }
}


// Virran kulutuksen laskenta
function kaynnistaVirranKulutus() {
    setInterval(function () {

        if (generaattoriKaynnistyy) return;

        // Peruskulutus (terminaali aina päällä)
        let virtamuutos = -0.3;
        let polttoainemuutos = 0;
        let lampotilamuutos = 0;

        // Generaattori (tuottaa virtaa, kuluttaa polttoainetta)
        if (generaattoriPaalla) {
            virtamuutos += 1.2;
            polttoainemuutos -= 0.8;
        }

        // Ilmansuodatin (kuluttaa virtaa)
        if (ilmansuodatinPaalla) {
            virtamuutos -= 0.5;
        }

        // Lämmitin päällä ( kuluttaa virtaa, nostaa lämpötilaa)
        if (lammitinPaalla) {
            virtamuutos -= 0.4;
            lampotilamuutos = 0.2;
        } else {
            lampotilamuutos = -0.15;
        }

        // Jalostus (kuluttaa virtaa, tuottaa polttoainetta)
        if (jalostinPaalla) {
            virtamuutos -= 0.6;
            polttoainemuutos += 1.0;
        }

        virta += virtamuutos;
        polttoaine += polttoainemuutos;
        lampotila += lampotilamuutos;

        if (virta > 100) virta = 100;
        if (virta < 0) virta = 0;
        if (polttoaine < 0) polttoaine = 0;
        if (polttoaine > 100) polttoaine = 100;
        if (lampotila < 5) lampotila = 5;
        if (lampotila > 25) lampotila = 25;

        // Automaattiset sammutukset
        // Jos polttoaine loppuu, generaattori sammuu
        if (polttoaine === 0 && generaattoriPaalla) {
            generaattoriPaalla = false;
        }
        // Jos virta täynnä, generaattori sammuu
        if ( virta === 100 && generaattoriPaalla) {
            generaattoriPaalla = false;
        }

        paivitaVirta();
        paivitaPolttoaine();
        paivitaLampotila();
    }, 1000);
}


// Funktio lämpötilan päivitykseen
function paivitaLampotila() {
    const tempDisplay = document.querySelector(".temp-display");
    if (!tempDisplay) return;

    const pyoristetty = Math.round(lampotila);
    tempDisplay.textContent = `SISÄLÄMPÖTILA: ${pyoristetty > 0 ? '+' : ''}${pyoristetty}°C`;

    if (lampotila < 10) {
        tempDisplay.style.color = "#FF0000";
    } else if (lampotila < 15) {
        tempDisplay.style.color = "#FFA500";
    } else {
        tempDisplay.style.color = "#33FF00";
    }
}


// Polttoaineen barin värit
function paivitaPolttoaine() {
    const fuelBar = document.getElementById("fuel-bar");
    if (!fuelBar) return;
    fuelBar.style.width = polttoaine + "%";

    if (polttoaine <= 25) {
        fuelBar.className = "progress-bar bg-danger";
    } else if (polttoaine <= 60) {
        fuelBar.className = "progress-bar bg-warning";
    } else {
        fuelBar.className = "progress-bar bg-radiation-green";
    }
}


// Aktivoidaan generaattorin klikkaus
function aktivoiGeneraattoriKlikkaus() {
    const genStatus = document.getElementById("generator-status");
    if (!genStatus) return;

    genStatus.style.cursor = "pointer";

    genStatus.addEventListener("click", function () {

        if (!generaattoriPaalla && !generaattoriKaynnistyy) {
            generaattoriKaynnistyy = true;
            genStatus.textContent = "[ KÄYNNISTYY... ]";

            setTimeout(function() {
                generaattoriKaynnistyy = false;
                generaattoriPaalla = true;
                paivitaVirta();
            }, 3000);
        } else if (generaattoriPaalla) {
            generaattoriPaalla = false;
            paivitaVirta();
        }
    });
}


// Ilmansuodattimien klikkaus
function aktivoiIlmansuodatin() {
    const filterStatus = document.getElementById("air-filter-status");
    if (!filterStatus) return;

    filterStatus.style.cursor = "pointer";

    filterStatus.addEventListener("click", function () {
        if (!ilmansuodatinPaalla && !ilmansuodatinKaynnistyy) {
            ilmansuodatinKaynnistyy = true;
            filterStatus.textContent = "[ KÄYNNISTYY... ]";

            setTimeout(() => {
                ilmansuodatinKaynnistyy = false;
                ilmansuodatinPaalla = true;
                filterStatus.textContent = "[ PÄÄLLÄ ]";
                filterStatus.className = "status-indicator on";
                tarkistaGlitchTila();
            }, 2000);
        } else if (ilmansuodatinPaalla) {
            ilmansuodatinPaalla = false;
            filterStatus.textContent = "[ POIS ]";
            filterStatus.className = "status-indicator off";
            tarkistaGlitchTila();
        }
    });
}


// Lämmittimen klikkaus
function aktivoiLammitin() {
    const heater = document.getElementById("heater-status");
    if (!heater) return;

    heater.style.cursor = "pointer";

    heater.addEventListener("click", function () {
        if (!lammitinPaalla && !lammitinKaynnistyy) {
            lammitinKaynnistyy = true;
            heater.textContent = "[ KÄYNNISTYY... ]";

            setTimeout(() => {
                lammitinKaynnistyy = false;
                lammitinPaalla = true;
                heater.textContent = "[ PÄÄLLÄ ]";
                heater.className = "status-indicator on";
            }, 2000);
        } else if (lammitinPaalla) {
            lammitinPaalla = false;
            heater.textContent = "[ POIS ]";
            heater.className = "status-indicator off";
        }
    });
}


// Jalostus klikkaus
function aktivoiJalostin() {
    const refinery = document.getElementById("refinery-status");
    if (!refinery) return;

    refinery.style.cursor = "pointer";

    refinery.addEventListener("click", function () {
        if (!jalostinPaalla && !jalostinKaynnistyy) {
            jalostinKaynnistyy = true;
            refinery.textContent = "[ KÄYNNISTYY... ]";

            setTimeout(() => {
                jalostinKaynnistyy = false;
                jalostinPaalla = true;
                refinery.textContent = "[ PÄÄLLÄ ]";
                refinery.className = "status-indicator on";
            }, 2000);
        } else if (jalostinPaalla) {
            jalostinPaalla = false;
            refinery.textContent = "[ POIS ]";
            refinery.className = "status-indicator off";
        }
    });
}