let rules = null;
let homebrew = JSON.parse(localStorage.getItem("dnd-homebrew") || "[]");

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#039;'
}[c]));

const rulesUrl = new URL("./data/rules.json", document.baseURI).href;

fetch(rulesUrl, { cache: "no-store" })
  .then(r => {
    if (!r.ok) {
      throw new Error(
        `Could not load ${rulesUrl}: ${r.status} ${r.statusText}`
      );
    }
    return r.json();
  })
  .then(data => {
    rules = data;
    render();
  })
  .catch(err => {
    $("#content").innerHTML = `
      <h1>Could not load the rules</h1>
      <p>${esc(err.message)}</p>
      <p>Check that <strong>data/rules.json</strong> exists in your GitHub repository.</p>
    `;
    console.error(err);
  });

function renderSidebar(activeSection) {
  const sections = [...new Set(rules.pages.map(p => p.section))];

  $("#sidebar").innerHTML = `
    <div class="nav-title">Rules</div>

    <a class="nav-link ${!activeSection ? 'active':''}" href="#/">
      Overview
    </a>

    ${sections.map(s => `
      <a class="nav-link ${activeSection === s ? 'active':''}"
         href="#/section/${encodeURIComponent(s)}">
        ${esc(s)}
      </a>
    `).join("")}

    <div class="nav-title" style="margin-top:20px">
      Homebrew
    </div>

    <a class="nav-link" href="#/homebrew">
      My Homebrew (${homebrew.length})
    </a>

    ${homebrew.map(p => `
      <a class="nav-link" href="#/brew/${p.id}">
        ${esc(p.title)}
      </a>
    `).join("")}
  `;
}

const STRUCTURED = {
  "classes": [
    [
      "barbarian",
      "Barbarian",
      28,
      30
    ],
    [
      "bard",
      "Bard",
      31,
      35
    ],
    [
      "cleric",
      "Cleric",
      36,
      40
    ],
    [
      "druid",
      "Druid",
      41,
      46
    ],
    [
      "fighter",
      "Fighter",
      47,
      48
    ],
    [
      "monk",
      "Monk",
      49,
      52
    ],
    [
      "paladin",
      "Paladin",
      53,
      56
    ],
    [
      "ranger",
      "Ranger",
      57,
      60
    ],
    [
      "rogue",
      "Rogue",
      61,
      63
    ],
    [
      "sorcerer",
      "Sorcerer",
      64,
      69
    ],
    [
      "warlock",
      "Warlock",
      70,
      76
    ],
    [
      "wizard",
      "Wizard",
      77,
      82
    ]
  ],
  "species": [
    [
      "dragonborn",
      "Dragonborn",
      84,
      84
    ],
    [
      "dwarf",
      "Dwarf",
      84,
      84
    ],
    [
      "elf",
      "Elf",
      84,
      85
    ],
    [
      "gnome",
      "Gnome",
      85,
      85
    ],
    [
      "goliath",
      "Goliath",
      85,
      86
    ],
    [
      "halfling",
      "Halfling",
      86,
      86
    ],
    [
      "human",
      "Human",
      86,
      86
    ],
    [
      "orc",
      "Orc",
      86,
      86
    ],
    [
      "tiefling",
      "Tiefling",
      86,
      86
    ]
  ],
  "backgrounds": [
    [
      "acolyte",
      "Acolyte",
      83,
      83
    ],
    [
      "criminal",
      "Criminal",
      83,
      83
    ],
    [
      "sage",
      "Sage",
      83,
      83
    ],
    [
      "soldier",
      "Soldier",
      83,
      83
    ]
  ]
};

