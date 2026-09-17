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

function sourceLines(start, end) {
  return rules.pages.filter(p => p.page >= start && p.page <= end)
    .map(p => p.text)
    .join("\n")
    .replace(/\u200b/g, "")
    .split(/\r?\n/)
    .map(x => x.replace(/\u00a0/g, " ").trim());
}

function stripChrome(lines) {
  return lines.filter((line, i) => {
    if (line === "System Reference Document 5.2.1") return false;
    if (/^\d{1,3}$/.test(line) && lines[i - 1] === "System Reference Document 5.2.1") return false;
    return true;
  });
}

const CLASS_TABLE_HEADERS = {
  Barbarian:["Level","Proficiency Bonus","Class Features","Rages","Rage Damage","Weapon Mastery"],
  Bard:["Level","Proficiency Bonus","Class Features","Bardic Die","Cantrips","Prepared Spells","1","2","3","4","5","6","7","8","9"],
  Cleric:["Level","Proficiency Bonus","Class Features","Channel Divinity","Cantrips","Prepared Spells","1","2","3","4","5","6","7","8","9"],
  Druid:["Level","Proficiency Bonus","Class Features","Cantrips","Wild Shape","Prepared Spells","1","2","3","4","5","6","7","8","9"],
  Fighter:["Level","Proficiency Bonus","Class Features","Second Wind","Weapon Mastery"],
  Monk:["Level","Proficiency Bonus","Class Features","Martial Arts","Focus Points","Unarmored Movement"],
  Paladin:["Level","Proficiency Bonus","Class Features","Channel Divinity","Prepared Spells","1","2","3","4","5"],
  Ranger:["Level","Proficiency Bonus","Class Features","Favored Enemy","Prepared Spells","1","2","3","4","5"],
  Rogue:["Level","Proficiency Bonus","Class Features","Sneak Attack"],
  Sorcerer:["Level","Proficiency Bonus","Class Features","Sorcery Points","Cantrips","Prepared Spells","1","2","3","4","5","6","7","8","9"],
  Warlock:["Level","Proficiency Bonus","Class Features","Eldritch Invocations","Cantrips","Prepared Spells","Spell Slots","Slot Level"],
  Wizard:["Level","Proficiency Bonus","Class Features","Cantrips","Prepared Spells","1","2","3","4","5","6","7","8","9"]
};

function isolateClassLines(name, start, end) {
  const lines=stripChrome(sourceLines(start,end));
  const begin=lines.findIndex((x,i)=>x===name && lines[i+1]===`Core ${name} Traits`);
  if(begin<0) return lines;
  const classNames=STRUCTURED.classes.map(x=>x[1]).filter(x=>x!==name);
  let stop=lines.length;
  for(let i=begin+2;i<lines.length-1;i++) {
    if(classNames.includes(lines[i]) && lines[i+1]===`Core ${lines[i]} Traits`) { stop=i; break; }
  }
  return lines.slice(begin,stop);
}

function parseCoreTraitRows(lines,name) {
  const labels=["Primary Ability","Hit Point Die","Saving Throw Proficiencies","Skill Proficiencies","Weapon Proficiencies","Tool Proficiencies","Armor Training","Starting Equipment"];
  const start=lines.indexOf(`Core ${name} Traits`);
  const stop=lines.indexOf(`Becoming a ${name} …`);
  if(start<0) return [];
  const part=lines.slice(start+1,stop>start?stop:start+60);
  const rows=[];
  for(let i=0;i<part.length;i++) if(labels.includes(part[i])) {
    const value=[];
    for(let j=i+1;j<part.length;j++) {
      if(labels.includes(part[j]) || part[j]===`Becoming a ${name} …`) break;
      value.push(part[j]);
    }
    rows.push([part[i],value.join(" ")]);
  }
  return rows;
}

