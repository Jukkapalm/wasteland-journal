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
// Tämä tapahtuma käynnistyy kun sivu on latautunut kokonaan
// Jos elementtejä yritettäisiin hakea aikaisemmin niin niitä ei ehkä olisi koska eivät ole vielä DOM:ssa
document.addEventListener("DOMContentLoaded", function () {

    // Päivälaskuri
    const katastrofista = new Date("2026-02-19");

    function updateDays() {
        const currentDate = new Date();

        // Laskee päivien erotuksen
        const timeDifference = currentDate.getTime() - katastrofista.getTime();
        const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        const daysElement = document.querySelector(".paiva");

        if (daysElement) {
            const displayDays = daysPassed > 0 ? daysPassed : 0;
            daysElement.textContent = `${displayDays} Päivää`;
        }
    }
    updateDays();

    // Käynnistetään järjestelmät
    sateilyArvo();
    alustaVirta();
    aktivoiIlmansuodatin();
    aktivoiLammitin();
    aktivoiJalostin();

    // Käynnistetään päiväkirjan toiminnot
    haePaivakirjaMerkinnat();
    aktivoiTallennaBtn();
    aktivoiPinModal();
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


// Hakee päiväkirja merkinnät palvelimelta GET pyynnöllä
function haePaivakirjaMerkinnat() {
    const listaEl = document.getElementById("journal-entries");

    // Näytetään latausviesti odottaessa
    listaEl.innerHTML = `
        <div class="journal-entry mb-3">
            <div class="entry-meta">HAETAAN TIETOJA...</div>
        </div>`;

        // Tekee HTTP GET pyynnön
        // Ilman lisäasetuksia oletuksena aina GET pyyntö
        fetch("api/api.php")

            .then(vastaus => {
                if(!vastaus.ok) {
                    throw new Error("Verkkovirhe: " + vastaus.status);
                }
                return vastaus.json();
            })

            .then(merkinnat => {
                piirraMerkinnat(merkinnat);
            })

            // Virheet ketjussa palautuvat tänne
            .catch(virhe => {
                console.error("Merkintöjen haku epäonnistui:", virhe);
                listaEl.innerHTML = `
                    <div class="journal-entry mb-3">
                        <div class="entry-meta">VIRHE</div>
                        <p>Tietokantayhteys katkesi. Tiedostot vioittuneet.</p>
                    </div>`;
            });
}


// Rakentaa merkinnät HTML elementiksi
function piirraMerkinnat(merkinnat) {
    const listaEl = document.getElementById("journal-entries");

    // Jos tietokannassa ei ole yhtään merkintää
    if (!merkinnat || merkinnat.length === 0) {
        listaEl.innerHTML = `
            <div class="journal-entry mb-3">
                <div class="entry-meta">EI MERKINTÖJÄ</div>
                <p>Kirjoita ensimmäinen merkintäsi alle.</p>
            </div>`;
        return;
    }

    // Tyhjennetään lista ennen uudelleentäyttämistä
    listaEl.innerHTML = "";

    // forEach käy kaikki merkinnät läpi yksi kerrallaan
    merkinnat.forEach(merkinta => {

        // Muotoillaan tietokannan aika leima (tietokannan aikaleima on muodossa "yyyy-mm-dd xx:xx:xx")
        const pvm = new Date(merkinta.created_at);
        const klo = pvm.toLocaleTimeString("fi-FI", {
            hour:   "2-digit",
            minute: "2-digit"
        });
        const metaTeksti = `Päivä ${merkinta.day_number} - KLO ${klo}`;

        // Luodaan uusi div Elementti päiväkirja merkinnöille ja lisätään CSS luokka
        const merkintaDiv = document.createElement("div");
        merkintaDiv.className = "journal-entry mb-3";

        const metaDiv = document.createElement("div");
        metaDiv.className   = "entry-meta";
        metaDiv.textContent = metaTeksti;

        const tekstiP = document.createElement("p");
        tekstiP.textContent = merkinta.merkinta;

        merkintaDiv.appendChild(metaDiv);
        merkintaDiv.appendChild(tekstiP);

        // Lisätään valmis merkintä elementti listaan
        listaEl.appendChild(merkintaDiv);
    });

    // Vieritetään lista alkuun
    listaEl.scrollTop = 0;
}


// Lähettää uuden merkinnän palvelimelle POST pyynnöllä
function lahetaMerkinta(tekstiSisalto, pin, dayNumber) {
    return fetch("api/api.php", {

        // Kertoo että pyyntö on POST
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({pin: pin, merkinta: tekstiSisalto, day_number: dayNumber})
    })
    .then(vastaus => vastaus.json().then(data => ({ status: vastaus.status, data })));
}


// Lisää tallenna napille toiminnon, joka avaa pin modaalin
function aktivoiTallennaBtn() {
    const btn = document.getElementById("add-entry-btn");
    const textarea = document.getElementById("new-entry-text");
    const modal = document.getElementById("pin-modal");

    if (!btn || !textarea || !modal) return;

    btn.addEventListener("click", function () {

        // Trim poistaa tyhjät välilyönnit alusta ja lopusta
        const teksti = textarea.value.trim();

        // Tarkistetaan ettei teksti kenttä ole tyhjä
        if (!teksti) {
            naytaKenttaViesti("Kirjoita ensin merkintä tekstikenttään.", "varoitus");
            return; // Ei avata modalia tyhjällä tekstillä
        }

        // Tyhjennetään edellinen pin syöte ja mahdolliset virhe ilmoitukset
        document.getElementById("pin-input").value    = "";
        document.getElementById("pin-viesti").textContent = "";
        document.getElementById("pin-viesti").className   = "pin-viesti";

        // Avataan modal lisäämällä "active" CSS luokka
        modal.classList.add("active");
        document.getElementById("pin-input").focus(); // Viedään fokus PIN-kenttään
    });
}


// Hallitsee koko pin modalin toimintalogiikan
// Myös Entr näppäimen tuki
// PIN:n lähetys palvelimelle ja vastauksen käsittely
function aktivoiPinModal() {
    const modal       = document.getElementById("pin-modal");
    const suljeBtn    = document.getElementById("pin-sulje");
    const vahvistaBtn = document.getElementById("pin-vahvista");
    const pinInput    = document.getElementById("pin-input");
    const pinViesti   = document.getElementById("pin-viesti");
    const textarea    = document.getElementById("new-entry-text");

    if (!modal) return;

    // Sulje napilla
    suljeBtn.addEventListener("click", function () {
        modal.classList.remove("active"); // Poistetaan "active" -> modal piiloutuu
    });

    // Sulje klikkaamalla taustan päälle
    // e.target = elementti jota klikattiin
    // modal itse = tumma tausta-overlay
    // Jos klikattiin taustan päälle (ei modalin sisältölaatikkoa), suljetaan
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Vahvista napilla
    vahvistaBtn.addEventListener("click", function () {
        lahetaModalista();
    });

    // Enter-näppäimellä
    pinInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") lahetaModalista();
    });

    // Sisäinen funktio: kerää tiedot ja lähettää
    // Tämä funktio on "sulkeuman" (closure) sisällä:
    // se pääsee käsiksi ylemmän funktion muuttujiin (modal, textarea jne.)
    function lahetaModalista() {
        const pin    = pinInput.value.trim();
        const teksti = textarea.value.trim();

        // Haetaan päiväluku näytöltä (parseInt muuntaa "0 Päivää" -> 0)
        const paivaEl   = document.querySelector(".paiva");
        const dayNumber = paivaEl ? parseInt(paivaEl.textContent) || 0 : 0;

        if (!pin) {
            naytaPinViesti("Anna PIN-koodi.", "varoitus");
            return;
        }

        // Estetään useampi samanaikainen lähetys
        // (käyttäjä ei voi klikata "Vahvista" uudelleen ennen kuin vastaus saapuu)
        vahvistaBtn.disabled    = true;
        vahvistaBtn.textContent = "LÄHETETÄÄN...";

        // Kutsutaan lahetaMerkinta-funktiota ja ketjutetaan vastauksen käsittely
        lahetaMerkinta(teksti, pin, dayNumber)

            .then(({ status, data }) => {

                if (status === 201 && data.ok) {
                    modal.classList.remove("active"); // Suljetaan modal
                    textarea.value = "";             // Tyhjennetään tekstikenttä
                    haePaivakirjaMerkinnat();        // Päivitetään lista (uusi GET-pyyntö)

                } else if (data.koodi === "VAARA_PIN") {

                    // Väärä PIN
                    // PHP palautti { virhe: "PÄÄSY EVÄTTY", koodi: "VAARA_PIN" }
                    naytaPinViesti("⚠ PÄÄSY EVÄTTY - VÄÄRÄ PIN", "virhe");
                    pinInput.value = ""; // Tyhjennetään PIN-kenttä uutta yritystä varten
                    pinInput.focus();

                } else {

                    // Jokin muu palvelinvirhe
                    naytaPinViesti("Virhe: " + (data.virhe || "Tuntematon virhe"), "virhe");
                }
            })

            // .catch - verkkovirhe (palvelin ei vastaa, internet poikki jne.)
            .catch(() => {
                naytaPinViesti("Verkkovirhe. Tarkista yhteys.", "virhe");
            })

            // .finally suoritetaan AINA riippumatta onnistumisesta tai virheestä.
            // Palautetaan nappi käyttöön joka tapauksessa.
            .finally(() => {
                vahvistaBtn.disabled    = false;
                vahvistaBtn.textContent = "VAHVISTA";
            });
    }

    // Näyttää viestin PIN-modalin sisällä
    function naytaPinViesti(teksti, tyyppi) {
        pinViesti.textContent = teksti;

        // Asetetaan CSS-luokka joka määrittää värin (virhe=punainen, varoitus=oranssi)
        pinViesti.className   = "pin-viesti pin-viesti--" + tyyppi;
    }
}


