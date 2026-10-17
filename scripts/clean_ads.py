# File: scripts/clean_ads.py
# Action: ToolLab 광고 플레이스홀더 박스 및 ADVERTISEMENT 라벨 완전 제거

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DIRS = ["tools", "ko"]

AD_PATTERNS = [
    # 1. adsbygoogle 스크립트 및 태그
    r'<script\b[^>]*src="[^"]*pagead2\.googlesyndication\.com[^"]*"[^>]*>.*?</script>',
    r'<ins\s+class="adsbygoogle"[^>]*>.*?</ins>',
    r'\(adsbygoogle\s*=\s*window\.adsbygoogle\s*\|\|\s*\[\]\)\.push\(\{\}\);',
    
    # 2. ADVERTISEMENT 텍스트를 포함하는 부모 박스 전체 (스크린샷에 나타난 바로 그 영역)
    r'<div[^>]*class=["\'][^"\']*(?:ad-|ads-)[^"\']*["\'][^>]*>.*?</div>',
    r'<section[^>]*class=["\'][^"\']*(?:ad-|ads-)[^"\']*["\'][^>]*>.*?</section>',
    r'<div[^>]*>[\s\n]*<span[^>]*>ADVERTISEMENT</span>.*?</div>[\s\n]*</div>',
    r'<!--\s*ADVERTISEMENT\s*-->',
    r'<div[^>]*style=["\'][^"\']*min-height:\s*250px[^"\']*["\'][^>]*>.*?</div>',
    
    # 3. 주석 및 플레이스홀더
    r'<!--\s*(?:Google\s*AdSense|Ad\s*Slot|Ad\s*Banner|광고).*?-->'
]

def clean_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    cleaned = content
    for pattern in AD_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.DOTALL | re.IGNORECASE)

    # 4. 남아있을 수 있는 ADVERTISEMENT 단독 라벨 청소
    cleaned = re.sub(r'<p[^>]*class=["\'][^"\']*text-center[^"\']*["\'][^>]*>\s*ADVERTISEMENT\s*</p>', "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'<div[^>]*class=["\'][^"\']*text-xs[^"\']*["\'][^>]*>\s*ADVERTISEMENT\s*</div>', "", cleaned, flags=re.IGNORECASE)

    # 불필요한 연속 개행 정리
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)

    if cleaned != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(cleaned)
        print(f"[광고 박스 박멸 완료] {os.path.relpath(file_path, BASE_DIR)}")
    else:
        print(f"[광고 없음/정상] {os.path.relpath(file_path, BASE_DIR)}")

def main():
    print(f"=== 광고 플레이스홀더 2차 정밀 청소: {BASE_DIR} ===")
    for d in TARGET_DIRS:
        target_path = os.path.join(BASE_DIR, d)
        if not os.path.exists(target_path):
            continue
        for file in os.listdir(target_path):
            if file.endswith(".html"):
                clean_file(os.path.join(target_path, file))

    print("\n--- 모든 파일의 광고 박스 청소가 완료되었습니다. ---")

if __name__ == "__main__":
    main()