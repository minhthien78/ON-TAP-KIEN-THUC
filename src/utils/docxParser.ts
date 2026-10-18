import mammoth from 'mammoth';
import { convertMetafileToSvg } from 'emf-converter';
import { Question, Option, TrueFalseItem, SectionType } from '../types/exam';

/**
 * Intelligent Exam Parser for Vietnamese Chemistry Exams (Bộ GD&ĐT 2025/2026 3-Part Standard)
 * Supports:
 * - DOCX ArrayBuffer via mammoth (preserves <sub>, <sup>, <u>, <b>, <i>, <table>, <img> with base64/SVG)
 * - Auto-converts Word MathType/Vector WMF and EMF into Web-Native SVG
 * - PHẦN 1: Trắc nghiệm 4 lựa chọn (A. B. C. D. với dấu chấm, không nhận dạng A) B) c) D))
 * - PHẦN 2: Trắc nghiệm đúng - sai (ý a) b) c) d))
 * - PHẦN 3: Trả lời ngắn (quy ước "A. [giá trị]" hoặc "Đáp án: [giá trị]")
 * - Accurate detection of Underline / bold / answer keys
 */

export interface ParseExamResult {
  title: string;
  questions: Question[];
  warnings: string[];
}

/**
 * Parses a .docx File object in browser or Buffer in node using mammoth
 */
export async function parseDocxFile(file: File | ArrayBuffer): Promise<ParseExamResult> {
  let arrayBuffer: ArrayBuffer;
  let fileName = 'Đề Thi Hóa Học';

  if (file instanceof File) {
    arrayBuffer = await file.arrayBuffer();
    fileName = file.name.replace(/\.[^/.]+$/, '');
  } else {
    arrayBuffer = file;
  }

  // Configure mammoth to preserve bold, italic, underline, subscript, superscript and extract images
  const options = {
    convertImage: (mammoth.images as any).imgElement(async (element: any) => {
      const imageBuffer = await element.read('base64');
      const contentType = element.contentType || 'image/png';
      let finalSrc = `data:${contentType};base64,${imageBuffer}`;

      // Convert WMF/EMF into web-compatible SVG Data URL
      if (contentType.includes('wmf') || contentType.includes('emf')) {
        try {
          const binary = atob(imageBuffer);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const svg = await convertMetafileToSvg(bytes.buffer);
          if (svg && typeof svg === 'string') {
            finalSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          }
        } catch (e) {
          console.warn('WMF to SVG conversion skipped', e);
        }
      }

      return {
        src: finalSrc
      };
    }),
    styleMap: [
      "u => u",
      "strike => s",
      "sub => sub",
      "sup => sup"
    ]
  };

  const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer }, options);
  return parseExamFromHtml(htmlContent, fileName);
}

/**
 * Extracts and categorizes questions into Section 1, Section 2, and Section 3 from HTML or Rich Text
 */
export function parseExamFromHtml(htmlContent: string, defaultTitle: string = 'Đề Thi Hóa Học'): ParseExamResult {
  const warnings: string[] = [];
  const questions: Question[] = [];

  // Normalize line breaks and spaces while keeping HTML tags
  const cleaned = htmlContent
    .replace(/&nbsp;/g, ' ')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim();

  // Try section regex for Section 1, 2, 3
  // Handles: "PHẦN I", "PHẦN 1", "Phần I.", "PHẦN THỨ NHẤT", etc.
  const sec1Regex = /(?:PHẦN\s+(?:I|1|THỨ\s*NHẤT)[^\w<]*)([\s\S]*?)(?=(?:PHẦN\s+(?:II|2|THỨ\s*HAI))|$)/i;
  const sec2Regex = /(?:PHẦN\s+(?:II|2|THỨ\s*HAI)[^\w<]*)([\s\S]*?)(?=(?:PHẦN\s+(?:III|3|THỨ\s*BA))|$)/i;
  const sec3Regex = /(?:PHẦN\s+(?:III|3|THỨ\s*BA)[^\w<]*)([\s\S]*?)$/i;

  const sec1Match = sec1Regex.exec(cleaned);
  const sec2Match = sec2Regex.exec(cleaned);
  const sec3Match = sec3Regex.exec(cleaned);

  if (sec1Match || sec2Match || sec3Match) {
    if (sec1Match && sec1Match[1].trim()) {
      const q1 = extractQuestionsFromText(sec1Match[1], 1, questions.length);
      questions.push(...q1);
    }
    if (sec2Match && sec2Match[1].trim()) {
      const q2 = extractQuestionsFromText(sec2Match[1], 2, questions.length);
      questions.push(...q2);
    }
    if (sec3Match && sec3Match[1].trim()) {
      const q3 = extractQuestionsFromText(sec3Match[1], 3, questions.length);
      questions.push(...q3);
    }
  } else {
    // If no explicit "PHẦN" headers are present, parse all questions and auto-classify
    const allExtracted = extractQuestionsFromText(cleaned, 1, 0);
    questions.push(...allExtracted);
  }

  // Final renumbering and ordering
  questions.forEach((q, idx) => {
    q.questionNumber = idx + 1;
    q.originalOrder = idx + 1;
  });

  return {
    title: defaultTitle,
    questions,
    warnings,
  };
}

