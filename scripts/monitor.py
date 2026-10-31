import os
import json
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import feedparser
import google.generativeai as genai

# 환경변수 로드 (GitHub Secrets)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "rates.json")

# 1. 감시 타깃 키워드 (기존 금융 계산기 + ToolLab ETF 및 자본시장 세법)
TARGET_KEYWORDS = [
    # Starsign16 금융 계산기 도메인
    "최저임금", "중개보수", "부동산 중개", "간이세액", 
    "건강보험료율", "국민연금", "기준소득월액", "퇴직급여",
    # 공통 및 ToolLab ETF / 절세계좌 도메인
    "소득세법", "조세특례제한법",
    "개인종합자산관리계좌",  # ISA
    "집합투자기구",          # ETF, 펀드 과세 체계
    "배당소득", "금융투자소득", "증권거래세"
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

def fetch_feed_with_retry(url: str):
    """법제처 RSS 요청: 재시도 2회 및 Connect/Read 타임아웃 분리"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }
    
    session = requests.Session()
    retry_strategy = Retry(
        total=2,
        backoff_factor=3,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    return session.get(url, headers=headers, timeout=(7, 15))

def check_law_updates():
    try:
        # 1. 기준 데이터 로드
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            current_rates = json.load(f)

        base_year = current_rates.get("baseYear", "2026")

        # 2. 공공 피드 가져오기
        try:
            res = fetch_feed_with_retry(FEED_URL)
            res.raise_for_status()
            feed_content = res.content
        except (requests.exceptions.ConnectTimeout, requests.exceptions.ConnectionError) as conn_err:
            warning_msg = (
                f"🟡 *[통합 모니터링] 법제처 피드 일시 스킵*\n\n"
                f"• 사유: 법제처 서버 연결 지연(Timeout / 해외 IP 필터링)\n"
                f"• 조치: 이번 회차는 스킵하며, 기존 {base_year}년 요율 유지"
            )
            print(f"법제처 피드 연결 실패 (스킵 처리): {conn_err}")
            send_telegram(warning_msg)
            return

        feed = feedparser.parse(feed_content)
        total_notices = len(feed.entries)

        collected_notices = []
        for entry in feed.entries:
            title = entry.get("title", "")
            link = entry.get("link", "")
            if any(kw in title for kw in TARGET_KEYWORDS):
                collected_notices.append(f"- 제목: {title}\n  링크: {link}")

        # 관련 안건이 하나도 없을 때
        if not collected_notices:
            normal_msg = (
                f"🟢 *[통합 모니터링] 법률·세율 정기 점검*\n\n"
                f"• 감시 영역: Starsign16 금융 / ToolLab ETF\n"
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
당신은 대한민국 금융·세법·자본시장 법률 개정 전문 분석가입니다.
아래 수집된 법제처 공고 목록을 검토하고, 운영 중인 서비스의 기준 데이터나 로직에 변경이 필요한지 분석하세요.

[운영 중인 서비스 및 점검 항목]
1. Starsign16 금융 계산기:
   - 최저임금, 4대보험 요율, 국민연금 기준소득월액, 부동산 중개보수, 퇴직금, 근로소득 간이세액표
   - 현재 기준 데이터 (config/rates.json):
{json.dumps(current_rates, ensure_ascii=False, indent=2)}

2. ToolLab ETF & 절세계좌 시뮬레이터:
   - ISA(개인종합자산관리계좌): 연간 납입한도, 비과세 한도, 분리과세 세율
   - 연금저축/IRP: 연간 세액공제 한도 및 소득 구간별 세액공제율(16.5% / 13.2%)
   - 배당소득세율(15.4%) 및 금융소득종합과세 기준금액(2,000만 원)
   - 금융투자소득세(금투세) 시행/유예/폐지 및 증권거래세율 변동

[새로 감지된 법제처 공고 ({len(collected_notices)}건)]:
{chr(10).join(collected_notices)}

[분석 요구사항]:
- 실제 요율/한도/과세 체계 수치 변경이 수반되는 안건이 있다면:
  1. 영향 대상: [Starsign16], [ToolLab ETF], [공통] 중 명시
  2. 개정 요약 및 법적 시행일자
  3. 수정이 필요한 항목 또는 파일(config/rates.json 등)
- 단순 문구 정비나 무관한 안건이면 반드시 "수정 불필요"라는 단어를 포함하여 답변하세요.
"""
        report = call_gemini_with_retry(model, prompt)

        if "수정 불필요" not in report:
            # 실제 요율/한도 개정 발생 시 경보
            send_telegram(f"🚨 *[법률·세율 개정 감지]*\n\n{report}")
            print("개정 감지 알림 발송 완료.")
        else:
            normal_msg = (
                f"🟢 *[통합 모니터링] 법률·세율 정기 점검*\n\n"
                f"• 감시 영역: Starsign16 금융 / ToolLab ETF\n"
                f"• 상태: 정상 (수치 변동 없음)\n"
                f"• 검토 안건: {len(collected_notices)}건 (Gemini 검토: 수정 불필요)\n"
                f"• 기준: {base_year}년 요율 체계 유지 중"
            )
            send_telegram(normal_msg)
            print("수치 변동 없음 (정기 알림 발송 완료).")

    except Exception as e:
        error_msg = f"⚠️ *[통합 모니터링] 파이프라인 확인 요망*\n\n• 결과: {e}"
        send_telegram(error_msg)
        print(error_msg)

if __name__ == "__main__":
    check_law_updates()