// Näyttää väliaikaisen viestin tekstikentän vieressä
function naytaKenttaViesti(teksti, tyyppi) {
    const textarea = document.getElementById("new-entry-text");
    let viesti = document.getElementById("kentta-viesti");

    // Luodaan viesti-elementti jos sitä ei vielä ole
    if (!viesti) {
        viesti = document.createElement("div");
        viesti.id = "kentta-viesti";

        // insertBefore lisää elementin ennen tekstikenttää
        textarea.parentNode.insertBefore(viesti, textarea);
    }

    viesti.textContent = teksti;
    viesti.className   = "pin-viesti pin-viesti--" + tyyppi;

    // setTimeout: poistetaan viesti automaattisesti 3 sekunnin jälkeen
    setTimeout(() => { viesti.textContent = ""; }, 3000);
}


// Arvotaan säteilynmäärä ja asetetaan visuaaliset efektit
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
    tarkistaSateilyVaroitus();
}


// Tarkistaa pitääkö säteilyvaroitus näyttää
function tarkistaSateilyVaroitus() {
    const radWarning = document.getElementById("radiation-warning");

    if (radWarning) {
        // Näytetään varoitus jos säteily on korkea ja ilmansuodatin ei ole päällä
        if(sateilytaso === "KORKEA" && !ilmansuodatinPaalla) {
            radWarning.classList.add("show");
        } else {
            radWarning.classList.remove("show");
        }
    }
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
    tarkistaSateilyVaroitus();
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

        if (virta === 0) {
            if (ilmansuodatinPaalla) {
                ilmansuodatinPaalla = false;
                const filterStatus = document.getElementById("air-filter-status");
                if (filterStatus) {
                    filterStatus.textContent = "[ POIS ]";
                    filterStatus.className = "status-indicator off";
                    tarkistaGlitchTila();
                }
            }
            if (lammitinPaalla) {
                lammitinPaalla = false;
                const heaterStatus = document.getElementById("heater-status");
                if (heaterStatus) {
                    heaterStatus.textContent = "[ POIS ]";
                    heaterStatus.className = "status-indicator off";
                }
            }
            if (jalostinPaalla) {
                jalostinPaalla = false;
                const refineryStatus = document.getElementById("refinery-status");
                if (refineryStatus) {
                    refineryStatus.textContent = "[ POIS ]";
                    refineryStatus.className = "status-indicator off";
                }
            }
        }

        paivitaVirta();
        paivitaPolttoaine();
        paivitaLampotila();
    }, 1000);
}


