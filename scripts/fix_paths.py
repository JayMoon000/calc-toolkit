# File: scripts/fix_paths.py
# Action: 하위 폴더(ko, tools, legal) HTML 파일 내 상대경로 및 Canonical 태그 일괄 보정

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TARGET_SUBDIRS = ["ko", "tools", "legal"]
RESOURCE_PATTERNS = [
    r'href="(components/[^"]+)"',
    r'src="(components/[^"]+)"',
    r'href="(Utils/[^"]+)"',
    r'src="(Utils/[^"]+)"',
    r'src="(images/[^"]+)"',
    r'href="(images/[^"]+)"'
]

def update_html_file(file_path, subdir_name):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content
    filename_without_ext = os.path.splitext(os.path.basename(file_path))[0]

    # 1. 리소스 상대경로 보정 (이미 ../가 없는 경우에만 ../ 추가)
    for pattern in RESOURCE_PATTERNS:
        content = re.sub(pattern, r'href="../\1"' if 'href' in pattern else r'src="../\1"', content)

    # 2. Canonical 태그 갱신
    new_canonical = f"https://starsign16.com/{subdir_name}/{filename_without_ext}"
    if filename_without_ext == "index":
        new_canonical = f"https://starsign16.com/{subdir_name}"

    canonical_tag = f'<link rel="canonical" href="{new_canonical}">'
    
    if '<link rel="canonical"' in content:
        content = re.sub(r'<link rel="canonical"[^>]*>', canonical_tag, content)
    else:
        # head 태그 바로 아래 삽입
        content = re.sub(r'(<head[^>]*>)', rf'\1\n  {canonical_tag}', content, count=1)

    # 3. 홈 로고 링크 수정 (index.html -> /ko 또는 /)
    if subdir_name == "ko":
        content = re.sub(r'href="index\.html"', 'href="/ko"', content)
    else:
        content = re.sub(r'href="index\.html"', 'href="/"', content)

    if content != original_content:
        # 백업 생성
        with open(file_path + ".bak", "w", encoding="utf-8") as bf:
            bf.write(original_content)
        # 본문 덮어쓰기
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[수정 완료] {subdir_name}/{os.path.basename(file_path)} (Canonical: {new_canonical})")
    else:
        print(f"[변경 없음] {subdir_name}/{os.path.basename(file_path)}")

def main():
    print(f"=== 프로젝트 루트: {BASE_DIR} ===")
    for subdir in TARGET_SUBDIRS:
        dir_path = os.path.join(BASE_DIR, subdir)
        if not os.path.exists(dir_path):
            continue
        for file in os.listdir(dir_path):
            if file.endswith(".html"):
                file_path = os.path.join(dir_path, file)
                update_html_file(file_path, subdir)

    print("\n--- 모든 하위 HTML 경로 및 SEO Canonical 태그 보정이 완료되었습니다. ---")

if __name__ == "__main__":
    main()