/**
 * Extracts questions from an HTML chunk
 */
function extractQuestionsFromText(htmlChunk: string, defaultSection: SectionType, startIndex: number): Question[] {
  const questions: Question[] = [];

  // Split question blocks by "Câu \d+"
  // Handles: <p>Câu 1: ...</p>, <strong>Câu 1.</strong>, Câu 1 - ...
  const parts = htmlChunk.split(/(?=(?:<p[^>]*>|<h[1-6][^>]*>|<div[^>]*>|<br\s*\/?>|\n|^)\s*(?:<[a-z0-9]+[^>]*>)*\s*Câu\s+\d+[\s:.-])/gi);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Must strictly begin with "Câu \d+" (e.g. Câu 1:, Câu 2., <p><b>Câu 1.</b>)
    // Avoids parsing section instruction text like "Thí sinh trả lời từ câu 1 đến câu 10..." as a question
    const startsWithQuestionMarker = /^(?:<p[^>]*>|<h[1-6][^>]*>|<div[^>]*>|<br\s*\/?>|\n|\s)*(?:<[a-z0-9]+[^>]*>)*\s*Câu\s+\d+[\s:.-]/i.test(trimmed);
    if (!startsWithQuestionMarker) continue;

    // Extract images inside this question block
    const images: string[] = [];
    const imgMatches = trimmed.matchAll(/<img[^>]+src="([^">]+)"/gi);
    for (const m of imgMatches) {
      if (m[1]) images.push(m[1]);
    }

    // Determine the actual section based on content features
    const questionObj = parseSingleQuestionBlock(trimmed, defaultSection, startIndex + questions.length + 1, images);
    if (questionObj) {
      questions.push(questionObj);
    }
  }

  return questions;
}

/**
 * Parses an individual question block with smart auto-detection
 */
function parseSingleQuestionBlock(
  rawBlock: string,
  hintSection: SectionType,
  qIndex: number,
  images: string[]
): Question | null {
  // Check for True/False indicators: sub-items a), b), c), d) or a., b., c., d.
  // Per requirement: strictly recognizes a) b) c) d)
  const hasSubItemsA = /(?:^|\s|<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n)(?:<[a-z0-9]+[^>]*>)*\s*[a-d]\)/i.test(rawBlock);
  const subItemsMatchCount = [...rawBlock.matchAll(/(?:^|\s|<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n)(?:<[a-z0-9]+[^>]*>)*\s*([a-d]\))/gi)].length;

  // Check for Section 1 multiple choice options A. B. C. D. (strictly with dot, NOT parenthesis)
  const mcqMatches = [...rawBlock.matchAll(/(?:^|\s|<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n)(?:<[a-z0-9]+[^>]*>)*\s*([A-D])\s*(?:<\/[a-z0-9]+>)*\./gi)];
  const mcqDistinctLabels = new Set(mcqMatches.map(m => m[1].toUpperCase()));

  // Check for Section 3 indicator: "A. [giá trị]" with NO other options (no B., C., D.), OR "Đáp án: [giá trị]"
  const hasShortAnswerSingleA = mcqMatches.length === 1 && mcqMatches[0][1].toUpperCase() === 'A' && mcqDistinctLabels.size === 1;
  const hasExplicitShortAnswerMarker = /(?:Đáp\s*án|ĐS)\s*[:.]\s*[^A-D\n<]+/i.test(rawBlock);

  let finalSection: SectionType = hintSection;

  if (hintSection === 2 || (hasSubItemsA && subItemsMatchCount >= 2)) {
    finalSection = 2;
  } else if (hasShortAnswerSingleA || (hintSection === 3 && mcqDistinctLabels.size <= 1)) {
    finalSection = 3;
  } else if (mcqDistinctLabels.size >= 2 || hintSection === 1) {
    finalSection = 1;
  } else if (hasExplicitShortAnswerMarker) {
    finalSection = 3;
  }

  if (finalSection === 1) {
    return parseSection1Question(rawBlock, qIndex, images);
  } else if (finalSection === 2) {
    return parseSection2Question(rawBlock, qIndex, images);
  } else {
    return parseSection3Question(rawBlock, qIndex, images);
  }
}

