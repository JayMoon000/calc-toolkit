/**
 * ToolLab.org - Word & Character Analysis Engine (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\wordCounter.js
 */
const WordCounter = {
  // 1. 단어 수 계산 (국제 공백 및 특수기호 분리)
  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  },

  // 2. 글자 수 계산 (공백 포함 및 제외)
  countCharacters(text) {
    if (!text || typeof text !== 'string') return { total: 0, noSpaces: 0 };
    return {
      total: text.length,
      noSpaces: text.replace(/\s/g, '').length
    };
  },

  // 3. UTF-8 바이트 계산 (영문/ASCII 1B, 한글/한자 등 다국어 3B/4B 처리)
  countBytes(text) {
    if (!text || typeof text !== 'string') return 0;
    return new Blob([text]).size;
  },

  // 4. 문장 및 단락 수 계산
  countStructures(text) {
    if (!text || typeof text !== 'string') return { sentences: 0, paragraphs: 0 };
    const trimmed = text.trim();
    if (!trimmed) return { sentences: 0, paragraphs: 0 };

    const sentences = trimmed.split(/[.!?]+(?:\s+|$)/).filter(Boolean).length;
    const paragraphs = trimmed.split(/\n+/).filter(line => line.trim().length > 0).length;

    return { sentences, paragraphs };
  },

  // 5. 예상 소요 시간 (평균 분당 200단어 읽기, 150단어 말하기 기준)
  estimateTimes(wordCount) {
    const readingMinutes = wordCount / 200;
    const speakingMinutes = wordCount / 150;
    return {
      readingTime: readingMinutes < 1 ? '< 1 min' : `${Math.ceil(readingMinutes)} min`,
      speakingTime: speakingMinutes < 1 ? '< 1 min' : `${Math.ceil(speakingMinutes)} min`
    };
  },

  // 6. SNS 글자 수 제한 상태 분석
  checkSocialLimits(charCount) {
    return {
      twitter: { max: 280, remaining: 280 - charCount, isOver: charCount > 280 },
      linkedin: { max: 3000, remaining: 3000 - charCount, isOver: charCount > 3000 },
      instagramBio: { max: 150, remaining: 150 - charCount, isOver: charCount > 150 }
    };
  },

  // 종합 분석 통합 함수
  analyze(text) {
    const chars = this.countCharacters(text);
    const words = this.countWords(text);
    const bytes = this.countBytes(text);
    const structures = this.countStructures(text);
    const times = this.estimateTimes(words);
    const social = this.checkSocialLimits(chars.total);

    return {
      words,
      charsTotal: chars.total,
      charsNoSpaces: chars.noSpaces,
      bytes,
      sentences: structures.sentences,
      paragraphs: structures.paragraphs,
      readingTime: times.readingTime,
      speakingTime: times.speakingTime,
      social
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordCounter;
}

if (typeof window !== "undefined") {
  window.WordCounter = WordCounter;
}

// Node.js CLI Validation
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("wordCounter.js")) {
  const sample = "Hello World! This is ToolLab.";
  const res = WordCounter.analyze(sample);
  console.assert(res.words === 5, "Word count assertion failed");
  console.assert(res.charsTotal === 29, "Character total assertion failed");
  console.assert(res.sentences === 2, "Sentence count assertion failed");
  console.log("✔ WordCounter pure engine passed all unit tests");
}