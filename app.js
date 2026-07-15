const selectedEntries = [
  {
    type: "practice",
    id: "P0132",
    tier: "Foundation",
    goal: "Mobility",
    caution: "Keep the range small. Stop with dizziness, radiating pain, or numbness.",
    note: "knowledge/content/practices/P0132-chair-neck-movement.md"
  },
  {
    type: "practice",
    id: "P0003",
    tier: "Foundation",
    goal: "Circulation",
    caution: "Use a comfortable pace and avoid forcing swollen or painful joints.",
    note: "knowledge/content/practices/P0003-ankle-bending.md"
  },
  {
    type: "practice",
    id: "P0069",
    tier: "Breath",
    goal: "Regulation",
    caution: "Avoid breath strain. Keep the inhale and exhale comfortable.",
    note: "knowledge/content/practices/P0069-nadi-suddhi.md"
  },
  {
    type: "practice",
    id: "P0071",
    tier: "Breath",
    goal: "Calming",
    caution: "Reduce volume or stop if vibration, pressure, or anxiety increases.",
    note: "knowledge/content/practices/P0071-bhramari.md"
  },
  {
    type: "practice",
    id: "P0102",
    tier: "Posture",
    goal: "Balance",
    caution: "Use wall or chair support when balance is uncertain.",
    note: "knowledge/content/practices/P0102-vrikshasana.md"
  },
  {
    type: "practice",
    id: "P0101",
    tier: "Posture",
    goal: "Strength",
    caution: "Avoid neck pressure. Use support or skip during acute back or neck pain.",
    note: "knowledge/content/practices/P0101-setubandhasana.md"
  },
  {
    type: "practice",
    id: "P0135",
    tier: "Relaxation",
    goal: "Rest",
    caution: "Choose a stable chair and keep the breath natural.",
    note: "knowledge/content/practices/P0135-chair-relaxation.md"
  },
  {
    type: "practice",
    id: "P0123",
    tier: "Relaxation",
    goal: "Recovery",
    caution: "Modify position if lying still increases discomfort or distress.",
    note: "knowledge/content/practices/P0123-drt.md"
  },
  {
    type: "practice",
    id: "P0169",
    tier: "Relaxation",
    goal: "Integration",
    caution: "Use side-lying or supported rest if lying flat is uncomfortable.",
    note: "knowledge/content/practices/P0169-savasana.md"
  },
  {
    type: "lifestyle",
    id: "LIF010",
    tier: "Lifestyle",
    goal: "Regulation",
    caution: "Use as daily-life guidance, not as a substitute for care.",
    note: "knowledge/lifestyles.ndjson"
  },
  {
    type: "ailment",
    id: "A004",
    tier: "Condition Pathways",
    goal: "Back care",
    caution: "Pain, numbness, weakness, or worsening symptoms require reassessment.",
    note: "knowledge/content/ailments/A004-back-pain.md"
  },
  {
    type: "ailment",
    id: "A005",
    tier: "Condition Pathways",
    goal: "Cardiovascular",
    caution: "Avoid strain and breath retention unless cleared and supervised.",
    note: "knowledge/content/ailments/A005-hypertension.md"
  }
];

const tiers = ["All", ...new Set(selectedEntries.map((entry) => entry.tier))];
const state = {
  query: "",
  tier: "All",
  selectedId: null,
  sequence: [],
  items: []
};

const tierTabs = document.querySelector("#tierTabs");
const itemList = document.querySelector("#itemList");
const search = document.querySelector("#itemSearch");
const resultCount = document.querySelector("#resultCount");
const resetFilters = document.querySelector("#resetFilters");
const detailEmpty = document.querySelector("#detailEmpty");
const detailCard = document.querySelector("#detailCard");
const detailTier = document.querySelector("#detailTier");
const detailTitle = document.querySelector("#detailTitle");
const detailSummary = document.querySelector("#detailSummary");
const detailGoal = document.querySelector("#detailGoal");
const detailCaution = document.querySelector("#detailCaution");
const detailLink = document.querySelector("#detailLink");
const addSelected = document.querySelector("#addSelected");
const sequenceList = document.querySelector("#sequenceList");
const clearSequence = document.querySelector("#clearSequence");
const practiceCount = document.querySelector("#practiceCount");
const conditionCount = document.querySelector("#conditionCount");
const lifestyleCount = document.querySelector("#lifestyleCount");
const sequenceCount = document.querySelector("#sequenceCount");

