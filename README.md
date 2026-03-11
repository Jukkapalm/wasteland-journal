# Wasteland Journal

Post-apokalyptinen bunkkeri-terminaali päiväkirjasovellus.

---

## Rakenne

```
/           ← v1 (alkuperäinen versio)
/v2/        ← v2 (uusin versio)
```

> **Uusin versio löytyy kansiosta `/v2`**

---

## Kuvaus

Wasteland Journal on post-apokalyptinen päiväkirjasovellus joka simuloi bunkkerin hallintajärjestelmää. Käyttäjä hallinnoi bunkkerin resursseja ja laitteita kirjoittaakseen päiväkirjamerkintöjä — generaattori tarvitaan virraksi, lämmitin pitää lämpötilan elinkelpoisena, ja vesivarasto täyttyy keräämällä lunta.

---

## Ominaisuudet

- **Resurssien hallinta** — akut, polttoaine, vesi ja generaattorin lämpötila
- **Laitteet** — generaattori, jäähdytin, lämmitin ja polttoaineen jalostus
- **Sää** — lumisade vaihtelee satunnaisesti, lämmitin sulattaa lumen vedeksi
- **Hätäkäynnistys** — varavirtaläiskäys kun akut tyhjenevät, 60s cooldown
- **Hätävalaistus** — UI vaihtuu punaiseksi kun akkuvirta kriittisellä tasolla
- **Huurtuminen** — näyttö huurtuuu kun sisälämpötila laskee liian alas
- **Tapahtumaloki** — kirjaa automaattisesti laitteiden tilan ja järjestelmätapahtumat
- **Satunnaiset järjestelmähälytykset** — tunnelmaa lisäävät varoitusviestit
- **Päiväkirja** — merkinnät tallennetaan tietokantaan PIN-tunnistuksella
- **CRT-efekti** — scanlines ja vignette luovat vanhan terminaalin tunnelman

---

## Teknologiat

- HTML, CSS, JavaScript
- PHP + MySQL (päiväkirja API)

---

## Käyttö

1. **Generaattori** käyntiin — lataa akkuja, vaatii polttoainetta
2. **Jäähdytin** käyntiin — estää generaattorin ylikuumenemisen, vaatii vettä
3. **Lämmitin** käyntiin — pitää sisälämpötilan ylhäällä ja sulattaa lumen vedeksi

---

## Demo

[jukkapekka.com/portfolio/wasteland-journal](https://jukkapekka.com/portfolio/wasteland-journal/)