/**
 * Parse Section 1: Multiple choice A., B., C., D. (strictly with dot, does not recognize A) B) c) D))
 */
function parseSection1Question(rawBlock: string, qIndex: number, images: string[]): Question {
  // Find all option markers strictly in format A., B., C., D. (supports inside tables <td>, <th>, paragraphs, divs)
  // Handles: "A.", "<b>A.</b>", "<b>A</b>.", "<u>A.</u>", "<u>A</u>.", "<p>A.</p>", "<td>A.</td>", etc.
  const markerRegex = /(?:^|\s|<p[^>]*>|<div[^>]*>|<br\s*\/?>|<td[^>]*>|<th[^>]*>|\n)((?:<[a-z0-9]+[^>]*>)*\s*[A-D]\s*(?:<\/[a-z0-9]+>)*\.)(?=\s|$|<)/gi;
  const matches = [...rawBlock.matchAll(markerRegex)];

  const options: Option[] = [];
  let questionStem = rawBlock;

  if (matches.length >= 2) {
    const firstMarkerIndex = matches[0].index + matches[0][0].indexOf(matches[0][1]);
    questionStem = rawBlock.slice(0, firstMarkerIndex).trim();

    for (let i = 0; i < matches.length; i++) {
      const curMatch = matches[i];
      const markerStart = curMatch.index + curMatch[0].indexOf(curMatch[1]);
      const textStart = markerStart + curMatch[1].length;

      let textEnd = rawBlock.length;
      if (i + 1 < matches.length) {
        const nextMatch = matches[i + 1];
        textEnd = nextMatch.index + nextMatch[0].indexOf(nextMatch[1]);
      }

      const rawOptionText = rawBlock.slice(textStart, textEnd).trim();
      const rawMarker = curMatch[1];
      
      // Determine if option is underlined or marked as correct
      const isUnderlined = /<u>/i.test(rawMarker) || /<u>/i.test(rawOptionText) || /style="[^"]*text-decoration:\s*underline/i.test(rawOptionText);
      const letterMatch = rawMarker.replace(/<[^>]+>/g, '').match(/[A-D]/i);
      const letter = letterMatch ? letterMatch[0].toUpperCase() : String.fromCharCode(65 + i);

      // Clean option text but preserve chemical tags <sub>, <sup>
      const cleanedText = cleanChemicalHtml(rawOptionText);

      options.push({
        id: `opt-${qIndex}-${i}`,
        label: letter,
        text: cleanedText,
        isCorrect: isUnderlined,
      });
    }
  }

  // If no option was underlined, check for "Đáp án: [A-D]" in text
  const ansMatch = /(?:Đáp\s*án|ĐS|Key)\s*[:=]\s*([A-D])/i.exec(rawBlock);
  if (ansMatch) {
    const targetLetter = ansMatch[1].toUpperCase();
    options.forEach(o => {
      if (o.label === targetLetter) o.isCorrect = true;
    });
    // Remove "Đáp án: ..." from stem if present
    questionStem = questionStem.replace(/(?:<p[^>]*>)?\s*(?:Đáp\s*án|ĐS|Key)\s*[:=]\s*[A-D]\s*(?:<\/p>)?/gi, '');
  }

  const hasCorrect = options.some(o => o.isCorrect);

  return {
    id: `Q-SEC1-${Date.now()}-${qIndex}`,
    section: 1,
    questionNumber: qIndex,
    originalOrder: qIndex,
    questionContent: cleanQuestionStem(questionStem),
    images,
    options,
    validationWarning: !hasCorrect && options.length > 0 ? 'Chưa xác định được đáp án đúng (hãy chọn đáp án ở bước kiểm tra).' : undefined,
  };
}

