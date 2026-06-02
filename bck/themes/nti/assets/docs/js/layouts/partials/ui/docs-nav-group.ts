export default {
  template: "#docs-nav-group",
  props: {
    initialOpen: { type: Boolean, default: false },
    label:       { type: String,  default: "" },
  },
  data(this: any) {
    return { open: this.initialOpen };
  },
};
