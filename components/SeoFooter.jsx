import React from 'react';
import siteData from '../config/siteContent.json';

export default function SeoFooter() {
  return (
    <footer className="w-full border-t border-neutral-800 bg-neutral-950 text-neutral-400 py-10 px-4 mt-16 text-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* 서비스명 및 카피라이트 */}
        <div>
          <span className="font-semibold text-neutral-200">Starsign16</span>
          <p className="text-xs text-neutral-500 mt-1">© {siteData.updatedYear} Starsign16. All rights reserved.</p>
        </div>

        {/* 패밀리 링크 (서브도메인 크롤링 유도) */}
        <div className="flex flex-wrap gap-4 text-xs">
          {siteData.familyLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 transition-colors underline decoration-neutral-700 underline-offset-4"
            >
              {link.name} ↗
            </a>
          ))}
        </div>

        {/* 애드센스 필수 4대 정적 링크 */}
        <div className="flex flex-wrap gap-4 text-xs font-medium text-neutral-300">
          <a href="/about" className="hover:text-white transition-colors">About Us</a>
          <span className="text-neutral-700">|</span>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          <span className="text-neutral-700">|</span>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-neutral-700">|</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>

      </div>
    </footer>
  );
}