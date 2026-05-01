
***

```markdown
<div align="center">

# 🤝 دليل المساهمة في Noorify Bot

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=180&section=header&text=Contribution%20Guide&fontSize=40&fontColor=ffffff" />
```
### 💡 "هذا المشروع ليس مجرد كود — بل نظام خدمة مستمر"

[![GitHub contributors](https://img.shields.io/github/contributors/YOUR_USERNAME/Noorify_Bot?style=for-the-badge)](https://github.com/YOUR_USERNAME/Noorify_Bot/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>
```
---

## 🚀 رحلة المساهمة (أول خطواتك)

إذا كنت ترغب في الانضمام إلى فريق التطوير، ابدأ بتنفيذ هذه الخطوات:

1. **الاستنساخ**: ابدأ بنسخة محلية من المستودع.
   ```bash
   git clone [https://github.com/YOUR_USERNAME/Noorify_Bot.git](https://github.com/YOUR_USERNAME/Noorify_Bot.git)
   cd Noorify_Bot
   ```

2. **التثبيت**: تأكد من جاهزية البيئة.
   ```bash
   npm install
   ```

3. **الإعداد**: قم بإعداد متغيرات البيئة.
   ```bash
   cp .env.example .env
   # أضف الـ Tokens الخاصة بك في ملف .env
   ```

4. **التشغيل**: ابدأ رحلة التطوير.
   ```bash
   npm run dev
   ```

---

## 🏗️ نظام الفروع | Branching Strategy

نتبع معايير GitFlow لضمان استقرار الإنتاج:

| الفرع | الوصف | الاستخدام |
| :--- | :--- | :--- |
| `main` | **الإنتاج** | النسخة المستقرة (Production) |
| `dev` | **التطوير** | نسخة العمل الحالية |
| `feature/*` | **الميزات** | إضافة وظائف جديدة (مثال: `feature/tasbeeh-ui`) |
| `fix/*` | **الإصلاحات** | معالجة الأخطاء (مثال: `fix/callback-error`) |

---

## 🧠 ميثاق المطور (Coding Standards)

نريد كوداً يعكس جودة المشروع. يرجى الالتزام بالمعايير التالية:

### 1. الكود النظيف (Clean Code)
* **قاعدة المسؤولية الواحدة:** الدالة الواحدة تقوم بمهمة واحدة فقط.
* **التسمية:** استخدم `camelCase` واضح ومعبّر.
* **التعليقات:** علّق على "لماذا" فعلت هذا، لا على "ماذا" فعل الكود.

### 2. معايير TypeScript
* 🚫 **تجنب `any`**: استخدم الـ `Interface` و `Type` دائماً.
* ✅ **الاستيراد المنظم**: لا تترك أي `unused imports`.

### 3. الأداء والذكاء
* ⚡ **العمليات غير المتزامنة**: استخدم `async/await` بحذر لتجنب حظر الـ Event Loop.
* 💾 **إدارة البيانات**: لا تكرر استعلامات قاعدة البيانات، استخدم الـ `Services` للوصول إليها.

---

## 🔐 الأمن أولاً (Security Policy)

> **⚠️ تنبيه شديد الأهمية:** > لا يتم قبول أي Pull Request يحتوي على مفاتيح سرية (Tokens / Keys).

* **ممنوع نهائياً:** رفع ملف `.env` أو كتابة `BOT_TOKEN` مباشرة داخل الكود.
* **المطلوب:** استخدم متغيرات البيئة دائماً.

---

## 📦 معايير الالتزام (Commit Convention)

نستخدم `Conventional Commits` لجعل سجل التغييرات واضحاً:

```bash
feat:     إضافة ميزة جديدة (مثال: إضافة مسبحة إلكترونية)
fix:      إصلاح خطأ برمجي (مثال: إصلاح تعليق الأزرار)
refactor: إعادة هيكلة الكود (بدون إضافة ميزات أو إصلاح أخطاء)
chore:    تحديث التبعيات أو تغييرات في التوثيق
```

---

## 📢 خطوات الـ Pull Request

عند رفع طلب مساهمة، تأكد من التالي:

1. **الوصف**: اشرح التغيير (ماذا أضفت؟ لماذا أضفت؟).
2. **التوثيق**: إذا أضفت ميزة، قم بتحديث الـ README إن لزم الأمر.
3. **الاختبار**: قم بتشغيل `npm run build` للتأكد من عدم وجود أخطاء في الـ TypeScript.
4. **التفاعل**: ارفق صوراً أو لقطات شاشة إذا كان التغيير مرئياً (واجهة البوت).

---

<div align="center">

### 🌟 شكراً لاهتمامك بـ Noorify Bot
*معاً نبني نظاماً رقمياً نافعاً للأمة*

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=100&section=footer" />

</div>
```

***
