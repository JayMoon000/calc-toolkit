# File: scripts/fix_legal_links.py
# Action: 한국어 페이지(/ko/*.html) 푸터 링크를 /legal/ko/... 로 일괄 업데이트

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KO_DIR = os.path.join(BASE_DIR, "ko")

def patch_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    # 푸터 링크를 /legal/ko/ 경로로 정밀 치환
    content = re.sub(r'href=["\']/legal/about["\']', 'href="/legal/ko/about"', content)
    content = re.sub(r'href=["\']/legal/privacy["\']', 'href="/legal/ko/privacy"', content)
    content = re.sub(r'href=["\']/legal/terms["\']', 'href="/legal/ko/terms"', content)
    content = re.sub(r'href=["\']/legal/contact["\']', 'href="/legal/ko/contact"', content)

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[한글 푸터 링크 교정] {os.path.basename(file_path)}")
    else:
        print(f"[변경 없음] {os.path.basename(file_path)}")

def main():
    print(f"=== 한글 페이지 법적 고지 링크 교정 시작 ===")
    for file in os.listdir(KO_DIR):
        if file.endswith(".html"):
            patch_file(os.path.join(KO_DIR, file))
    print("\n--- 교정 완료 ---")

if __name__ == "__main__":
    main()