function renderSidebar(activeSection, activeCategory) {
  const sections = [...new Set(rules.pages.map(p => p.section))];

  const link = (href, label, active = false) => `
    <a class="nav-link ${active ? "active" : ""}" href="${href}">
      ${esc(label)}
    </a>
  `;

  $("#sidebar").innerHTML = `
    <div class="nav-title">Rules</div>
    ${link("#/", "Overview", !activeSection && !activeCategory)}

    <div class="nav-title structured-nav-title">Character</div>
    ${link("#/category/classes", "Classes", activeCategory === "classes")}
    ${link("#/category/species", "Species", activeCategory === "species")}
    ${link("#/category/backgrounds", "Backgrounds", activeCategory === "backgrounds")}

    <div class="nav-title structured-nav-title">Rules Reference</div>
    ${link("#/category/feats", "Feats", activeCategory === "feats")}
    ${link("#/category/equipment", "Equipment", activeCategory === "equipment")}
    ${link("#/category/spells", "Spells", activeCategory === "spells")}
    ${link("#/category/monsters", "Monsters", activeCategory === "monsters")}
    ${link("#/category/glossary", "Rules Glossary", activeCategory === "glossary")}

    <div class="nav-title structured-nav-title">Source</div>
    ${sections.map(s => link(
      "#/section/" + encodeURIComponent(s),
      s,
      activeSection === s
    )).join("")}

    <div class="nav-title structured-nav-title">Homebrew</div>
    ${link("#/homebrew", `My Homebrew (${homebrew.length})`)}

    ${homebrew.map(p => `
      <a class="nav-link" href="#/brew/${p.id}">
        ${esc(p.title)}
      </a>
    `).join("")}
  `;
}

function structuredEntries(category) {
  return (STRUCTURED[category] || []).map(([slug, name, start, end]) => ({
    slug, name, start, end
  }));
}

function structuredCategoryTitle(category) {
  return ({
    classes: "Classes",
    species: "Species",
    backgrounds: "Backgrounds",
    feats: "Feats",
    equipment: "Equipment",
    spells: "Spells",
    monsters: "Monsters",
    glossary: "Rules Glossary"
  })[category] || "Rules";
}

function renderCategory(category) {
  const entries = structuredEntries(category);

  if (!entries.length) {
    return renderSectionFallback(category);
  }

  renderSidebar(undefined, category);

  $("#content").innerHTML = `
    <div class="hero">
      <div class="eyebrow">Character Reference</div>
      <h1>${esc(structuredCategoryTitle(category))}</h1>
      <p class="muted">
        Structured pages built from the supplied SRD 5.2.1 source text.
      </p>
    </div>

    <div class="entity-grid">
      ${entries.map(e => `
        <a class="entity-card" href="#/entity/${category}/${e.slug}">
          <div class="entity-card-title">${esc(e.name)}</div>
          <div class="entity-card-meta">
            Source page${e.start === e.end ? "" : "s"} ${e.start}${e.end !== e.start ? "–" + e.end : ""}
          </div>
          <div class="entity-card-arrow">View entry →</div>
        </a>
      `).join("")}
    </div>
  `;
}

function renderEntity(category, slug) {
  const entry = structuredEntries(category).find(e => e.slug === slug);

  if (!entry) {
    return renderHome();
  }

  renderSidebar(undefined, category);

  const pages = rules.pages.filter(
    p => p.page >= entry.start && p.page <= entry.end
  );

  const sourcePageLinks = pages.map(p => `
    <a class="source-chip" href="#/page/${p.page}">
      Source p. ${p.page}
    </a>
  `).join("");

  const pageBlocks = pages.map(p => {
    const text = p.text.split("\n").map(line => `
      <p class="sr-line">${esc(line)}</p>
    `).join("");

    return `
      <section class="entity-source-page">
        <div class="entity-source-heading">
          <h2>Source Page ${p.page}</h2>
          <a href="#/page/${p.page}">Open source view →</a>
        </div>
        ${text}
      </section>
    `;
  }).join("");

  $("#content").innerHTML = `
    <div class="hero entity-hero">
      <a class="back-link" href="#/category/${category}">
        ← ${esc(structuredCategoryTitle(category))}
      </a>
      <div class="eyebrow">${esc(structuredCategoryTitle(category))}</div>
      <h1>${esc(entry.name)}</h1>
      <p class="muted">
        Structured entry · SRD 5.2.1 source pages ${entry.start}${entry.end !== entry.start ? "–" + entry.end : ""}
      </p>
      <div class="source-chip-row">${sourcePageLinks}</div>
    </div>

    <article class="rule-page entity-page">
      <div class="entity-notice">
        <strong>Source-backed entry</strong>
        <span>
          This page reorganizes the existing indexed source pages without
          changing their text.
        </span>
      </div>

      ${pageBlocks}
    </article>
  `;
}

