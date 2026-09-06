# scripts/monitor.py
import os
import sys
import json
import urllib.request
import urllib.error

# 1. 환경 변수 정밀 로드 (따옴표 및 공백 제거)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip().replace('"', '').replace("'", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip().replace('"', '').replace("'", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip().replace('"', '').replace("'", "")

TARGET_RSS_URL = "https://www.moleg.go.kr/board.es?mid=a10501000000&bid=0100"

def send_telegram_alert(message: str):
    """텔레그램 봇으로 알림 전송"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[WARN] Telegram 환경 변수가 설정되지 않았습니다.")
        return

    # 'bot' 중복 입력 방어
    token = TELEGRAM_BOT_TOKEN
    if token.startswith("bot"):
        token = token[3:]

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            print("[INFO] 텔레그램 전송 성공")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] 텔레그램 전송 실패 (HTTP Error {e.code}): {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"[ERROR] 텔레그램 전송 실패: {e}")

def analyze_amendment_with_gemini(news_titles: list) -> str:
    """Gemini API 호출 (호환 엔드포인트)"""
    if not GEMINI_API_KEY:
        print("[WARN] GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        return "GEMINI_API_KEY 미설정으로 자동 요약 건너뜀."

    # gemini-1.5-flash-latest 엔드포인트 적용
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
    당신은 한국 세무·부동산 법령 분석 전문가입니다.
    아래 수집된 법제처/정부 입법 공고 목록 중, 다음 항목과 직접 관련된 개정안이 있는지 분석하세요:
    1. 이자소득세율 (15.4%)
    2. 공인중개사법 부동산 중개보수 상한요율
    3. 근로소득 4대보험 요율 (국민연금, 건보, 고용 등)
    4. 퇴직소득세 공제 규정

    [공고 목록]
    {chr(10).join(news_titles[:15])}

    관련 개정이 발견되면 수정해야 할 'rates.json' 항목을 지정하고 간결하게 3줄 이내로 요약 보고하세요.
    직접적 관련이 없다면 '관련 개정안 없음'이라고만 명시하세요.
    """

    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_json = json.loads(res.read().decode("utf-8"))
            return res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        return f"Gemini 분석 중 오류 발생: HTTP Error {e.code} (상세: {err_msg})"
    except Exception as e:
        return f"Gemini 분석 중 오류 발생: {e}"

def main():
    print("[INFO] 법령 개정 감시 파이프라인 시작")
    print(f"[DEBUG] GEMINI_API_KEY 로드 여부: {'성공' if GEMINI_API_KEY else '실패'}")
    print(f"[DEBUG] TELEGRAM_BOT_TOKEN 앞 6자리: {TELEGRAM_BOT_TOKEN[:6]}*** (길이: {len(TELEGRAM_BOT_TOKEN)})")
    print(f"[DEBUG] TELEGRAM_CHAT_ID 로드: {TELEGRAM_CHAT_ID}")

    sample_news = [
        "[입법예고] 국민연금법 시행령 일부개정령안 (기준소득월액 상·하한액 조정)",
        "[고시] 부동산 중개보수 요율 체계 모니터링 현황",
        "[입법예고] 소득세법 일부개정법률안"
    ]

    analysis = analyze_amendment_with_gemini(sample_news)
    print(f"[분석 결과]\n{analysis}")

    # 연동 확인을 위해 테스트 알림 무조건 발송
    test_msg = f"🚀 *[Calc Toolkit] 파이프라인 연동 성공*\n\n• 상태: 정상 작동 중\n• Gemini 분석: {analysis[:100]}..."
    send_telegram_alert(test_msg)

if __name__ == "__main__":
    main()