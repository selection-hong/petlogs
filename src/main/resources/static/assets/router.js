/* PetLogs — 해시 라우터 + 루트 앱 + 마운트 */

const routes = [
  { re: /^#\/login\/?$/,                 comp: LoginView,         bare: true, public: true },
  { re: /^#\/signup\/?$/,                comp: SignupView,        bare: true, public: true },
  { re: /^#\/survey\/(.+)$/,             comp: PublicSurveyView,  bare: true, public: true, params: ["token"] },
  { re: /^#\/?$/,                        comp: DashboardView,     nav: "dashboard" },
  { re: /^#\/dashboard\/?$/,             comp: DashboardView,     nav: "dashboard" },
  { re: /^#\/clients\/?$/,               comp: ClientsView,       nav: "clients" },
  { re: /^#\/clients\/(\d+)$/,           comp: ClientDetailView,  nav: "clients", params: ["id"] },
  { re: /^#\/pre-consultation\/?$/,      comp: PreConsultView,    nav: "pre-consultation" },
  { re: /^#\/pre-consultation\/(\d+)$/,  comp: SurveyDetailView,  nav: "pre-consultation", params: ["id"] },
  { re: /^#\/logs\/?$/,                  comp: LogsView,          nav: "logs" },
  { re: /^#\/community\/write\/?$/,      comp: PostWriteView,     nav: "community" },
  { re: /^#\/community\/(\d+)$/,         comp: PostDetailView,    nav: "community", params: ["id"] },
  { re: /^#\/community\/?$/,             comp: CommunityView,     nav: "community" }
];

function resolveRoute(hash) {
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      const params = {};
      (r.params || []).forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
      return { ...r, params };
    }
  }
  return null;
}

const App = {
  data() {
    return { route: null, hash: location.hash || "#/dashboard" };
  },
  computed: {
    componentProps() { return this.route ? this.route.params : {}; }
  },
  created() {
    window.addEventListener("hashchange", this.onRoute);
    this.onRoute();
  },
  methods: {
    onRoute() {
      let hash = location.hash || "#/dashboard";
      let route = resolveRoute(hash);

      // 매칭 실패 → 대시보드로
      if (!route) { location.hash = "#/dashboard"; return; }

      // 인증 가드: 보호 라우트인데 로그인 정보 없으면 로그인으로
      if (!route.public && !store.user) { location.hash = "#/login"; return; }
      // 이미 로그인했는데 로그인/회원가입 접근 시 대시보드로
      if (store.user && (route.comp === LoginView || route.comp === SignupView)) { location.hash = "#/dashboard"; return; }

      this.hash = hash;
      this.route = route;
      window.scrollTo(0, 0);
    }
  },
  template: `
  <toasts />
  <template v-if="route && route.bare">
    <component :is="route.comp" v-bind="componentProps" :key="hash" />
  </template>
  <div v-else-if="route" class="flex">
    <sidebar :active="route.nav" />
    <div class="flex-1 md:ml-64 min-h-screen flex flex-col">
      <mobile-topbar />
      <main class="flex-1 p-sm md:p-lg max-w-[1280px] w-full mx-auto">
        <component :is="route.comp" v-bind="componentProps" :key="hash" />
      </main>
    </div>
  </div>`
};

const app = createApp(App);
app.component("sidebar", Sidebar);
app.component("mobile-topbar", MobileTopbar);
app.component("page-header", PageHeader);
app.component("modal", Modal);
app.component("loading", Loading);
app.component("empty-state", EmptyState);
app.component("toasts", Toasts);
app.mount("#app");
