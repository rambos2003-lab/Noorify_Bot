
***

```markdown
<div align="center">

# 🕌 Noorify Bot | نوريفاي

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=180&section=header&text=Noorify%20Bot&fontSize=40&fontColor=ffffff" />

### ﴿ أَلَا بِذِكْرِ ٱللَّٰهِ تَطْمَئِنُّ ٱلْقُلُوبُ ﴾

**بوت ذكي متكامل لنشر الطمأنينة والذكر الرقمي عبر تيليجرام**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

</div>

## 🌟 نبذة عن المشروع
**Noorify** هو نظام ذكاء رقمي مصمم ليكون رفيقاً إيمانياً للمستخدم عبر منصة تيليجرام. يجمع بين البساطة في الاستخدام والاحترافية في البرمجة، لتقديم تجربة ذكر مستمرة، سريعة، ومستقرة.

## 🚀 المميزات الرئيسية

| الأيقونة | الميزة | الوصف |
| :---: | :--- | :--- |
| 📿 | **مسبحة ذكية** | نظام تتبع تسبيح متطور مع إحصائيات حفظ تلقائي. |
| 🌙 | **الورد اليومي** | أذكار الصباح، المساء، والنوم مع تنبيهات مخصصة. |
| 📖 | **المكتبة الإسلامية** | إمكانية تصفح وتحميل الأذكار والكتب بصيغة PDF. |
| 📊 | **لوحة تحكم** | إحصائيات دقيقة لنمو المستخدمين وتفاعلهم. |
| 🔔 | **نظام التذكير** | إشعارات ذكية مجدولة زمنياً لا تسبب إزعاجاً. |
| 🧩 | **تفاعل مرن** | واجهة مستخدم تعتمد على الأزرار التفاعلية (Inline). |

---

## 🛠️ التقنيات المستخدمة

* **Runtime:** `Node.js`
* **Language:** `TypeScript` (لضمان أمان الكود واستقراره)
* **API:** `Telegraf.js` أو `grammY` (Telegram Bot API)
* **Architecture:** `Modular Design` (هيكلة معيارية قابلة للتوسع)
* **Storage:** `JSON / Local DB` (خفيفة وسريعة)

---

## ⚙️ دليل التشغيل

### 1. المتطلبات
تأكد من تثبيت [Node.js](https://nodejs.org/) (إصدار LTS) على جهازك.

### 2. التثبيت
```bash
# استنساخ المستودع
git clone [https://github.com/your-username/noorify-bot.git](https://github.com/your-username/noorify-bot.git)
cd noorify-bot

# تثبيت الحزم
npm install
```

### 3. الإعداد
قم بإنشاء ملف `.env` في المجلد الرئيسي وأضف المفاتيح التالية:
```env
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_ID=your_id
```

### 4. التشغيل
```bash
# وضع التطوير
npm run dev

# بناء المشروع
npm run build

# التشغيل للإنتاج
npm start
```

---

## 📁 هيكلة المشروع
تم تصميم الهيكلة لتكون سهلة الصيانة:
```text
src/
├── bot/           # إعدادات البوت والـ Middlewares
├── handlers/      # معالجة الأوامر والرسائل (Command Handlers)
├── services/      # منطق العمل (Business Logic)
├── database/      # إدارة البيانات (Models/Query)
├── lib/           # أدوات مساعدة (Helpers/Utils)
└── index.ts       # نقطة الدخول (Entry Point)
```

---

## 🤝 المساهمة (Contribution)
المشروع مفتوح للمساهمات! إذا كنت مطوراً وترغب في إضافة لمستك:
1. قم بعمل **Fork** للمشروع.
2. أنشئ **Branch** جديد (`git checkout -b feature/amazing-feature`).
3. قم بعمل **Commit** للتعديلات.
4. أرسل **Pull Request**.

---

## 👨‍💻 المطور
**Rami Bitar**

<p align="left">
  <a href="https://t.me/vx_rq">
    <img src="https://img.shields.io/badge/Telegram-Contact-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" />
  </a>
  <a href="mailto:ramibitar.connct@gmail.com">
    <img src="https://img.shields.io/badge/Email-Send-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</p>

---

<div align="center">

### ﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَى تَنفَعُ الْمُؤْمِنِينَ ﴾

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=120&section=footer" />

</div>
```
