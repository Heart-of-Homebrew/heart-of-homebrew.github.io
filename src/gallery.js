(function () {
    console.log("Gallery page loaded.");

    const galleryRoot = document.querySelector(".gallery-root");

    if (galleryRoot) {
        galleryRoot.innerHTML = `
            <h2>Gallery — Placeholder</h2>
            <p>Artwork, concept visuals, and world imagery will be shown here.</p>
        `;
    }
})();