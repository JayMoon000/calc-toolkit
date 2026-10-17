// File: js/related-tools.js
// Action: Starsign16 검증된 영문 툴 10종 완전 무작위(Random) 추천 렌더링

(function () {
  const ALL_TOOLS = [
    {
      id: "loan-compound-calc",
      name: "Loan & Compound Engine",
      category: "Finance",
      tagColor: "text-blue-400",
      desc: "Simulate amortization schedules and compound interest growth.",
      url: "/tools/loan-compound-calc"
    },
    {
      id: "percentage-calc",
      name: "Percentage & Margin",
      category: "Finance",
      tagColor: "text-blue-400",
      desc: "Calculate proportion, percentage changes, and retail profit margins.",
      url: "/tools/percentage-calc"
    },
    {
      id: "word-counter",
      name: "Word & Character Counter",
      category: "Productivity",
      tagColor: "text-emerald-400",
      desc: "Real-time word, character, byte count and reading duration.",
      url: "/tools/word-counter"
    },
    {
      id: "unit-converter",
      name: "Universal Unit Converter",
      category: "Utility",
      tagColor: "text-amber-400",
      desc: "Length, mass, area, temperature, and volume conversions.",
      url: "/tools/unit-converter"
    },
    {
      id: "dday-calculator",
      name: "D-Day & Working Days",
      category: "Productivity",
      tagColor: "text-emerald-400",
      desc: "Countdowns and business working day schedules without weekends.",
      url: "/tools/dday-calculator"
    },
    {
      id: "qr-generator",
      name: "Vector QR Code Generator",
      category: "Utility",
      tagColor: "text-amber-400",
      desc: "Generate clean QR codes for links, Wi-Fi, and text.",
      url: "/tools/qr-generator"
    },
    {
      id: "json-formatter",
      name: "JSON Formatter & Validator",
      category: "Developer",
      tagColor: "text-indigo-400",
      desc: "Beautify, inspect, and validate JSON payloads with syntax highlighting.",
      url: "/tools/json-formatter"
    },
    {
      id: "text-formatter",
      name: "Text Formatter & Slugifier",
      category: "Developer",
      tagColor: "text-indigo-400",
      desc: "Case conversions, line sorting, and clean URL slug generation.",
      url: "/tools/text-formatter"
    },
    {
      id: "image-compressor",
      name: "Image Compressor & WebP",
      category: "Media",
      tagColor: "text-purple-400",
      desc: "Compress JPG, PNG, and WebP images locally via HTML5 Canvas.",
      url: "/tools/image-compressor"
    },
    {
      id: "game-2048",
      name: "2048 Classic Web Puzzle",
      category: "Casual Brain",
      tagColor: "text-purple-400",
      desc: "Slide identical numbers and reach the 2048 milestone in dark mode.",
      url: "/tools/game-2048"
    }
  ];

  // 현재 실행 중인 페이지 파일명 추출
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split("/").pop().replace(".html", "");

  // 1. 현재 툴을 제외한 후보군 도출
  let candidates = ALL_TOOLS.filter(t => t.id !== currentFile);

  // 2. Fisher-Yates 셔플 알고리즘으로 무작위 섞기
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // 3. 무작위로 섞인 목록에서 앞 3개 선택
  const selectedTools = candidates.slice(0, 3);

  // 4. HTML 렌더링
  const container = document.createElement("section");
  container.className = "mt-12 pt-8 border-t border-slate-800";
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Related Utilities You Might Need
      </h2>
      <a href="/" class="text-xs text-slate-400 hover:text-white transition">Explore All Tools →</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${selectedTools.map(t => `
        <a href="${t.url}" class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition group">
          <div class="text-[10px] font-bold ${t.tagColor} tracking-wider uppercase mb-1">${t.category}</div>
          <div class="font-semibold text-slate-200 group-hover:text-white mb-1 text-sm">${t.name}</div>
          <p class="text-xs text-slate-400 line-clamp-2">${t.desc}</p>
        </a>
      `).join("")}
    </div>
  `;

  // footer 바로 앞에 삽입
  const footer = document.querySelector("footer");
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(container, footer);
  } else {
    document.body.appendChild(container);
  }
})();