function parseClassProgression(lines,name,headers) {
  const ti=lines.indexOf(`${name} Features`);
  if(ti<0) return [];
  const extras=Math.max(0,headers.length-3);
  const candidates=Array.from({length:21},()=>[]);
  for(let i=ti+1;i<lines.length-1;i++) {
    const n=Number(lines[i]);
    if(n>=1 && n<=20 && String(n)===lines[i] && /^\+\d+$/.test(lines[i+1])) candidates[n].push(i);
  }
  const first=candidates[1][0];
  if(first==null) return [];
  const memo=new Map();
  function solve(level,pos) {
    const key=level+":"+pos;
    if(memo.has(key)) return memo.get(key);
    if(level===21) return [];
    for(const cand of candidates[level]) {
      if(cand<pos) continue;
      if(level===1 && cand!==first) continue;
      if(level===20) { memo.set(key,[cand]); return [cand]; }
      for(const next of candidates[level+1]) {
        if(next<cand+3+extras) continue;
        const rest=solve(level+1,next);
        if(rest!==null) { const ans=[cand,...rest]; memo.set(key,ans); return ans; }
      }
    }
    memo.set(key,null); return null;
  }
  const starts=solve(1,first);
  if(!starts || starts.length!==20) return [];
  const rows=[];
  for(let k=0;k<starts.length;k++) {
    const block=lines.slice(starts[k],starts[k+1]??lines.length).filter(Boolean);
    if(block[0]!==String(k+1) || block.length<3+extras) continue;
    const cut=block.length-extras;
    const row=[block[0],block[1],block.slice(2,cut).join(" ")];
    if(extras) row.push(...block.slice(cut));
    rows.push(row);
  }
  return rows;
}

function isClassFeatureHeading(line) { return /^Level \d+:\s+\S/.test(line); }
function isClassSubclassHeading(line) { return /^(?:Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard) Subclass:/.test(line); }
function isSpellListHeading(line) { return /^(?:Cantrips \(Level 0 .+ Spells\)|Level [1-9] .+ Spells)$/.test(line); }

function parseClassFeatures(lines,name) {
  const items=[]; let current=null, mode="features";
  for(const line of lines) {
    if(isSpellListHeading(line)) { mode="spells"; if(current){items.push(current);current=null;} continue; }
    if(mode==="spells") { if(isClassSubclassHeading(line)) mode="features"; else continue; }
    if(isClassSubclassHeading(line)) {
      if(current) items.push(current);
      current={type:"subclass",title:line.replace(`${name} Subclass:` ,"").trim(),body:[],features:[]};
      continue;
    }
    if(isClassFeatureHeading(line)) {
      if(current && current.type==="feature") items.push(current);
      const m=line.match(/^Level (\d+):\s*(.+)$/);
      current={type:"feature",level:Number(m[1]),title:m[2],body:[]};
      continue;
    }
    if(current) current.body.push(line);
  }
  if(current) items.push(current);
  const grouped=[]; let active=null;
  for(const item of items) {
    if(item.type==="subclass") { item.intro=item.body.join(" "); delete item.body; item.features=[]; active=item; grouped.push(item); }
    else if(item.type==="feature") { if(active) active.features.push(item); else grouped.push(item); }
  }
  return grouped;
}

function parseSpellLists(lines,name) {
  const lists=[];
  for(let i=0;i<lines.length;i++) {
    if(!isSpellListHeading(lines[i]) || !lines[i].includes(name)) continue;
    const raw=[];
    for(let j=i+1;j<lines.length;j++) {
      if(isSpellListHeading(lines[j]) || isClassSubclassHeading(lines[j])) break;
      if(["Spell","School","Special","System Reference Document 5.2.1"].includes(lines[j]) || !lines[j]) continue;
      raw.push(lines[j]);
    }
    const rows=[];
    for(let k=0;k+2<raw.length;k+=3) rows.push([raw[k],raw[k+1],raw[k+2]]);
    if(rows.length) lists.push({title:lines[i],rows});
  }
  return lists;
}

