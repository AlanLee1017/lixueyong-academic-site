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
  };

  const renderMarkdown = async (file, container, fallback) => {
    try {
      const res = await fetch(file, { cache: "no-cache" });
      if (!res.ok) {
        throw new Error(`Failed to load ${file}: ${res.status}`);
      }
      const text = await res.text();
      container.innerHTML = marked.parse(text);
    } catch (err) {
      container.innerHTML = `<p>${fallback}</p>`;
      console.error(err);
    }
  };

  langBtn.addEventListener("click", () => {
    setLang(root.dataset.lang === "zh" ? "en" : "zh");
  });

  setLang("zh");

  Promise.all([
    renderMarkdown("content.zh.md", zhContainer, "正文加载失败，请检查 content.zh.md。"),
    renderMarkdown("content.en.md", enContainer, "Failed to load content.en.md."),
  ]);
})();