/**
 * Parse Section 2: True / False sub-items strictly as a), b), c), d)
 */
function parseSection2Question(rawBlock: string, qIndex: number, images: string[]): Question {
  // Find all sub-item markers strictly in format a), b), c), d)
  // Handles: "a)", "<b>a)</b>", "<b>a</b>)", "<u>a)</u>", "<u>a</u>)", "<p>a)</p>", etc.
  const markerRegex = /(?:^|\s|<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n)((?:<[a-z0-9]+[^>]*>)*\s*[a-d]\s*(?:<\/[a-z0-9]+>)*\))(?=\s|$|<)/gi;
  const matches = [...rawBlock.matchAll(markerRegex)];

  const subItems: TrueFalseItem[] = [];
  let questionStem = rawBlock;

  // Check if there is an answer summary at the end:
  // e.g. "Đáp án: a - Đúng, b - Sai, c - Đúng, d - Đúng" or "a - Đ, b - S, c - Đ, d - Đ"
  const summaryMatch = /(?:Đáp\s*án|ĐS)\s*[:=]\s*([\s\S]+)$/i.exec(rawBlock);
  const summaryAnswers: Record<string, boolean> = {};
  if (summaryMatch) {
    const summaryText = summaryMatch[1];
    const subAnsMatches = summaryText.matchAll(/([a-d])\s*[-:.)\s]\s*(đúng|dung|sai|đ|d|s)/gi);
    for (const m of subAnsMatches) {
      const key = m[1].toLowerCase();
      const val = m[2].toLowerCase();
      summaryAnswers[key] = val.startsWith('đ') || val.startsWith('d');
    }
  }

  if (matches.length > 0) {
    const firstMarkerIndex = matches[0].index + matches[0][0].indexOf(matches[0][1]);
    questionStem = rawBlock.slice(0, firstMarkerIndex).trim();

    const defaultLabels = ['a', 'b', 'c', 'd'];

    for (let i = 0; i < matches.length; i++) {
      const curMatch = matches[i];
      const markerStart = curMatch.index + curMatch[0].indexOf(curMatch[1]);
      const textStart = markerStart + curMatch[1].length;

      let textEnd = rawBlock.length;
      if (i + 1 < matches.length) {
        const nextMatch = matches[i + 1];
        textEnd = nextMatch.index + nextMatch[0].indexOf(nextMatch[1]);
      } else if (summaryMatch) {
        // Exclude the summary block from the last sub-item text
        textEnd = Math.min(textEnd, summaryMatch.index);
      }

      let text = rawBlock.slice(textStart, textEnd).trim();
      const rawMarker = curMatch[1];
      const isUnderlined = /<u>/i.test(rawMarker) || /<u>/i.test(text);

      const letterMatch = rawMarker.replace(/<[^>]+>/g, '').match(/[a-d]/i);
      const letter = (letterMatch ? letterMatch[0].toLowerCase() : defaultLabels[i]) as 'a' | 'b' | 'c' | 'd';

      let isCorrect = false;

      // 1. Check if item explicitly ends with ": Đúng" or "- Sai" or " (Đúng)" etc.
      const endMarkerMatch = /(?:[:\-\s(])\s*(đúng|dung|sai|đ|d|s)\s*[.:;)]?$/i.exec(text);
      if (endMarkerMatch) {
        const val = endMarkerMatch[1].toLowerCase();
        isCorrect = val.startsWith('đ') || val.startsWith('d');
        text = text.slice(0, endMarkerMatch.index).trim();
      } else if (summaryAnswers[letter] !== undefined) {
        // 2. Check summary block answers
        isCorrect = summaryAnswers[letter];
      } else if (isUnderlined) {
        // 3. Fallback: underline indicates Đúng
        isCorrect = true;
      }

      subItems.push({
        id: `tf-${qIndex}-${i}`,
        label: letter,
        text: cleanChemicalHtml(text),
        isCorrect,
      });
    }
  }

  // Remove summary match from question stem if present
  if (summaryMatch) {
    questionStem = questionStem.replace(/(?:<p[^>]*>)?\s*(?:Đáp\s*án|ĐS)\s*[:=][\s\S]+?(?:<\/p>|$)/gi, '');
  }

  return {
    id: `Q-SEC2-${Date.now()}-${qIndex}`,
    section: 2,
    questionNumber: qIndex,
    originalOrder: qIndex,
    questionContent: cleanQuestionStem(questionStem),
    images,
    trueFalseItems: subItems,
  };
}

