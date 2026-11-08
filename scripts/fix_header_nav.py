# File: scripts/fix_header_nav.py
# Action: 헤더 로고 링크를 루트(/)로 교체 및 불필요한 '한국어 허브' 버튼 일괄 제거

import os
import re

BASE_DIR = r"D:\Gemini_Files\Calc_Toolkit"

def clean_headers():
    print("=== 헤더 로고 링크 교체 및 한국어 허브 버튼 제거 시작 ===")
    
    # 루트 HTML 및 legal 폴더 내 HTML 수집
    html_files = [os.path.join(BASE_DIR, f) for f in os.listdir(BASE_DIR) if f.endswith(".html")]
    legal_dir = os.path.join(BASE_DIR, "legal")
    if os.path.exists(legal_dir):
        html_files.extend([os.path.join(legal_dir, f) for f in os.listdir(legal_dir) if f.endswith(".html")])

    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        orig = content

        # 1. 왼쪽 상단 로고 링크 교체 (/ko -> /)
        content = re.sub(
            r'<a\s+href=["\'](?:/ko|/ko/|https://starsign16\.com/ko)["\']([^>]*class=["\'][^"\']*logo[^"\']*["\'])',
            r'<a href="/\1',
            content,
            flags=re.IGNORECASE
        )
        content = content.replace('href="/ko"', 'href="/"')
        content = content.replace('href="/ko/"', 'href="/"')

        # 2. 캐노니컬 URL에 /ko가 남아있는 경우 보정
        content = content.replace('https://starsign16.com/ko', 'https://starsign16.com')

        # 3. 우측 상단 '← 한국어 허브' 링크/버튼 태그 완전 제거
        content = re.sub(
            r'<a[^>]*href=["\'][^"\']*["\'][^>]*>\s*(?:&larr;|←)?\s*한국어\s*허브\s*</a>',
            '',
            content,
            flags=re.IGNORECASE
        )
        content = re.sub(
            r'<button[^>]*>\s*(?:&larr;|←)?\s*한국어\s*허브\s*</button>',
            '',
            content,
            flags=re.IGNORECASE
        )

        if content != orig:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[수정 완료] {os.path.basename(file_path)}")

    print("\n=== 헤더 정리 완료 ===")

if __name__ == "__main__":
    clean_headers()