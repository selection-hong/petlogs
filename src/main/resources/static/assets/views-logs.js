/* PetLogs — 훈련 일지 아카이브 (전 케이스 일지 통합 뷰)
 * 백엔드는 케이스별 일지 조회만 제공하므로, 케이스를 먼저 불러온 뒤
 * 각 케이스의 일지를 병렬로 모아 최신순으로 정렬한다.
 */
const LogsView = {
  data() { return { loading: true, entries: [], cases: [], caseFilter: "" }; },
  computed: {
    filtered() {
      if (!this.caseFilter) return this.entries;
      return this.entries.filter(e => String(e.caseId) === String(this.caseFilter));
    }
  },
  async mounted() { await this.load(); },
  methods: {
    fmtDate: fmt.date,
    async load() {
      this.loading = true;
      try {
        this.cases = await api.cases.list() || [];
        const lists = await Promise.all(
          this.cases.map(c => api.cases.logs(c.caseId).then(
            logs => (logs || []).map(l => ({ ...l, petName: c.petName, ownerName: c.ownerName, caseId: c.caseId })),
            () => []
          ))
        );
        this.entries = lists.flat().sort((a, b) => new Date(b.trainedAt) - new Date(a.trainedAt));
      } catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    }
  },
  template: `
  <div class="fade-up">
    <page-header eyebrow="Archive" title="훈련 일지" subtitle="모든 케이스의 훈련 기록을 시간순으로 모아봅니다." />

    <div class="flex flex-wrap items-center gap-sm mb-md">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
        <select v-model="caseFilter" class="field !pl-10 max-w-xs">
          <option value="">전체 케이스</option>
          <option v-for="c in cases" :key="c.caseId" :value="c.caseId">{{ c.petName }} · {{ c.ownerName || '보호자' }}</option>
        </select>
      </div>
      <a href="#/clients" class="btn btn-secondary ml-auto"><span class="material-symbols-outlined">add</span>케이스에서 일지 작성</a>
    </div>

    <loading v-if="loading" />
    <empty-state v-else-if="!filtered.length" icon="history_edu" text="작성된 훈련 일지가 없습니다." />
    <div v-else class="relative pl-md">
      <!-- 타임라인 라인 -->
      <div class="absolute left-[7px] top-base bottom-base w-px bg-surface-variant"></div>
      <div class="flex flex-col gap-md">
        <article v-for="l in filtered" :key="l.logId" class="relative">
          <span class="absolute -left-md top-sm w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface"></span>
          <a :href="'#/clients/'+l.caseId" class="polaroid-card rounded-xl p-md block">
            <div class="flex items-center justify-between gap-sm mb-base">
              <div class="flex items-center gap-base">
                <span class="font-serif text-body-lg">{{ l.petName }}</span>
                <span class="tag tag-progress">세션 {{ l.sessionNo }}</span>
              </div>
              <span class="text-label-sm text-on-surface-variant">{{ fmtDate(l.trainedAt) }}</span>
            </div>
            <p v-if="l.goal" class="text-label-md font-semibold text-primary mb-base">{{ l.goal }}</p>
            <p class="text-body-md text-on-surface line-clamp-3 whitespace-pre-line">{{ l.content }}</p>
          </a>
        </article>
      </div>
    </div>
  </div>`
};
