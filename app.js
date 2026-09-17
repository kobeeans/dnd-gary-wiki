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

  const pageBlocks = pages.map(p => `
    <section class="entity-source-page">
      <div class="entity-source-heading">
        <h2>Source Page ${p.page}</h2>
        <a href="#/page/${p.page}">Open source view →</a>
      </div>
      ${renderRichSourceText(p.text)}
    </section>
  `).join("");

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
          This page reorganizes the indexed SRD source text into a
          readable reference layout. The source wording is preserved.
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


const MAJOR_HEADINGS = new Set([
  "Classes",
  "Character Origins",
  "Character Backgrounds",
  "Parts of a Background",
  "Background Descriptions",
  "Character Species",
  "Parts of a Species",
  "Species Descriptions",
  "Feats",
  "Feat Descriptions",
  "Parts of a Feat",
  "Origin Feats",
  "General Feats",
  "Fighting Style Feats",
  "Epic Boon Feats",
  "Rules Glossary",
  "Equipment",
  "Magic Items",
  "Spells",
  "Monster Descriptions",
  "Actions",
  "Bonus Actions",
  "Reactions",
  "Traits",
  "Legendary Actions",
  "Lair Actions",
  "Challenge Rating",
  "Experience Points"
]);

const STAT_LABELS = new Set([
  "Ability Scores",
  "Feat",
  "Skill Proficiencies",
  "Tool Proficiency",
  "Equipment",
  "Creature Type",
  "Size",
  "Speed",
  "Primary Ability",
  "Hit Point Die",
  "Saving Throw Proficiencies",
  "Saving Throw",
  "Weapon Proficiencies",
  "Armor Training",
  "Starting Equipment",
  "Prerequisite",
  "Category",
  "Benefit",
  "Repeatable",
  "Casting Time",
  "Range",
  "Components",
  "Duration",
  "Damage",
  "Condition",
  "Hit Points",
  "Armor Class",
  "Challenge"
]);

const STRUCTURED_NAMES = new Set(
  Object.values(STRUCTURED)
    .flat()
    .map(x => x[1])
);