function renderStructuredClass(entry) {
  const lines=isolateClassLines(entry.name,entry.start,entry.end);
  const headers=CLASS_TABLE_HEADERS[entry.name];
  const core=parseCoreTraitRows(lines,entry.name);
  const progression=parseClassProgression(lines,entry.name,headers);
  const features=parseClassFeatures(lines,entry.name);
  const spells=parseSpellLists(lines,entry.name);
  let featureHtml="", subclassHtml="";
  for(const f of features) {
    if(f.type==="feature") featureHtml+=`<article class="feature-card"><div class="feature-level">Level ${f.level}</div><h3>${esc(f.title)}</h3>${renderStructuredBody(f.body)}</article>`;
    else subclassHtml+=`<section class="subclass-section"><div class="eyebrow">Subclass</div><h2>${esc(f.title)}</h2>${f.intro?`<p class="subclass-intro">${renderStructuredBody([f.intro])}</p>`:""}${f.features.map(x=>`<article class="feature-card"><div class="feature-level">Level ${x.level}</div><h3>${esc(x.title)}</h3>${renderStructuredBody(x.body)}</article>`).join("")}</section>`;
  }
  const coreTable=renderStructuredTable("Core Traits",["Trait","Value"],core,"core-traits");
  const progTable=renderStructuredTable(`${entry.name} Features`,headers,progression,"class-progression");
  const spellHtml=spells.length?`<section class="spell-section"><div class="eyebrow">Spell List</div><h2>${esc(entry.name)} Spells</h2>${spells.map(x=>`<details><summary>${esc(x.title)}</summary>${renderStructuredTable("",["Spell","School","Special"],x.rows,"spell-table")}</details>`).join("")}</section>`:"";
  renderSidebar(undefined,"classes");
  $("#content").innerHTML=`<div class="hero entity-hero"><a class="back-link" href="#/category/classes">← Classes</a><div class="eyebrow">Class</div><h1>${esc(entry.name)}</h1><p class="muted">Structured class reference from the supplied SRD 5.2.1 source pages.</p><div class="source-chip-row">${Array.from({length:entry.end-entry.start+1},(_,i)=>`<a class="source-chip" href="#/page/${entry.start+i}">Source p. ${entry.start+i}</a>`).join("")}</div></div><article class="structured-entry">${coreTable}${progTable}<section class="feature-section"><div class="eyebrow">Class Features</div><h2>${esc(entry.name)} Features</h2>${featureHtml||`<p class="muted">No class feature headings could be parsed from the supplied source range.</p>`}</section>${subclassHtml}${spellHtml}<div class="source-note">The structured page reorganizes source text; use the source-page links above for the original extracted page view.</div></article>`;
}

function renderStructuredBody(lines) {
  const clean=lines.filter(Boolean);
  let html="",para=[],list=[];
  const flushPara=()=>{if(para.length){html+=`<p>${formatStructuredInline(para.join(" "))}</p>`;para=[];}};
  const flushList=()=>{if(list.length){html+=`<ul class="feature-list">${list.map(x=>`<li>${formatStructuredInline(x)}</li>`).join("")}</ul>`;list=[];}};
  for(const raw of clean) {
    if(raw.startsWith("•")){flushPara();list.push(raw.replace(/^•\s*/,""));}
    else if(raw.startsWith("– ")||raw.startsWith("- ")){flushPara();list.push(raw.replace(/^(?:–|- )/,""));}
    else {flushList();para.push(raw);}
  }
  flushPara();flushList(); return html;
}

