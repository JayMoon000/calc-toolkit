# File: scripts/fix_header_perfect.py
# Action: 깨진 헤더 로고 HTML 복구 및 정상 루트(/) 연결

import os
import re

BASE_DIR = r"D:\Gemini_Files\Calc_Toolkit"

# 1. index.html 전용 표준 헤더 (2048 퍼즐 버튼 유지)
INDEX_HEADER = """  <header>
    <div class="container header-content">
      <a href="/" class="logo"><span>★</span> Starsign16 <span>Financial</span></a>
      <div class="header-right">
        <a href="/game-2048" class="btn-game">2048 퍼즐 🎮</a>
      </div>
    </div>
  </header>"""

# 2. 계산기 상세 페이지 전용 표준 헤더 (우측 버튼 없이 깔끔한 로고만)
DETAIL_HEADER = """  <header>
    <div class="container header-content">
      <a href="/" class="logo"><span>★</span> Starsign16 <span>Financial</span></a>
    </div>
  </header>"""

def run():
    print("=== 헤더 로고 및 링크 완벽 복구 시작 ===")
    
    html_files = [os.path.join(BASE_DIR, f) for f in os.listdir(BASE_DIR) if f.endswith(".html")]
    legal_dir = os.path.join(BASE_DIR, "legal")
    if os.path.exists(legal_dir):
        html_files.extend([os.path.join(legal_dir, f) for f in os.listdir(legal_dir) if f.endswith(".html")])

    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        fname = os.path.basename(file_path)
        replacement = INDEX_HEADER if fname == "index.html" else DETAIL_HEADER

        # 기존 <header> ... </header> 영역을 통째로 깨끗하게 치환
        new_content = re.sub(
            r'<header>.*?</header>',
            replacement,
            content,
            flags=re.DOTALL | re.IGNORECASE
        )

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[헤더 복구 완료] {fname}")

    print("\n=== 헤더 복구 완료 ===")

if __name__ == "__main__":
    run()