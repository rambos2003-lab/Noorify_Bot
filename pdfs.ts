/**
 * إدارة روابط المكتبة من مستودع GitHub الخاص بك
 */

export interface PdfBook {
  id: string;
  title: string;
  filename: string;
  emoji: string;
  url: string;
}

const GITHUB_BASE_URL = "https://raw.githubusercontent.com/rambos2003-lab/Noorify_Bot/main/";

export const PDF_LIBRARY: PdfBook[] = [
  { id: "quran", title: "القرآن الكريم", filename: "القرآن الكريم.pdf", emoji: "📖", url: "" },
  { id: "morning", title: "أذكار الصباح والمساء", filename: "أذكار الصباح والمساء.pdf", emoji: "☀️", url: "" },
  { id: "hisn", title: "حصن المسلم", filename: "حصن المسلم.pdf", emoji: "🏰", url: "" },
  { id: "salihin", title: "رياض الصالحين", filename: "رياض الصالحين.pdf", emoji: "🌸", url: "" },
  { id: "reward", title: "أسهل طرق لكسب الثواب", filename: "اسهل طرق لكسب الثواب.pdf", emoji: "💰", url: "" },
  { id: "disease", title: "كتاب الداء والدواء", filename: "كتاب الداء والدواء.pdf", emoji: "💊", url: "" },
  { id: "dua", title: "جوامع دعاء النبي", filename: "جوامع دعاء النبي.pdf", emoji: "🤲", url: "" },
  { id: "sleep", title: "أذكار النوم", filename: "اذكار النوم.pdf", emoji: "🌙", url: "" },
  { id: "wake", title: "أذكار الاستيقاظ", filename: "اذكار الإستيقاظ.pdf", emoji: "🌅", url: "" },
].map(book => ({
  ...book,
  url: `${GITHUB_BASE_URL}${encodeURIComponent(book.filename)}`
}));

export function getPdfUrl(filename: string): string {
  return `${GITHUB_BASE_URL}${encodeURIComponent(filename)}`;
}
