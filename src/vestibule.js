(function () {
    const layout = document.querySelector(".archive-layout");
    if (!layout) return;

    const navItems = layout.querySelectorAll(".nav-item");
    const navSections = layout.querySelectorAll(".nav-section");
    const contentPanel = layout.querySelector(".archive-content");

    function highlightSection(sectionName) {
        navSections.forEach(section => {
            section.classList.toggle(
                "active-section",
                section.dataset.section === sectionName
            );
        });
    }

    function selectNavItem(item) {
        navItems.forEach(i => i.classList.remove("nav-selected"));
        item.classList.add("nav-selected");

        highlightSection(item.dataset.section);
    }

    async function loadContent(target) {
        if (!target || !contentPanel) return;

        try {
            const response = await fetch(target);

            if (!response.ok) {
                contentPanel.innerHTML = `
                    <div class="archive-error">
                        <p>Unable to load this entry.</p>
                        <p><small>(${response.status} ${response.statusText})</small></p>
                    </div>
                `;
                return;
            }

            const html = await response.text();
            contentPanel.innerHTML = html;
        } catch (err) {
            console.error("Error loading archive content:", err);
            contentPanel.innerHTML = `
                <div class="archive-error">
                    <p>An error occurred while loading this entry.</p>
                </div>
            `;
        }
    }

    navItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();

            selectNavItem(item);

            const target = item.dataset.target;
            if (target) {
                loadContent(target);
            }
        });
    });

    const majorCategories = layout.querySelectorAll(".nav-category");

    layout.querySelectorAll(".nav-children").forEach(children => {
        children.style.display = "none";
    });

    let openMajorCategory = null;

    majorCategories.forEach(category => {
        category.addEventListener("click", event => {
            event.stopPropagation();

            const section = category.closest(".nav-section");
            const children = section.querySelector(".nav-children");

            if (openMajorCategory !== section) {
                layout.querySelectorAll(".nav-section .nav-children")
                    .forEach(c => c.style.display = "none");

                if (children) children.style.display = "block";

                openMajorCategory = section;
            }
        });
    });

    console.log("Vestibule script initialized.");
})();
