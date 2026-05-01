/**
 * إدارة روابط المكتبة من مستودع GitHub الخاص بك
 */

export interface PdfBook {
  id: string;
  title: string;
  filename: string;
  emoji: string;
}

/**
 * تم تحديث الرابط ليشير إلى الفرع الرئيسي (main) في مستودعك
 */
const GITHUB_BASE_URL = "https://raw.githubusercontent.com/rambos2003-lab/Noorify_Bot/main/";

export const PDF_LIBRARY: PdfBook[] = [
  { id: "quran", title: "القرآن الكريم", filename: "القرآن الكريم.pdf", emoji: "📖" },
  { id: "morning", title: "أذكار الصباح والمساء", filename: "أذكار الصباح والمساء.pdf", emoji: "☀️" },
  { id: "hisn", title: "حصن المسلم", filename: "حصن المسلم.pdf", emoji: "🏰" },
  { id: "salihin", title: "رياض الصالحين", filename: "رياض الصالحين.pdf", emoji: "🌸" },
  { id: "reward", title: "أسهل طرق لكسب الثواب", filename: "اسهل طرق لكسب الثواب.pdf", emoji: "💰" },
  { id: "disease", title: "كتاب الداء والدواء", filename: "كتاب الداء والدواء.pdf", emoji: "💊" },
  { id: "dua", title: "جوامع دعاء النبي", filename: "جوامع دعاء النبي.pdf", emoji: "🤲" },
  { id: "sleep", title: "أذكار النوم", filename: "اذكار النوم.pdf", emoji: "🌙" },
  { id: "wake", title: "أذكار الاستيقاظ", filename: "اذكار الإستيقاظ.pdf", emoji: "🌅" },
];

/**
 * توليد الرابط المباشر للملف
 */
export function getPdfUrl(filename: string): string {
  // نقوم بترميز الاسم للتعامل مع المسافات واللغة العربية في الروابط
  return `${GITHUB_BASE_URL}${encodeURIComponent(filename)}`;
}
