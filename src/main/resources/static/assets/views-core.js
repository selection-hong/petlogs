/* PetLogs — 핵심 화면: 로그인 / 회원가입 / 대시보드 / 공개 문진 */

/* ------------------------------- 로그인 ------------------------------- */
const LoginView = {
  data() { return { email: "trainer1@test.com", password: "1234", loading: false, error: "" }; },
  methods: {
    async submit() {
      this.error = ""; this.loading = true;
      try {
        const user = await api.auth.login(this.email, this.password);
        store.setUser(user);
        store.toast("환영합니다, " + user.name + " 님", "success");
        location.hash = "#/dashboard";
      } catch (e) { this.error = e.message; }
      finally { this.loading = false; }
    }
  },
  template: `
  <div class="min-h-screen flex items-center justify-center p-sm">
    <div class="w-full max-w-md fade-up">
      <div class="text-center mb-lg">
        <div class="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-headline-md font-bold mx-auto mb-sm">PL</div>
        <h1 class="font-serif text-display-sm text-on-background">PetLogs</h1>
        <p class="text-body-md text-on-surface-variant mt-base">반려견 훈련사를 위한 케이스 · 일지 · 문진 관리</p>
      </div>
      <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-md tactile-shadow">
        <h2 class="font-serif text-headline-md mb-md">로그인</h2>
        <form @submit.prevent="submit" class="flex flex-col gap-sm">
          <div>
            <label class="text-label-md font-medium text-on-surface-variant">이메일</label>
            <input v-model="email" type="email" class="field mt-base" placeholder="trainer@example.com" required />
          </div>
          <div>
            <label class="text-label-md font-medium text-on-surface-variant">비밀번호</label>
            <input v-model="password" type="password" class="field mt-base" placeholder="••••" required />
          </div>
          <p v-if="error" class="text-label-md text-error">{{ error }}</p>
          <button class="btn btn-primary w-full mt-xs" :disabled="loading">
            <span v-if="loading" class="spinner" style="border-top-color:#fff;border-color:rgba(255,255,255,.4)"></span>
            <span v-else>로그인</span>
          </button>
        </form>
        <p class="text-label-md text-on-surface-variant text-center mt-md">
          계정이 없으신가요? <a href="#/signup" class="text-primary font-semibold">회원가입</a>
        </p>
      </div>
      <p class="text-label-sm text-on-surface-variant text-center mt-md">테스트 계정: trainer1@test.com / 1234</p>
    </div>
  </div>`
};

/* ------------------------------- 회원가입 ------------------------------- */
const SignupView = {
  data() { return { form: { email: "", password: "", name: "", phone: "" }, loading: false, error: "" }; },
  methods: {
    async submit() {
      this.error = ""; this.loading = true;
      try {
        await api.auth.signup(this.form);
        store.toast("회원가입이 완료되었습니다. 로그인해 주세요.", "success");
        location.hash = "#/login";
      } catch (e) { this.error = e.message; }
      finally { this.loading = false; }
    }
  },
  template: `
  <div class="min-h-screen flex items-center justify-center p-sm">
    <div class="w-full max-w-md fade-up">
      <div class="text-center mb-lg">
        <h1 class="font-serif text-display-sm text-on-background">회원가입</h1>
        <p class="text-body-md text-on-surface-variant mt-base">훈련사 계정을 생성합니다</p>
      </div>
      <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-md tactile-shadow">
        <form @submit.prevent="submit" class="flex flex-col gap-sm">
          <div><label class="text-label-md font-medium text-on-surface-variant">이메일 *</label>
            <input v-model="form.email" type="email" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">비밀번호 *</label>
            <input v-model="form.password" type="password" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">이름 *</label>
            <input v-model="form.name" type="text" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">연락처</label>
            <input v-model="form.phone" type="tel" class="field mt-base" placeholder="010-1234-5678" /></div>
          <p v-if="error" class="text-label-md text-error">{{ error }}</p>
          <button class="btn btn-primary w-full mt-xs" :disabled="loading">
            <span v-if="loading" class="spinner" style="border-top-color:#fff;border-color:rgba(255,255,255,.4)"></span>
            <span v-else>가입하기</span>
          </button>
        </form>
        <p class="text-label-md text-on-surface-variant text-center mt-md">
          이미 계정이 있으신가요? <a href="#/login" class="text-primary font-semibold">로그인</a>
        </p>
      </div>
    </div>
  </div>`
};

