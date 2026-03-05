(() => {
  const root = document.documentElement;
  const langBtn = document.getElementById("lang-toggle");
  const year = document.getElementById("year");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const pubs = Array.from(document.querySelectorAll(".pub-item"));

  year.textContent = String(new Date().getFullYear());

  const setLang = (lang) => {
    root.dataset.lang = lang;
    root.lang = lang === "zh" ? "zh-CN" : "en";
    langBtn.textContent = lang === "zh" ? "EN" : "中";
    langBtn.setAttribute("aria-label", lang === "zh" ? "切换到英文" : "Switch to Chinese");
  };

  const applyFilter = (filter) => {
    chips.forEach((chip) => {
      const active = chip.dataset.filter === filter;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    pubs.forEach((card) => {
      const tags = (card.dataset.tags || "").split(",").map((s) => s.trim());
      const visible = filter === "all" || tags.includes(filter);
      card.hidden = !visible;
    });
  };

  langBtn.addEventListener("click", () => {
    setLang(root.dataset.lang === "zh" ? "en" : "zh");
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
  });

  setLang("zh");
  applyFilter("all");
})();
