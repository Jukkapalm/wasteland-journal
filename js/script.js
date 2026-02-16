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


// Arvotaan säteilynmäärä
function sateilyArvo() {

    const sateilyOpt = [
        {
            arvo: "MATALA",
            taytto: 20,
            badgeVari: "bg-radiation-green",
            barVari: "bg-radiation-green",
            tekstiVari: ""
        },
        {
            arvo: "KOHONNUT",
            taytto: 50,
            badgeVari: "bg-warning",
            barVari: "bg-radiation-green",
            tekstiVari: "text-dark"
        },
        {
            arvo: "KORKEA",
            taytto: 85,
            badgeVari: "bg-danger",
            barVari: "bg-danger",
            tekstiVari: "text-light"
        }
    ];

    const randOpt = Math.floor(Math.random() * sateilyOpt.length);
    const tila = sateilyOpt[randOpt];

    const badge = document.getElementById("radiation-badge");
    const radBar = document.getElementById("radiation-bar");

    badge.textContent = tila.arvo;
    badge.className = "badge float-end " + tila.badgeVari + " " + tila.tekstiVari;

    radBar.style.width = tila.taytto + "%";
    radBar.className = "progress-bar " + tila.barVari;
}


// Arvotaan virran määrä
let virta = 0;
let generaattoriPaalla = false;
function alustaVirta() {
    virta = Math.floor(Math.random() * 61) + 20;
    paivitaVirta();
    paivitaPolttoaine();
    kaynnistaVirranKulutus();
    aktivoiGeneraattoriKlikkaus();
}


// Paivitetään virran status
function paivitaVirta() {
    const powerBar = document.getElementById("power-bar");
    const genStatus = document.getElementById("generator-status");

    if (!powerBar || !genStatus) return;

    powerBar.style.width = virta + "%";
    //powerBar.textContent = virta + "%";

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
}


// Virran kulutuksen laskenta
let generaattoriKaynnistyy = false;
let polttoaine = 50;
function kaynnistaVirranKulutus() {
    setInterval(function () {

        if (generaattoriKaynnistyy) return;

        const mikaanEiPaalla = generaattoriPaalla || ilmansuodatinPaalla || lammitinPaalla || jalostinPaalla;

        if (mikaanEiPaalla) {
        
            if (generaattoriPaalla) {
                virta += 2;
                polttoaine -= 1;
                if (ilmansuodatinPaalla) virta -= 1;
            } else {
                virta -= 1;
                if (ilmansuodatinPaalla) virta -= 1;
            }

            if (lammitinPaalla) virta -= 1;

            if (jalostinPaalla) {
                polttoaine += 1;
                virta -= 1;
                if (polttoaine > 100) polttoaine = 100;
            }

            if (virta > 100) virta = 100;
            if (virta < 0) virta = 0;
            if (polttoaine < 0) polttoaine = 0;
            if (polttoaine > 100) polttoaine = 100;

            if (polttoaine === 0 || virta === 100) {
                generaattoriPaalla = false;
            }

            paivitaVirta();
            paivitaPolttoaine();
        }
    }, 1000);
}


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
let ilmansuodatinPaalla = false;
let ilmansuodatinKaynnistyy = false;
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
            }, 2000);
        } else if (ilmansuodatinPaalla) {
            ilmansuodatinPaalla = false;
            filterStatus.textContent = "[ POIS ]";
            filterStatus.className = "status-indicator off";
        }
    });
}


// Lämmittimen klikkaus
let lammitinPaalla = false;
let lammitinKaynnistyy = false;
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
let jalostinPaalla = false;
let jalostinKaynnistyy = false;
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