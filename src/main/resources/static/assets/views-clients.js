/* PetLogs — 고객 관리: 디렉터리 / 프로필(상세) */

/* ------------------------------- 고객 디렉터리 ------------------------------- */
const ClientsView = {
  data() {
    return {
      loading: true, cases: [], q: "",
      showCreate: false, creating: false,
      form: { ownerName: "", ownerPhone: "", petName: "", breed: "", age: null, gender: "", neutered: false, status: "접수 완료", memo: "" }
    };
  },
  computed: {
    filtered() {
      const q = this.q.trim().toLowerCase();
      if (!q) return this.cases;
      return this.cases.filter(c =>
        (c.petName || "").toLowerCase().includes(q) ||
        (c.ownerName || "").toLowerCase().includes(q) ||
        (c.breed || "").toLowerCase().includes(q));
    }
  },
  async mounted() { await this.load(); },
  methods: {
    caseTagClass,
    async load() {
      this.loading = true;
      try { this.cases = await api.cases.list() || []; }
      catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    async create() {
      this.creating = true;
      try {
        const tc = await api.cases.create(this.form);
        store.toast("케이스가 생성되었습니다.", "success");
        this.showCreate = false;
        location.hash = "#/clients/" + tc.caseId;
      } catch (e) { store.toast(e.message, "error"); }
      finally { this.creating = false; }
    }
  },
  template: `
  <div class="fade-up">
    <page-header eyebrow="Planner Index" title="고객 디렉터리" subtitle="훈련 중인 반려견과 보호자를 관리합니다.">
      <template #actions>
        <button @click="showCreate=true" class="btn btn-primary"><span class="material-symbols-outlined">add</span>새 케이스</button>
      </template>
    </page-header>

    <div class="relative mb-md max-w-sm">
      <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
      <input v-model="q" class="field !pl-10" placeholder="반려견 · 보호자 · 견종 검색" />
    </div>

    <loading v-if="loading" />
    <empty-state v-else-if="!filtered.length" icon="pets" text="등록된 케이스가 없습니다.">
      <button @click="showCreate=true" class="btn btn-secondary mt-sm"><span class="material-symbols-outlined">add</span>첫 케이스 만들기</button>
    </empty-state>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md">
      <a v-for="c in filtered" :key="c.caseId" :href="'#/clients/'+c.caseId" class="polaroid-card rounded-xl p-xs block">
        <div class="aspect-square rounded-lg bg-surface-container flex items-center justify-center mb-xs">
          <span class="material-symbols-outlined text-5xl text-primary/40">pets</span>
        </div>
        <div class="px-base pb-base">
          <div class="flex items-center justify-between gap-base">
            <h3 class="font-serif text-label-md text-on-background truncate">{{ c.petName }}</h3>
            <span :class="['tag', caseTagClass(c.status)]">{{ c.status }}</span>
          </div>
          <p class="text-label-sm text-on-surface-variant mt-base truncate">{{ c.breed || '믹스견' }} · {{ c.ownerName || '보호자' }}</p>
        </div>
      </a>
    </div>

    <!-- 케이스 생성 모달 -->
    <modal v-if="showCreate" title="새 훈련 케이스" size="lg" @close="showCreate=false">
      <form @submit.prevent="create" class="flex flex-col gap-sm">
        <div class="grid sm:grid-cols-2 gap-sm">
          <div><label class="text-label-md font-medium text-on-surface-variant">보호자 이름 *</label>
            <input v-model="form.ownerName" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">연락처</label>
            <input v-model="form.ownerPhone" class="field mt-base" /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">반려견 이름 *</label>
            <input v-model="form.petName" class="field mt-base" required /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">견종</label>
            <input v-model="form.breed" class="field mt-base" /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">나이 (세)</label>
            <input v-model.number="form.age" type="number" min="0" class="field mt-base" /></div>
          <div><label class="text-label-md font-medium text-on-surface-variant">성별</label>
            <select v-model="form.gender" class="field mt-base"><option value="">선택</option><option>수컷</option><option>암컷</option></select></div>
        </div>
        <label class="flex items-center gap-base text-body-md"><input type="checkbox" v-model="form.neutered" /> 중성화 완료</label>
        <div><label class="text-label-md font-medium text-on-surface-variant">메모</label>
          <textarea v-model="form.memo" rows="2" class="field mt-base" placeholder="초기 상담 메모"></textarea></div>
        <div class="flex justify-end gap-xs mt-xs">
          <button type="button" @click="showCreate=false" class="btn btn-ghost">취소</button>
          <button class="btn btn-primary" :disabled="creating">{{ creating ? '생성 중…' : '케이스 생성' }}</button>
        </div>
      </form>
    </modal>
  </div>`
};

/* ------------------------------- 고객 프로필 (상세) ------------------------------- */
const ClientDetailView = {
  props: ["id"],
  data() {
    return {
      loading: true, c: null, logs: [],
      statuses: ["접수 완료", "상담 중", "훈련 중", "완료"],
      showLog: false, savingLog: false, editingLog: null,
      logForm: { goal: "", content: "", improvement: "" }
    };
  },
  async mounted() { await this.load(); },
  methods: {
    caseTagClass, fmtDate: fmt.date,
    async load() {
      this.loading = true;
      try {
        this.c = await api.cases.get(this.id);
        this.logs = await api.cases.logs(this.id) || [];
      } catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    async changeStatus(s) {
      try { await api.cases.updateStatus(this.id, s); this.c.status = s; store.toast("상태가 변경되었습니다.", "success"); }
      catch (e) { store.toast(e.message, "error"); }
    },
    openNewLog() { this.editingLog = null; this.logForm = { goal: "", content: "", improvement: "" }; this.showLog = true; },
    openEditLog(l) { this.editingLog = l; this.logForm = { goal: l.goal, content: l.content, improvement: l.improvement }; this.showLog = true; },
    async saveLog() {
      this.savingLog = true;
      try {
        if (this.editingLog) {
          await api.logs.update(this.editingLog.logId, this.logForm);
          store.toast("일지가 수정되었습니다.", "success");
        } else {
          await api.cases.addLog(this.id, this.logForm);
          store.toast("일지가 작성되었습니다.", "success");
        }
        this.showLog = false;
        this.logs = await api.cases.logs(this.id) || [];
      } catch (e) { store.toast(e.message, "error"); }
      finally { this.savingLog = false; }
    },
    async removeLog(l) {
      if (!confirm("세션 " + l.sessionNo + " 일지를 삭제할까요?")) return;
      try { await api.logs.remove(l.logId); this.logs = this.logs.filter(x => x.logId !== l.logId); store.toast("삭제되었습니다."); }
      catch (e) { store.toast(e.message, "error"); }
    }
  },
  template: `
  <div class="fade-up">
    <a href="#/clients" class="inline-flex items-center gap-base text-label-md text-on-surface-variant hover:text-primary mb-sm">
      <span class="material-symbols-outlined">arrow_back</span> 고객 디렉터리
    </a>
    <loading v-if="loading" />
    <div v-else-if="!c"><empty-state icon="error" text="케이스를 찾을 수 없습니다." /></div>
    <div v-else class="grid lg:grid-cols-3 gap-lg">
      <!-- 프로필 카드 -->
      <aside class="lg:col-span-1">
        <div class="polaroid-card rounded-xl p-md text-center">
          <div class="w-24 h-24 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-sm">
            <span class="material-symbols-outlined text-6xl text-primary/40">pets</span>
          </div>
          <h2 class="font-serif text-headline-md text-on-background">{{ c.petName }}</h2>
          <p class="text-body-md text-on-surface-variant">{{ c.breed || '믹스견' }}<span v-if="c.petAge"> · {{ c.petAge }}세</span></p>
          <div class="mt-sm flex justify-center"><span :class="['tag', caseTagClass(c.status)]">{{ c.status }}</span></div>

          <div class="text-left mt-md pt-md border-t border-surface-variant flex flex-col gap-xs">
            <div class="flex items-center gap-sm text-body-md"><span class="material-symbols-outlined text-on-surface-variant">person</span>{{ c.ownerName || '—' }}</div>
            <div class="flex items-center gap-sm text-body-md"><span class="material-symbols-outlined text-on-surface-variant">event</span>접수 {{ fmtDate(c.startedAt) }}</div>
            <div class="flex items-center gap-sm text-body-md"><span class="material-symbols-outlined text-on-surface-variant">history_edu</span>총 {{ logs.length }} 세션</div>
          </div>

          <div class="text-left mt-md pt-md border-t border-surface-variant">
            <label class="text-label-md font-medium text-on-surface-variant">상태 변경</label>
            <select :value="c.status" @change="changeStatus($event.target.value)" class="field mt-base">
              <option v-for="s in statuses" :key="s">{{ s }}</option>
            </select>
          </div>
          <p v-if="c.memo" class="text-left text-label-md text-on-surface-variant mt-md pt-md border-t border-surface-variant whitespace-pre-line">{{ c.memo }}</p>
        </div>
      </aside>

      <!-- 일지 타임라인 -->
      <section class="lg:col-span-2">
        <div class="flex items-center justify-between mb-md border-b border-surface-variant pb-xs">
          <h3 class="font-serif text-headline-md">훈련 일지</h3>
          <button @click="openNewLog" class="btn btn-primary"><span class="material-symbols-outlined">add</span>일지 작성</button>
        </div>
        <empty-state v-if="!logs.length" icon="edit_note" text="작성된 일지가 없습니다." />
        <div v-else class="flex flex-col gap-md">
          <article v-for="l in logs" :key="l.logId" class="polaroid-card rounded-xl p-md">
            <div class="flex items-start justify-between gap-sm">
              <div>
                <span class="tag tag-progress">세션 {{ l.sessionNo }}</span>
                <span class="text-label-sm text-on-surface-variant ml-xs">{{ fmtDate(l.trainedAt) }}</span>
              </div>
              <div class="flex gap-base">
                <button @click="openEditLog(l)" class="material-symbols-outlined text-on-surface-variant hover:text-primary text-xl">edit</button>
                <button @click="removeLog(l)" class="material-symbols-outlined text-on-surface-variant hover:text-error text-xl">delete</button>
              </div>
            </div>
            <h4 v-if="l.goal" class="font-serif text-body-lg mt-xs">{{ l.goal }}</h4>
            <p class="text-body-md text-on-surface mt-base whitespace-pre-line">{{ l.content }}</p>
            <div v-if="l.improvement" class="mt-sm bg-secondary-container/40 rounded-lg p-sm">
              <p class="text-label-sm font-semibold text-on-secondary-container mb-base">개선사항</p>
              <p class="text-body-md text-on-secondary-container whitespace-pre-line">{{ l.improvement }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- 일지 작성/수정 모달 -->
    <modal v-if="showLog" :title="editingLog ? '일지 수정' : '새 훈련 일지'" @close="showLog=false">
      <form @submit.prevent="saveLog" class="flex flex-col gap-sm">
        <div><label class="text-label-md font-medium text-on-surface-variant">훈련 목표</label>
          <input v-model="logForm.goal" class="field mt-base" placeholder="예: 분리불안 둔감화 1단계" /></div>
        <div><label class="text-label-md font-medium text-on-surface-variant">훈련 내용 *</label>
          <textarea v-model="logForm.content" rows="4" class="field mt-base" required></textarea></div>
        <div><label class="text-label-md font-medium text-on-surface-variant">개선사항</label>
          <textarea v-model="logForm.improvement" rows="2" class="field mt-base"></textarea></div>
        <div class="flex justify-end gap-xs mt-xs">
          <button type="button" @click="showLog=false" class="btn btn-ghost">취소</button>
          <button class="btn btn-primary" :disabled="savingLog">{{ savingLog ? '저장 중…' : '저장' }}</button>
        </div>
      </form>
    </modal>
  </div>`
};
