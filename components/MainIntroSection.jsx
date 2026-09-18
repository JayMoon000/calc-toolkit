import React from 'react';
import siteData from '../config/siteContent.json';

export default function MainIntroSection() {
  // Schema.org FAQ 구조화 데이터 생성
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": siteData.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 text-neutral-300">
      {/* Schema.org 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 소개 텍스트 영역 */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-xl font-bold text-neutral-100 mb-3">
          {siteData.intro.title}
        </h2>
        <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
          {siteData.intro.description}
        </p>
      </div>

      {/* FAQ 영역 (봇 색인용 아코디언/블록) */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-neutral-200">자주 묻는 질문 (FAQ)</h3>
        {siteData.faqs.map((faq, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm">
            <p className="font-medium text-neutral-200 mb-1.5">Q. {faq.q}</p>
            <p className="text-neutral-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}