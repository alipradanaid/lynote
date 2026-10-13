/* LyNote simple: konten dibaca dari satu file JSON, tanpa database. */
const state = { articles: [], query: "", category: "all" };
const list = document.querySelector("#list");
const search = document.querySelector("#search");
const category = document.querySelector("#category");
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");
const reader = document.querySelector("#reader");
const detail = document.querySelector("#detail");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function safeURL(value = "") {
  try {
    const url = new URL(value, location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value + "T12:00:00");
  return Number.isNaN(date.getTime()) ? value :
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
/* Markdown sederhana agar rangkuman mudah diberi subjudul dan poin penting. */
function inlineMarkdown(value) {
  let text = escapeHTML(value);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (match, label, url) => `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
}
function renderSummary(markdown = "") {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [], listType = "", items = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      output.push(`<${listType}>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`);
      listType = ""; items = [];
    }
  };
  for (const line of lines) {
    const value = line.trim();
    if (!value) { flushParagraph(); flushList(); continue; }
    const heading = value.match(/^#{1,2}\s+(.+)$/);
    const bullet = value.match(/^[-*]\s+(.+)$/);
    const numbered = value.match(/^\d+[.)]\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      output.push(`<h2>${inlineMarkdown(heading[1])}</h2>`);
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (listType && listType !== type) flushList();
      listType = type;
      items.push((bullet || numbered)[1]);
    } else {
      flushList(); paragraph.push(value);
    }
  }
  flushParagraph(); flushList();
  return output.join("");
}
function visibleArticles() {
  const query = state.query.toLocaleLowerCase("id");
  return state.articles.filter(item => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const haystack = [item.title, item.summary, item.sourceTitle, item.sourceAuthor,
      item.category, ...(item.tags || [])].join(" ").toLocaleLowerCase("id");
    return matchesCategory && (!query || haystack.includes(query));
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
function renderList() {
  const articles = visibleArticles();
  count.textContent = `${articles.length} bacaan`;
  list.innerHTML = articles.map(item => `
    <button class="book-item" type="button" data-id="${escapeHTML(item.id)}">
      <span class="item-meta">
        <span class="category-tag">${escapeHTML(item.category || "Bacaan")}</span>
        <span class="item-date">${escapeHTML(formatDate(item.date))}</span>
      </span>
      <span class="item-title">${escapeHTML(item.title)}</span>
      <span class="item-excerpt">${escapeHTML(item.excerpt || item.sourceTitle || "")}</span>
      <span class="item-link">Buka rangkuman ↗</span>
    </button>`).join("");
  empty.hidden = articles.length > 0;
}
function openArticle(id) {
  const item = state.articles.find(article => article.id === id);
  if (!item) return;
  const sourceURL = safeURL(item.sourceUrl || "");
  detail.innerHTML = `
    <div class="detail-category">${escapeHTML(item.category || "Bacaan")}</div>
    <h1>${escapeHTML(item.title)}</h1>
    <div class="source">
      <span class="source-label">Sumber</span>
      <strong>${escapeHTML(item.sourceTitle || "Sumber bacaan belum dicantumkan")}</strong>
      ${item.sourceAuthor ? `<br>${escapeHTML(item.sourceAuthor)}` : ""}
      ${item.sourceYear ? ` · ${escapeHTML(item.sourceYear)}` : ""}
      ${sourceURL ? `<br><a href="${escapeHTML(sourceURL)}" target="_blank" rel="noopener noreferrer">Buka sumber asli ↗</a>` : ""}
    </div>
    <div class="summary">${renderSummary(item.summary || "")}</div>`;
  reader.showModal();
  document.body.style.overflow = "hidden";
}
search.addEventListener("input", event => {
  state.query = event.target.value.trim();
  renderList();
});
category.addEventListener("change", event => {
  state.category = event.target.value;
  renderList();
});
list.addEventListener("click", event => {
  const button = event.target.closest("[data-id]");
  if (button) openArticle(button.dataset.id);
});
document.querySelector("#close").addEventListener("click", () => reader.close());
reader.addEventListener("click", event => {
  if (event.target === reader) reader.close();
});
reader.addEventListener("close", () => { document.body.style.overflow = ""; });

async function init() {
  try {
    const response = await fetch("content/articles.json");
    if (!response.ok) throw new Error("Content file not found");
    const data = await response.json();
    state.articles = Array.isArray(data.articles) ? data.articles : [];
    const categories = [...new Set(state.articles.map(item => item.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "id"));
    category.innerHTML = '<option value="all">Semua kategori</option>' +
      categories.map(value => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");
    renderList();
  } catch {
    list.innerHTML = '<p class="empty">Arsip belum bisa dimuat. Pastikan file content/articles.json tersedia dan buka melalui hosting atau server lokal.</p>';
    count.textContent = "—";
  }
}
init();
