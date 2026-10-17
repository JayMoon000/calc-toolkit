import os
import re

# 대상 디렉토리 (현재 스크립트가 실행되는 디렉토리)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "https://starsign16.com"

# 제외할 파일이 있다면 추가 (예: admin.html 등 검색 색인 불필요 파일)
EXCLUDE_FILES = ["admin.html"]

def process_html_file(file_path, filename):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # index.html은 루트(/)로, 나머지는 파일명 그대로 매핑
    if filename == "index.html":
        canonical_url = f"{BASE_URL}/"
    else:
        canonical_url = f"{BASE_URL}/{filename}"

    canonical_tag = f'  <link rel="canonical" href="{canonical_url}" />\n  <meta property="og:url" content="{canonical_url}" />'

    # 1. 이미 canonical 태그가 존재하는 경우 -> 교체
    if re.search(r'<link\s+rel=["\']canonical["\'].*?>', content, re.IGNORECASE):
        content = re.sub(
            r'<link\s+rel=["\']canonical["\'].*?>',
            f'<link rel="canonical" href="{canonical_url}" />',
            content,
            flags=re.IGNORECASE
        )
        # og:url도 이미 있으면 갱신, 없으면 유지
        if re.search(r'<meta\s+property=["\']og:url["\'].*?>', content, re.IGNORECASE):
            content = re.sub(
                r'<meta\s+property=["\']og:url["\'].*?>',
                f'<meta property="og:url" content="{canonical_url}" />',
                content,
                flags=re.IGNORECASE
            )
        print(f"[갱신 완료] {filename} -> {canonical_url}")

    # 2. canonical 태그가 없는 경우 -> <title> 태그 바로 뒤에 삽입
    else:
        title_pattern = re.compile(r'(</title>)', re.IGNORECASE)
        if title_pattern.search(content):
            content = title_pattern.sub(f'\\1\n{canonical_tag}', content, count=1)
            print(f"[삽입 완료] {filename} -> {canonical_url}")
        else:
            # <title>이 없는 경우 <head> 바로 뒤에 삽입
            head_pattern = re.compile(r'(<head[^>]*>)', re.IGNORECASE)
            if head_pattern.search(content):
                content = head_pattern.sub(f'\\1\n{canonical_tag}', content, count=1)
                print(f"[삽입 완료 (head 뒤)] {filename} -> {canonical_url}")
            else:
                print(f"[스킵] {filename}: <head> 또는 <title> 태그를 찾을 수 없음")
                return

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    print(f"작업 디렉토리: {BASE_DIR}")
    html_files = [
        f for f in os.listdir(BASE_DIR)
        if f.endswith(".html") and f not in EXCLUDE_FILES
    ]

    for filename in html_files:
        file_path = os.path.join(BASE_DIR, filename)
        process_html_file(file_path, filename)

    print(f"\n총 {len(html_files)}개 HTML 파일 처리 완료!")

if __name__ == "__main__":
    main()