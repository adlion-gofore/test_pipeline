import AppDropdown   from "./layouts/partials/ui/app-dropdown";
import DocsNavGroup  from "./layouts/partials/ui/docs-nav-group";
import SingleApp     from "./layouts/docs/single";

const Vue = (window as any).Vue;

Vue.createApp(SingleApp)
  .component("app-dropdown",   AppDropdown)
  .component("docs-nav-group", DocsNavGroup)
  .mount('[data-vue-app="app-root"]');