// Funktio lämpötilan päivitykseen
function paivitaLampotila() {
    const tempDisplay = document.querySelector(".temp-display");
    const frostOverlay = document.getElementById("frost-overlay");
    const coldWarning = document.getElementById("cold-warning");

    if (!tempDisplay) return;

    const pyoristetty = Math.round(lampotila);
    tempDisplay.textContent = `SISÄLÄMPÖTILA: ${pyoristetty > 0 ? '+' : ''}${pyoristetty}°C`;

    // Värikoodaus lämpötilalle
    if (lampotila < 10) {
        tempDisplay.style.color = "#FF0000";
    } else if (lampotila < 15) {
        tempDisplay.style.color = "#FFA500";
    } else {
        tempDisplay.style.color = "#33FF00";
    }

    // Huurteen ja varoituksen hallinta
    if (frostOverlay && coldWarning) {

        // Poistetaan kaikki huurre luokat ensin
        frostOverlay.classList.remove("frost-light", "frost-medium", "frost-heavy");

        if (lampotila < 8 && lampotila >= 7) {
            frostOverlay.classList.add("frost-light");
            coldWarning.classList.add("show");
        } else if (lampotila < 7 && lampotila >= 6) {
            frostOverlay.classList.add("frost-medium");
            coldWarning.classList.add("show");
        } else if (lampotila < 6) {
            frostOverlay.classList.add("frost-heavy");
            coldWarning.classList.add("show");
        } else {
            coldWarning.classList.remove("show");
        }
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