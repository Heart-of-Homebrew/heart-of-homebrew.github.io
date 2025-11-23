const ROUTES = {
    atrium: {
        html: "pages/atrium.html",
        css: "src/atrium.css",
        js: "src/atrium.js"
    },
    archive: {
        html: "pages/archive/vestibule.html",
        css: "src/vestibule.css",
        js: "src/vestibule.js"
    },
    cartohall: {
        html: "pages/cartohall/foyer.html",
        css: "src/cartohall.css",
        js: "src/cartohall.js"
    },
    planetarium: {
        html: "pages/planetarium/entrance.html",
        css: "src/planetarium.css",
        js: "src/planetarium.js"
    },
    chronospire: {
        html: "pages/chronospire/escalier.html",
        css: "src/chronospire.css",
        js: "src/chronospire.js"
    },
    gallery: {
        html: "pages/gallery/lobby.html",
        css: "src/gallery.css",
        js: "src/gallery.js"
    },
    orienta: {
        html: "pages/orienta/antechamber.html",
        css: "src/orienta.css",
        js: "src/orienta.js"
    }
};

function loadCSS(url) {
    return new Promise(resolve => {
        if (document.querySelector(`link[data-page-css="${url}"]`)) return resolve();
        const tag = document.createElement("link");
        tag.rel = "stylesheet";
        tag.href = url;
        tag.dataset.pageCss = url;
        tag.onload = resolve;
        document.head.appendChild(tag);
    });
}

function loadScript(url) {
    return new Promise(resolve => {
        if (document.querySelector(`script[data-page-js="${url}"]`)) return resolve();
        const tag = document.createElement("script");
        tag.src = url;
        tag.defer = true;
        tag.dataset.pageJs = url;
        tag.onload = resolve;
        document.body.appendChild(tag);
    });
}

function unhideHiddenInits() {
    document.querySelectorAll('.hidden-init').forEach(nav => {
        nav.classList.remove('hidden-init');
        nav.classList.add('unhidden-init')
    });
}

function hideUnhiddenInits() {
    document.querySelectorAll('.unhidden-init').forEach(nav => {
            nav.classList.remove('unhidden-init');
            nav.classList.add('hidden-init')
        });
}

function clearPageAssets() {
    document.querySelectorAll("link[data-page-css], script[data-page-js").forEach(el => el.remove());
}

async function loadPage(routeName) {
    const route = ROUTES[routeName];
    if (!route) return;

    const frame = document.getElementById("frame");
    const html = await fetch(route.html).then(r => r.text());

    clearPageAssets();
    hideUnhiddenInits();

    frame.innerHTML = html;

    await loadCSS(route.css);
    await loadScript(route.js);

    unhideHiddenInits();
    updateActiveNav(routeName);
}

function updateActiveNav(routeName) {
    const navLinks = document.querySelectorAll(".nav a.swap");

    navLinks.forEach(a => {
        const hash = a.getAttribute("href").substring(1);
        const mainSpan = a.querySelector(".text-main");

        if (hash === routeName) {
            a.setAttribute("aria-current", "page");
            a.classList.add("active-nav");
        } else {
            a.removeAttribute("aria-current");
            a.classList.remove("active-nav");
        }
    });
}


function initHoverSwap() {
    document.querySelectorAll(".swap").forEach(el => {
        const main = el.dataset.main;
        const alt  = el.dataset.alt;

        const temp = document.createElement("span");
        temp.style.visibility = "hidden";
        temp.style.position = "absolute";
        temp.style.whiteSpace = "nowrap";
        temp.innerText = main.length > alt.length ? main : alt;
        document.body.appendChild(temp);

        const width = temp.offsetWidth;
        document.body.removeChild(temp);

        el.style.width = width + "px";

        el.innerHTML = `
            <span class="text-main">${main}</span>
            <span class="text-alt">${alt}</span>
        `;

        el.addEventListener("mouseover", () => {
            el.classList.add("hovered");
        });

        el.addEventListener("mouseout", () => {
            el.classList.remove("hovered");
        });
    });
}

let suppressHashHandler = false;

window.addEventListener("hashchange", () => {

    if (suppressHashHandler) {
        suppressHashHandler = false;
        return;
    }

    let hash = location.hash || "#atrium";
    let route = hash.substring(1);

    if (hash.startsWith("#archive")) {
        if (!(hash === "#archive")) {

            if (window.loadArchiveContent) {
                const route = "pages/" + location.hash.substring(1);
                const srcRoute = "src/" + location.hash.substring(1);
                window.loadArchiveContent(route);
            }
            return;
        }
    }

    if (!(Object.prototype.hasOwnProperty.call(ROUTES, route) | hash.startsWith("#archive"))) {
        suppressHashHandler = true;
        location.hash = "#atrium";
        route = "atrium";
    }

    loadPage(route);
});

window.addEventListener("DOMContentLoaded", async () => {
    initHoverSwap();

    const hash  = location.hash || "#atrium";
    const slash = hash.indexOf("/");

    if (slash === -1) {
        await loadPage(hash.substring(1));
    } else {
        const topRoute = hash.substring(1, slash);

        await loadPage(topRoute);
        //Todo: make the welcome page not visible when immediately loading content

        if (window.loadArchiveContent) {
            const route = "pages/" + location.hash.substring(1);
            window.loadArchiveContent(route);
        }

        if (window.syncArchiveSidebarFromHash) {
            window.syncArchiveSidebarFromHash(location.hash);
        }
    }
});