# File: scripts/fix_index_and_links.py
# Action: Global (EN) 버튼 제거 및 index.html / 전체 툴의 404 링크(ko, legal/ko) 완벽 교정

import os
import re

BASE_DIR = r"D:\Gemini_Files\Calc_Toolkit"
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

def fix_all_links():
    print("=== 링크 404 오류 수정 및 Global (EN) 버튼 제거 시작 ===")
    
    # 1. 대상 HTML 파일 목록 (루트 HTML 및 legal 내부 HTML)
    html_files = [os.path.join(BASE_DIR, f) for f in os.listdir(BASE_DIR) if f.endswith(".html")]
    legal_dir = os.path.join(BASE_DIR, "legal")
    if os.path.exists(legal_dir):
        html_files.extend([os.path.join(legal_dir, f) for f in os.listdir(legal_dir) if f.endswith(".html")])

    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        orig = content

        # [1] index.html의 Global (EN) 버튼/링크 태그 제거
        if os.path.basename(file_path) == "index.html":
            # <a> 태그나 <button> 태그 형태의 Global (EN) 감지 및 삭제
            content = re.sub(
                r'<a[^>]*class="[^"]*"[^>]*>\s*(?:<span[^>]*>.*?</span>\s*)*Global\s*\(EN\).*?</a>',
                '',
                content,
                flags=re.DOTALL | re.IGNORECASE
            )
            content = re.sub(
                r'<button[^>]*>\s*Global\s*\(EN\).*?</button>',
                '',
                content,
                flags=re.DOTALL | re.IGNORECASE
            )
            # 혹시 남아있을 수 있는 단순 형태
            content = re.sub(r'<a[^>]*href="[^"]*"[^>]*>.*?Global\s*\(EN\).*?</a>', '', content, flags=re.DOTALL | re.IGNORECASE)

        # [2] legal/ko/ 경로 교정 -> legal/
        content = content.replace('/legal/ko/', '/legal/')
        content = content.replace('legal/ko/', 'legal/')
        content = content.replace('./legal/ko/', './legal/')
        content = content.replace('../legal/ko/', './legal/')

        # [3] /ko/ 툴 경로 교정 -> / (루트 경로)
        content = content.replace('href="/ko/', 'href="/')
        content = content.replace('href="./ko/', 'href="/')
        content = content.replace('href="ko/', 'href="/')
        
        # [4] tools/ 경로가 혹시 남아있다면 제거
        content = content.replace('href="/tools/', 'href="/')
        content = content.replace('href="tools/', 'href="/')

        # [5] cleanUrls 환경에 맞게 내부 a href의 .html 확장자 제거
        # (단, 외부 링크나 css/js는 제외하고 내부 페이지만 매핑)
        tool_slugs = [
            'salary', 'severance', 'hourly', 'savings', 'real-estate',
            'discount-calc', 'dday-calculator', 'word-counter', 'qr-generator', 'game-2048'
        ]
        for slug in tool_slugs:
            content = content.replace(f'href="{slug}.html"', f'href="/{slug}"')
            content = content.replace(f'href="./{slug}.html"', f'href="/{slug}"')
            content = content.replace(f'href="/{slug}.html"', f'href="/{slug}"')

        for doc in ['privacy', 'terms', 'about', 'contact']:
            content = content.replace(f'legal/{doc}.html', f'legal/{doc}')

        if content != orig:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[수정 완료] {os.path.basename(file_path)}")

    print("\n=== 링크 및 상단 버튼 정리 완료 ===")

if __name__ == "__main__":
    fix_all_links()