setTimeout(() => {
    const intro = document.querySelector(".intro-container");
    const main = document.querySelector(".main-content");
    intro.classList.add("intro-fade-out");
    main.classList.add("main-fade-in");

    setTimeout(() => {
        intro.remove();
    }, 1000);
}, 4000);

document.addEventListener("DOMContentLoaded", function () {
    sateilyArvo();
});

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