function renderSectionFallback(category) {
  const names = {
    feats: "Feats",
    equipment: "Equipment",
    spells: "Spells",
    monsters: "Monsters",
    glossary: "Rules Glossary"
  };
  const label = names[category] || "Rules Reference";
  const page = rules.pages.find(p => p.text.toLowerCase().includes(label.toLowerCase()));

  if (page) {
    location.hash = "#/page/" + page.page;
  } else {
    renderHome();
  }
}

function render() {
  if (!rules) return;

  const hash = location.hash || "#/";

  if (hash === "#/" || hash === "#") {
    renderHome();
  }
  else if (hash.startsWith("#/section/")) {
    renderSection(
      decodeURIComponent(hash.slice(10))
    );
  }
  else if (hash.startsWith("#/category/")) {
    renderCategory(hash.slice(11));
  }
  else if (hash.startsWith("#/entity/")) {
    const parts = hash.slice(9).split("/");
    renderEntity(parts[0], parts[1]);
  }
  else if (hash === "#/homebrew") {
    renderHomebrew();
  }
  else if (hash.startsWith("#/brew/")) {
    renderBrew(hash.slice(7));
  }
  else if (hash.startsWith("#/page/")) {
    renderPage(Number(hash.slice(7)));
  }
  else {
    renderHome();
  }
}

function renderHome() {
  renderSidebar();

  const categoryCards = [
    ["classes", "Classes", "Browse all player classes."],
    ["species", "Species", "Browse the character species in the SRD."],
    ["backgrounds", "Backgrounds", "Browse the available SRD backgrounds."],
  ];

  $("#content").innerHTML = `
    <div class="hero">
      <div class="eyebrow">SRD 5.2.1 Reference</div>
      <h1>D&D Rules & Homebrew</h1>
      <p class="muted">
        A searchable, GitHub Pages-friendly rules reference with
        structured character pages and a local homebrew wiki.
      </p>
    </div>

    <div class="rule-page">
      <h2>Character</h2>
      <div class="entity-grid compact">
        ${categoryCards.map(([slug, title, description]) => `
          <a class="entity-card" href="#/category/${slug}">
            <div class="entity-card-title">${title}</div>
            <div class="entity-card-meta">${description}</div>
            <div class="entity-card-arrow">Browse →</div>
          </a>
        `).join("")}
      </div>

      <h2>Rules Reference</h2>
      <div class="quick-links">
        <a class="search-result" href="#/category/feats">
          <strong>Feats</strong>
          <span>Structured category is next; source pages remain available now.</span>
        </a>
        <a class="search-result" href="#/category/equipment">
          <strong>Equipment</strong>
          <span>Browse the source-backed equipment section.</span>
        </a>
        <a class="search-result" href="#/category/spells">
          <strong>Spells</strong>
          <span>Browse the source-backed spell material.</span>
        </a>
        <a class="search-result" href="#/category/monsters">
          <strong>Monsters</strong>
          <span>Browse the source-backed creature material.</span>
        </a>
        <a class="search-result" href="#/category/glossary">
          <strong>Rules Glossary</strong>
          <span>Browse the glossary source material.</span>
        </a>
      </div>

      <h2>Source Pages</h2>
      <p>
        ${rules.pages.length} source pages are indexed and remain available
        as the authoritative page-by-page view.
      </p>

      <h2>Homebrew</h2>
      <a class="search-result" href="#/homebrew">
        <strong>Open My Homebrew</strong>
        <span>Create, edit, export, and import custom pages.</span>
      </a>

      <p class="muted">
        SRD attribution: This work includes material from the
        System Reference Document 5.2.1 (“SRD 5.2.1”) by
        Wizards of the Coast LLC, available at
        https://www.dndbeyond.com/srd.
        The SRD 5.2.1 is licensed under the Creative Commons
        Attribution 4.0 International License, available at
        https://creativecommons.org/licenses/by/4.0/legalcode.
      </p>
    </div>
  `;
}