/* ------------------------------- 대시보드 ------------------------------- */
const DashboardView = {
  data() { return { loading: true, data: null }; },
  computed: {
    user() { return store.user; },
    greeting() {
      const h = new Date().getHours();
      const t = h < 12 ? "좋은 아침입니다" : h < 18 ? "좋은 오후입니다" : "좋은 저녁입니다";
      return t + (store.user ? ", " + store.user.name + " 님." : ".");
    },
    stats() {
      const d = this.data || {};
      return [
        { label: "전체 케이스", value: d.totalCases ?? 0, icon: "folder_open", color: "text-primary" },
        { label: "진행 중", value: d.inProgress ?? 0, icon: "directions_run", color: "text-primary" },
        { label: "미확인 문진", value: d.unconfirmed ?? 0, icon: "mark_email_unread", color: "text-tertiary" },
        { label: "이번 달 완료", value: d.completedThisMonth ?? 0, icon: "task_alt", color: "text-secondary" }
      ];
    }
  },
  async mounted() {
    try { this.data = await api.dashboard(); }
    catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
    finally { this.loading = false; }
  },
  methods: { fmtDate: fmt.dateShort, surveyTagClass, caseTagClass },
  template: `
  <div class="fade-up">
    <page-header eyebrow="Planner Index" :title="greeting" subtitle="오늘의 훈련 현황을 한눈에 확인하세요.">
      <template #actions>
        <a href="#/pre-consultation" class="btn btn-secondary"><span class="material-symbols-outlined">link</span>문진 링크</a>
        <a href="#/clients" class="btn btn-primary"><span class="material-symbols-outlined">add</span>새 케이스</a>
      </template>
    </page-header>

    <loading v-if="loading" />
    <div v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        <div v-for="s in stats" :key="s.label" class="bg-surface-container-lowest border border-surface-variant rounded-xl p-md tactile-shadow">
          <div class="flex items-center justify-between mb-sm">
            <span class="text-label-md text-on-surface-variant">{{ s.label }}</span>
            <span :class="['material-symbols-outlined', s.color]">{{ s.icon }}</span>
          </div>
          <p :class="['font-serif text-display-sm', s.color]">{{ s.value }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-lg">
        <!-- 최근 문진 -->
        <section>
          <h3 class="font-serif text-headline-md mb-md border-b border-surface-variant pb-xs flex items-center justify-between">
            최근 문진 <a href="#/pre-consultation" class="text-label-md text-primary font-semibold">전체보기</a>
          </h3>
          <empty-state v-if="!data.recentSurveys || !data.recentSurveys.length" icon="assignment" text="접수된 문진이 없습니다." />
          <div v-else class="flex flex-col gap-xs">
            <a v-for="s in data.recentSurveys" :key="s.surveyId" :href="'#/pre-consultation/'+s.surveyId"
               class="polaroid-card rounded-xl p-sm flex items-center gap-sm">
              <div class="w-10 h-10 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center font-serif font-bold">{{ (s.petName||s.ownerName||'?').slice(0,2) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-body-md font-semibold truncate">{{ s.petName || '미입력' }} · {{ s.ownerName || '보호자' }}</p>
                <p class="text-label-sm text-on-surface-variant truncate">{{ s.problemBehavior || '문진 대기' }}</p>
              </div>
              <span :class="['tag', surveyTagClass(s.status)]">{{ s.status }}</span>
            </a>
          </div>
        </section>

        <!-- 최근 케이스 -->
        <section>
          <h3 class="font-serif text-headline-md mb-md border-b border-surface-variant pb-xs flex items-center justify-between">
            최근 케이스 <a href="#/clients" class="text-label-md text-primary font-semibold">전체보기</a>
          </h3>
          <empty-state v-if="!data.recentCases || !data.recentCases.length" icon="pets" text="등록된 케이스가 없습니다." />
          <div v-else class="flex flex-col gap-xs">
            <a v-for="c in data.recentCases" :key="c.caseId" :href="'#/clients/'+c.caseId"
               class="polaroid-card rounded-xl p-sm flex items-center gap-sm">
              <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-serif font-bold">{{ (c.petName||'?').slice(0,2) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-body-md font-semibold truncate">{{ c.petName }} <span class="text-on-surface-variant font-normal">· {{ c.breed || '믹스' }}</span></p>
                <p class="text-label-sm text-on-surface-variant truncate">보호자 {{ c.ownerName || '—' }} · 세션 {{ c.sessionCount || 0 }}회</p>
              </div>
              <span :class="['tag', caseTagClass(c.status)]">{{ c.status }}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>`
};

