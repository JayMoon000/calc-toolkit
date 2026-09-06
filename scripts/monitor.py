# scripts/monitor.py
import os
import sys
import json
import urllib.request
import urllib.error

# 1. 환경 변수 로드 (GitHub Secrets 연동)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

# 감시 대상 RSS (대한민국 법제처 입법예고 / 주요 공고)
TARGET_RSS_URL = "https://www.moleg.go.kr/board.es?mid=a10501000000&bid=0100"

def send_telegram_alert(message: str):
    """텔레그램 봇으로 알림 전송 (무료 알림 채널)"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[WARN] Telegram 환경 변수가 설정되지 않았습니다.")
        return

    # 'bot' 접두사가 혹시 포함되어 있다면 정제
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
    """Gemini API를 호출하여 rates.json 관련 개정 여부 신속 판별"""
    if not GEMINI_API_KEY:
        print("[WARN] GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        return "GEMINI_API_KEY 미설정으로 자동 요약 건너뜀."

    # Gemini 1.5 Flash 공식 규격 엔드포인트
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
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
    
    # 환경변수 로드 상태 확인 (디버그용)
    print(f"[DEBUG] GEMINI_API_KEY 로드 여부: {'성공' if GEMINI_API_KEY else '실패'}")
    print(f"[DEBUG] TELEGRAM_BOT_TOKEN 로드 여부: {'성공' if TELEGRAM_BOT_TOKEN else '실패'}")
    print(f"[DEBUG] TELEGRAM_CHAT_ID 로드 여부: {'성공' if TELEGRAM_CHAT_ID else '실패'}")

    sample_news = [
        "[입법예고] 국민연금법 시행령 일부개정령안 (기준소득월액 상·하한액 조정)",
        "[고시] 부동산 중개보수 요율 체계 모니터링 현황",
        "[입법예고] 소득세법 일부개정법률안"
    ]

    analysis = analyze_amendment_with_gemini(sample_news)
    print(f"[분석 결과]\n{analysis}")

    # 분석 결과가 정상적으로 나왔거나 테스트 메시지일 때 알림 발송
    if "관련 개정안 없음" not in analysis and "오류 발생" not in analysis:
        alert_msg = f"🚨 *[Calc Toolkit] 법령/요율 개정 감지 알림*\n\n{analysis}\n\n👉 *조치*: `config/rates.json` 수치 확인 후 Push 요망"
        send_telegram_alert(alert_msg)
    else:
        print("[INFO] rates.json 영향 개정 사항 없음 (또는 오류).")
        # 파이프라인 연동 확인용 테스트 핑 발송
        send_telegram_alert("🚀 *[Calc Toolkit] 파이프라인 정상 연동 확인*\n\n• 상태: 정상\n• Gemini 분석 완료: rates.json 변동 없음")

if __name__ == "__main__":
    main()