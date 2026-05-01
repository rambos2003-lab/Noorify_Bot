/**
 * إدارة روابط المكتبة من GitHub
 */

export interface PdfBook {
  id: string;
  title: string;
  filename: string;
}

// تأكد من وضع رابط الـ Repository الصحيح هنا
const GITHUB_BASE_URL = "https://raw.githubusercontent.com/YourRepo/main/pdfs/";

export const PDF_LIBRARY: PdfBook[] = [
  { id: "dua", title: "جوامع الأدعية", filename: "جوامع_الادعيه.pdf" },
  { id: "reward", title: "كسب الثواب", filename: "كسب_الثواب.pdf" },
  { id: "morning", title: "أذكار الصباح والمساء", filename: "اذكار_الصباح_والمساء.pdf" },
  { id: "salihin", title: "رياض الصالحين", filename: "رياض_الصالحين.pdf" },
  { id: "disease", title: "الداء والدواء", filename: "الداء_والدواء.pdf" },
  { id: "sleep", title: "أذكار النوم", filename: "اذكار_النوم.pdf" },
  { id: "wake", title: "أذكار الاستيقاظ", filename: "اذكار_الاستيقاظ.pdf" },
  { id: "hisn", title: "حصن المسلم", filename: "حصن_مسلم.pdf" },
  { id: "quran", title: "القرآن الكريم", filename: "القران_الكريم.pdf" },
];

export function getPdfUrl(filename: string): string {
  return `${GITHUB_BASE_URL}${encodeURIComponent(filename)}`;
}
