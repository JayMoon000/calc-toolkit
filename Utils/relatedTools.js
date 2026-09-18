/**
 * Related Tools & Common Footer Injector
 * - 현재 도구 정확한 감지 및 중복 노출 차단 (확장자 유무 대응)
 * - 피셔-예이츠 셔플 기반 동적 3개 추천
 */
(function () {
  const tools = [
    { slug: 'savings', path: 'savings.html', name: '예·적금 계산기', desc: '이자소득세 15.4%·비과세 만기 수령액 비교', icon: '₩' },
    { slug: 'real-estate', path: 'real-estate.html', name: '부동산 중개보수', desc: '2026 공인중개사법 매매·임대차 상한 복비', icon: '🏢' },
    { slug: 'salary', path: 'salary.html', name: '연봉 실수령액', desc: '4대보험 최신 요율·근로소득 간이세액 공제', icon: '💰' },
    { slug: 'severance', path: 'severance.html', name: '퇴직금 계산기', desc: '근속연수공제·환산급여 개정세법 세후 수령액', icon: '💼' },
    { slug: 'hourly', path: 'hourly.html', name: '시급·주휴수당', desc: '2026년 최저시급 10,030원·주휴시간 자동 산출', icon: '⏱️' },
    { slug: 'converter', path: 'converter.html', name: '스마트 단위 변환기', desc: '아파트 전용 84㎡ 평수 환산·글로벌 도량형', icon: '📐' }
  ];

  // 1. 현재 URL에서 slug(확장자 제거된 파일명) 정밀 추출
  const rawFile = window.location.pathname.split('/').pop() || 'index.html';
  const currentSlug = rawFile.replace(/\.html$/, '').toLowerCase();

  // 2. 현재 도구 완벽 제외 (slug 기준 비교)
  const candidateTools = tools.filter(tool => tool.slug !== currentSlug);

  // 3. 피셔-예이츠(Fisher-Yates) 셔플로 방문 시마다 다양한 3개 도구 노출
  for (let i = candidateTools.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateTools[i], candidateTools[j]] = [candidateTools[j], candidateTools[i]];
  }
  const selectedTools = candidateTools.slice(0, 3);

  const container = document.getElementById('related-tools-container');
  if (!container) return;

  const html = `
    <!-- 상호 내부 링크 (Related Tools) -->
    <section class="mt-14 pt-8 border-t border-slate-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-slate-800">함께 많이 활용하는 연산 도구</h3>
        <a href="./game-2048.html" class="text-xs font-semibold text-blue-600 hover:underline">🎮 머리 식히기 (2048)</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${selectedTools.map(item => `
          <a href="./${item.path}" class="block p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">${item.icon}</span>
              <span class="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">${item.name}</span>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed">${item.desc}</p>
          </a>
        `).join('')}
      </div>
    </section>

    <!-- 공통 상세 페이지 푸터 -->
    <footer class="mt-12 pt-6 pb-8 border-t border-slate-200 text-xs text-slate-500">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <a href="./index.html" class="font-bold text-slate-700 hover:text-blue-600 transition-colors">← 스마트 계산기 툴킷 홈으로</a>
          <p class="text-[11px] text-slate-400 mt-0.5">© 2026 Starsign16. 2026년 법정 기준 준수.</p>
        </div>
        <div class="flex items-center gap-3 font-semibold text-slate-600">
          <a href="./about.html" class="hover:text-blue-600">소개</a>
          <span class="text-slate-300">|</span>
          <a href="./contact.html" class="hover:text-blue-600">문의</a>
          <span class="text-slate-300">|</span>
          <a href="./privacy.html" class="hover:text-blue-600">개인정보처리방침</a>
          <span class="text-slate-300">|</span>
          <a href="./terms.html" class="hover:text-blue-600">이용약관</a>
        </div>
      </div>
    </footer>
  `;

  container.innerHTML = html;
})();