<?php

// JavaScript lähettää pyyntöjä tänne, ja PHP hoitaa tietokantaoperaatiot

// Sisällyttää tämän tiedoston vain kerran
require_once "db_yhteys.php";

// Kertoo selaimelle että vastaus on JSON muodossa
header("Content-Type: application/json; charset=utf-8");

// Estetään selainta tallentamasta API-vastauksia välimuistiin
header("Cache-Control: no-cache, no-store, must-revalidate");

$metodi = $_SERVER["REQUEST_METHOD"];

// Tarkistetaan mikä metodi kyseessä ja kutsutaan funktiota sen mukaan
// Että jos kyseessä GET niin selain haluaa lukea merkintöjä
// Jos POST niin selain haluaa tallentaa merkinnän
if ($metodi === "GET") {
    haeMerkinnat();
} else if ($metodi === "POST") {
    tallennaMerkinta();
} else {
    // Tuntematon metodi palautetaan 405
    http_response_code(405);
    echo json_encode(["virhe" => "Metodi ei ole sallittu"]);
}


// Hakee kaikki merkinnät tietokannasta
function haeMerkinnat(): void {

    // Try Catch:ssa on koodi joka saattaa epäonnistua
    // Estää ohjelman kaatumisen
    try {

        // Kutsutaan db_yhteys.php tiedostossa määriteltyä funktiota
        $yhteys = tietokantaYhteys();

        // Tässä GET pyynnössä ei ole käyttäjän syöttämiä arvoja tai tekstiä
        $lause = $yhteys->prepare("SELECT id, day_number, created_at, merkinta FROM journal_entries ORDER BY created_at DESC");

        // Execute suorittaa valmistelun kyselyn tietokantaan
        $lause->execute();

        // fetchAll hakee kaikki merkinnät taulukkoon kerralla. fetch() hakisi yhden rivin kerrallaan
        $merkinnat = $lause->fetchAll();

        foreach($merkinnat as &$rivi) {
            $rivi["merkinta"] = htmlspecialchars($rivi["merkinta"], ENT_QUOTES, "UTF-8");
        }

        // JSON encode muuntaa PHP taulukon JSON merkkijonoksi
        echo json_encode($merkinnat);

        // Tietokantavirhe, yhteys katkesi, kysely epäonnistui
    } catch (PDOException $e) {

        // Lokitetaan virhe palvelimen lokiin
        error_log("Tietokantavirhe haeMerkinnat(): " . $e->getMessage());

        // Käyttäjälle kerrotaan yleinen virheilmoitus
        http_response_code(500);
        echo json_encode(["virhe" => "Tietokantavirhe"]);
    }
}


// Tallenetaan uusi merkintä tietokantaan
function tallennaMerkinta(): void {
    $data = json_decode(file_get_contents("php://input"), true);

    // Tarkistetaan että data on kelvollista JSON:ia.
    // Jos JavaScript lähetti virheellistä JSONia, $data on null.
    if (!$data) {
        http_response_code(400);
        echo json_encode(["virhe" => "Virheellinen pyyntö"]);
        return;
    }

    // PIN koodin tarkistus
    $pinOikein = isset($data["pin"]) && hash_equals(JOURNAL_PIN, (string)$data["pin"]);

    if (!$pinOikein) {
        http_response_code(401);
        echo json_encode(["virhe" => "PÄÄSY EVÄTTY", "koodi" => "VAARA_PIN"]);
        return;
    }

    // Syötteen validointi ja siivous
    // Trim poistaa välilyönnit alusta ja lopusta
    $merkintaTeksti = trim($data["merkinta"] ?? "");

    // intVal muuntaa arvon kokonaisluvuksi
    $dayNumber = intval($data["day_number"] ?? 0);

    // Empty tarkistaa ettei arvo ole tyhjä/null/""
    if (empty($merkintaTeksti)) {
        http_response_code(400);
        echo json_encode(["virhe" => "Merkinta ei voi olla tyhjä"]);
        return;
    }

    // Suomen kieli sisältää monibytemerkkejä esim ä ö jotka vievät enemmän tavuja
    if (mb_strlen($merkintaTeksti) > 2000) {
        http_response_code(400);
        echo json_encode(["virhe" => "Merkinta on liian pitkä (max 2000 merkkiä)"]);
        return;
    }

    // Estetään ettei päiväluku ole negatiivinen
    if ($dayNumber < 0) {
        $dayNumber = 0;
    }

    // Tallennus tietokantaan
    try {
        $yhteys = tietokantaYhteys();

        $lause = $yhteys->prepare("INSERT INTO journal_entries (day_number, merkinta) VALUES (:day_number, :merkinta)");

        $lause->bindParam(":day_number", $dayNumber, PDO::PARAM_INT);
        $lause->bindParam(":merkinta", $merkintaTeksti, PDO::PARAM_STR);

        // Nyt suoritetaan valmisteltu kysely sidotuilla arvoilla.
        $lause->execute();

        // lastInsertId() palauttaa viimeksi lisätyn rivin AUTO_INCREMENT id:n.
        // Tämä on hyödyllistä jos halutaan myöhemmin viitata juuri lisättyyn riviin.
        $uusiId = $yhteys->lastInsertId();

        // Tallennus onnistui - palautetaan 201 Created ja tiedot JavaScript:lle.
        // JavaScript tarkistaa "ok" arvon ja päivittää päiväkirjalistan.
        http_response_code(201);
        echo json_encode(["ok" => true, "viesti" => "Merkinta tallennettu", "id" => $uusiId]);
    } catch (PDOException $e) {
        // Lokitetaan virhe palevlimen lokiin
        error_log("Tietokantavirhe tallennaMerkinta(): " . $e->getMessage());

        // Kerrotaan JavaScript:lle että tallennus epäonnistui
        http_response_code(500);
        echo json_encode(["virhe" => "Tietokantavirhe"]);
    }
}

?>