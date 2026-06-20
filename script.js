(() => {
  const root = document.documentElement;
  const langBtn = document.getElementById("lang-toggle");
  const year = document.getElementById("year");
  const zhContainer = document.getElementById("content-zh");
  const enContainer = document.getElementById("content-en");

  year.textContent = String(new Date().getFullYear());

  const setLang = (lang) => {
    root.dataset.lang = lang;
    root.lang = lang === "zh" ? "zh-CN" : "en";
    langBtn.textContent = lang === "zh" ? "EN" : "中";
    langBtn.setAttribute("aria-label", lang === "zh" ? "切换到英文" : "Switch to Chinese");
    document.querySelectorAll("[data-anchor]").forEach((link) => {
      link.setAttribute("href", `#${lang}-${link.dataset.anchor}`);
    });
  };

  const escapeHtml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const inline = (value) => {
    let text = escapeHtml(value);
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return text;
  };

  const closeList = (state) => {
    if (!state.list) return "";
    const tag = state.list;
    state.list = "";
    return `</${tag}>`;
  };

  const renderMarkdown = (source, prefix) => {
    const lines = source.split(/\r?\n/);
    const state = { list: "", openSection: false, rawDiv: false, ids: new Set() };
    let html = "";

    const closeSection = () => {
      if (!state.openSection) return "";
      state.openSection = false;
      return `${closeList(state)}</div></section>`;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        html += closeList(state);
        continue;
      }

      if (line === '<div class="qr-center">') {
        html += closeList(state);
        html += '<div class="qr-center">';
        state.rawDiv = true;
        continue;
      }

      if (state.rawDiv && line === "</div>") {
        html += "</div>";
        state.rawDiv = false;
        continue;
      }

      if (line.startsWith("## ")) {
        const title = inline(line.slice(3));
        let id = title.includes("论文") || title.includes("Publication") || title.includes("Working")
          ? "papers"
          : title.includes("项目") || title.includes("Project")
            ? "projects"
            : "";
        if (id && state.ids.has(id)) {
          id = "";
        }
        if (id) {
          state.ids.add(id);
        }
        html += closeSection();
        html += `<section${id ? ` id="${prefix}-${id}"` : ""}><h2>${title}</h2><div class="section-body">`;
        state.openSection = true;
        continue;
      }

      const ordered = line.match(/^\d+\.\s+(.+)$/);
      const bullet = line.match(/^-\s+(.+)$/);

      if (ordered || bullet) {
        const tag = ordered ? "ol" : "ul";
        if (state.list !== tag) {
          html += closeList(state);
          state.list = tag;
          html += `<${tag}>`;
        }
        html += `<li>${inline((ordered || bullet)[1])}</li>`;
        continue;
      }

      html += closeList(state);
      html += `<p>${inline(line)}</p>`;
    }

    html += closeSection();
    return html;
  };

  const loadMarkdown = async (file, container, fallback, prefix) => {
    try {
      const res = await fetch(file, { cache: "no-cache" });
      if (!res.ok) {
        throw new Error(`Failed to load ${file}: ${res.status}`);
      }
      container.innerHTML = renderMarkdown(await res.text(), prefix);
    } catch (err) {
      container.innerHTML = `<section><h2>${fallback}</h2><div class="section-body"><p>${fallback}</p></div></section>`;
      console.error(err);
    }
  };

  langBtn.addEventListener("click", () => {
    setLang(root.dataset.lang === "zh" ? "en" : "zh");
  });

  setLang("zh");

  Promise.all([
    loadMarkdown("content.zh.md", zhContainer, "正文加载失败", "zh"),
    loadMarkdown("content.en.md", enContainer, "Content unavailable", "en"),
  ]);
})();
