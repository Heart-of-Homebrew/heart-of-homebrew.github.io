(function () {
    console.log("Orienta (About/Navigation) page loaded.");

    const orientaRoot = document.querySelector(".orienta-root");

    if (orientaRoot) {
        orientaRoot.innerHTML = `
            <h2>Orienta — Placeholder</h2>
            <p>Information, links, house rules, or meta navigation may go here.</p>
        `;
    }
})();