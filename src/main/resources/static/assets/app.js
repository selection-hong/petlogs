/* PetLogs SPA — Vue 3 (CDN global build)
 * 해시 라우터 + 사이드바 레이아웃 + 전 화면. 백엔드 REST API에 직접 연결.
 */
const { createApp, reactive, ref, computed, onMounted, watch, h } = Vue;

/* ----------------------------- 전역 스토어 ----------------------------- */
const store = reactive({
  user: JSON.parse(localStorage.getItem("petlogs_user") || "null"),
  toasts: [],
  setUser(u) {
    this.user = u;
    if (u) localStorage.setItem("petlogs_user", JSON.stringify(u));
    else localStorage.removeItem("petlogs_user");
  },
  toast(message, type = "info") {
    const id = Date.now() + Math.random();
    this.toasts.push({ id, message, type });
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3200);
  }
});

/* ----------------------------- 유틸 ----------------------------- */
const fmt = {
  date(s) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  },
  dateShort(s) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  },
  initials(name) { return (name || "?").trim().slice(0, 2); }
};

// 케이스 상태 → 태그 클래스
function caseTagClass(status) {
  if (status === "완료") return "tag-done";
  if (status === "훈련 중" || status === "상담 중") return "tag-progress";
  return "tag-pending";
}
function surveyTagClass(status) {
  return status === "확인 완료" ? "tag-done" : "tag-pending";
}

/* ----------------------------- 공통 UI 컴포넌트 ----------------------------- */

// 사이드바
const Sidebar = {
  props: ["active"],
  computed: { user() { return store.user; } },
  methods: {
    async logout() {
      try { await api.auth.logout(); } catch (e) {}
      store.setUser(null);
      store.toast("로그아웃 되었습니다.");
      location.hash = "#/login";
    }
  },
  template: `
  <nav class="hidden md:flex bg-surface-container-low h-screen w-64 flex-col border-r border-surface-variant fixed left-0 top-0 py-sm z-20">
    <div class="px-sm pb-md mb-sm border-b border-surface-variant">
      <div class="flex items-center gap-xs mb-xs">
        <div class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif font-bold">PL</div>
        <h1 class="font-serif text-headline-md text-primary tracking-tight">PetLogs</h1>
      </div>
      <p class="text-label-sm text-on-surface-variant pl-px">반려견 훈련 관리 스위트</p>
    </div>
    <div class="flex-1 overflow-y-auto py-xs flex flex-col gap-base px-xs">
      <a v-for="item in items" :key="item.key" :href="item.href"
         :class="['flex items-center gap-sm px-sm py-xs rounded-lg cursor-pointer transition-all duration-200 active:scale-95',
                  active===item.key ? 'text-primary font-bold bg-surface-bright border-l-4 border-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary']">
        <span class="material-symbols-outlined" :class="{ fill: active===item.key }">{{ item.icon }}</span>
        <span class="text-label-md">{{ item.label }}</span>
      </a>
    </div>
    <div class="px-xs pt-sm border-t border-surface-variant mt-sm">
      <div class="flex items-center gap-sm px-sm py-xs">
        <div class="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-serif font-bold">{{ initials }}</div>
        <div class="min-w-0">
          <p class="text-label-md font-semibold text-on-surface truncate">{{ user ? user.name : '게스트' }}</p>
          <p class="text-label-sm text-on-surface-variant truncate">{{ user ? user.email : '' }}</p>
        </div>
      </div>
      <button @click="logout" class="btn btn-ghost w-full mt-xs justify-start">
        <span class="material-symbols-outlined">logout</span> 로그아웃
      </button>
    </div>
  </nav>`,
  data() {
    return {
      items: [
        { key: "dashboard", label: "대시보드", icon: "dashboard", href: "#/dashboard" },
        { key: "clients", label: "고객 관리", icon: "pets", href: "#/clients" },
        { key: "logs", label: "훈련 일지", icon: "history_edu", href: "#/logs" },
        { key: "pre-consultation", label: "사전 문진", icon: "assignment", href: "#/pre-consultation" },
        { key: "community", label: "커뮤니티", icon: "forum", href: "#/community" }
      ]
    };
  },
  computed: { initials() { return fmt.initials(store.user && store.user.name); } }
};

// 모바일 상단바
const MobileTopbar = {
  template: `
  <header class="md:hidden sticky top-0 z-20 bg-surface-container-low/95 backdrop-blur border-b border-surface-variant px-sm py-xs flex items-center justify-between">
    <div class="flex items-center gap-xs">
      <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif font-bold text-label-md">PL</div>
      <span class="font-serif text-headline-md-mobile text-primary">PetLogs</span>
    </div>
    <a href="#/dashboard" class="material-symbols-outlined text-on-surface-variant">menu</a>
  </header>`
};

// 페이지 헤더 (Playfair 타이틀 + 액션)
const PageHeader = {
  props: ["eyebrow", "title", "subtitle"],
  template: `
  <div class="flex flex-wrap items-end justify-between gap-md mb-lg">
    <div>
      <p v-if="eyebrow" class="text-label-sm uppercase tracking-widest text-on-surface-variant mb-base">{{ eyebrow }}</p>
      <h2 class="font-serif text-display-sm text-on-background">{{ title }}</h2>
      <p v-if="subtitle" class="text-body-md text-on-surface-variant mt-base">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-xs"><slot name="actions"></slot></div>
  </div>`
};

// 로딩/빈 상태
const Loading = { template: `<div class="flex items-center justify-center py-xl"><div class="spinner"></div></div>` };
const EmptyState = {
  props: ["icon", "text"],
  template: `
  <div class="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
    <span class="material-symbols-outlined text-5xl mb-xs opacity-40">{{ icon || 'inbox' }}</span>
    <p class="text-body-md">{{ text || '데이터가 없습니다.' }}</p>
    <slot></slot>
  </div>`
};

// 모달 (backdrop blur)
const Modal = {
  props: ["title", "size"],
  emits: ["close"],
  template: `
  <teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-sm" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-inverse-surface/30 backdrop-blur-sm"></div>
      <div :class="['relative bg-surface-container-lowest rounded-xl border border-surface-variant tactile-shadow w-full max-h-[88vh] overflow-y-auto fade-up',
                    size==='lg' ? 'max-w-2xl' : 'max-w-lg']">
        <div class="flex items-center justify-between px-md py-sm border-b border-surface-variant sticky top-0 bg-surface-container-lowest">
          <h3 class="font-serif text-headline-md text-on-background">{{ title }}</h3>
          <button @click="$emit('close')" class="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
        </div>
        <div class="p-md"><slot></slot></div>
      </div>
    </div>
  </teleport>`
};

// 토스트 컨테이너
const Toasts = {
  computed: { toasts() { return store.toasts; } },
  template: `
  <teleport to="body">
    <div class="fixed bottom-md right-md z-[60] flex flex-col gap-xs">
      <div v-for="t in toasts" :key="t.id"
           :class="['fade-up px-md py-sm rounded-lg tactile-shadow text-label-md font-medium border',
                    t.type==='error' ? 'bg-error-container text-on-error-container border-error/20'
                    : t.type==='success' ? 'bg-secondary-container text-on-secondary-container border-secondary/20'
                    : 'bg-inverse-surface text-inverse-on-surface border-transparent']">
        {{ t.message }}
      </div>
    </div>
  </teleport>`
};
