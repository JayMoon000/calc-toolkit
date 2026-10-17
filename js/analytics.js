/**
 * ToolLab.org - Ultra-lightweight Global Analytics Engine
 * Path: D:\Gemini_Files\ToolLab.org\js\analytics.js
 */
(function() {
  const GA_ID = 'G-MGL1YF5WFH';

  // 1. Google Analytics (gtag.js) 비동기 스크립트 인젝션
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_ID, {
    send_page_view: true,
    anonymize_ip: true
  });

  // 2. 툴킷 실행 이벤트 트래커 (Data-Driven Pivot 측정용)
  window.trackToolEvent = function(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  // 3. 체류 시간(Dwell Time) 자동 추적 (30초, 60초)
  const trackDwell = (seconds) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'dwell_time', {
        event_category: 'Engagement',
        event_label: seconds + 's',
        value: seconds
      });
    }
  };
  setTimeout(() => trackDwell(30), 30000);
  setTimeout(() => trackDwell(60), 60000);

  // 4. 연산/실행 버튼 인터랙션 자동 추적
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, input[type="file"], input[type="range"]').forEach(el => {
      el.addEventListener('click', () => {
        const actionLabel = (el.innerText || el.id || el.name || 'action').trim().substring(0, 30);
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'tool_interaction', {
            tool_title: document.title,
            element: actionLabel
          });
        }
      }, { passive: true });
    });
  });


  // 5. Cloudflare Web Analytics Beacon Injection ($0 Serverless)
  const cfScript = document.createElement('script');
  cfScript.type = 'module';
  cfScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  cfScript.setAttribute('data-cf-beacon', '{"token": "0ce5c65756114975810c265cb2b9c02a"}');
  document.head.appendChild(cfScript);

})();