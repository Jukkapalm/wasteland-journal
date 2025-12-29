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

// Ladataan sivu ja käynnistetään funktio
window.onload = updatePaivat();