/* --------------------- 공개 문진 폼 (보호자, 비로그인) --------------------- */
const PublicSurveyView = {
  props: ["token"],
  data() {
    return {
      loading: false, done: false, error: "",
      form: {
        ownerName: "", ownerPhone: "", petName: "", breed: "", ageYears: null,
        gender: "", neutered: null, problemBehavior: "", behaviorDetail: "", trainingGoal: ""
      },
      behaviors: ["분리불안", "공격성", "짖음", "배변 문제", "산책 거부", "기타"],
      selected: []
    };
  },
  methods: {
    async submit() {
      this.error = "";
      this.form.problemBehavior = this.selected.join(",");
      this.loading = true;
      try {
        await api.surveys.submitPublic(this.token, this.form);
        this.done = true;
      } catch (e) { this.error = e.message; }
      finally { this.loading = false; }
    }
  },
  template: `
  <div class="min-h-screen py-lg px-sm">
    <div class="max-w-2xl mx-auto fade-up">
      <div class="text-center mb-lg">
        <div class="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif font-bold mx-auto mb-sm">PL</div>
        <h1 class="font-serif text-display-sm text-on-background">반려견 사전 문진</h1>
        <p class="text-body-md text-on-surface-variant mt-base">훈련 상담을 위해 우리 아이에 대해 알려주세요.</p>
      </div>

      <div v-if="done" class="bg-secondary-container text-on-secondary-container rounded-xl p-lg text-center tactile-shadow">
        <span class="material-symbols-outlined text-5xl mb-xs">check_circle</span>
        <h2 class="font-serif text-headline-md mb-xs">문진이 제출되었습니다</h2>
        <p class="text-body-md">담당 훈련사가 내용을 확인한 뒤 연락드릴 예정입니다. 감사합니다!</p>
      </div>

      <form v-else @submit.prevent="submit" class="bg-surface-container-lowest border border-surface-variant rounded-xl p-md tactile-shadow flex flex-col gap-md">
        <div class="grid sm:grid-cols-2 gap-sm">
          <div><label class="text-label-md font-medium text-on-surface-variant">보호자 이름 *</label>
            <input v-model="form.ownerName" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">연락처</label>
            <input v-model="form.ownerPhone" class="field mt-base" placeholder="010-0000-0000" /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">반려견 이름 *</label>
            <input v-model="form.petName" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">견종 *</label>
            <input v-model="form.breed" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">나이 (세)</label>
            <input v-model.number="form.ageYears" type="number" min="0" class="field mt-base" /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">성별</label>
            <select v-model="form.gender" class="field mt-base"><option value="">선택</option><option>수컷</option><option>암컷</option></select></div>
        </div>
        <div>
          <label class="text-label-md font-medium text-on-surface-variant">중성화 여부</label>
          <div class="flex gap-sm mt-base">
            <label class="flex items-center gap-base text-body-md"><input type="radio" :value="true" v-model="form.neutered" class="text-primary"/> 했음</label>
            <label class="flex items-center gap-base text-body-md"><input type="radio" :value="false" v-model="form.neutered" class="text-primary"/> 안 함</label>
          </div>
        </div>
        <div>
          <label class="text-label-md font-medium text-on-surface-variant">문제행동 (복수 선택)</label>
          <div class="flex flex-wrap gap-base mt-base">
            <label v-for="b in behaviors" :key="b"
              :class="['px-sm py-base rounded-full border cursor-pointer text-label-md transition-colors',
                       selected.includes(b) ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary']">
              <input type="checkbox" :value="b" v-model="selected" class="hidden" /> {{ b }}
            </label>
          </div>
        </div>
        <div><label class="text-label-md font-medium text-on-surface-variant">문제행동 상세 설명 *</label>
          <textarea v-model="form.behaviorDetail" rows="3" class="field mt-base" required placeholder="언제, 어떤 상황에서 나타나는지 적어주세요."></textarea></div>
        <div><label class="text-label-md font-medium text-on-surface-variant">훈련 목표</label>
          <textarea v-model="form.trainingGoal" rows="2" class="field mt-base" placeholder="훈련을 통해 기대하는 변화"></textarea></div>

        <p v-if="error" class="text-label-md text-error">{{ error }}</p>
        <button class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="spinner" style="border-top-color:#fff;border-color:rgba(255,255,255,.4)"></span>
          <span v-else>문진 제출하기</span>
        </button>
      </form>
    </div>
  </div>`
};
