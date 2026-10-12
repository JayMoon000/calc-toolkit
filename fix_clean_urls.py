import os
import re

# 작업 대상 디렉토리 (현재 폴더)
TARGET_DIR = r"D:\Gemini_Files\Calc_Toolkit"

# 1. HTML 파일 일괄 수정 (canonical, og:url, index.html 링크)
html_files = [f for f in os.listdir(TARGET_DIR) if f.endswith(".html")]

for fname in html_files:
    fpath = os.path.join(TARGET_DIR, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # canonical URL에서 .html 제거
    # 예: href="https://starsign16.com/about.html" -> href="https://starsign16.com/about"
    new_content = re.sub(
        r'(<link\s+rel=["\']canonical["\']\s+href=["\']https://starsign16\.com/[^"\']+?)\.html(["\'])',
        r'\1\2',
        content
    )

    # og:url 에서 .html 제거
    # 예: content="https://starsign16.com/about.html" -> content="https://starsign16.com/about"
    new_content = re.sub(
        r'(<meta\s+property=["\']og:url["\']\s+content=["\']https://starsign16\.com/[^"\']+?)\.html(["\'])',
        r'\1\2',
        new_content
    )

    # ./index.html 링크를 / 로 변경
    new_content = re.sub(
        r'href=["\']\./index\.html["\']',
        'href="/"',
        new_content
    )

    if new_content != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[HTML 수정 완료] {fname}")
    else:
        print(f"[HTML 변경 없음] {fname}")

# 2. sitemap.xml 일괄 수정 (.html 제거)
sitemap_path = os.path.join(TARGET_DIR, "sitemap.xml")
if os.path.exists(sitemap_path):
    with open(sitemap_path, "r", encoding="utf-8") as f:
        sitemap_content = f.read()

    # <loc>https://starsign16.com/...html</loc> -> .html 제거
    new_sitemap = re.sub(
        r'(<loc>https://starsign16\.com/[^<]+?)\.html(</loc>)',
        r'\1\2',
        sitemap_content
    )

    if new_sitemap != sitemap_content:
        with open(sitemap_path, "w", encoding="utf-8") as f:
            f.write(new_sitemap)
        print("[sitemap.xml 수정 완료]")
    else:
        print("[sitemap.xml 변경 없음]")

print("\n모든 작업이 완료되었습니다!")