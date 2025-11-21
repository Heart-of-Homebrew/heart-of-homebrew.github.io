(function () {
    console.log("Planetarium (Star Map) page loaded.");

    const root = document.querySelector(".planetarium-root");

    if (root) {
        root.innerHTML = `
            <h2>Planetarium — Placeholder</h2>
            <p>A celestial visualization of Ceriad's night sky will appear here.</p>
        `;
    }
})();