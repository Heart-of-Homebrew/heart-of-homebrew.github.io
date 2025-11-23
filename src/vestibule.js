(function () {

    //Todo: make childrens children collapse as well, fully and recursively if necessary

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
    }

    async function loadArchiveContent(target) {
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

    window.loadArchiveContent = loadArchiveContent;

        function normalizeHref(raw) {
            if (!raw) return null;
            let href = raw.trim();

            if (href.startsWith("/")) {
                href = href.slice(1);
            }

            if (href.startsWith("pages/archive/")) {
                href = href.slice("pages/archive/".length);
            }

            if (href.startsWith("archive/")) {
                href = href.slice("archive/".length);
            }

            if (href.endsWith("/")) {
                href = href.slice(0, -1);
            }

            return href;
        }

        function syncArchiveSidebarFromHash(hash) {
            if (!layout || !hash) return;
            if (hash.startsWith("#")) hash = hash.slice(1);

            if (!hash.startsWith("archive")) return;

            let path = hash.slice("archive".length);
            if (path.startsWith("/")) path = path.slice(1);

            const targetKey = normalizeHref(path);
            if (!targetKey) return;

            const allItems = Array.from(navItems);
            const targetItem = allItems.find(item => {
                const key = normalizeHref(item.dataset.href);
                return key === targetKey;
            });

            if (!targetItem) {
                console.warn("Archive sidebar: no nav-item matches", targetKey);
                return;
            }

            navItems.forEach(i => i.classList.remove("nav-selected"));

            targetItem.classList.add("nav-selected");

            layout.querySelectorAll(".nav-children").forEach(group => {
                group.style.display = "none";
            });

            const directChildren = targetItem.nextElementSibling;
            if (
                directChildren &&
                directChildren.classList.contains("nav-children")
            ) {
                directChildren.style.display = "block";

                const owningSection = targetItem.closest(".nav-section");
                if (owningSection && owningSection.dataset.section) {
                    highlightSection(owningSection.dataset.section);
                }
            }

            let node = targetItem;
            while (node && node !== layout) {
                if (node.classList && node.classList.contains("nav-children")) {
                    node.style.display = "block";

                    const category = node.previousElementSibling;
                    if (category && category.classList.contains("nav-category")) {
                        const section = category.closest(".nav-section");
                        if (section && section.dataset.section) {
                            highlightSection(section.dataset.section);
                        }
                    }
                }

                node = node.parentElement;
            }
        }

        window.syncArchiveSidebarFromHash = syncArchiveSidebarFromHash;

    function collapseNonSelectedGroups(parent, myChildren) {
        const siblingGroups = Array.from(parent.children).filter(
            child =>
                child.classList &&
                child.classList.contains("nav-children")
        );

        siblingGroups.forEach(group => {
            group.style.display =
                group === myChildren ? "block" : "none";
        });
    }

    layout.querySelectorAll(".nav-children").forEach(children => {
        children.style.display = "none";
    });

    navItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const isCategory = item.classList.contains("nav-category");
            const wasSelected = item.classList.contains("nav-selected");

            let shouldSelectAndLoad = true;

            if (isCategory) {
                // Try to find this category's own dropdown children
                const sibling = item.nextElementSibling;
                const myChildren =
                    sibling && sibling.classList.contains("nav-children")
                        ? sibling
                        : null;

                if (myChildren) {
                    const parent = item.parentElement;
                    const isOpen = myChildren.style.display === "block";

                    if (parent.classList.contains("nav-section")) {
                        // ============================
                        // TOP-LEVEL CATEGORY
                        // ============================

                        console.log("is top level");

                        highlightSection(parent.dataset.section);

                        if (isOpen && wasSelected) {
                            // Click on the currently selected, open parent:
                            // -> collapse everything and go "home"

                            // 1) Clear selected nav items
                            navItems.forEach(i => i.classList.remove("nav-selected"));

                            // 2) Clear section highlight
                            highlightSection(); // undefined -> no section matches

                            // 3) Collapse all dropdowns
                            layout.querySelectorAll(".nav-children").forEach(group => {
                                group.style.display = "none";
                            });

                            // 4) Reload Archive root via hash
                            window.location.hash = "#refresh";
                            window.location.hash = "#archive";

                            // Don't re-select or load this category
                            shouldSelectAndLoad = false;
                        } else {
                            // Open this group and close other top-level groups
                            layout
                                .querySelectorAll(".nav-section > .nav-children")
                                .forEach(group => {
                                    group.style.display =
                                        group === myChildren ? "block" : "none";
                                });
                        }
                    } else if (parent.classList.contains("nav-children")) {
                        // ============================
                        // NESTED CATEGORY (e.g., Continents)
                        // ============================

                        if (isOpen && wasSelected) {
                            // Only collapse its own children
                            myChildren.style.display = "none";
                        } else {
                           collapseNonSelectedGroups(parent, myChildren);
                        }
                    }
                }
            } else {
                collapseNonSelectedGroups(item.parentElement, false);
            }

            if (shouldSelectAndLoad) {
                selectNavItem(item);

                const target = item.dataset.href;
                if (target) {
                    console.log(target)
                    location.hash = "#archive/" + target;
                }
            }
        });
    });
})();