/* PetLogs — 사전 문진: 목록(탭) / 상세(확인·AI 분석) */

/* ------------------------------- 문진 목록 ------------------------------- */
const PreConsultView = {
  data() {
    return {
      loading: true, surveys: [], tab: "all",
      showLink: false, linking: false, linkForm: { ownerName: "", petName: "" }, generated: null
    };
  },
  computed: {
    tabs() {
      const all = this.surveys.length;
      const pending = this.surveys.filter(s => s.status !== "확인 완료").length;
      const done = this.surveys.filter(s => s.status === "확인 완료").length;
      return [
        { key: "all", label: "전체", count: all },
        { key: "pending", label: "미확인", count: pending },
        { key: "done", label: "확인 완료", count: done }
      ];
    },
    filtered() {
      if (this.tab === "pending") return this.surveys.filter(s => s.status !== "확인 완료");
      if (this.tab === "done") return this.surveys.filter(s => s.status === "확인 완료");
      return this.surveys;
    },
    shareUrl() {
      if (!this.generated) return "";
      return location.origin + "/#/survey/" + this.generated.token;
    }
  },
  async mounted() { await this.load(); },
  methods: {
    surveyTagClass, fmtDate: fmt.date,
    async load() {
      this.loading = true;
      try { this.surveys = await api.surveys.list() || []; }
      catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    async createLink() {
      this.linking = true;
      try {
        this.generated = await api.surveys.createLink(this.linkForm);
        store.toast("문진 링크가 생성되었습니다.", "success");
        await this.load();
      } catch (e) { store.toast(e.message, "error"); }
      finally { this.linking = false; }
    },
    copyUrl() {
      navigator.clipboard.writeText(this.shareUrl).then(
        () => store.toast("링크가 복사되었습니다.", "success"),
        () => store.toast("복사에 실패했습니다.", "error"));
    },
    closeLink() { this.showLink = false; this.generated = null; this.linkForm = { ownerName: "", petName: "" }; }
  },
  template: `
  <div class="fade-up">
    <page-header eyebrow="Forms" title="사전 문진" subtitle="보호자에게 문진 링크를 발송하고 접수 현황을 관리합니다.">
      <template #actions>
        <button @click="showLink=true" class="btn btn-primary"><span class="material-symbols-outlined">add_link</span>문진 링크 생성</button>
      </template>
    </page-header>

    <div class="flex gap-base border-b border-surface-variant mb-md">
      <button v-for="t in tabs" :key="t.key" @click="tab=t.key"
        :class="['px-sm py-xs font-serif text-body-md border-b-2 -mb-px transition-colors',
                 tab===t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface']">
        {{ t.label }} <span class="text-label-sm">({{ t.count }})</span>
      </button>
    </div>

    <loading v-if="loading" />
    <empty-state v-else-if="!filtered.length" icon="assignment" text="해당 상태의 문진이 없습니다." />
    <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-md">
      <a v-for="s in filtered" :key="s.surveyId" :href="'#/pre-consultation/'+s.surveyId" class="polaroid-card rounded-xl p-md block">
        <div class="flex items-start justify-between gap-base">
          <div class="min-w-0">
            <h3 class="font-serif text-body-lg truncate">{{ s.petName || '미입력' }}</h3>
            <p class="text-label-md text-on-surface-variant truncate">보호자 {{ s.ownerName || '—' }}</p>
          </div>
          <span :class="['tag', surveyTagClass(s.status)]">{{ s.status }}</span>
        </div>
        <div class="mt-sm flex flex-wrap gap-base">
          <span v-for="b in (s.problemBehavior ? s.problemBehavior.split(',') : [])" :key="b" class="tag tag-neutral">{{ b }}</span>
          <span v-if="!s.problemBehavior" class="text-label-sm text-on-surface-variant italic">제출 대기 중</span>
        </div>
        <div class="mt-sm pt-sm border-t border-surface-variant flex items-center justify-between text-label-sm text-on-surface-variant">
          <span>{{ s.submittedAt ? fmtDate(s.submittedAt) : '미제출' }}</span>
          <span v-if="s.hasAiAnalysis" class="inline-flex items-center gap-base text-secondary"><span class="material-symbols-outlined text-base">psychology</span>AI 분석</span>
        </div>
      </a>
    </div>

    <!-- 링크 생성 모달 -->
    <modal v-if="showLink" title="문진 링크 생성" @close="closeLink">
      <div v-if="!generated">
        <p class="text-body-md text-on-surface-variant mb-sm">보호자 정보를 입력하면 공유 가능한 문진 링크가 생성됩니다.</p>
        <form @submit.prevent="createLink" class="flex flex-col gap-sm">
          <div><label class="text-label-md font-medium text-on-surface-variant">보호자 이름 *</label>
            <input v-model="linkForm.ownerName" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">반려견 이름 (선택)</label>
            <input v-model="linkForm.petName" class="field mt-base" /></div>
          <div class="flex justify-end gap-xs mt-xs">
            <button type="button" @click="closeLink" class="btn btn-ghost">취소</button>
            <button class="btn btn-primary" :disabled="linking">{{ linking ? '생성 중…' : '링크 생성' }}</button>
          </div>
        </form>
      </div>
      <div v-else class="text-center">
        <span class="material-symbols-outlined text-5xl text-secondary mb-xs">check_circle</span>
        <p class="text-body-md mb-sm">아래 링크를 보호자에게 공유하세요.</p>
        <div class="flex items-center gap-base bg-surface-container rounded-lg p-sm">
          <input :value="shareUrl" readonly class="field !bg-transparent !border-0 text-label-md" />
          <button @click="copyUrl" class="btn btn-secondary"><span class="material-symbols-outlined">content_copy</span></button>
        </div>
        <button @click="closeLink" class="btn btn-primary w-full mt-md">완료</button>
      </div>
    </modal>
  </div>`
};

/* ------------------------------- 문진 상세 ------------------------------- */
const SurveyDetailView = {
  props: ["id"],
  data() { return { loading: true, s: null, confirming: false, analyzing: false }; },
  async mounted() { await this.load(); },
  methods: {
    surveyTagClass, fmtDate: fmt.date,
    async load() {
      this.loading = true;
      try { this.s = await api.surveys.get(this.id); }
      catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    async confirm() {
      this.confirming = true;
      try { await api.surveys.confirm(this.id); this.s.status = "확인 완료"; store.toast("확인 완료 처리되었습니다.", "success"); }
      catch (e) { store.toast(e.message, "error"); }
      finally { this.confirming = false; }
    },
    async analyze() {
      this.analyzing = true;
      try {
        const ai = await api.surveys.aiAnalysis(this.id);
        this.s.aiAnalysis = ai; this.s.hasAiAnalysis = true;
        store.toast("AI 분석이 완료되었습니다.", "success");
      } catch (e) { store.toast(e.message, "error"); }
      finally { this.analyzing = false; }
    }
  },
  template: `
  <div class="fade-up">
    <a href="#/pre-consultation" class="inline-flex items-center gap-base text-label-md text-on-surface-variant hover:text-primary mb-sm">
      <span class="material-symbols-outlined">arrow_back</span> 사전 문진
    </a>
    <loading v-if="loading" />
    <div v-else-if="!s"><empty-state icon="error" text="문진을 찾을 수 없습니다." /></div>
    <div v-else class="grid lg:grid-cols-3 gap-lg">
      <section class="lg:col-span-2 flex flex-col gap-md">
        <div class="polaroid-card rounded-xl p-md">
          <div class="flex items-start justify-between mb-sm">
            <div>
              <h2 class="font-serif text-headline-md">{{ s.petName || '미입력' }}</h2>
              <p class="text-body-md text-on-surface-variant">{{ s.breed || '견종 미상' }}<span v-if="s.ageYears"> · {{ s.ageYears }}세</span><span v-if="s.gender"> · {{ s.gender }}</span><span v-if="s.neutered!=null"> · 중성화 {{ s.neutered ? 'O' : 'X' }}</span></p>
            </div>
            <span :class="['tag', surveyTagClass(s.status)]">{{ s.status }}</span>
          </div>
          <dl class="grid sm:grid-cols-2 gap-sm text-body-md">
            <div><dt class="text-label-sm text-on-surface-variant">보호자</dt><dd>{{ s.ownerName || '—' }}</dd></div>
            <div><dt class="text-label-sm text-on-surface-variant">연락처</dt><dd>{{ s.ownerPhone || '—' }}</dd></div>
            <div><dt class="text-label-sm text-on-surface-variant">제출일</dt><dd>{{ s.submittedAt ? fmtDate(s.submittedAt) : '미제출' }}</dd></div>
            <div><dt class="text-label-sm text-on-surface-variant">담당 훈련사</dt><dd>{{ s.trainerName || '—' }}</dd></div>
          </dl>
          <div class="mt-sm pt-sm border-t border-surface-variant">
            <p class="text-label-sm text-on-surface-variant mb-base">문제행동</p>
            <div class="flex flex-wrap gap-base">
              <span v-for="b in (s.problemBehavior ? s.problemBehavior.split(',') : [])" :key="b" class="tag tag-pending">{{ b }}</span>
              <span v-if="!s.problemBehavior" class="text-body-md text-on-surface-variant">—</span>
            </div>
          </div>
          <div v-if="s.behaviorDetail" class="mt-sm"><p class="text-label-sm text-on-surface-variant mb-base">상세 설명</p><p class="text-body-md whitespace-pre-line">{{ s.behaviorDetail }}</p></div>
          <div v-if="s.trainingGoal" class="mt-sm"><p class="text-label-sm text-on-surface-variant mb-base">훈련 목표</p><p class="text-body-md whitespace-pre-line">{{ s.trainingGoal }}</p></div>
        </div>

        <!-- AI 분석 -->
        <div class="polaroid-card rounded-xl p-md">
          <div class="flex items-center justify-between mb-sm">
            <h3 class="font-serif text-headline-md flex items-center gap-base"><span class="material-symbols-outlined text-secondary">psychology</span>AI 행동 분석</h3>
            <button v-if="!s.aiAnalysis" @click="analyze" class="btn btn-secondary" :disabled="analyzing || !s.submittedAt">
              <span v-if="analyzing" class="spinner"></span><span v-else>분석 요청</span>
            </button>
          </div>
          <p v-if="!s.submittedAt" class="text-body-md text-on-surface-variant">보호자가 문진을 제출한 후 분석할 수 있습니다.</p>
          <empty-state v-else-if="!s.aiAnalysis" icon="auto_awesome" text="아직 분석 결과가 없습니다. ‘분석 요청’을 눌러보세요." />
          <div v-else class="flex flex-col gap-sm">
            <div class="flex gap-sm">
              <div class="flex-1 bg-surface-container rounded-lg p-sm"><p class="text-label-sm text-on-surface-variant">행동 유형</p><p class="font-serif text-body-lg mt-base">{{ s.aiAnalysis.behaviorType }}</p></div>
              <div class="flex-1 bg-surface-container rounded-lg p-sm"><p class="text-label-sm text-on-surface-variant">위험도</p><p class="font-serif text-body-lg mt-base">{{ s.aiAnalysis.riskLevel }}</p></div>
            </div>
            <div><p class="text-label-sm text-on-surface-variant mb-base">요약</p><p class="text-body-md whitespace-pre-line">{{ s.aiAnalysis.summary }}</p></div>
            <div class="bg-secondary-container/40 rounded-lg p-sm"><p class="text-label-sm font-semibold text-on-secondary-container mb-base">권장 훈련 방향</p><p class="text-body-md text-on-secondary-container whitespace-pre-line">{{ s.aiAnalysis.trainingDirection }}</p></div>
          </div>
        </div>
      </section>

      <!-- 액션 -->
      <aside class="lg:col-span-1">
        <div class="polaroid-card rounded-xl p-md flex flex-col gap-sm sticky top-md">
          <h3 class="font-serif text-headline-md">처리</h3>
          <button v-if="s.status !== '확인 완료'" @click="confirm" class="btn btn-primary w-full" :disabled="confirming">
            <span class="material-symbols-outlined">done</span>{{ confirming ? '처리 중…' : '확인 완료 처리' }}
          </button>
          <div v-else class="bg-secondary-container text-on-secondary-container rounded-lg p-sm text-center text-label-md font-semibold">확인 완료된 문진입니다</div>
          <a href="#/clients" class="btn btn-secondary w-full"><span class="material-symbols-outlined">add</span>케이스로 전환</a>
          <p class="text-label-sm text-on-surface-variant">문진을 검토한 뒤 케이스를 생성해 훈련을 시작하세요.</p>
        </div>
      </aside>
    </div>
  </div>`
};