function parseNdjson(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function loadTable(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  return parseNdjson(await response.text());
}

function entryTitle(entry, record) {
  if (entry.type === "practice") {
    return record.canonical_name || record.english_name || entry.id;
  }
  if (entry.type === "ailment") {
    return record.ailment_name || entry.id;
  }
  return record.name || entry.id;
}

function entrySummary(entry, record) {
  if (entry.type === "practice") {
    return record.description || "Yoga therapy practice reference.";
  }
  if (entry.type === "ailment") {
    return record.meaning_function || "Condition-oriented yoga therapy reference.";
  }
  return record.description || record.instructions || "Lifestyle guidance reference.";
}

function buildItems(tables) {
  const practiceMap = new Map(tables.practices.map((item) => [item.practice_id, item]));
  const ailmentMap = new Map(tables.ailments.map((item) => [item.ailment_id, item]));
  const lifestyleMap = new Map(tables.lifestyles.map((item) => [item.lifestyle_id, item]));

  return selectedEntries
    .map((entry) => {
      const record =
        entry.type === "practice"
          ? practiceMap.get(entry.id)
          : entry.type === "ailment"
            ? ailmentMap.get(entry.id)
            : lifestyleMap.get(entry.id);

      if (!record) {
        return null;
      }

      return {
        ...entry,
        title: entryTitle(entry, record),
        summary: entrySummary(entry, record)
      };
    })
    .filter(Boolean);
}

function selectedItem() {
  return state.items.find((item) => item.id === state.selectedId);
}

function filteredItems() {
  const query = state.query.trim().toLowerCase();
  return state.items.filter((item) => {
    const haystack = [item.tier, item.title, item.goal, item.summary, item.caution]
      .join(" ")
      .toLowerCase();
    return (state.tier === "All" || item.tier === state.tier) && haystack.includes(query);
  });
}

function renderTabs() {
  tierTabs.innerHTML = "";
  tiers.forEach((tier) => {
    const button = document.createElement("button");
    button.className = "tier-tab";
    button.type = "button";
    button.textContent = tier;
    button.classList.toggle("active", tier === state.tier);
    button.addEventListener("click", () => {
      state.tier = tier;
      render();
    });
    tierTabs.append(button);
  });
}

function renderList() {
  const visible = filteredItems();
  itemList.innerHTML = "";
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No references match the current filters.";
    itemList.append(empty);
    return;
  }

  if (!visible.some((item) => item.id === state.selectedId)) {
    state.selectedId = visible[0].id;
  }

  visible.forEach((item) => {
    const button = document.createElement("button");
    button.className = "item-card";
    button.type = "button";
    button.classList.toggle("selected", item.id === state.selectedId);
    button.innerHTML = `
      <span class="item-tier">${item.tier}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
      </div>
      <span class="item-goal">${item.goal}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedId = item.id;
      render();
    });
    itemList.append(button);
  });
}

function renderDetail() {
  const item = selectedItem();
  detailEmpty.classList.toggle("hidden", Boolean(item));
  detailCard.classList.toggle("hidden", !item);

  if (!item) {
    return;
  }

  detailTier.textContent = item.tier;
  detailTitle.textContent = item.title;
  detailSummary.textContent = item.summary;
  detailGoal.textContent = item.goal;
  detailCaution.textContent = item.caution;
  detailLink.href = item.note;
  addSelected.disabled = state.sequence.includes(item.id);
  addSelected.textContent = state.sequence.includes(item.id) ? "Added to sequence" : "Add to sequence";
}

function renderSequence() {
  sequenceList.innerHTML = "";
  sequenceCount.textContent = state.sequence.length;

  if (state.sequence.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Select references from the finder to build a short sequence.";
    sequenceList.append(empty);
    return;
  }

  state.sequence
    .map((id) => state.items.find((item) => item.id === id))
    .filter(Boolean)
    .forEach((item, index) => {
      const row = document.createElement("article");
      row.className = "sequence-item";
      row.innerHTML = `
        <div>
          <strong>${index + 1}. ${item.title}</strong>
          <span>${item.tier} / ${item.goal}</span>
        </div>
        <button class="remove-button" type="button" aria-label="Remove ${item.title}">x</button>
      `;
      row.querySelector("button").addEventListener("click", () => {
        state.sequence = state.sequence.filter((id) => id !== item.id);
        render();
      });
      sequenceList.append(row);
    });
}

function render() {
  renderTabs();
  renderList();
  renderDetail();
  renderSequence();
}

function renderLoadError(error) {
  resultCount.textContent = "Load error";
  itemList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "empty-state";
  message.textContent = error.message;
  itemList.append(message);
}

search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

resetFilters.addEventListener("click", () => {
  state.query = "";
  state.tier = "All";
  search.value = "";
  render();
});

addSelected.addEventListener("click", () => {
  const item = selectedItem();
  if (item && !state.sequence.includes(item.id)) {
    state.sequence.push(item.id);
    render();
  }
});

clearSequence.addEventListener("click", () => {
  state.sequence = [];
  render();
});

async function init() {
  try {
    const [practices, ailments, lifestyles] = await Promise.all([
      loadTable("knowledge/practices.ndjson"),
      loadTable("knowledge/ailments.ndjson"),
      loadTable("knowledge/lifestyles.ndjson")
    ]);

    practiceCount.textContent = practices.filter((practice) => practice.active_flag).length;
    conditionCount.textContent = ailments.length;
    lifestyleCount.textContent = lifestyles.filter((item) => item.active_flag).length;
    state.items = buildItems({ practices, ailments, lifestyles });
    state.selectedId = state.items[0]?.id || null;
    render();
  } catch (error) {
    renderLoadError(error);
  }
}

init();
