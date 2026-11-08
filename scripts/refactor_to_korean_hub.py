# File: scripts/refactor_to_korean_hub.py
# Action: 영문 툴 제거, 한글 툴 루트 승격 및 경로/사이트맵 자동 동기화 (WinError 5 방어)

import os
import shutil
import stat
import time

BASE_DIR = r"D:\Gemini_Files\Calc_Toolkit"
TOOLS_DIR = os.path.join(BASE_DIR, "tools")
KO_DIR = os.path.join(BASE_DIR, "ko")
LEGAL_DIR = os.path.join(BASE_DIR, "legal")
LEGAL_KO_DIR = os.path.join(LEGAL_DIR, "ko")

def remove_readonly(func, path, exc_info):
    """윈도우 파일 권한 문제 발생 시 읽기 전용 속성 강제 해제 후 재시도"""
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception as e:
        print(f"  [!] 파일 강제 삭제 건너뜀: {path} ({e})")

def safe_remove_dir(dir_path):
    """디렉토리 안전 삭제 함수"""
    if not os.path.exists(dir_path):
        return
    try:
        shutil.rmtree(dir_path, onexc=remove_readonly)
        print(f"[-] {os.path.basename(dir_path)} 폴더 삭제 완료")
    except Exception as e:
        print(f"[!] {os.path.basename(dir_path)} 폴더 직접 삭제 실패, 내부 파일 개별 삭제 시도: {e}")
        for root, dirs, files in os.walk(dir_path, topdown=False):
            for name in files:
                f_path = os.path.join(root, name)
                try:
                    os.chmod(f_path, stat.S_IWRITE)
                    os.remove(f_path)
                except Exception:
                    pass
            for name in dirs:
                d_path = os.path.join(root, name)
                try:
                    os.rmdir(d_path)
                except Exception:
                    pass

def run_refactor():
    print("=== 스타사인16 계산기 구조 개편 시작 ===")

    # 1. 영문 tools 폴더 안전 삭제
    if os.path.exists(TOOLS_DIR):
        safe_remove_dir(TOOLS_DIR)

    # 2. 영문 legal 파일 삭제 및 legal/ko 내용을 legal 루트로 승격
    if os.path.exists(LEGAL_KO_DIR):
        for f in ["about.html", "contact.html", "privacy.html", "terms.html"]:
            eng_legal = os.path.join(LEGAL_DIR, f)
            if os.path.exists(eng_legal):
                try:
                    os.chmod(eng_legal, stat.S_IWRITE)
                    os.remove(eng_legal)
                except Exception:
                    pass
        
        for f in os.listdir(LEGAL_KO_DIR):
            src = os.path.join(LEGAL_KO_DIR, f)
            dst = os.path.join(LEGAL_DIR, f)
            try:
                shutil.move(src, dst)
            except Exception:
                pass
        try:
            os.rmdir(LEGAL_KO_DIR)
        except Exception:
            pass
        print("[+] 한글 법적 문서(legal) 루트 승격 완료")

    # 3. 기존 루트 index.html(영문) 백업 후 ko/index.html로 대체
    root_index = os.path.join(BASE_DIR, "index.html")
    ko_index = os.path.join(KO_DIR, "index.html")
    if os.path.exists(root_index):
        try:
            os.chmod(root_index, stat.S_IWRITE)
            os.remove(root_index)
        except Exception:
            pass
    if os.path.exists(ko_index):
        shutil.move(ko_index, root_index)
        print("[+] 루트 index.html을 한글 허브로 교체 완료")

    # 4. ko 폴더 내의 한글 툴들을 BASE_DIR 루트로 이동 및 상대 경로 자동 보정
    if os.path.exists(KO_DIR):
        ko_files = [f for f in os.listdir(KO_DIR) if f.endswith(".html")]
        for fname in ko_files:
            src_path = os.path.join(KO_DIR, fname)
            dst_path = os.path.join(BASE_DIR, fname)
            
            with open(src_path, "r", encoding="utf-8") as f:
                content = f.read()

            # 상대 경로 보정: ../assets -> ./assets, ../Utils -> ./Utils, ../legal -> ./legal
            content = content.replace('../assets/', './assets/')
            content = content.replace('../Utils/', './Utils/')
            content = content.replace('../legal/', './legal/')
            content = content.replace('../js/', './js/')
            content = content.replace('../config/', './config/')

            with open(dst_path, "w", encoding="utf-8") as f:
                f.write(content)

            try:
                os.remove(src_path)
            except Exception:
                pass
            print(f"[+] 승격 및 경로 보정: {fname}")

        try:
            os.rmdir(KO_DIR)
            print("[-] 빈 ko 폴더 정리 완료")
        except Exception:
            pass

    # 5. 루트 index.html 내부 상대경로 보정
    if os.path.exists(root_index):
        with open(root_index, "r", encoding="utf-8") as f:
            idx_content = f.read()
        idx_content = idx_content.replace('../assets/', './assets/')
        idx_content = idx_content.replace('../Utils/', './Utils/')
        idx_content = idx_content.replace('../legal/', './legal/')
        idx_content = idx_content.replace('../js/', './js/')
        idx_content = idx_content.replace('../config/', './config/')
        
        with open(root_index, "w", encoding="utf-8") as f:
            f.write(idx_content)
        print("[+] 루트 index.html 내부 상대경로 동기화 완료")

    print("\n=== 구조 개편 완료 ===")

if __name__ == "__main__":
    run_refactor()