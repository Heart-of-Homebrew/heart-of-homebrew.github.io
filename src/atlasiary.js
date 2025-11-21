(function () {
    console.log("Atlasiary (Map) page loaded.");

    const panel = document.querySelector(".atlasiary-root");

    if (panel) {
        panel.innerHTML = `
            <h2>Atlasiary — Placeholder</h2>
            <p>Your world map will be rendered here.</p>
        `;
    }
})();