/**
 * Parse Section 3: Short answer
 * Format specification in file:
 * "A. giá trị của đáp án"
 * Ví dụ:
 * Câu 1. Tính số mol...
 * A. 0,25
 * Hệ thống hiểu: "A." là ký hiệu đáp án đúng, "0,25" là giá trị đáp án.
 */
function parseSection3Question(rawBlock: string, qIndex: number, images: string[]): Question {
  let questionStem = rawBlock;
  let correctAnswer = '';

  // Look for "A. [giá trị]" or "Đáp án: [giá trị]" or "ĐS: [giá trị]"
  // Handles: A. 0,25 | <u>A.</u> 0,25 | <b>A.</b> 0,25 | A: 0,25 | Đáp án: 0,25 | ĐS: 0,25
  const ansRegex = /(?:<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n|^)\s*(?:<[a-z0-9]+[^>]*>)*\s*(?:A|Đáp\s*án|ĐS)\s*(?:<\/[a-z0-9]+>)*\s*[:.]\s*(?:<[a-z0-9]+[^>]*>)*\s*([^<\n\r]+)/i;
  const ansMatch = ansRegex.exec(rawBlock);

  if (ansMatch) {
    correctAnswer = ansMatch[1]
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/[.\s]+$/, '')
      .trim();

    // Strip the answer line from the question content so students do not see the answer!
    const splitIdx = rawBlock.search(/(?:<p[^>]*>|<div[^>]*>|<br\s*\/?>|\n|^)\s*(?:<[a-z0-9]+[^>]*>)*\s*(?:A|Đáp\s*án|ĐS)\s*(?:<\/[a-z0-9]+>)*\s*[:.]/i);
    if (splitIdx !== -1) {
      questionStem = rawBlock.substring(0, splitIdx).trim();
    }
  }

  // Clean remaining stem
  questionStem = cleanQuestionStem(questionStem);

  return {
    id: `Q-SEC3-${Date.now()}-${qIndex}`,
    section: 3,
    questionNumber: qIndex,
    originalOrder: qIndex,
    questionContent: questionStem,
    images,
    shortAnswer: {
      correctAnswer: correctAnswer || '0',
    },
    validationWarning: !correctAnswer ? 'Chưa nhận diện được đáp án ngắn chuẩn (vui lòng nhập đáp án).' : undefined,
  };
}

/**
 * Removes "Câu X: " or "Câu X." prefix and trims
 */
function cleanQuestionStem(stem: string): string {
  return stem
    .replace(/^(?:<p[^>]*>)?\s*(?:<(?:strong|b|span|u)[^>]*>)?\s*Câu\s+\d+[\s:.-]*(?:<\/(?:strong|b|span|u)>)?\s*/i, '')
    .trim();
}

/**
 * Cleans option/item text while preserving essential chemistry tags (<sub>, <sup>, <img>, <table>)
 */
function cleanChemicalHtml(html: string): string {
  // Allow sub, sup, img, table, tr, td, th tags, remove other raw wrapper tags
  return html
    .replace(/<(?!sub|\/sub|sup|\/sup|img|table|\/table|tr|\/tr|td|\/td|th|\/th|tbody|\/tbody)[^>]+>/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[;,\s]+$/, '')
    .trim();
}
