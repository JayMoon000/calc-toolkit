import os
import json
import time
import requests
import feedparser
import google.generativeai as genai

# 환경변수 로드 (GitHub Secrets)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "rates.json")

# 계산기 실제 데이터셋에 맞춘 정밀 키워드
TARGET_KEYWORDS = [
    "최저임금", "중개보수", "부동산 중개", 
    "소득세법", "조세특례제한법", "간이세액", 
    "건강보험료율", "국민연금", "기준소득월액", "퇴직급여"
]
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
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            current_rates = json.load(f)

        base_year = current_rates.get("baseYear", "2026")

        # 2. 공공 피드 가져오기
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = requests.get(FEED_URL, headers=headers, timeout=20)
        res.raise_for_status()

        feed = feedparser.parse(res.content)
        total_notices = len(feed.entries)

        collected_notices = []
        for entry in feed.entries:
            title = entry.get("title", "")
            link = entry.get("link", "")
            if any(kw in title for kw in TARGET_KEYWORDS):
                collected_notices.append(f"- 제목: {title}\n  링크: {link}")

        # 관련 안건이 하나도 없을 때 -> 정기 이상 무 보고 발송 후 종료
        if not collected_notices:
            normal_msg = (
                f"🟢 *[Calc Toolkit] 법률 요율 정기 모니터링*\n\n"
                f"• 상태: 정상 (변동 없음)\n"
                f"• 수집 공고: {total_notices}건 검토 완료\n"
                f"• 기준: {base_year}년 요율 체계 유지 중"
            )
            send_telegram(normal_msg)
            print("변동 안건 없음 (정기 알림 발송 완료).")
            return

        # 3. Gemini API 분석 호출
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
당신은 대한민국 세법/노무/부동산 법률 변경 분석가입니다.
아래 수집된 법제처 공고 목록을 검토하고, 현재 계산기 웹사이트의 기준 데이터(JSON)에 변경이 필요한지 분석하세요.

[현재 계산기 기준 데이터 (config/rates.json)]:
{json.dumps(current_rates, ensure_ascii=False, indent=2)}

[새로 감지된 공고 ({len(collected_notices)}건)]:
{chr(10).join(collected_notices)}

만약 실제 요율/수치 변경이 수반되는 안건이라면:
1. 영향받는 계산기 항목
2. 개정 내용 요약 및 시행일자
3. config/rates.json 에서 수정해야 할 필드명을 Markdown 형태로 보고하세요.
단순 용어 개정이나 무관한 내용이면 "수정 불필요"라고만 답하세요.
"""
        report = call_gemini_with_retry(model, prompt)

        if "수정 불필요" not in report:
            # 실제 개정 수치 변동 감지 시 경보
            send_telegram(f"🚨 *[Calc Toolkit 법 개정 감지]*\n\n{report}")
            print("개정 감지 알림 발송 완료.")
        else:
            # 키워드는 걸렸으나 분석 결과 수치 변경 없는 경우
            normal_msg = (
                f"🟢 *[Calc Toolkit] 법률 요율 정기 모니터링*\n\n"
                f"• 상태: 정상 (수치 변동 없음)\n"
                f"• 검토 안건: {len(collected_notices)}건 (Gemini 검토: 수정 불필요)\n"
                f"• 기준: {base_year}년 요율 체계 유지 중"
            )
            send_telegram(normal_msg)
            print("수치 변동 없음 (정기 알림 발송 완료).")

    except Exception as e:
        error_msg = f"⚠️ *[Calc Toolkit] 파이프라인 확인 요망*\n\n• 결과: {e}"
        send_telegram(error_msg)
        print(error_msg)

if __name__ == "__main__":
    check_law_updates()
