/**
 * ToolLab.org - Lorem Ipsum & Dummy Text Generator (Pure Functions)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\loremGenerator.js
 */
const LoremGenerator = {
  DICTIONARY: [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "architecto", "beatae",
    "vitae", "dicta", "explicabo", "nemo", "ipsam", "voluptatem", "quia", "voluptas",
    "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni", "dolores", "eos",
    "ratione", "sequi", "nesciunt", "neque", "porro", "quisquam", "dolorem"
  ],

  // 1. 단어 단위 생성
  generateWords(count = 5, startWithLorem = true) {
    if (count <= 0) return "";
    const words = [];
    const len = this.DICTIONARY.length;

    if (startWithLorem && count >= 5) {
      words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      count -= 5;
    }

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * len);
      words.push(this.DICTIONARY[idx]);
    }

    // 첫 단어 대문자화
    if (words.length > 0 && (!startWithLorem || words[0] !== "Lorem")) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    return words.join(" ");
  },

  // 2. 문장 단위 생성
  generateSentence(minWords = 8, maxWords = 15) {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const sentence = this.generateWords(wordCount, false);
    return sentence + ".";
  },

  generateSentences(count = 3, startWithLorem = true) {
    if (count <= 0) return "";
    const sentences = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && startWithLorem) {
        const lead = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        sentences.push(lead);
      } else {
        sentences.push(this.generateSentence());
      }
    }
    return sentences.join(" ");
  },

  // 3. 문단 단위 생성
  generateParagraphs(count = 3, sentencesPerPara = 5, startWithLorem = true, wrapTags = false) {
    if (count <= 0) return "";
    const paras = [];

    for (let p = 0; p < count; p++) {
      const isLead = (p === 0 && startWithLorem);
      const text = this.generateSentences(sentencesPerPara, isLead);
      paras.push(wrapTags ? `<p>${text}</p>` : text);
    }

    return paras.join(wrapTags ? "\n" : "\n\n");
  },

  // 4. 바이트/글자수 기반 지표 계산
  getMetrics(text) {
    if (!text) return { chars: 0, words: 0, paragraphs: 0, bytes: 0 };
    const trimmed = text.trim();
    return {
      chars: text.length,
      words: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
      paragraphs: trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0,
      bytes: new Blob([text]).size
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = LoremGenerator;
}

if (typeof window !== "undefined") {
  window.LoremGenerator = LoremGenerator;
}

// Node.js 단위 검증 블록
if (typeof process !== "undefined" && process.argv && process.argv[1]?.endsWith("loremGenerator.js")) {
  const words = LoremGenerator.generateWords(10, true);
  console.assert(words.startsWith("Lorem ipsum dolor sit amet"), "Lead word assertion failed");

  const paras = LoremGenerator.generateParagraphs(2, 4, true, false);
  console.assert(paras.split("\n\n").length === 2, "Paragraph count assertion failed");

  const metrics = LoremGenerator.getMetrics(paras);
  console.assert(metrics.paragraphs === 2 && metrics.words > 0, "Metrics validation failed");
  console.log("✔ LoremGenerator pure engine passed all assertions");
}