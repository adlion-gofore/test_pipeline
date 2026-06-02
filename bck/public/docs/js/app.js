"use strict";
(() => {
  // ns-hugo-imp:/home/kristian/Desktop/natitec/documentation/themes/nti/assets/docs/js/layouts/partials/ui/app-dropdown.ts
  var app_dropdown_default = {
    template: "#app-dropdown",
    props: {
      items: { type: Array, default: () => [] },
      label: { type: String, default: "" }
    },
    emits: ["select"],
    data() {
      return { open: false, placementUp: false, placementRight: false };
    },
    mounted() {
      this._outside = (e) => {
        if (!this.$el.contains(e.target)) this.open = false;
      };
      document.addEventListener("click", this._outside);
    },
    unmounted() {
      document.removeEventListener("click", this._outside);
    },
    methods: {
      toggleOpen() {
        if (this.open) {
          this.open = false;
          return;
        }
        const rect = this.$el.getBoundingClientRect();
        this.placementUp = window.innerHeight - rect.bottom < 200;
        this.placementRight = window.innerWidth - rect.right < 160;
        this.open = true;
      },
      onSelect(item) {
        this.$emit("select", item.value ?? item.id);
        this.open = false;
      }
    }
  };

  // ns-hugo-imp:/home/kristian/Desktop/natitec/documentation/themes/nti/assets/docs/js/layouts/partials/ui/docs-nav-group.ts
  var docs_nav_group_default = {
    template: "#docs-nav-group",
    props: {
      initialOpen: { type: Boolean, default: false },
      label: { type: String, default: "" }
    },
    data() {
      return { open: this.initialOpen };
    }
  };

  // ns-hugo-imp:/home/kristian/Desktop/natitec/documentation/themes/nti/assets/docs/js/layouts/partials/docs/theme-controller.ts
  var theme_controller_default = {
    data() {
      const raw = window.__NTI_THEMES__;
      const stored = localStorage.getItem("nti-themes");
      const themes = stored ? JSON.parse(stored) : raw.map((t) => ({ ...t }));
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      let selected = themes.find((t) => t.selected);
      if (!selected) {
        selected = themes.find((t) => t.dark === isDark && t.default) ?? themes.find((t) => t.dark === isDark) ?? themes.find((t) => !t.dark) ?? themes[0];
        if (selected) selected.selected = true;
      }
      return { themes, selectedTheme: selected };
    },
    computed: {
      themeItems() {
        return this.themes.map((t) => ({
          label: t.label,
          value: t.id,
          active: t.id === this.selectedTheme.id
        }));
      }
    },
    mounted() {
      this.applyTheme();
    },
    methods: {
      pick(id) {
        const picked = this.themes.find((t) => t.id === id);
        if (!picked) return;
        this.themes.forEach((t) => {
          t.selected = t.id === id;
          if (t.dark === picked.dark) t.default = t.id === id;
        });
        this.selectedTheme = picked;
        this.persistTheme();
        this.applyTheme();
      },
      toggle() {
        const next = this.themes.find((t) => t.dark !== this.selectedTheme.dark && t.default) ?? this.themes.find((t) => t.dark !== this.selectedTheme.dark);
        if (next) this.pick(next.id);
      },
      applyTheme() {
        document.documentElement.setAttribute("data-theme", this.selectedTheme.id);
      },
      persistTheme() {
        localStorage.setItem("nti-themes", JSON.stringify(this.themes));
      }
    }
  };

  // ns-hugo-imp:/home/kristian/Desktop/natitec/documentation/themes/nti/assets/docs/js/layouts/partials/docs/settings-drawer.ts
  var settings_drawer_default = {
    mixins: [theme_controller_default],
    data() {
      return {
        versionItems: window.__NTI_VERSION_ITEMS__,
        currentVersion: window.__NTI_CURRENT_VERSION__,
        currentLang: window.__NTI_CURRENT_LANG__ ? window.__NTI_CURRENT_LANG__.toUpperCase() : null
      };
    },
    computed: {
      langItems() {
        const v = this.versionItems.find((v2) => v2.value === this.currentVersion);
        return v ? v.langs : [];
      }
    },
    methods: {
      pickVersion(value) {
        window.location.href = `/docs/${value}/${this.currentLang.toLowerCase()}/`;
      },
      pickLang(value) {
        window.location.href = `/docs/${this.currentVersion}/${value}/`;
      }
    }
  };

  // ns-hugo-imp:/home/kristian/Desktop/natitec/documentation/themes/nti/assets/docs/js/layouts/docs/single.ts
  var single_default = {
    mixins: [settings_drawer_default],
    data() {
      return {
        settingsPanelOpen: false,
        docsNavOpen: localStorage.getItem("nti-docs-nav-open") === "true",
        showBackToTop: false
      };
    },
    methods: {
      toggleSettingsPanel() {
        this.settingsPanelOpen = !this.settingsPanelOpen;
      },
      toggleDocsNav() {
        this.docsNavOpen = !this.docsNavOpen;
        localStorage.setItem("nti-docs-nav-open", String(this.docsNavOpen));
      },
      onBodyScroll(e) {
        this.showBackToTop = e.target.scrollTop > 300;
      },
      scrollToTop() {
        this.$refs.bodyEl.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // <stdin>
  var Vue = window.Vue;
  Vue.createApp(single_default).component("app-dropdown", app_dropdown_default).component("docs-nav-group", docs_nav_group_default).mount('[data-vue-app="app-root"]');
})();
