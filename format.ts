import { DIVIDER, FANCY_TOP, FANCY_BOTTOM, TASBEEH_OPTIONS } from "../data/azkar";

export function buildTasbeehDisplay(dhikrId: string, count: number): string {
  const dhikr = TASBEEH_OPTIONS.find(o => o.id === dhikrId);
  return `${FANCY_TOP}\n` +
         `   📿 <b>الـمـسـبـحـة</b>\n` +
         `${FANCY_BOTTOM}\n\n` +
         `الذكر المختار: <b>${dhikr?.text}</b>\n\n` +
         `العدد الحالي: <code>[ ${count} ]</code>\n\n` +
         `${DIVIDER}\n` +
         `<i>استمر بالنقر على الزر أدناه للتسبيح..</i>`;
}

export function buildFastingMessage(day: 'Mon' | 'Thu'): string {
  const isMon = day === 'Mon';
  return `🌙 <b>تذكير بصيام غدٍ ${isMon ? 'الإثنين' : 'الخميس'}</b>\n` +
         `${DIVIDER}\n\n` +
         `بشراكم يا محبي الصيام، غداً ترفع الأعمال إلى الله.\n\n` +
         `📖 <b>الدليل:</b> <i>«تُعْرَضُ الأَعْمَالُ يَوْمَ الاثْنَيْنِ وَالْخَمِيسِ، فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»</i>\n\n` +
         `${DIVIDER}\n` +
         `اللهم بارك لنا ولكم، وتقبل منا ومنكم.`;
}
