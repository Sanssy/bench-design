const selector = document.querySelector<HTMLElement>("#theme");
if (!selector) throw new Error("Missing theme selector");
const root = document.documentElement;
const buttons = selector.querySelectorAll<HTMLButtonElement>(
  "[data-theme-choice]",
);
function reflectTheme() {
  const theme = root.getAttribute("data-theme") || "system";
  for (const button of buttons) {
    const selected = button.dataset.themeChoice === theme;
    button.setAttribute("aria-pressed", String(selected));
    button.toggleAttribute("data-selected", selected);
  }
}
reflectTheme();
for (const button of buttons) {
  button.addEventListener("click", () => {
    const theme = button.dataset.themeChoice;
    if (theme !== "system" && theme !== "light" && theme !== "dark") return;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    reflectTheme();
    try {
      localStorage.setItem("bench-design-theme", theme);
    } catch {}
  });
}