function formatStructuredInline(text) {
  let s=esc(text);
  s=s.replace(/^([A-Z][A-Za-z0-9’'()\-+/, ]{1,70}\.)\s+/,"<strong>$1</strong> ");
  s=s.replace(/\b(Advantage|Disadvantage|Bonus Action|Reaction|D20 Test|Critical Hit|Long Rest|Short Rest|Proficiency Bonus|Spell Save DC|Saving Throw|Hit Points|Temporary Hit Points|Resistance|Immunity|Vulnerability|Concentration)\b/g,"<em>$1</em>");
  return s;
}

function renderStructuredTable(title,headers,rows,klass="") {
  if(!rows.length) return "";
  return `<section class="table-section ${klass}">${title?`<h3>${esc(title)}</h3>`:""}<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${i===0?"level-cell":""}">${formatStructuredInline(String(v))}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
}

function parseSpeciesStructured(entry) {
  const lines=stripChrome(sourceLines(84,86));
  const begin=lines.findIndex((x,i)=>x===entry.name && /^Creature Type:/.test(lines[i+1]||""));
  if(begin<0) return null;
  const names=STRUCTURED.species.map(x=>x[1]); let stop=lines.length;
  for(let i=begin+1;i<lines.length-1;i++) if(names.includes(lines[i]) && /^Creature Type:/.test(lines[i+1]||"")){stop=i;break;}
  const part=lines.slice(begin,stop), stats=[];
  for(const label of ["Creature Type:","Size:","Speed:"]) {const i=part.findIndex(x=>x.startsWith(label)); if(i>=0) stats.push([label.slice(0,-1),part[i].slice(label.length).trim()]);}
  const traitStart=part.findIndex(x=>x.startsWith(`As a ${entry.name},`));
  const body=traitStart>=0?part.slice(traitStart+1):[];
  const traits=[]; let cur=null;
  for(const line of body){
    if(/^[A-Z][A-Za-z0-9’'()\-+ ]{1,55}\.\s+/.test(line) && !line.endsWith(":") && !["You also", "When you"].some(x=>line.startsWith(x))){
      if(cur) traits.push(cur); const m=line.match(/^(.+?)\.\s+(.*)$/); cur={title:m[1],body:[m[2]]};
    } else if(cur) cur.body.push(line);
  }
  if(cur) traits.push(cur);
  return {stats,traits,part};
}

function getSpeciesTables(name) {
  if(name==="Dragonborn") return [{title:"Draconic Ancestors",headers:["Dragon","Damage Type","Dragon","Damage Type"],rows:[
    ["Black","Acid","Gold","Fire"],["Blue","Lightning","Green","Poison"],["Brass","Fire","Red","Fire"],
    ["Bronze","Lightning","Silver","Cold"],["Copper","Acid","White","Cold"]
  ]}];
  if(name==="Elf") return [{title:"Elven Lineages",headers:["Lineage","Level 1","Level 3","Level 5"],rows:[
    ["Drow","The range of your Darkvision increases to 120 feet. You also know the Dancing Lights cantrip.","Faerie Fire","Darkness"],
    ["High Elf","You know the Prestidigitation cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Wizard spell list.","Detect Magic","Misty Step"],
    ["Wood Elf","Your Speed increases to 35 feet. You also know the Druidcraft cantrip.","Longstrider","Pass without Trace"]
  ]}];
  if(name==="Tiefling") return [{title:"Fiendish Legacies",headers:["Legacy","Level 1","Level 3","Level 5"],rows:[
    ["Abyssal","You have Resistance to Poison damage. You also know the Poison Spray cantrip.","Ray of Sickness","Hold Person"],
    ["Chthonic","You have Resistance to Necrotic damage. You also know the Chill Touch cantrip.","False Life","Ray of Enfeeblement"],
    ["Infernal","You have Resistance to Fire damage. You also know the Fire Bolt cantrip.","Hellish Rebuke","Darkness"]
  ]}];
  return [];
}

function renderStructuredSpecies(entry){
  const s=parseSpeciesStructured(entry); if(!s) return renderEntityFallback(entry,"species");
  const table=renderStructuredTable("Species Traits",["Trait","Value"],s.stats,"species-stats");
  const traits=s.traits.map(t=>`<article class="feature-card"><h3>${esc(t.title)}</h3>${renderStructuredBody(t.body)}</article>`).join("");
  const speciesTables=getSpeciesTables(entry.name).map(t=>renderStructuredTable(t.title,t.headers,t.rows,"species-table")).join("");
  renderSidebar(undefined,"species");
  $("#content").innerHTML=`<div class="hero entity-hero"><a class="back-link" href="#/category/species">← Species</a><div class="eyebrow">Species</div><h1>${esc(entry.name)}</h1><p class="muted">Structured species reference from Character Origins.</p></div><article class="structured-entry">${table}<section class="feature-section"><div class="eyebrow">Special Traits</div><h2>${esc(entry.name)} Traits</h2>${traits}</section>${speciesTables}<div class="source-note"><a href="#/page/84">Open source pages →</a></div></article>`;
}

function parseBackgroundStructured(entry){
  const lines=stripChrome(sourceLines(83,83)); const names=STRUCTURED.backgrounds.map(x=>x[1]); const begin=lines.indexOf(entry.name); if(begin<0)return null; let stop=lines.length; for(let i=begin+1;i<lines.length;i++) if(names.includes(lines[i])){stop=i;break;} const part=lines.slice(begin,stop),fields=[]; for(const line of part){const m=line.match(/^(Ability Scores|Feat|Skill Proficiencies|Tool Proficiency|Equipment):\s*(.*)$/); if(m)fields.push([m[1],m[2]]); else if(fields.length)fields[fields.length-1][1]+=" "+line;} return fields;
}
function renderStructuredBackground(entry){const fields=parseBackgroundStructured(entry); if(!fields)return renderEntityFallback(entry,"backgrounds"); renderSidebar(undefined,"backgrounds"); $("#content").innerHTML=`<div class="hero entity-hero"><a class="back-link" href="#/category/backgrounds">← Backgrounds</a><div class="eyebrow">Background</div><h1>${esc(entry.name)}</h1><p class="muted">Structured character background from Character Origins.</p></div><article class="structured-entry">${renderStructuredTable("",["Part","Details"],fields,"background-table")}<div class="source-note"><a href="#/page/83">Open source page →</a></div></article>`;}

function renderEntityFallback(entry,category){
  const pages=rules.pages.filter(p=>p.page>=entry.start&&p.page<=entry.end);
  renderSidebar(undefined,category);
  $("#content").innerHTML=`<div class="hero entity-hero"><a href="#/category/${category}">← ${esc(structuredCategoryTitle(category))}</a><div class="eyebrow">${esc(structuredCategoryTitle(category))}</div><h1>${esc(entry.name)}</h1></div><article class="rule-page entity-page">${pages.map(p=>`<section class="entity-source-page"><h2>Source Page ${p.page}</h2>${renderRichSourceText(p.text)}</section>`).join("")}</article>`;
}

function renderEntity(category, slug) {
  const entry = structuredEntries(category).find(e => e.slug === slug);
  if (!entry) return renderHome();
  if (category === "classes") return renderStructuredClass(entry);
  if (category === "species") return renderStructuredSpecies(entry);
  if (category === "backgrounds") return renderStructuredBackground(entry);
  return renderEntityFallback(entry, category);
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
/*
  Tables that are flattened by the PDF text extractor are rebuilt here.
  The cell text is taken directly from the supplied SRD source pages.
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
    ],
    endMarker: "White"
  },

  "Elven Lineages": {
    headers: ["Lineage", "Level 1", "Level 3", "Level 5"],
    rows: [
      ["Drow", "The range of your Darkvision increases to 120 feet. You also know the Dancing Lights cantrip.", "Faerie Fire", "Darkness"],
      ["High Elf", "You know the Prestidigitation cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Wizard spell list.", "Detect Magic", "Misty Step"],
      ["Wood Elf", "Your Speed increases to 35 feet. You also know the Druidcraft cantrip.", "Longstrider", "Pass without Trace"]
    ],
    endMarker: "Pass without Trace"
  },

  "Fiendish Legacies": {
    headers: ["Legacy", "Level 1", "Level 3", "Level 5"],
    rows: [
      ["Abyssal", "You have Resistance to Poison damage. You also know the Poison Spray cantrip.", "Ray of Sickness", "Hold Person"],
      ["Chthonic", "You have Resistance to Necrotic damage. You also know the Chill Touch cantrip.", "False Life", "Ray of Enfeeblement"],
      ["Infernal", "You have Resistance to Fire damage. You also know the Fire Bolt cantrip.", "Hellish Rebuke", "Darkness"]
    ],
    endMarker: "Darkness"
  }
};

function renderSourceTable(title, def) {
  return `
    <div class="source-table-wrap">
      <table class="source-table">
        <caption>${esc(title)}</caption>
        <thead>
          <tr>
            ${def.headers.map(h => `<th scope="col">${esc(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${def.rows.map(row => `
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

function findTableAt(lines, index, title) {
  const def = SOURCE_TABLES[title];
  if (!def || cleanSourceLine(lines[index]) !== title) return null;

  let endIndex = index + 1;
  while (endIndex < lines.length) {
    if (cleanSourceLine(lines[endIndex]) === def.endMarker) {
      const consume = title === "Draconic Ancestors" ? 2 : 1;
      return {
        html: renderSourceTable(title, def),
        nextIndex: endIndex + consume
      };
    }
    endIndex++;
  }

  return null;
}

function isFeatureStart(s) {
  /*
    SRD feature names are generally extracted as:
      Feature Name. Description...
      Feature Name (Parenthetical). Description...
    This deliberately requires title-like words so normal prose such as
    "When you..." is not mistaken for a feature.
  */
  return /^[A-Z][A-Za-z’'&-]*(?:\s+[A-Z][A-Za-z’'&-]*){0,7}(?:\s+\([^)]{1,45}\))?\.\s+/.test(s);
}

function splitFeatureLine(s) {
  const m = s.match(/^(.+?\.)\s+(.*)$/);
  if (!m) return [s, ""];
  return [m[1], m[2]];
}

function isHeading(line, nextLine = "", prevLine = "") {
  const s = cleanSourceLine(line);
  if (!s) return false;

  if (MAJOR_HEADINGS.has(s) || STRUCTURED_NAMES.has(s)) return true;
  if (/^Core .+ Traits$/i.test(s)) return true;
  if (/^[A-Z][A-Za-z’'&-]+ Features$/.test(s)) return true;

  /*
    Small section labels that occur repeatedly in the SRD.
    Keep this list explicit; generic "all title-case lines are headings"
    produces false positives such as table columns.
  */
  const commonHeadings = new Set([
    "Species Descriptions",
    "Class Features",
    "Subclass Features",
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
    "Level 5",
    "Level 6",
    "Level 7",
    "Level 8",
    "Level 9",
    "Level 10",
    "Level 11",
    "Level 12",
    "Level 13",
    "Level 14",
    "Level 15",
    "Level 16",
    "Level 17",
    "Level 18",
    "Level 19",
    "Level 20",
    "General Rules",
    "Subclass",
    "Multiclassing",
    "Creating a Character",
    "Building a Character",
    "Ability Scores",
    "Proficiencies",
    "Equipment",
    "Starting Equipment"
  ]);

  return commonHeadings.has(s);
}

function isStatLine(s) {
  const m = s.match(/^([^:]{2,40}):\s*(.+)$/);
  return !!m && STAT_LABELS.has(m[1].trim());
}

function isBulletLine(s) {
  return /^•\s+/.test(s) || /^[-–]\s+/.test(s);
}

function renderRichSourceText(text) {
  const rawLines = String(text || "").split("\n");
  const lines = rawLines.map(cleanSourceLine);
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

  const nextMeaningful = (from) => {
    for (let j = from; j < lines.length; j++) {
      if (lines[j] && lines[j] !== "System Reference Document 5.2.1" && !/^\d+$/.test(lines[j])) {
        return lines[j];
      }
    }
    return "";
  };

  for (let i = 0; i < lines.length; i++) {
    const s = lines[i];
    const raw = rawLines[i];

    if (!s || s === "System Reference Document 5.2.1" || /^\d+$/.test(s)) {
      flushParagraph();
      continue;
    }

    const table = findTableAt(lines, i, s);
    if (table) {
      flushParagraph();
      blocks.push(table.html);
      i = table.nextIndex - 1;
      continue;
    }

    if (isHeading(s, nextMeaningful(i + 1), i > 0 ? lines[i - 1] : "")) {
      flushParagraph();

      const level =
        STRUCTURED_NAMES.has(s) ? 2 :
        MAJOR_HEADINGS.has(s) ? 2 :
        /^Core .+ Traits$/i.test(s) ? 3 :
        /^[A-Z][A-Za-z’'&-]+ Features$/.test(s) ? 3 :
        3;

      blocks.push(`<h${level} class="source-heading source-heading-${level}">${esc(s)}</h${level}>`);
      continue;
    }

    if (isStatLine(s)) {
      flushParagraph();
      const m = s.match(/^([^:]{2,40}):\s*(.+)$/);
      blocks.push(`
        <div class="source-stat">
          <strong>${esc(m[1])}</strong>
          <span>${inlineRich(m[2])}</span>
        </div>
      `);
      continue;
    }

    if (isBulletLine(s)) {
      flushParagraph();
      blocks.push(`<div class="source-bullet">${inlineRich(s.replace(/^(?:•|[-–])\s+/, ""))}</div>`);
      continue;
    }

    if (isFeatureStart(s)) {
      flushParagraph();

      const [label, firstBody] = splitFeatureLine(s);
      const body = [firstBody];

      /*
        Join wrapped lines belonging to this feature until another feature,
        heading, table, stat line, or bullet begins.
      */
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j];
        if (!next || next === "System Reference Document 5.2.1" || /^\d+$/.test(next)) {
          j++;
          continue;
        }
        if (
          SOURCE_TABLES[next] ||
          isHeading(next, lines[j + 1] || "", lines[j - 1] || "") ||
          isStatLine(next) ||
          isBulletLine(next) ||
          isFeatureStart(next)
        ) {
          break;
        }
        body.push(next);
        j++;
      }

      blocks.push(`
        <div class="source-feature">
          <div class="feature-label">${esc(label)}</div>
          <div class="feature-body">${inlineRich(body.join(" ").replace(/\s+/g, " ").trim())}</div>
        </div>
      `);

      i = j - 1;
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
