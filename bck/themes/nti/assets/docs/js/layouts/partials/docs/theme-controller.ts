export default {
  data(this: any) {
    const raw    = (window as any).__NTI_THEMES__ as any[];
    const stored = localStorage.getItem("nti-themes");
    const themes = stored ? JSON.parse(stored) as any[] : raw.map((t: any) => ({ ...t }));
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    let selected = themes.find((t: any) => t.selected);
    if (!selected) {
      selected = (
        themes.find((t: any) => t.dark === isDark && t.default) ??
        themes.find((t: any) => t.dark === isDark) ??
        themes.find((t: any) => !t.dark) ??
        themes[0]
      );
      if (selected) selected.selected = true;
    }

    return { themes, selectedTheme: selected };
  },

  computed: {
    themeItems(this: any) {
      return this.themes.map((t: any) => ({
        label:  t.label,
        value:  t.id,
        active: t.id === this.selectedTheme.id,
      }));
    },
  },

  mounted(this: any) {
    this.applyTheme();
  },

  methods: {
    pick(this: any, id: string) {
      const picked = this.themes.find((t: any) => t.id === id);
      if (!picked) return;
      this.themes.forEach((t: any) => {
        t.selected = t.id === id;
        if (t.dark === picked.dark) t.default = t.id === id;
      });
      this.selectedTheme = picked;
      this.persistTheme();
      this.applyTheme();
    },

    toggle(this: any) {
      const next =
        this.themes.find((t: any) => t.dark !== this.selectedTheme.dark && t.default) ??
        this.themes.find((t: any) => t.dark !== this.selectedTheme.dark);
      if (next) this.pick(next.id);
    },

    applyTheme(this: any) {
      document.documentElement.setAttribute("data-theme", this.selectedTheme.id);
    },

    persistTheme(this: any) {
      localStorage.setItem("nti-themes", JSON.stringify(this.themes));
    },
  },
};
