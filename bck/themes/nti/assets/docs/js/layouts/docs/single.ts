import SettingsDrawer from "../partials/docs/settings-drawer";

export default {
  mixins: [SettingsDrawer],

  data() {
    return {
      settingsPanelOpen: false,
      docsNavOpen:       localStorage.getItem("nti-docs-nav-open") === "true",
      showBackToTop:     false,
    };
  },

  methods: {
    toggleSettingsPanel(this: any) {
      this.settingsPanelOpen = !this.settingsPanelOpen;
    },

    toggleDocsNav(this: any) {
      this.docsNavOpen = !this.docsNavOpen;
      localStorage.setItem("nti-docs-nav-open", String(this.docsNavOpen));
    },

    onBodyScroll(this: any, e: Event) {
      this.showBackToTop = (e.target as HTMLElement).scrollTop > 300;
    },

    scrollToTop(this: any) {
      (this.$refs.bodyEl as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
