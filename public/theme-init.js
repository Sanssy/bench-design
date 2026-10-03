(() => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.hasAttribute("data-theme")) return;
  try {
    const theme = globalThis.localStorage.getItem("bench-design-theme");
    if (theme === "light" || theme === "dark")
      root.setAttribute("data-theme", theme);
  } catch {}
})();
