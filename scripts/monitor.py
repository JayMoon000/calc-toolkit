import os
import json
import time
import requests
import feedparser
import google.generativeai as genai

# 환경변수 로드 (GitHub Secrets 관리)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

TARGET_KEYWORDS = ["최저임금", "부동산 중개", "중개보수", "소득세법", "퇴직급여", "건강보험료율", "국민연금"]
FEED_URL = "https://www.moleg.go.kr/board.es?mid=a10501000000&bid=0028&act=rss"

def send_telegram(msg: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("텔레그램 설정값 부재")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"텔레그램 발송 실패: {e}")

def call_gemini_with_retry(model, prompt: str, max_retries: int = 3) -> str:
    for attempt in range(1, max_retries + 1):
        try:
            response = model.generate_content(
                prompt,
                request_options={"timeout": 120}
            )
            return response.text.strip()
        except Exception as e:
            if attempt == max_retries:
                raise e
            wait_time = attempt * 5
            print(f"[재시도 {attempt}/{max_retries}] 에러: {e} -> {wait_time}초 후 재시도")
            time.sleep(wait_time)

def check_law_updates():
    try:
        # 1. 기준 데이터 로드
        with open("config/rates.json", "r", encoding="utf-8") as f:
            current_rates = json.load(f)

        # 2. 공공 피드 가져오기 (User-Agent 명시 및 requests 사용)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = requests.get(FEED_URL, headers=headers, timeout=20)
        res.raise_for_status()

        # feedparser로 파싱 (XML 문법 오류 무시하고 읽을 수 있는 항목만 최대한 수집)
        feed = feedparser.parse(res.content)

        collected_notices = []
        for entry in feed.entries:
            title = entry.get("title", "")
            link = entry.get("link", "")
            if any(kw in title for kw in TARGET_KEYWORDS):
                collected_notices.append(f"- 제목: {title}\n  링크: {link}")

        if not collected_notices:
            print(f"수집된 전체 안건 수: {len(feed.entries)}건 (관련 법 개정 안건 없음)")
            return

        # 3. Gemini API 분석 호출
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
당신은 대한민국 세법/노무/부동산 법률 변경 분석가입니다.
아래 수집된 법제처 공고 목록을 검토하고, 현재 계산기 웹사이트의 기준 데이터(JSON)에 변경이 필요한지 분석하세요.

[현재 계산기 기준 데이터 (config/rates.json)]:
{json.dumps(current_rates, ensure_ascii=False, indent=2)}

[새로 감지된 공고]:
{chr(10).join(collected_notices)}

만약 실제 요율/수치 변경이 수반되는 안건이라면:
1. 영향받는 계산기 항목
2. 개정 내용 요약 및 시행일자
3. config/rates.json 에서 수정해야 할 필드명을 Markdown 형태로 보고하세요.
단순 용어 개정이나 무관한 내용이면 "수정 불필요"라고만 답하세요.
"""
        report = call_gemini_with_retry(model, prompt)

        if "수정 불필요" not in report:
            send_telegram(f"🚨 *[Calc Toolkit 법 개정 감지]*\n\n{report}")
            print("알림 발송 완료.")
        else:
            print("특이사항 없음.")

    except Exception as e:
        error_msg = f"⚠️ *[Calc Toolkit] 파이프라인 확인 요망*\n\n• 결과: {e}"
        send_telegram(error_msg)
        print(error_msg)

if __name__ == "__main__":
    check_law_updates()
