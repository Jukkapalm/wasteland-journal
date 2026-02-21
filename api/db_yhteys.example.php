<?php

// Define luo vakion - sen arvoa ei voi muuttaa ajon aikana
// Vakioissa käytetään isoja kirjaimia
define("DB_HOST",    "localhost");
define("DB_NAME",    "tietokannan_nimi");
define("DB_USER",    "kayttaja");
define("DB_PASS",    "salasana");
define("JOURNAL_PIN", "0000");
define("DB_CHARSET", "utf8mb4");

// Luo ja palauttaa tietokantayhteyden
function tietokantaYhteys(): PDO {

// Piste (.) yhdistää merkkijonoja PHP:ssä
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

    // PDO asetukset taulukossa
    $asetukset = [

        // Kun tietokantavirhe tapahtuu, PHP heittää PDOException-poikkeuksen.
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

        // FETCH_ASSOC:
        // Kun haetaan tietoriviä tietokannasta, se tulee
        // assosiatiivisena taulukkona -> $rivi["sarakkeen_nimi"]
        // Vaihtoehto olisi FETCH_NUM -> $rivi[0], $rivi[1] jne.
        // Nimet ovat selvempiä kuin numerot, joten FETCH_ASSOC on parempi.
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

        // Käytetään tietokannan OMIA prepared statementteja
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    // Tämä rivi ottaa yhteyden tietokantaan.
    // Jos yhteys epäonnistuu (väärä salasana, palvelin ei vastaa jne.),
    // PHP heittää automaattisesti PDOException-poikkeuksen.
    return new PDO($dsn, DB_USER, DB_PASS, $asetukset);

    // Yhteyttä ei tarvitse sulkea erikseen.
    // PHP sulkee sen automaattisesti kun skripti on valmis.
}

?>