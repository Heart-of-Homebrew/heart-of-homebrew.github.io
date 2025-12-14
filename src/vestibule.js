//Todo: when archive content is loaded reset scroll to top
//Todo: add expand-all and collapse-all buttons to spoiler segments
//Todo: make sure sidebar sync is happening any time hash changes in the archive, or when back and forth arrows are being used
(function () {
   const layout = document.querySelector(".archive-layout");
   if (!layout) return;

   const navItems = layout.querySelectorAll(".nav-item");
   const navSections = layout.querySelectorAll(".nav-section");
   const contentPanel = document.getElementById("content-frame");

   const DEFINITIONS_MAP = new Map();

   function normalizeDefinitionTerm(text) {
       return (text || "").trim().toLowerCase().replace(/\s+/g, " ");
   }

   async function loadGlossary() {
       try {
           const response = await fetch("src/aa-glossary.json");
           if (!response.ok) {
               console.error("Glossary load failed:", response.status, response.statusText);
               return;
           }

           const data = await response.json();
           DEFINITIONS_MAP.clear();

           Object.entries(data).forEach(([key, value]) => {
               if (typeof value !== "string") return;

               const names = key
                   .split(",")
                   .map(n => n.trim())
                   .filter(Boolean);

               if (!names.length) return;

               const entry = { names, definition: value };

               names.forEach(name => {
                   DEFINITIONS_MAP.set(normalizeDefinitionTerm(name), entry);
               });
           });

           initDefinitionsTooltips(layout);
       } catch (err) {
           console.error("Error loading glossary JSON:", err);
       }
   }

   function adjustTooltipPosition(el) {
       const tooltip = el.querySelector(".define-tooltip");
       if (!tooltip) return;

       tooltip.classList.remove("flip-tooltip");

       const container =
           el.closest(".archive-content") ||
           layout.querySelector(".archive-content") ||
           document.documentElement;

       const containerRect = container.getBoundingClientRect();
       const tipRect = tooltip.getBoundingClientRect();

       const padding = 8;
       if (tipRect.top < containerRect.top + padding) {
           tooltip.classList.add("flip-tooltip");
       }
   }

   function initDefinitionsTooltips(root) {
       const scope = root || layout || document;
       if (!scope) return;

       const defineEls = scope.querySelectorAll(".define");
       if (!defineEls.length) return;

       defineEls.forEach(el => {
           const alt = el.getAttribute("data-alt");

           const lookupBase = alt || el.textContent || "";
           const lookupKey = normalizeDefinitionTerm(lookupBase);

           const entry = DEFINITIONS_MAP.get(lookupKey);
           if (!entry) return;

           const existing = el.querySelector(".define-tooltip");
           if (existing) existing.remove();

           const tooltip = document.createElement("div");
           tooltip.className = "define-tooltip";

           const defDiv = document.createElement("div");
           defDiv.className = "define-tooltip-definition";
           defDiv.textContent = entry.definition;
           tooltip.appendChild(defDiv);

           const baseForExclusion = normalizeDefinitionTerm(
               alt || el.textContent || ""
           );

           const synonyms = entry.names.filter(name => {
               return normalizeDefinitionTerm(name) !== baseForExclusion;
           });

           if (synonyms.length > 0) {
               const alsoDiv = document.createElement("div");
               alsoDiv.className = "define-tooltip-also";
               alsoDiv.textContent = "Also called → " + synonyms.join("; ");
               tooltip.appendChild(alsoDiv);
           }

           el.appendChild(tooltip);

           el.setAttribute("data-term", lookupBase.trim());
           if (!el.hasAttribute("tabindex")) {
               el.setAttribute("tabindex", "0");
           }

           const recalc = () => adjustTooltipPosition(el);
           el.addEventListener("mouseenter", recalc);
           el.addEventListener("focus", recalc);

           adjustTooltipPosition(el);
       });
   }

   function enhanceMediaParagraphs(root) {
       const scope = root || document;
       const nodes = scope.querySelectorAll("[data-media-left], [data-media-right]");
       if (!nodes.length) return;

       nodes.forEach(p => {
           if (p.closest(".archive-inline-media")) return;

           const leftSrc = p.getAttribute("data-media-left");
           const rightSrc = p.getAttribute("data-media-right");
           const src = leftSrc || rightSrc;
           if (!src) return;

           const side = leftSrc ? "left" : "right";

           const wrapper = document.createElement("div");
           wrapper.className = "archive-inline-media";
           wrapper.classList.add(side === "left" ? "media-left" : "media-right");


           const figure = document.createElement("figure");
           figure.className = "archive-figure";

           const img = document.createElement("img");
           img.className = "archive-figure-img";
           img.src = src;
           img.alt = p.getAttribute("data-media-alt") || "";

           const capText = p.getAttribute("data-media-cap");

           figure.appendChild(img);

           if (capText) {
               const cap = document.createElement("figcaption");
               cap.className = "archive-figure-cap";
               cap.textContent = capText;
               figure.appendChild(cap);
           }

           const parent = p.parentNode;
           parent.insertBefore(wrapper, p);
           wrapper.appendChild(p);

           if (side === "left") {
               wrapper.insertBefore(figure, p);
           } else {
               wrapper.appendChild(figure);
           }

           p.removeAttribute("data-media-left");
           p.removeAttribute("data-media-right");
       });
   }

   window.enhanceMediaParagraphs = enhanceMediaParagraphs;

   function highlightSection(sectionName) {
       navSections.forEach(section => {
           section.classList.toggle(
               "active-section",
               section.dataset.section === sectionName
           );
       });
   }

   function scrollArchiveSidebarToSelected(containerSelector = ".archive-sidebar") {
       const container = document.querySelector(containerSelector);
       if (!container) return;

       const selected = container.querySelector(".nav-item.nav-selected");
       if (!selected) return;

       const fullRange = container.scrollHeight - container.clientHeight;
       if (fullRange <= 0) return;

       let offset = 0;
       let node = selected;
       while (node && node !== container) {
           offset += node.offsetTop;
           node = node.offsetParent;
       }

       const target = offset - (container.clientHeight / 2 - selected.clientHeight / 2);
       const clamped = Math.max(0, Math.min(fullRange, target));

       container.scrollTo({ top: clamped, behavior: "smooth" });
   }

   function selectNavItem(item) {
       navItems.forEach(i => i.classList.remove("nav-selected"));
       item.classList.add("nav-selected");
       scrollArchiveSidebarToSelected();
   }

   async function loadArchiveContent(target) {
       if (!target || !contentPanel) return;
       try {
           const htmlResponse = await fetch(target + ".html");

           if (!htmlResponse.ok) {
               contentPanel.innerHTML = `
                   <div class="archive-error">
                       <p>Unable to load this entry.</p>
                       <p><small>(${htmlResponse.status} ${htmlResponse.statusText})</small></p>
                   </div>
               `;
               window.unhideHiddenInits();
               return;
           }

           const html = await htmlResponse.text();
           contentPanel.innerHTML = html;

           enhanceMediaParagraphs(contentPanel);
           initDefinitionsTooltips(contentPanel);
       } catch (err) {
           console.error("Error loading archive content:", err);
           contentPanel.innerHTML = `
               <div class="archive-error">
                   <p>An error occurred while loading this entry.</p>
               </div>
           `;
       }
       window.unhideHiddenInits();
   }

   window.loadArchiveContent = loadArchiveContent;

   function normalizeHref(raw) {
       if (!raw) return null;
       let href = raw.trim();

       if (href.startsWith("/")) href = href.slice(1);
       if (href.startsWith("pages/archive/")) href = href.slice("pages/archive/".length);
       if (href.startsWith("archive/")) href = href.slice("archive/".length);
       if (href.endsWith("/")) href = href.slice(0, -1);

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
       if (directChildren && directChildren.classList.contains("nav-children")) {
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

       scrollArchiveSidebarToSelected();
   }

   window.syncArchiveSidebarFromHash = syncArchiveSidebarFromHash;

   function collapseNonSelectedGroups(parent, myChildren) {
       const siblingGroups = Array.from(parent.children).filter(
           child =>
               child.classList &&
               child.classList.contains("nav-children")
       );

       siblingGroups.forEach(group => {
           group.style.display = group === myChildren ? "block" : "none";
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
               const sibling = item.nextElementSibling;
               const myChildren =
                   sibling && sibling.classList.contains("nav-children")
                       ? sibling
                       : null;

               if (myChildren) {
                   const parent = item.parentElement;
                   const isOpen = myChildren.style.display === "block";

                   if (parent.classList.contains("nav-section")) {
                       highlightSection(parent.dataset.section);

                       if (isOpen && wasSelected) {
                           navItems.forEach(i => i.classList.remove("nav-selected"));

                           highlightSection();

                           layout.querySelectorAll(".nav-children").forEach(group => {
                               group.style.display = "none";
                           });

                           window.location.hash = "#archive";

                           shouldSelectAndLoad = false;
                       } else {
                           layout
                               .querySelectorAll(".nav-section > .nav-children")
                               .forEach(group => {
                                   group.style.display =
                                       group === myChildren ? "block" : "none";
                               });
                       }
                   } else if (parent.classList.contains("nav-children")) {
                       if (isOpen && wasSelected) {
                           myChildren.style.display = "none";
                       } else {
                           collapseNonSelectedGroups(parent, myChildren);
                       }
                   }
               }
           }

           if (shouldSelectAndLoad) {
               selectNavItem(item);

               const target = item.dataset.href;
               if (target) {
                   location.hash = "#archive/" + target;
               }
           }
       });
   });

   initDefinitionsTooltips(layout);
   loadGlossary();

   window.CeriadDefinitions = {
       refresh(root) {
           initDefinitionsTooltips(root || layout || document);
       },
       add(term, definition) {
           const names = (term || "")
               .split(",")
               .map(n => n.trim())
               .filter(Boolean);
           if (!names.length || !definition) return;

           const entry = { names, definition };

           names.forEach(name => {
               const norm = normalizeDefinitionTerm(name);
               DEFINITIONS_MAP.set(norm, entry);
           });

           initDefinitionsTooltips(layout);
       },
       map: DEFINITIONS_MAP
   };
})();