function cleanSourceLine(line) {
  return String(line || "")
    .replace(/\u00ad/g, "")
    .replace(/\u200b/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inlineRich(text) {
  let out = esc(text);

  // Bold common mechanical labels inside rules text.
  out = out.replace(
    /\b(Attack Roll|Hit|Damage|Saving Throw|DC|Melee Attack Roll|Ranged Attack Roll|Spell Attack Roll|Area of Effect):/g,
    "<strong>$1:</strong>"
  );

  // Preserve the emphasis convention used throughout the SRD for named
  // rules features: "Feature Name. Description..."
  return out;
}

function isHeading(line, nextLine = "", prevLine = "") {
  const s = cleanSourceLine(line);
  const next = cleanSourceLine(nextLine);
  const prev = cleanSourceLine(prevLine);
  if (!s) return false;
  if (MAJOR_HEADINGS.has(s)) return true;
  if (STRUCTURED_NAMES.has(s)) return true;

  if (/^Level \d+:/i.test(s)) return true;
  if (/^Core .+ Traits$/i.test(s)) return true;
  if (/^[A-Z][A-Za-z’'&-]+ Features$/.test(s)) return true;

  // Short, title-like standalone headings.
  if (
    s.length <= 48 &&
    !/[.!?:;,]$/.test(s) &&
    /^[A-Z][A-Za-z0-9’'&()\/\-]*(?:\s+[A-Z][A-Za-z0-9’'&()\/\-]*)*$/.test(s) &&
    next.length > 35 &&
    prev.length > 0
  ) {
    return true;
  }

  return false;
}

function isFeatureLine(line) {
  const raw = String(line || "");
  const s = cleanSourceLine(raw);
  if (!s) return false;

  // PDF extraction marks many SRD feature paragraphs with a tab.
  if (/^\t/.test(raw) && /^[A-Z][^.\n]{1,60}\.\s+/.test(s)) return true;

  // Some indented subfeatures lose the tab in extraction.
  if (
    /^[A-Z][A-Za-z’'’\-]+(?:\s+[A-Z][A-Za-z’'’\-]+){0,5}\.\s+/.test(s) &&
    s.length < 180
  ) {
    return true;
  }

  return false;
}

function splitFeatureLine(s) {
  const m = s.match(/^(.+?\.)\s+(.*)$/);
  if (!m) return [s, ""];
  return [m[1], m[2]];
}

function isStatLine(s) {
  const m = s.match(/^([^:]{2,32}):\s*(.+)$/);
  return !!m && STAT_LABELS.has(m[1].trim());
}

/*
  The PDF-to-text export flattens a few tables into a predictable sequence.
  These definitions rebuild the tables without changing any source wording.
*/
const SOURCE_TABLES = {
  "Draconic Ancestors": {
    headers: ["Dragon", "Damage Type", "Dragon", "Damage Type"],
    rows: [
      ["Black", "Acid", "Gold", "Fire"],
      ["Blue", "Lightning", "Green", "Poison"],
      ["Brass", "Fire", "Red", "Fire"],
      ["Bronze", "Lightning", "Silver", "Cold"],
      ["Copper", "Acid", "White", "Cold"]
    ]
  },

  "Elven Lineages": {
    headers: ["Lineage", "Level 1", "Level 3", "Level 5"],
    rows: [
      ["Drow", null, "Faerie Fire", "Darkness"],
      ["High Elf", null, "Detect Magic", "Misty Step"],
      ["Wood Elf", null, "Longstrider", "Pass without Trace"]
    ]
  },

  "Fiendish Legacies": {
    headers: ["Legacy", "Level 1", "Level 3", "Level 5"],
    rows: [
      ["Abyssal", null, "Ray of Sickness", "Hold Person"],
      ["Chthonic", null, "False Life", "Ray of Enfeeblement"],
      ["Infernal", null, "Hellish Rebuke", "Darkness"]
    ]
  }
};

function findTableAt(lines, index, title) {
  const def = SOURCE_TABLES[title];
  if (!def) return null;

  if (cleanSourceLine(lines[index]) !== title) return null;

  let i = index + 1;

  // Skip blank lines and the flattened header cells.
  const headerCount = def.headers.length;
  let seen = 0;
  while (i < lines.length && seen < headerCount) {
    const s = cleanSourceLine(lines[i]);
    if (s) seen++;
    i++;
  }

  const rows = [];

  if (title === "Draconic Ancestors") {
    // Five rows, four cells per row, one line per cell.
    const values = [];
    while (i < lines.length && values.length < 20) {
      const s = cleanSourceLine(lines[i]);
      if (!s) { i++; continue; }
      if (/^\t/.test(lines[i])) break;
      values.push(s);
      i++;
    }
    for (let n = 0; n + 3 < values.length && rows.length < 5; n += 4) {
      rows.push(values.slice(n, n + 4));
    }
  } else {
    // Level-1 cells can wrap; Level-3 and Level-5 entries are single lines.
    const labels = def.rows.map(r => r[0]);
    for (const rowDef of def.rows) {
      const start = i;
      while (i < lines.length && cleanSourceLine(lines[i]) !== rowDef[0]) i++;
      if (i >= lines.length) return null;
      i++; // row label

      const nextLabel = labels[labels.indexOf(rowDef[0]) + 1];
      const cellLines = [];
      while (i < lines.length && (!nextLabel || cleanSourceLine(lines[i]) !== nextLabel)) {
        const s = cleanSourceLine(lines[i]);
        if (s) cellLines.push(s);
        i++;
      }

      if (cellLines.length < 3) return null;
      rows.push([
        rowDef[0],
        cellLines.slice(0, -2).join(" "),
        cellLines[cellLines.length - 2],
        cellLines[cellLines.length - 1]
      ]);
    }
  }

  if (!rows.length) return null;

  // The parser consumed the table. Return the next source-line index.
  return { html: renderSourceTable(title, def.headers, rows), nextIndex: i };
}

function renderSourceTable(title, headers, rows) {
  return `
    <div class="source-table-wrap">
      <table class="source-table">
        <caption>${esc(title)}</caption>
        <thead>
          <tr>
            ${headers.map(h => `<th scope="col">${esc(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map((cell, index) => `
                <td class="${index === 0 ? "table-label" : ""}">
                  ${inlineRich(cell || "—")}
                </td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRichSourceText(text) {
  const rawLines = String(text || "").split("\n");
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const joined = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (joined) {
      blocks.push(`<p class="source-paragraph">${inlineRich(joined)}</p>`);
    }
    paragraph = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const s = cleanSourceLine(raw);

    // Remove PDF running header/footer from the web presentation.
    if (!s || s === "System Reference Document 5.2.1" || /^\d+$/.test(s)) {
      flushParagraph();
      continue;
    }

    const table = findTableAt(rawLines, i, s);
    if (table) {
      flushParagraph();
      blocks.push(table.html);
      i = table.nextIndex - 1;
      continue;
    }

    if (isHeading(s, rawLines[i + 1] || "", rawLines[i - 1] || "")) {
      flushParagraph();
      const level = /^Level \d+:/i.test(s) ? 3 : (
        MAJOR_HEADINGS.has(s) || STRUCTURED_NAMES.has(s) ? 2 : 3
      );
      blocks.push(`<h${level} class="source-heading source-heading-${level}">${esc(s)}</h${level}>`);
      continue;
    }

    if (isStatLine(s)) {
      flushParagraph();
      const m = s.match(/^([^:]{2,32}):\s*(.+)$/);
      blocks.push(`
        <div class="source-stat">
          <strong>${esc(m[1])}</strong>
          <span>${inlineRich(m[2])}</span>
        </div>
      `);
      continue;
    }

    if (/^•\s*/.test(s)) {
      flushParagraph();
      blocks.push(`<div class="source-bullet">${inlineRich(s.replace(/^•\s*/, ""))}</div>`);
      continue;
    }

    if (/^\t/.test(raw) || isFeatureLine(raw)) {
      flushParagraph();
      const [label, body] = splitFeatureLine(s);
      blocks.push(`
        <p class="source-feature">
          <strong>${esc(label)}</strong>${body ? ` ${inlineRich(body)}` : ""}
        </p>
      `);
      continue;
    }

    paragraph.push(s);
  }

  flushParagraph();
  return blocks.join("\n");
}

function renderPage(num) {
  const p = rules.pages.find(
    x => x.page === num
  );

  if (!p) {
    return renderHome();
  }

  renderSidebar(p.section);

  $("#content").innerHTML = `
    <div class="hero source-hero">
      <a class="back-link" href="#/section/${encodeURIComponent(p.section)}">
        ← ${esc(p.section)}
      </a>

      <div class="eyebrow">${esc(p.section)}</div>
      <h1>Source Page ${p.page}</h1>
      <p class="muted">
        Clean reading view of SRD 5.2.1 source page ${p.page}.
      </p>
    </div>

    <article class="rule-page source-page">
      <div class="source-page-toolbar">
        <span>SRD 5.2.1</span>
        <a href="#/page/${Math.max(1, p.page - 1)}">← Previous</a>
        <a href="#/page/${p.page + 1}">Next →</a>
      </div>

      ${renderRichSourceText(p.text)}
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
