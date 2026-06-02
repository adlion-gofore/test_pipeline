import ThemeController from "./theme-controller";

export default {
  mixins: [ThemeController],

  data() {
    return {
      versionItems:   (window as any).__NTI_VERSION_ITEMS__  as any[],
      currentVersion: (window as any).__NTI_CURRENT_VERSION__ as string,
      currentLang:    (window as any).__NTI_CURRENT_LANG__ ? ((window as any).__NTI_CURRENT_LANG__ as string).toUpperCase() : null,
    };
  },

  computed: {
    langItems(this: any): any[] {
      const v = this.versionItems.find((v: any) => v.value === this.currentVersion);
      return v ? v.langs : [];
    },
  },

  methods: {
    pickVersion(this: any, value: string) {
      window.location.href = `/docs/${value}/${this.currentLang.toLowerCase()}/`;
    },

    pickLang(this: any, value: string) {
      window.location.href = `/docs/${this.currentVersion}/${value}/`;
    },
  },
};