function renderSection(section) {
  renderSidebar(section);

  const pages = rules.pages.filter(
    p => p.section === section
  );

  $("#content").innerHTML = `
    <div class="hero">
      <h1>${esc(section)}</h1>
      <p class="muted">
        ${pages.length} source pages
      </p>
    </div>

    <div class="rule-page">
      ${pages.map(p => `
        <a class="search-result"
           href="#/page/${p.page}">

          <strong>
            Page ${p.page}
          </strong>

          <span>
            ${esc(
              (p.text.split("\n").find(x => x.trim()) || "")
                .slice(0,180)
            )}
          </span>

        </a>
      `).join("")}
    </div>
  `;
}

function renderPage(num) {
  const p = rules.pages.find(
    x => x.page === num
  );

  if (!p) {
    return renderHome();
  }

  renderSidebar(p.section);

  const text = p.text
    .split("\n")
    .map(line => `
      <p class="sr-line">
        ${esc(line)}
      </p>
    `)
    .join("");

  $("#content").innerHTML = `
    <div class="hero">

      <a href="#/section/${encodeURIComponent(p.section)}">
        ← ${esc(p.section)}
      </a>

      <h1>
        SRD Page ${p.page}
      </h1>

    </div>

    <article class="rule-page">

      <span class="page-number">
        Source page ${p.page}
      </span>

      ${text}

    </article>
  `;
}

function renderHomebrew() {
  renderSidebar();

  $("#content").innerHTML = `
    <div class="hero">

      <h1>My Homebrew</h1>

      <p class="muted">
        Custom pages stored locally in your browser.
      </p>

      <button class="primary" onclick="openModal()">
        + New Homebrew Page
      </button>

      <button onclick="exportHomebrew()">
        Export
      </button>

      <label style="margin-left:8px;cursor:pointer">
        <button onclick="$('#import-file').click()">
          Import
        </button>
      </label>

      <input
        id="import-file"
        type="file"
        accept=".json"
        hidden
        onchange="importHomebrew(event)"
      >

    </div>

    <div>
      ${
        homebrew.length
        ?
        homebrew.map(p => `
          <div class="brew-card">

            <h3>
              <a href="#/brew/${p.id}">
                ${esc(p.title)}
              </a>
            </h3>

            <p class="muted">
              ${esc(p.category)}
            </p>

            <p>
              ${esc(p.content.slice(0,240))}
              ${p.content.length > 240 ? '…' : ''}
            </p>

            <div class="brew-actions">

              <button onclick="editBrew('${p.id}')">
                Edit
              </button>

              <button onclick="deleteBrew('${p.id}')">
                Delete
              </button>

            </div>

          </div>
        `).join("")
        :
        `
          <div class="rule-page">
            <p>No homebrew pages yet.</p>
          </div>
        `
      }
    </div>
  `;
}

function renderBrew(id) {
  renderSidebar();

  const p = homebrew.find(
    x => x.id === id
  );

  if (!p) {
    return renderHomebrew();
  }

  $("#content").innerHTML = `
    <div class="hero">

      <a href="#/homebrew">
        ← My Homebrew
      </a>

      <h1>
        ${esc(p.title)}
      </h1>

      <p class="muted">
        ${esc(p.category)}
      </p>

    </div>

    <article class="rule-page">

      <div class="sr-line">
        ${esc(p.content)}
      </div>

      <div class="brew-actions">

        <button onclick="editBrew('${p.id}')">
          Edit
        </button>

        <button onclick="deleteBrew('${p.id}')">
          Delete
        </button>

      </div>

    </article>
  `;
}

