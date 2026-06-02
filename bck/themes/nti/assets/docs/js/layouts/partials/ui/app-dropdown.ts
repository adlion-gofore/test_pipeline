export default {
  template: "#app-dropdown",
  props: {
    items: { type: Array,  default: () => [] },
    label: { type: String, default: "" },
  },
  emits: ["select"],
  data() {
    return { open: false, placementUp: false, placementRight: false };
  },
  mounted(this: any) {
    this._outside = (e: Event) => {
      if (!this.$el.contains(e.target as Node)) this.open = false;
    };
    document.addEventListener("click", this._outside);
  },
  unmounted(this: any) {
    document.removeEventListener("click", this._outside);
  },
  methods: {
    toggleOpen(this: any) {
      if (this.open) {
        this.open = false;
        return;
      }
      const rect = this.$el.getBoundingClientRect();
      this.placementUp    = window.innerHeight - rect.bottom < 200;
      this.placementRight = window.innerWidth  - rect.right  < 160;
      this.open = true;
    },
    onSelect(this: any, item: any) {
      this.$emit("select", item.value ?? item.id);
      this.open = false;
    },
  },
};
