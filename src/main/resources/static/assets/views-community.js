/* PetLogs — 커뮤니티: 목록 / 상세 / 작성 */

const CATEGORIES = ["훈련 팁", "행동 교정", "운영 노하우", "자유"];

/* ------------------------------- 목록 ------------------------------- */
const CommunityView = {
  data() {
    return { loading: true, posts: [], total: 0, page: 1, size: 10, totalPages: 1, category: "", keyword: "", cats: CATEGORIES };
  },
  async mounted() { await this.load(); },
  methods: {
    fmtDate: fmt.dateShort,
    async load() {
      this.loading = true;
      try {
        const res = await api.posts.list({ page: this.page, size: this.size, category: this.category, keyword: this.keyword });
        this.posts = res.posts || [];
        this.total = res.totalCount || 0;
        this.totalPages = res.totalPages || 1;
        this.page = res.currentPage || this.page;
      } catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    setCategory(c) { this.category = c; this.page = 1; this.load(); },
    search() { this.page = 1; this.load(); },
    go(p) { if (p < 1 || p > this.totalPages) return; this.page = p; this.load(); }
  },
  template: `
  <div class="fade-up">
    <page-header eyebrow="Trainer Community" title="커뮤니티" subtitle="훈련사들과 노하우를 나누고 사례를 토론하세요.">
      <template #actions>
        <a href="#/community/write" class="btn btn-primary"><span class="material-symbols-outlined">edit_square</span>글쓰기</a>
      </template>
    </page-header>

    <div class="flex flex-wrap items-center gap-base mb-md">
      <button @click="setCategory('')" :class="['px-sm py-base rounded-full text-label-md border transition-colors', category==='' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary']">전체</button>
      <button v-for="c in cats" :key="c" @click="setCategory(c)" :class="['px-sm py-base rounded-full text-label-md border transition-colors', category===c ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary']">{{ c }}</button>
      <div class="relative ml-auto">
        <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input v-model="keyword" @keyup.enter="search" class="field !pl-10 max-w-xs" placeholder="제목·내용 검색" />
      </div>
    </div>

    <loading v-if="loading" />
    <empty-state v-else-if="!posts.length" icon="forum" text="게시글이 없습니다." />
    <div v-else class="flex flex-col gap-xs">
      <a v-for="p in posts" :key="p.postId" :href="'#/community/'+p.postId" class="polaroid-card rounded-xl p-md block group">
        <div class="flex items-start justify-between gap-sm">
          <div class="min-w-0">
            <span v-if="p.category" class="tag tag-neutral mb-base">{{ p.category }}</span>
            <h3 class="font-serif text-body-lg text-on-background group-hover:text-primary transition-colors leading-tight">{{ p.title }}</h3>
            <p class="text-body-md text-on-surface-variant mt-base line-clamp-2">{{ p.content }}</p>
          </div>
        </div>
        <div class="mt-sm pt-sm border-t border-surface-variant flex items-center gap-md text-label-sm text-on-surface-variant">
          <span>{{ p.writerName || '훈련사' }}</span>
          <span>{{ fmtDate(p.createdAt) }}</span>
          <span class="ml-auto inline-flex items-center gap-base"><span class="material-symbols-outlined text-base">favorite</span>{{ p.likeCount||0 }}</span>
          <span class="inline-flex items-center gap-base"><span class="material-symbols-outlined text-base">chat_bubble</span>{{ p.commentCount||0 }}</span>
          <span class="inline-flex items-center gap-base"><span class="material-symbols-outlined text-base">visibility</span>{{ p.viewCount||0 }}</span>
        </div>
      </a>
    </div>

    <div v-if="!loading && totalPages>1" class="flex items-center justify-center gap-base mt-lg">
      <button @click="go(page-1)" :disabled="page<=1" class="btn btn-ghost"><span class="material-symbols-outlined">chevron_left</span></button>
      <button v-for="n in totalPages" :key="n" @click="go(n)"
        :class="['w-9 h-9 rounded-lg text-label-md', n===page ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high']">{{ n }}</button>
      <button @click="go(page+1)" :disabled="page>=totalPages" class="btn btn-ghost"><span class="material-symbols-outlined">chevron_right</span></button>
    </div>
  </div>`
};

/* ------------------------------- 상세 ------------------------------- */
const PostDetailView = {
  props: ["id"],
  data() {
    return { loading: true, p: null, comments: [], newComment: "", posting: false,
             showEdit: false, editForm: { category: "", title: "", content: "" }, savingEdit: false, cats: CATEGORIES };
  },
  computed: {
    isMine() { return store.user && this.p && this.p.writerId === store.user.memberId; }
  },
  async mounted() { await this.load(); },
  methods: {
    fmtDate: fmt.date,
    isMyComment(c) { return store.user && c.writerId === store.user.memberId; },
    async load() {
      this.loading = true;
      try {
        this.p = await api.posts.get(this.id);
        this.comments = await api.posts.comments(this.id) || [];
      } catch (e) { if (e.status !== 401) store.toast(e.message, "error"); }
      finally { this.loading = false; }
    },
    async toggleLike() {
      try { const r = await api.posts.toggleLike(this.id); this.p.likedByMe = r.liked; this.p.likeCount = (this.p.likeCount||0) + (r.liked ? 1 : -1); }
      catch (e) { store.toast(e.message, "error"); }
    },
    async toggleBookmark() {
      try { const r = await api.posts.toggleBookmark(this.id); this.p.bookmarkedByMe = r.bookmarked; store.toast(r.bookmarked ? "북마크에 저장했습니다." : "북마크를 해제했습니다."); }
      catch (e) { store.toast(e.message, "error"); }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      this.posting = true;
      try { await api.posts.addComment(this.id, this.newComment); this.newComment = ""; this.comments = await api.posts.comments(this.id) || []; if (this.p) this.p.commentCount = this.comments.length; }
      catch (e) { store.toast(e.message, "error"); }
      finally { this.posting = false; }
    },
    async removeComment(c) {
      if (!confirm("댓글을 삭제할까요?")) return;
      try { await api.comments.remove(c.commentId); this.comments = this.comments.filter(x => x.commentId !== c.commentId); }
      catch (e) { store.toast(e.message, "error"); }
    },
    async report() {
      const reason = prompt("신고 사유를 입력하세요.");
      if (!reason) return;
      try { await api.posts.report(this.id, reason); store.toast("신고가 접수되었습니다.", "success"); }
      catch (e) { store.toast(e.message, "error"); }
    },
    openEdit() { this.editForm = { category: this.p.category || "", title: this.p.title, content: this.p.content }; this.showEdit = true; },
    async saveEdit() {
      this.savingEdit = true;
      try { this.p = await api.posts.update(this.id, this.editForm); store.toast("수정되었습니다.", "success"); this.showEdit = false; }
      catch (e) { store.toast(e.message, "error"); }
      finally { this.savingEdit = false; }
    },
    async removePost() {
      if (!confirm("게시글을 삭제할까요?")) return;
      try { await api.posts.remove(this.id); store.toast("삭제되었습니다."); location.hash = "#/community"; }
      catch (e) { store.toast(e.message, "error"); }
    }
  },
  template: `
  <div class="fade-up max-w-3xl mx-auto">
    <a href="#/community" class="inline-flex items-center gap-base text-label-md text-on-surface-variant hover:text-primary mb-sm">
      <span class="material-symbols-outlined">arrow_back</span> 커뮤니티
    </a>
    <loading v-if="loading" />
    <div v-else-if="!p"><empty-state icon="error" text="게시글을 찾을 수 없습니다." /></div>
    <div v-else>
      <article class="polaroid-card rounded-xl p-md">
        <div class="flex items-start justify-between gap-sm">
          <span v-if="p.category" class="tag tag-neutral">{{ p.category }}</span>
          <div v-if="isMine" class="flex gap-base">
            <button @click="openEdit" class="material-symbols-outlined text-on-surface-variant hover:text-primary">edit</button>
            <button @click="removePost" class="material-symbols-outlined text-on-surface-variant hover:text-error">delete</button>
          </div>
        </div>
        <h1 class="font-serif text-display-sm text-on-background mt-base leading-tight">{{ p.title }}</h1>
        <div class="flex items-center gap-md text-label-sm text-on-surface-variant mt-sm pb-sm border-b border-surface-variant">
          <span class="inline-flex items-center gap-base"><span class="material-symbols-outlined text-base">person</span>{{ p.writerName || '훈련사' }}</span>
          <span>{{ fmtDate(p.createdAt) }}</span>
          <span class="inline-flex items-center gap-base"><span class="material-symbols-outlined text-base">visibility</span>{{ p.viewCount||0 }}</span>
        </div>
        <p class="text-body-lg text-on-surface mt-md whitespace-pre-line leading-relaxed">{{ p.content }}</p>

        <div class="flex items-center gap-xs mt-md pt-sm border-t border-surface-variant">
          <button @click="toggleLike" :class="['btn', p.likedByMe ? 'btn-primary' : 'btn-secondary']">
            <span class="material-symbols-outlined" :class="{ fill: p.likedByMe }">favorite</span>{{ p.likeCount||0 }}
          </button>
          <button @click="toggleBookmark" :class="['btn', p.bookmarkedByMe ? 'btn-primary' : 'btn-secondary']">
            <span class="material-symbols-outlined" :class="{ fill: p.bookmarkedByMe }">bookmark</span>북마크
          </button>
          <button v-if="!isMine" @click="report" class="btn btn-ghost ml-auto"><span class="material-symbols-outlined">flag</span>신고</button>
        </div>
      </article>

      <!-- 댓글 -->
      <section class="mt-lg">
        <h3 class="font-serif text-headline-md mb-md">댓글 {{ comments.length }}</h3>
        <div class="flex gap-base mb-md">
          <input v-model="newComment" @keyup.enter="addComment" class="field" placeholder="댓글을 입력하세요" />
          <button @click="addComment" class="btn btn-primary" :disabled="posting">등록</button>
        </div>
        <empty-state v-if="!comments.length" icon="chat_bubble" text="첫 댓글을 남겨보세요." />
        <div v-else class="flex flex-col gap-xs">
          <div v-for="c in comments" :key="c.commentId" class="bg-surface-container-lowest border border-surface-variant rounded-lg p-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-base">
                <div class="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-label-sm font-bold">{{ (c.writerName||'?').slice(0,1) }}</div>
                <span class="text-label-md font-semibold">{{ c.writerName || '훈련사' }}</span>
                <span class="text-label-sm text-on-surface-variant">{{ fmtDate(c.createdAt) }}</span>
              </div>
              <button v-if="isMyComment(c)" @click="removeComment(c)" class="material-symbols-outlined text-on-surface-variant hover:text-error text-lg">delete</button>
            </div>
            <p class="text-body-md mt-base pl-9 whitespace-pre-line">{{ c.content }}</p>
          </div>
        </div>
      </section>
    </div>

    <modal v-if="showEdit" title="게시글 수정" size="lg" @close="showEdit=false">
      <form @submit.prevent="saveEdit" class="flex flex-col gap-sm">
        <div><label class="text-label-md font-medium text-on-surface-variant">카테고리</label>
          <select v-model="editForm.category" class="field mt-base"><option value="">선택</option><option v-for="c in cats" :key="c">{{ c }}</option></select></div>
        <div><label class="text-label-md font-medium text-on-surface-variant">제목 *</label>
          <input v-model="editForm.title" class="field mt-base" required /></div>
        <div><label class="text-label-md font-medium text-on-surface-variant">내용 *</label>
          <textarea v-model="editForm.content" rows="6" class="field mt-base" required></textarea></div>
        <div class="flex justify-end gap-xs mt-xs">
          <button type="button" @click="showEdit=false" class="btn btn-ghost">취소</button>
          <button class="btn btn-primary" :disabled="savingEdit">{{ savingEdit ? '저장 중…' : '저장' }}</button>
        </div>
      </form>
    </modal>
  </div>`
};

/* ------------------------------- 작성 ------------------------------- */
const PostWriteView = {
  data() { return { form: { category: "", title: "", content: "" }, saving: false, cats: CATEGORIES }; },
  methods: {
    async submit() {
      this.saving = true;
      try { const p = await api.posts.create(this.form); store.toast("게시글이 등록되었습니다.", "success"); location.hash = "#/community/" + p.postId; }
      catch (e) { store.toast(e.message, "error"); }
      finally { this.saving = false; }
    }
  },
  template: `
  <div class="fade-up max-w-3xl mx-auto">
    <a href="#/community" class="inline-flex items-center gap-base text-label-md text-on-surface-variant hover:text-primary mb-sm">
      <span class="material-symbols-outlined">arrow_back</span> 커뮤니티
    </a>
    <page-header eyebrow="New Post" title="글쓰기" />
    <form @submit.prevent="submit" class="polaroid-card rounded-xl p-md flex flex-col gap-sm">
      <div><label class="text-label-md font-medium text-on-surface-variant">카테고리</label>
        <select v-model="form.category" class="field mt-base"><option value="">선택</option><option v-for="c in cats" :key="c">{{ c }}</option></select></div>
      <div><label class="text-label-md font-medium text-on-surface-variant">제목 *</label>
        <input v-model="form.title" class="field mt-base" required placeholder="제목을 입력하세요" /></div>
      <div><label class="text-label-md font-medium text-on-surface-variant">내용 *</label>
        <textarea v-model="form.content" rows="10" class="field mt-base" required placeholder="훈련 노하우나 사례를 자유롭게 공유하세요."></textarea></div>
      <div class="flex justify-end gap-xs mt-xs">
        <a href="#/community" class="btn btn-ghost">취소</a>
        <button class="btn btn-primary" :disabled="saving">{{ saving ? '등록 중…' : '등록' }}</button>
      </div>
    </form>
  </div>`
};
