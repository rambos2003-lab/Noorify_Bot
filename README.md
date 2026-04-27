</p> <div align="center">
     
   ## بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ## 
</div>
<div align="center">

#  Noorify Bot — بوت الأذكار الذكي

*"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"*

</div>

بوت Telegram ذكي يساعدك على المداومة في ذكر الله يومياً — رفيقك الروحي الدائم على مدار الساعة.

---

### <p align="center">📑 فهرس المحتويات</p>

<p align="center">
<a href="#-أبرز-الميزات">🌟 أبرز الميزات</a> •
<a href="#-الحالة-والإحصائيات">📈 الحالة والإحصائيات</a> •
<a href="#-قائمة-الأوامر-الكاملة">⌘ قائمة الأوامر</a> •
<a href="#-البدء-السريع">🚀 البدء السريع</a> •
<a href="#-التقنيات-المستخدمة">🛠 التقنيات</a> •
<a href="#-للتواصل-والدعم">✉️ التواصل</a>
</p>

---

## 🌟 أبرز الميزات

*   **محرك الأذكار (Dhikr Engine):**
    *   أكثر من 25 ذكر مختلف من مصادر إسلامية موثوقة.
    *   خوارزمية عشوائية ذكية لتقديم تجربة متجددة.

*   **نظام التذكيرات (Scheduler):**
    *   4 أوضاع تذكير (30 دقيقة، ساعة، 3 ساعات، 6 ساعات).
    *   يعمل 24/7 باستخدام `node-cron` لضمان الدقة العالية.

*   **المكتبة الرقمية:**
    *   محتوى روحي شامل (أذكار الصباح والمساء، حصن المسلم، القرآن الكريم).

*   **نظام الإحصائيات:**
    *   تتبع شخصي للتقدم اليومي.
    *   عداد أذكار وتاريخ انضمام مفصل لكل مستخدم.

## 📈 الحالة والإحصائيات

<p align="center">
     
</p> <div align="center">
     
</div>

[![الإصدار](https://img.shields.io/badge/الإصدار-v2.0.0-blue?style=for-the-badge)](https://github.com/rambos2003-lab/noorify-azkar-bot)
[![الحالة](https://img.shields.io/badge/الحالة-متصل%2099.9%25-brightgreen?style=for-the-badge)](https://github.com/rambos2003-lab/noorify-azkar-bot)
[![سرعة الاستجابة](https://img.shields.io/badge/سرعة_الاستجابة-120ms-yellow?style=for-the-badge)](https://github.com/rambos2003-lab/noorify-azkar-bot)
[![الترخيص](https://img.shields.io/badge/الترخيص-MIT-purple?style=for-the-badge)](https://github.com/rambos2003-lab/noorify-azkar-bot/blob/main/LICENSE)

</p>

</p> <div align="center">
     </div>
     
## ⌘ قائمة الأوامر الكاملة

| الأمر             | الوصف                                  | النوع      |
| :---------------- | :------------------------------------- | :---------- |
| `/start`          | الترحيب والقائمة الرئيسية              | أساسي     |
| `/help`           | عرض جميع الأوامر والمساعدة             | أساسي     |
| `/dhikr`          | احصل على ذكر عشوائي فوراً              | أساسي     |
| `/reminder_on`    | تفعيل التذكيرات الآلية                 | تذكير     |
| `/reminder_off`   | إيقاف التذكيرات مؤقتاً                 | تذكير     |
| `/reminder_settings` | اختيار فترة التذكير المناسبة          | تذكير     |
| `/daily_count`    | عدد أذكارك اليومية                     | إحصاء     |
| `/stats`          | إحصائياتك الشخصية الكاملة             | إحصاء     |
| `/library`        | فتح المكتبة الرقمية وتحميل الملفات    | مكتبة     |

## 🏗 معمارية النظام (System Architecture)

يعمل البوت بالتسلسل التالي:

1.  **المستخدم:** يرسل طلباً عبر Telegram.
2.  **Telegram API:** استقبال الطلب عبر Webhook أو Polling.
3.  **Noorify Core:** المعالجة باستخدام Node.js وإطار عمل Telegraf.
4.  **Scheduler:** إدارة المهام المجدولة عبر `node-cron`.
5.  **Data Store:** تخزين البيانات محلياً في ملفات JSON لسرعة الاستجابة.

## 🚀 البدء السريع

### للمستخدمين:

1.  افتح تطبيق Telegram.
2.  ابحث عن البوت: `@Noorify_bot`.
3.  أرسل أمر `/start`.
4.  اضبط التذكيرات عبر `/reminder_settings`.

### للمطورين:

1.  **استنساخ المستودع:**
    ```bash
    git clone https://github.com/rambos2003-lab/noorify-azkar-bot
    cd noorify-azkar-bot
    ```

2.  **تثبيت المكتبات البرمجية:**
    ```bash
    npm install
    ```

3.  **إعداد المتغيرات البيئية:**
    قم بإنشاء ملف `.env` في الجذر وأضف الـ Token الخاص بك:
    ```
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    ```

4.  **تشغيل البوت:**
    ```bash
    npm start
    ```

## 🛠 التقنيات المستخدمة (Tech Stack)

<p align="center">
     
</p> <div align="center">
     
 </div>
 
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Telegraf](https://img.shields.io/badge/Telegraf-2AABEE?style=for-the-badge&logo=telegram&logoColor=white)
![Cron](https://img.shields.io/badge/node--cron-212121?style=for-the-badge&logo=clockify&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D12?style=for-the-badge&logo=railway&logoColor=white)

</p>

## 📁 هيكل المشروع

```
noorify-azkar-bot/
├── app.js                   ← نقطة الدخول ومنطق البوت
├── .env                     ← متغيرات البيئة (خاص)
├── package.json             ← التبعيات والأوامر
├── reminders_data.json      ← بيانات التذكيرات النشطة
├── user_preferences.json    ← إعدادات المستخدمين
├── bot_stats.json           ← الإحصائيات العامة
└── README.md                ← التوثيق
```

## 🔒 الخصوصية والأمان

*   **تخزين محلي 100%:** لا يتم استخدام قواعد بيانات خارجية؛ البيانات تُحفظ في خادم البوت فقط.
*   **لا مشاركة للبيانات:** معلومات المستخدمين سرية ولا تُشارك مع أي طرف ثالث.
*   **حق الحذف:** يمكن للمستخدم طلب مسح كافة بياناته في أي وقت.

## 🔮 الخطط المستقبلية

*   إتمام نظام التذكيرات الذكية.
*   إضافة المكتبة الرقمية والإحصائيات.
*   دعم اللغات المتعددة ( Turkish,English,French,Urdu).
*   ميزة التذكير في ساعات محددة يدوياً.
*   تطوير واجهة ويب للتحكم.

## ✉️ للتواصل والدعم

<p align="center">

</p> <div align="center">
     
[![GitHub](https://img.shields.io/badge/GitHub-rambos2003--lab-blue?style=for-the-badge&logo=github)](https://github.com/rambos2003-lab)
[![Email](https://img.shields.io/badge/Email-ramibitar.connct@gmail.com-red?style=for-the-badge&logo=gmail)](mailto:ramibitar.connct@gmail.com)
[![Telegram](https://img.shields.io/badge/Telegram-@vx_rq-blue?style=for-the-badge&logo=telegram)](https://t.me/vx_rq)

</p>



</p> <div align="center">
   
## Made with ♥ for the sake of Allah ##
</div>
   