function openModal(page = null) {
  $("#modal").classList.remove("hidden");

  $("#brew-title").value =
    page?.title || "";

  $("#brew-category").value =
    page?.category || "Homebrew";

  $("#brew-content").value =
    page?.content || "";

  $("#modal").dataset.editing =
    page?.id || "";
}

function closeModal() {
  $("#modal").classList.add("hidden");
}

function savePage() {
  const title =
    $("#brew-title").value.trim();

  const category =
    $("#brew-category").value;

  const content =
    $("#brew-content").value.trim();

  if (!title) {
    return alert("Please enter a title.");
  }

  const editing =
    $("#modal").dataset.editing;

  if (editing) {

    const p = homebrew.find(
      x => x.id === editing
    );

    Object.assign(p, {
      title,
      category,
      content
    });

  }
  else {

    homebrew.push({
      id: crypto.randomUUID(),
      title,
      category,
      content
    });

  }

  localStorage.setItem(
    "dnd-homebrew",
    JSON.stringify(homebrew)
  );

  closeModal();
  render();
}

function editBrew(id) {
  const p = homebrew.find(
    x => x.id === id
  );

  if (p) {
    openModal(p);
  }
}

function deleteBrew(id) {

  if (
    confirm("Delete this homebrew page?")
  ) {

    homebrew =
      homebrew.filter(
        x => x.id !== id
      );

    localStorage.setItem(
      "dnd-homebrew",
      JSON.stringify(homebrew)
    );

    render();
  }
}

function exportHomebrew() {

  const blob = new Blob(
    [
      JSON.stringify(
        homebrew,
        null,
        2
      )
    ],
    {
      type: "application/json"
    }
  );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "homebrew.json";

  a.click();

  URL.revokeObjectURL(a.href);
}

function importHomebrew(e) {

  const file =
    e.target.files[0];

  if (!file) return;

  const r =
    new FileReader();

  r.onload = () => {

    try {

      const x =
        JSON.parse(r.result);

      if (!Array.isArray(x)) {
        throw 0;
      }

      homebrew = x;

      localStorage.setItem(
        "dnd-homebrew",
        JSON.stringify(homebrew)
      );

      render();

    }
    catch {

      alert(
        "That file is not valid homebrew JSON."
      );

    }

  };

  r.readAsText(file);
}

$("#new-page").onclick =
  () => openModal();

$("#close-modal").onclick =
  closeModal;

$("#cancel-page").onclick =
  closeModal;

$("#save-page").onclick =
  savePage;

$("#search").addEventListener(
  "input",
  e => {

    const q =
      e.target.value
        .trim()
        .toLowerCase();

    if (!q) {

      if (
        location.hash === "#/search"
      ) {
        location.hash = "#/";
      }

      return;
    }

    const hits =
      rules.pages
        .filter(p =>
          p.text
            .toLowerCase()
            .includes(q)
        )
        .slice(0,80);

    renderSidebar();

    $("#content").innerHTML = `
      <div class="hero">

        <h1>Search</h1>

        <p class="muted">
          ${hits.length}
          matching source pages
        </p>

      </div>

      <div>

        ${
          hits.map(p => `
            <a class="search-result"
               href="#/page/${p.page}">

              <strong>
                ${esc(p.section)}
                · page ${p.page}
              </strong>

              <span>
                ${esc(
                  p.text
                    .replace(/\s+/g," ")
                    .slice(0,260)
                )}…
              </span>

            </a>
          `).join("")
          ||
          `
            <div class="rule-page">
              No matches.
            </div>
          `
        }

      </div>
    `;
  }
);

window.addEventListener(
  "hashchange",
  render
);
