(function () {
    const carousel = document.getElementById("carousel");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const quoteGallery = document.getElementById("quoteGallery");

    if (!carousel || !btnLeft || !btnRight || !quoteGallery) {
        return;
    }

    const recent = [
        { id: 1, title:"Ironhaven — Port & Bastion",excerpt:"A fortified harbor city where tides meet cannon smoke.",tag:"City" },
        { id: 2, title:"Order of the Sapphire Veil",excerpt:"Mages who bend light and illusion into weaponry.",tag:"Faction" },
        { id: 3, title:"The Umbral Wilds",excerpt:"A haunted forest twisted by ancient magic.",tag:"Region" },
        { id: 4, title:"Aetherium Crystals",excerpt:"Rare minerals that amplify spellcasting.",tag:"Resource" },
        { id: 5, title:"War of Ashen Crowns",excerpt:"A conflict that reshaped kingdoms.",tag:"History" },
        { id: 6, title:"Skywhales of the Northwind Current",excerpt:"Titans drifting through the atmosphere.",tag:"Fauna" },
        { id: 7, title:"Drakar Forge-Born",excerpt:"Runic metals tempered in dragonfire.",tag:"Artifact" }
    ];

    function makeCard(item){
        const el = document.createElement("article");
        el.className = "card";
        el.innerHTML = `
            <div class="thumb">${item.tag}</div>
            <h4>${item.title}</h4>
            <p>${item.excerpt}</p>
        `;
        return el;
    }

    recent.forEach(item => carousel.appendChild(makeCard(item)));

    function updateScrollButtons() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;

        btnLeft.style.display = (carousel.scrollLeft <= 0) ? "none" : "block";
        btnRight.style.display = (carousel.scrollLeft >= maxScroll - 1) ? "none" : "block";
    }

    carousel.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();

    btnLeft.addEventListener("click", () => {
        carousel.scrollBy({ left: -300, behavior: "smooth" });
        setTimeout(updateScrollButtons, 350);
    });

    btnRight.addEventListener("click", () => {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
        setTimeout(updateScrollButtons, 350);
    });

    const quotes = [
        {
            text: "“The stones of Ceriad remember every step we take across them.”",
            attrib: "– Unknown cartographer",
            href: "#quote1"
        },
        {
            text: "“Maps do not show the heart of a land, only the paths we dare to walk.”",
            attrib: "– Wayfarer proverb",
            href: "#quote2"
        },
        {
            text: "“Ask not where the road leads; ask instead why it was laid.”",
            attrib: "– Worn milestone",
            href: "#quote3"
        },
        {
            text: "“In Ceriad, even silence has a history.”",
            attrib: "– Archivist of Athenaeum Ceriad",
            href: "#quote4"
        }
    ];

    const quoteSlides = [];

    quotes.forEach((q, index) => {
        const slide = document.createElement("div");
        slide.className = "quote-slide";
        if (index === 0) slide.classList.add("active");

        slide.innerHTML = `
            <p class="quote-text">${q.text}</p>
            <p class="quote-attrib">${q.attrib}</p>
        `;

        quoteGallery.appendChild(slide);
        quoteSlides.push(slide);
    });

    let currentQuoteIndex = 0;

    function showNextQuote() {
        if (!quoteSlides.length) return;

        const current = quoteSlides[currentQuoteIndex];
        current.classList.remove("active");

        currentQuoteIndex = (currentQuoteIndex + 1) % quoteSlides.length;

        const next = quoteSlides[currentQuoteIndex];
        next.classList.add("active");
    }

    setInterval(showNextQuote, 11000);
})();