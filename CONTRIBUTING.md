
# 🤝 المساهمة في Noorify Bot

> نظام ذكاء روحي لإدارة الأذكار والمحتوى الإسلامي — مبني بـ Node.js + TypeScript

---

## 🧭 فكرة المشروع

* 📿 أذكار يومية وتفاعلية
* 🧠 نظام تسبيح ذكي
* 📚 مكتبة كتب PDF
* ⚙️ إعدادات متقدمة للمجموعات
* 🔔 تذكيرات مجدولة

هدفنا:

> كود نظيف، أداء عالي، وتجربة مستخدم سلسة

---

# 🚀 بدء المساهمة خلال دقائق

## 1. استنساخ المشروع

```bash id="clone1"
git clone https://github.com/YOUR_USERNAME/Noorify_Bot.git
cd Noorify_Bot
```

---

## 2. تثبيت التبعيات

```bash id="install1"
npm install
```

---

## 3. إعداد البيئة

أنشئ ملف `.env`:

```env id="env1"
TELEGRAM_BOT_TOKEN=your_token_here
NODE_ENV=development
```

أو استخدم:

```bash id="env2"
cp env.example .env
```

---

## 4. تشغيل المشروع

```bash id="run1"
npm run dev
```

أو إنتاج:

```bash id="run2"
npm run build
npm start
```

---

# 🧱 هيكل المشروع

```txt id="structure1"
src/
 ├── index.ts        # نقطة تشغيل البوت
 ├── bot/            # إنشاء البوت
 ├── handlers/       # الأوامر والـ callbacks
 ├── services/       # منطق التطبيق
 ├── lib/            # أدوات مساعدة
 ├── data/           # الأذكار والبيانات
 └── config/         # الإعدادات
```

---

# 🔀 نظام الفروع

| الفرع     | الاستخدام   |
| --------- | ----------- |
| main      | الإنتاج     |
| dev       | التطوير     |
| feature/* | ميزات جديدة |
| fix/*     | إصلاح أخطاء |

مثال:

```bash id="branch1"
git checkout -b feature/tasbeeh-improvements
```

---

# 📌 قواعد الكود (Important)

## 🧼 1. Clean Code

* أسماء واضحة (camelCase)
* دوال صغيرة (Single Responsibility)
* بدون تكرار

---

## 🧠 2. TypeScript Rules

* لا تستخدم `any` إلا للضرورة
* عرّف Types دائماً
* لا تترك imports غير مستخدمة

---

## ⚡ 3. الأداء

* تجنب loops الثقيلة داخل handlers
* استخدم async/await بشكل صحيح
* لا تكرر استدعاء database بدون داعي

---

## 🧩 4. Structure

✔ منطق في `services/`
✔ واجهة المستخدم في `handlers/`
✔ البيانات في `data/`

---

# 🧪 الاختبار قبل PR

قبل إرسال أي Pull Request:

```bash id="test1"
npm run build
```

ثم:

* جرب `/start`
* جرب `/tasbeeh`
* جرب الأزرار (Inline Buttons)
* تأكد ما في أخطاء في console

---

# 🔀 Commit Convention

```bash id="commit1"
feat: add new dhikr system
fix: resolve callback error in tasbeeh
refactor: improve bot structure
chore: update dependencies
```

---

# 🔐 الأمان (مهم جداً)

🚫 ممنوع تماماً رفع:

* `.env`
* `TELEGRAM_BOT_TOKEN`
* أي API Keys

✔ استخدم دائمًا:

```env id="secure1"
.env file
```

---

# 🧠 Pull Request

عند رفع PR:

* اشرح التغيير
* أرفق صور أو مثال
* اذكر السبب وليس فقط ماذا فعلت

---

# ⚡ ملاحظات احترافية

* لا تخلط منطق البوت داخل `index.ts`
* خليه فقط “تشغيل”
* كل شيء ثاني يكون modular

---

# 🏁 رسالة المشروع

> هذا المشروع ليس مجرد كود — بل نظام خدمة مستمر قابل للتطوير
