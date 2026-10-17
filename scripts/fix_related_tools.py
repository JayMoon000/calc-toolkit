# File: scripts/fix_related_tools.py
# Action: 영문 툴 연관 유틸리티 영역 유연 매칭 치환 및 2048 경로 완벽 교정

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS_DIR = os.path.join(BASE_DIR, "tools")

# 교체할 표준 연관 툴 블록 (검증된 3종 도구 및 최신 game-2048 링크)
SAFE_RELATED_BLOCK = """    <!-- RELATED UTILITIES (Safe Verified Tools) -->
    <div class="mt-16 pt-8 border-t border-slate-800">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Related Utilities You Might Need
        </h2>
        <a href="/" class="text-xs text-slate-400 hover:text-white transition">Explore All Tools →</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/tools/loan-compound-calc" class="p-4 rounded-xl bg-[#151D2A] border border-[#26354A] hover:border-blue-500/50 transition group">
          <div class="text-[10px] font-bold text-blue-400 tracking-wider uppercase mb-1">Finance</div>
          <div class="font-semibold text-slate-200 group-hover:text-white mb-1">Loan & Compound Engine</div>
          <p class="text-xs text-slate-400">Mortgage amortizations & growth simulator.</p>
        </a>
        <a href="/tools/unit-converter" class="p-4 rounded-xl bg-[#151D2A] border border-[#26354A] hover:border-blue-500/50 transition group">
          <div class="text-[10px] font-bold text-amber-400 tracking-wider uppercase mb-1">Utility</div>
          <div class="font-semibold text-slate-200 group-hover:text-white mb-1">Universal Unit Converter</div>
          <p class="text-xs text-slate-400">Length, area, weight, and volume units.</p>
        </a>
        <a href="/tools/game-2048" class="p-4 rounded-xl bg-[#151D2A] border border-[#26354A] hover:border-blue-500/50 transition group">
          <div class="text-[10px] font-bold text-purple-400 tracking-wider uppercase mb-1">Casual Brain</div>
          <div class="font-semibold text-slate-200 group-hover:text-white mb-1">2048 Classic Web Puzzle</div>
          <p class="text-xs text-slate-400">Merge numbers to 2048 with smooth dark UI.</p>
        </a>
      </div>
    </div>\n\n"""

def clean_tools_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. 파일 내 구형 2048 링크 일괄 치환 (2048.html, /tools/2048 -> /tools/game-2048)
    content = re.sub(r'href=["\'](?:/tools/|\.\./tools/)?2048(?:\.html)?["\']', 'href="/tools/game-2048"', content, flags=re.IGNORECASE)

    # 2. 'Related Utilities' 또는 'Explore All'을 포함하는 하단 연관 섹션 탐색 (줄바꿈/엔티티 유연 대응)
    # 패턴: border-t나 mt- 계열 div 시작부터 풋터 직전까지 매칭
    pattern = r'(<div[^>]*class=["\'][^"\']*(?:border-t|mt-12|mt-16)[^"\']*["\'][^>]*>[\s\S]*?(?:Related[\s\S]{1,30}?Utilities|Explore\s+All[\s\S]{1,20}?Tools)[\s\S]*?)(?=\s*<div[^>]*class=["\'][^"\']*(?:mt-20|border-t|footer)[^"\']*["\']|\s*<footer|\s*</main|\s*<!-- Footer)'
    
    match = re.search(pattern, content, flags=re.IGNORECASE)
    if match:
        content = content[:match.start()] + SAFE_RELATED_BLOCK.strip() + "\n\n  " + content[match.end():]
        print(f"[교정 성공] {os.path.basename(file_path)}")
    else:
        # 광범위 대체 패턴 (Related Utilities 텍스트 주변을 포괄 검색)
        alt_pattern = r'(<div[^>]*>[\s\S]*?Related[\s\S]*?Utilities[\s\S]*?)(?=<div[^>]*>\s*<p[^>]*>Starsign16|<footer)'
        alt_match = re.search(alt_pattern, content, flags=re.IGNORECASE)
        if alt_match:
            content = content[:alt_match.start()] + SAFE_RELATED_BLOCK.strip() + "\n\n  " + content[alt_match.end():]
            print(f"[대체 패턴 교정 성공] {os.path.basename(file_path)}")
        else:
            print(f"[매칭 실패] {os.path.basename(file_path)}")

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

def main():
    print(f"=== 영문 툴 연관 링크 및 2048 경로 정규식 정밀 교정 ===")
    for file in os.listdir(TOOLS_DIR):
        if file.endswith(".html") and file != "game-2048.html":
            clean_tools_file(os.path.join(TOOLS_DIR, file))

    print("\n--- 모든 파일 교정 작업이 완료되었습니다. ---")

if __name__ == "__main__":
    main()