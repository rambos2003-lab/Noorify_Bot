<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Noorify Bot — بوت الأذكار الذكي</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;400;500;700&family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --c-bg:       #060c08;
  --c-surface:  #0b1510;
  --c-card:     #0f1d13;
  --c-card2:    #132019;
  --c-border:   #1c3522;
  --c-border2:  #264535;
  --c-green:    #34e87a;
  --c-green2:   #22a855;
  --c-green3:   #166337;
  --c-gold:     #e8b84b;
  --c-gold2:    #9a7520;
  --c-blue:     #4ec9ff;
  --c-blue2:    #1e5f8a;
  --c-red:      #ff5f5f;
  --c-text:     #dff0e4;
  --c-muted:    #5a8a68;
  --c-muted2:   #3a5e45;
  --mono:       'JetBrains Mono', monospace;
  --arabic:     'Noto Kufi Arabic', sans-serif;
  --serif:      'Amiri', serif;
}

html { scroll-behavior: smooth; }

body {
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--arabic);
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.6;
}

#canvas-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}

.grain {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: .6;
}

.page {
  position: relative;
  z-index: 2;
  max-width: 1020px;
  margin: 0 auto;
  padding: 0 28px 100px;
}

/* NAV */
nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(6,12,8,.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--c-border);
  padding: 0 28px;
  margin: 0 -28px;
}
.nav-inner {
  max-width: 1020px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--c-green);
}
.nav-logo-icon {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, var(--c-green3), #0a2e14);
  border: 1px solid var(--c-green2);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}
.nav-links { display: flex; gap: 2px; list-style: none; }
.nav-links a {
  color: var(--c-muted);
  text-decoration: none;
  font-family: var(--mono);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all .2s;
}
.nav-links a:hover { color: var(--c-green); background: rgba(52,232,122,.07); }

/* HERO */
.hero {
  padding: 88px 0 60px;
  text-align: center;
  position: relative;
}
.hero-aurora {
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 800px; height: 400px;
  background:
    radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,232,122,.1) 0%, transparent 100%),
    radial-gradient(ellipse 30% 30% at 30% 20%, rgba(232,184,75,.05) 0%, transparent 100%);
  pointer-events: none;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(52,232,122,.06);
  border: 1px solid var(--c-green3);
  border-radius: 100px;
  padding: 6px 16px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--c-green);
  letter-spacing: .8px;
  text-transform: uppercase;
  margin-bottom: 28px;
  animation: slideDown .6s ease both;
}
.chip-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-green);
  animation: pulse 2s ease infinite;
}
.hero-title {
  font-family: var(--arabic);
  font-size: clamp(48px, 7vw, 80px);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 12px;
  animation: slideDown .6s .08s ease both;
}
.t-green {
  background: linear-gradient(135deg, var(--c-green) 0%, #a0f5c5 60%, var(--c-green) 100%);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}
.t-gold {
  background: linear-gradient(135deg, var(--c-gold) 0%, #fff5cc 60%, var(--c-gold) 100%);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s .5s linear infinite;
}
.hero-ayah {
  font-family: var(--serif);
  font-size: clamp(20px, 3vw, 28px);
  color: var(--c-gold);
  margin: 20px 0 28px;
  animation: slideDown .6s .16s ease both;
  position: relative;
  display: inline-block;
}
.hero-ayah::after {
  content: '';
  position: absolute;
  bottom: -8px; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--c-gold2), transparent);
}
.hero-desc {
  color: var(--c-muted);
  font-size: 16px;
  max-width: 480px;
  margin: 28px auto 36px;
  line-height: 1.8;
  animation: slideDown .6s .24s ease both;
}

/* BADGES */
.badge-strip {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 36px;
  animation: slideDown .6s .32s ease both;
}
.bdg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 100px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
  letter-spacing: .3px;
  transition: transform .2s;
}
.bdg:hover { transform: translateY(-2px); }
.bdg-g { background: rgba(52,232,122,.08); border-color: var(--c-green3); color: var(--c-green); }
.bdg-o { background: rgba(232,184,75,.08); border-color: var(--c-gold2); color: var(--c-gold); }
.bdg-b { background: rgba(78,201,255,.08); border-color: var(--c-blue2); color: var(--c-blue); }
.bdg-n { background: rgba(255,255,255,.04); border-color: var(--c-border2); color: var(--c-muted); }

/* CTA */
.cta-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  animation: slideDown .6s .4s ease both;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  border-radius: 10px;
  font-family: var(--arabic);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all .25s ease;
  cursor: pointer;
  border: none;
}
.btn-main {
  background: linear-gradient(135deg, #1a6b38 0%, #0b3d1e 100%);
  border: 1px solid var(--c-green2);
  color: var(--c-green);
}
.btn-main:hover {
  box-shadow: 0 0 30px rgba(52,232,122,.25), 0 8px 32px rgba(0,0,0,.4);
  transform: translateY(-3px);
}
.btn-ghost {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--c-border2);
  color: var(--c-muted);
}
.btn-ghost:hover { border-color: var(--c-green2); color: var(--c-green); transform: translateY(-3px); }

/* STATS BAR */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  overflow: hidden;
  margin: 56px 0;
  background: var(--c-card);
}
.stat-item {
  padding: 22px 14px;
  text-align: center;
  border-left: 1px solid var(--c-border);
  position: relative;
  transition: background .25s;
}
.stat-item:last-child { border-left: none; }
.stat-item:hover { background: rgba(52,232,122,.04); }
.stat-item::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(to right, var(--c-green3), transparent);
  opacity: 0;
  transition: opacity .25s;
}
.stat-item:hover::after { opacity: 1; }
.stat-lbl { font-family: var(--mono); font-size: 9px; color: var(--c-muted2); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
.stat-val { font-family: var(--mono); font-size: 20px; font-weight: 700; color: var(--c-green); }
.stat-sub { font-family: var(--mono); font-size: 10px; color: var(--c-muted); margin-top: 2px; }

/* SECTION LABEL */
.sec-label {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.sec-label-icon {
  width: 34px; height: 34px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.sli-g { background: rgba(52,232,122,.1); border: 1px solid var(--c-green3); }
.sli-o { background: rgba(232,184,75,.1); border: 1px solid var(--c-gold2); }
.sli-b { background: rgba(78,201,255,.1); border: 1px solid var(--c-blue2); }
.sec-label-text { font-size: 18px; font-weight: 700; }
.sec-label-line { flex: 1; height: 1px; background: linear-gradient(to left, transparent, var(--c-border)); }

/* FEATURES */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}
.feat-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 28px;
  transition: all .25s;
  position: relative;
  overflow: hidden;
}
.feat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(52,232,122,.08) 0%, transparent 100%);
  opacity: 0;
  transition: opacity .3s;
}
.feat-card:hover { border-color: var(--c-green2); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.4); }
.feat-card:hover::before { opacity: 1; }
.feat-num { font-family: var(--mono); font-size: 11px; color: var(--c-muted2); letter-spacing: 1px; margin-bottom: 16px; }
.feat-icon { font-size: 32px; margin-bottom: 14px; display: block; }
.feat-title { font-size: 17px; font-weight: 700; color: var(--c-green); margin-bottom: 10px; }
.feat-desc { font-size: 14px; color: var(--c-muted); line-height: 1.8; margin-bottom: 14px; }
.feat-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.feat-tag {
  font-family: var(--mono);
  font-size: 11px;
  background: rgba(52,232,122,.06);
  border: 1px solid var(--c-green3);
  color: var(--c-green);
  border-radius: 6px;
  padding: 3px 9px;
}

/* DIVIDER */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--c-border), transparent);
  margin: 56px 0;
}

/* COMMANDS */
.cmd-section {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  overflow: hidden;
}
.cmd-header {
  padding: 13px 20px;
  background: rgba(0,0,0,.25);
  border-bottom: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  gap: 8px;
}
.cmd-header-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-r { background: #ff5f57; }
.dot-y { background: #ffbd2e; }
.dot-g { background: #28c840; }
.cmd-header-title { font-family: var(--mono); font-size: 12px; color: var(--c-muted); margin-right: 8px; }
.cmd-table { width: 100%; border-collapse: collapse; }
.cmd-table thead tr { background: rgba(52,232,122,.04); }
.cmd-table th {
  text-align: right;
  padding: 11px 20px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--c-muted2);
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--c-border);
  font-weight: 500;
}
.cmd-table td { padding: 14px 20px; border-bottom: 1px solid rgba(28,53,34,.5); vertical-align: middle; }
.cmd-table tr:last-child td { border-bottom: none; }
.cmd-table tr:hover td { background: rgba(52,232,122,.03); }
.cmd-name { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--c-green); white-space: nowrap; }
.cmd-slash { color: var(--c-green2); }
.cmd-desc { font-size: 14px; color: var(--c-text); }
.cmd-tag { display: inline-block; font-family: var(--mono); font-size: 10px; padding: 3px 9px; border-radius: 6px; font-weight: 500; }
.tag-basic  { background: rgba(52,232,122,.08); border: 1px solid var(--c-green3); color: var(--c-green); }
.tag-remind { background: rgba(78,201,255,.08); border: 1px solid var(--c-blue2); color: var(--c-blue); }
.tag-stats  { background: rgba(232,184,75,.08); border: 1px solid var(--c-gold2); color: var(--c-gold); }

/* ARCHITECTURE */
.arch-box-wrap {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
}
.arch-box-wrap::before {
  content: '';
  position: absolute;
  top: -100px; left: 50%;
  transform: translateX(-50%);
  width: 500px; height: 300px;
  background: radial-gradient(ellipse, rgba(52,232,122,.06) 0%, transparent 70%);
  pointer-events: none;
}
.arch-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 24px;
  position: relative;
}
.arch-node { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.arch-box {
  border-radius: 12px;
  padding: 14px 22px;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 115px;
  transition: transform .25s;
}
.arch-box:hover { transform: scale(1.05); }
.ab-green { background: rgba(52,232,122,.08); border: 1px solid var(--c-green2); color: var(--c-green); }
.ab-gold  { background: rgba(232,184,75,.08); border: 1px solid var(--c-gold2); color: var(--c-gold); }
.ab-blue  { background: rgba(78,201,255,.08); border: 1px solid var(--c-blue2); color: var(--c-blue); }
.ab-gray  { background: rgba(255,255,255,.04); border: 1px solid var(--c-border2); color: var(--c-muted); }
.arch-icon { font-size: 24px; }
.arch-lbl { font-size: 10px; color: var(--c-muted2); font-family: var(--mono); }
.arch-arrow { color: var(--c-green3); font-size: 20px; padding: 0 6px; margin-bottom: 24px; flex-shrink: 0; }
.arch-tech-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--c-border);
}

/* CODE */
.code-block {
  background: #020806;
  border: 1px solid var(--c-border);
  border-radius: 13px;
  overflow: hidden;
  margin: 16px 0;
  font-family: var(--mono);
}
.cb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(255,255,255,.02);
  border-bottom: 1px solid var(--c-border);
}
.cb-dots { display: flex; gap: 6px; }
.cb-file { font-size: 12px; color: var(--c-muted2); }
.cb-lang { font-size: 10px; background: rgba(52,232,122,.07); border: 1px solid var(--c-green3); color: var(--c-green); padding: 2px 8px; border-radius: 5px; letter-spacing: .5px; }
.cb-body { padding: 22px; font-size: 13px; line-height: 2; direction: ltr; text-align: left; overflow-x: auto; }
.co { color: #2e5e3a; }
.ck { color: var(--c-blue); }
.cs { color: #9ee8c0; }
.cv { color: var(--c-green); }

/* STEPS */
.steps-list { display: flex; flex-direction: column; gap: 10px; }
.step {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 18px 22px;
  transition: all .25s;
}
.step:hover { border-color: var(--c-green2); background: var(--c-card2); }
.step-n {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(52,232,122,.08);
  border: 1px solid var(--c-green2);
  color: var(--c-green);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.step h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.step p { font-size: 13px; color: var(--c-muted); line-height: 1.7; }
code {
  font-family: var(--mono);
  font-size: 12px;
  background: rgba(52,232,122,.07);
  color: var(--c-green);
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid rgba(52,232,122,.2);
}

/* TREE */
.tree {
  background: #020806;
  border: 1px solid var(--c-border);
  border-radius: 13px;
  padding: 26px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 2.1;
  direction: ltr;
  text-align: left;
  overflow-x: auto;
}
.tr { color: #1e3d28; }
.td { color: var(--c-text); }
.tf { color: var(--c-gold); }
.tc { color: var(--c-muted2); font-size: 12px; }
.tg { color: var(--c-green); }

/* TECH GRID */
.tech-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.tech-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  transition: all .25s;
}
.tech-card:hover { border-color: var(--c-green2); transform: translateY(-3px); background: var(--c-card2); }
.tech-icon { font-size: 30px; margin-bottom: 10px; display: block; }
.tech-name { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--c-green); margin-bottom: 4px; }
.tech-ver  { font-family: var(--mono); font-size: 11px; color: var(--c-muted); }

/* PRIVACY */
.privacy-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.priv-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: border-color .25s;
}
.priv-card:hover { border-color: var(--c-green2); }
.priv-icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(52,232,122,.08);
  border: 1px solid var(--c-green3);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.priv-title { font-size: 14px; font-weight: 700; color: var(--c-green); margin-bottom: 4px; }
.priv-desc  { font-size: 12px; color: var(--c-muted); line-height: 1.6; }

/* ROADMAP */
.roadmap { display: flex; flex-direction: column; position: relative; }
.roadmap::before {
  content: '';
  position: absolute;
  top: 20px; bottom: 20px;
  right: 15px;
  width: 1px;
  background: linear-gradient(to bottom, var(--c-green3), var(--c-border));
}
.road-item { display: flex; gap: 20px; align-items: flex-start; padding: 16px 0; position: relative; }
.road-dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  z-index: 1;
}
.rd-done { background: rgba(52,232,122,.15); border: 2px solid var(--c-green2); color: var(--c-green); }
.rd-todo { background: rgba(255,255,255,.04); border: 2px solid var(--c-border2); color: var(--c-muted); }
.road-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.road-content p  { font-size: 13px; color: var(--c-muted); }
.road-done-txt { color: var(--c-green); }
.road-todo-txt { color: var(--c-muted); }

/* VERSIONS */
.version-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 10px;
  transition: border-color .2s;
}
.version-row:hover { border-color: var(--c-border2); }
.vtag { font-family: var(--mono); font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 7px; min-width: 76px; text-align: center; }
.vtag-latest { background: rgba(52,232,122,.1); border: 1px solid var(--c-green2); color: var(--c-green); }
.vtag-old    { background: rgba(255,255,255,.04); border: 1px solid var(--c-border2); color: var(--c-muted2); }
.vdate { font-family: var(--mono); font-size: 12px; color: var(--c-muted2); min-width: 80px; }
.vdesc { font-size: 14px; color: var(--c-text); flex: 1; }

/* CONTACT */
.contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.contact-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: 13px;
  padding: 24px 20px;
  text-align: center;
  text-decoration: none;
  transition: all .25s;
  display: block;
}
.contact-card:hover { border-color: var(--c-green2); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.4); }
.contact-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(52,232,122,.07);
  border: 1px solid var(--c-green3);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  margin: 0 auto 14px;
  transition: background .25s;
}
.contact-card:hover .contact-icon-wrap { background: rgba(52,232,122,.14); }
.contact-name { font-size: 15px; font-weight: 700; color: var(--c-green); margin-bottom: 6px; }
.contact-handle { font-family: var(--mono); font-size: 12px; color: var(--c-muted); }

/* FOOTER */
footer {
  text-align: center;
  padding: 56px 0 32px;
  border-top: 1px solid var(--c-border);
  margin-top: 72px;
  position: relative;
}
footer::before {
  content: '';
  position: absolute;
  top: -1px; left: 20%; right: 20%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--c-green2), transparent);
}
.foot-bismillah { font-family: var(--serif); font-size: 32px; color: var(--c-gold); margin-bottom: 16px; }
.foot-line { font-family: var(--mono); font-size: 12px; color: var(--c-muted2); letter-spacing: .5px; }
.foot-heart { color: var(--c-red); }
.foot-green { color: var(--c-green); }

/* ANIMATIONS */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .5; transform: scale(.85); }
}
@keyframes floatUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--c-bg); }
::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 3px; }

@media (max-width: 720px) {
  .stats-bar { grid-template-columns: repeat(3, 1fr); }
  .features-grid, .tech-grid, .privacy-row, .contact-grid { grid-template-columns: 1fr; }
  .arch-arrow { display: none; }
  .arch-flow { gap: 12px; }
}
</style>
</head>
<body>

<canvas id="canvas-bg"></canvas>
<div class="grain"></div>

<nav>
  <div class="nav-inner">
    <div class="nav-logo">
      <div class="nav-logo-icon">🌿</div>
      Noorify Bot
    </div>
    <ul class="nav-links">
      <li><a href="#features">المميزات</a></li>
      <li><a href="#commands">الأوامر</a></li>
      <li><a href="#install">التثبيت</a></li>
      <li><a href="#contact">التواصل</a></li>
    </ul>
  </div>
</nav>

<div class="page">

  <!-- HERO -->
  <section class="hero">
    <div class="hero-aurora"></div>
    <div class="hero-chip"><span class="chip-dot"></span>v2.0.0 — Online & Running</div>
    <h1 class="hero-title"><span class="t-green">Noorify</span> <span class="t-gold">Bot</span></h1>
    <div class="hero-ayah">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</div>
    <p class="hero-desc">بوت Telegram ذكي يساعدك على المداومة في ذكر الله يومياً — رفيقك الروحي الدائم على مدار الساعة</p>
    <div class="badge-strip">
      <span class="bdg bdg-g">✓ v2.0.0</span>
      <span class="bdg bdg-n">Node.js ≥14.0</span>
      <span class="bdg bdg-o">MIT License</span>
      <span class="bdg bdg-b">Telegram Platform</span>
      <span class="bdg bdg-g">● Online 99.9%</span>
      <span class="bdg bdg-o">★ 72 Stars</span>
      <span class="bdg bdg-g">👥 1,245+ Users</span>
      <span class="bdg bdg-n">132 KB</span>
    </div>
    <div class="cta-row">
      <a href="https://t.me/Noorify_bot" class="btn btn-main">✈ ابدأ مع البوت الآن</a>
      <a href="https://github.com/rambos2003-lab" class="btn btn-ghost">⎇ GitHub</a>
      <a href="https://t.me/vx_rq" class="btn btn-ghost">💬 المطوّر</a>
    </div>
  </section>

  <!-- STATS BAR -->
  <div class="stats-bar">
    <div class="stat-item"><div class="stat-lbl">VERSION</div><div class="stat-val">2.0.0</div></div>
    <div class="stat-item"><div class="stat-lbl">USERS</div><div class="stat-val">1.2K+</div><div class="stat-sub">and growing</div></div>
    <div class="stat-item"><div class="stat-lbl">UPTIME</div><div class="stat-val">99.9%</div><div class="stat-sub">last 30 days</div></div>
    <div class="stat-item"><div class="stat-lbl">RESPONSE</div><div class="stat-val">120ms</div><div class="stat-sub">average</div></div>
    <div class="stat-item"><div class="stat-lbl">STARS ★</div><div class="stat-val">72</div><div class="stat-sub">and counting</div></div>
    <div class="stat-item"><div class="stat-lbl">DHIKR</div><div class="stat-val">25+</div><div class="stat-sub">unique</div></div>
  </div>

  <!-- FEATURES -->
  <section id="features">
    <div class="sec-label">
      <div class="sec-label-icon sli-g">✨</div>
      <span class="sec-label-text">المميزات الرئيسية</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-num">01 — DHIKR ENGINE</div>
        <span class="feat-icon">📿</span>
        <div class="feat-title">أذكار متنوعة وموثوقة</div>
        <div class="feat-desc">أكثر من 25 ذكر مختلف من أفضل المصادر الإسلامية. تجربة جديدة في كل مرة مع خوارزمية عشوائية ذكية.</div>
        <div class="feat-tags"><span class="feat-tag">25+ ذكر</span><span class="feat-tag">مصادر موثوقة</span><span class="feat-tag">عشوائي</span></div>
      </div>
      <div class="feat-card">
        <div class="feat-num">02 — SCHEDULER</div>
        <span class="feat-icon">⏰</span>
        <div class="feat-title">تذكيرات ذكية مخصصة</div>
        <div class="feat-desc">4 أوضاع تذكير تتكيف مع جدولك. يعمل 24/7 على Railway بلا انقطاع مع node-cron للدقة العالية.</div>
        <div class="feat-tags"><span class="feat-tag">30 دقيقة</span><span class="feat-tag">كل ساعة</span><span class="feat-tag">3 ساعات</span><span class="feat-tag">6 ساعات</span></div>
      </div>
      <div class="feat-card">
        <div class="feat-num">03 — LIBRARY</div>
        <span class="feat-icon">📚</span>
        <div class="feat-title">مكتبة رقمية شاملة</div>
        <div class="feat-desc">محتوى روحي غني في مكان واحد. من أذكار الصباح والمساء إلى حصن المسلم والقرآن الكريم.</div>
        <div class="feat-tags"><span class="feat-tag">حصن المسلم</span><span class="feat-tag">القرآن</span><span class="feat-tag">كسب الثواب</span></div>
      </div>
      <div class="feat-card">
        <div class="feat-num">04 — ANALYTICS</div>
        <span class="feat-icon">📊</span>
        <div class="feat-title">إحصائيات وتتبع شخصي</div>
        <div class="feat-desc">تابع رحلتك الروحية يوماً بيوم. عداد يومي دقيق، تاريخ انضمام، وإحصائيات مفصّلة لكل مستخدم.</div>
        <div class="feat-tags"><span class="feat-tag">عداد يومي</span><span class="feat-tag">إحصائيات</span><span class="feat-tag">تتبع التقدم</span></div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- COMMANDS -->
  <section id="commands">
    <div class="sec-label">
      <div class="sec-label-icon sli-o">⌘</div>
      <span class="sec-label-text">قائمة الأوامر الكاملة</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="cmd-section">
      <div class="cmd-header">
        <div class="cmd-header-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
        <span class="cmd-header-title">noorify-bot — command reference</span>
      </div>
      <table class="cmd-table">
        <thead><tr><th>الأمر</th><th>الوصف</th><th>النوع</th></tr></thead>
        <tbody>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>start</span></td><td><span class="cmd-desc">الترحيب والقائمة الرئيسية</span></td><td><span class="cmd-tag tag-basic">أساسي</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>help</span></td><td><span class="cmd-desc">عرض جميع الأوامر والمساعدة</span></td><td><span class="cmd-tag tag-basic">أساسي</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>dhikr</span></td><td><span class="cmd-desc">احصل على ذكر عشوائي موثوق في الحال</span></td><td><span class="cmd-tag tag-basic">أساسي</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>reminder_on</span></td><td><span class="cmd-desc">تفعيل التذكيرات الآلية الدورية</span></td><td><span class="cmd-tag tag-remind">تذكير</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>reminder_off</span></td><td><span class="cmd-desc">إيقاف التذكيرات مؤقتاً</span></td><td><span class="cmd-tag tag-remind">تذكير</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>reminder_settings</span></td><td><span class="cmd-desc">اختيار الفترة المناسبة لتذكيراتك</span></td><td><span class="cmd-tag tag-remind">تذكير</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>daily_count</span></td><td><span class="cmd-desc">عدد الأذكار التي قلتها اليوم</span></td><td><span class="cmd-tag tag-stats">إحصاء</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>stats</span></td><td><span class="cmd-desc">إحصائياتك الشخصية الكاملة</span></td><td><span class="cmd-tag tag-stats">إحصاء</span></td></tr>
          <tr><td><span class="cmd-name"><span class="cmd-slash">/</span>library</span></td><td><span class="cmd-desc">فتح المكتبة الرقمية وتحميل الملفات</span></td><td><span class="cmd-tag tag-basic">مكتبة</span></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ARCHITECTURE -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-b">🏗</div>
      <span class="sec-label-text">معمارية النظام</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="arch-box-wrap">
      <div class="arch-flow">
        <div class="arch-node"><div class="arch-icon">👤</div><div class="arch-box ab-gray">User</div><div class="arch-lbl">المستخدم</div></div>
        <div class="arch-arrow">──→</div>
        <div class="arch-node"><div class="arch-icon">✈</div><div class="arch-box ab-blue">Telegram API</div><div class="arch-lbl">Webhook / Polling</div></div>
        <div class="arch-arrow">──→</div>
        <div class="arch-node"><div class="arch-icon">🌿</div><div class="arch-box ab-green">Noorify Core</div><div class="arch-lbl">Node.js · Telegraf</div></div>
        <div class="arch-arrow">──→</div>
        <div class="arch-node"><div class="arch-icon">⏱</div><div class="arch-box ab-gold">Scheduler</div><div class="arch-lbl">node-cron</div></div>
        <div class="arch-arrow">──→</div>
        <div class="arch-node"><div class="arch-icon">🗄</div><div class="arch-box ab-gold">JSON Store</div><div class="arch-lbl">Local · Fast · Safe</div></div>
      </div>
      <div class="arch-tech-row">
        <span class="bdg bdg-g">Node.js ≥14</span>
        <span class="bdg bdg-b">Telegraf Framework</span>
        <span class="bdg bdg-o">node-cron</span>
        <span class="bdg bdg-n">JSON Database</span>
        <span class="bdg bdg-g">Railway Deploy</span>
        <span class="bdg bdg-n">dotenv</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- INSTALL -->
  <section id="install">
    <div class="sec-label">
      <div class="sec-label-icon sli-g">🚀</div>
      <span class="sec-label-text">البدء السريع — للمستخدمين</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="steps-list" style="margin-bottom:48px">
      <div class="step"><div class="step-n">1</div><div><h4>افتح Telegram</h4><p>ابحث عن <code>@Noorify_bot</code> أو اضغط على زر البدء أعلاه</p></div></div>
      <div class="step"><div class="step-n">2</div><div><h4>ابدأ المحادثة</h4><p>اكتب <code>/start</code> وستظهر القائمة الرئيسية فوراً</p></div></div>
      <div class="step"><div class="step-n">3</div><div><h4>فعّل التذكيرات</h4><p>استخدم <code>/reminder_settings</code> لاختيار الفترة المناسبة لك</p></div></div>
      <div class="step"><div class="step-n">4</div><div><h4>ابدأ رحلتك 🌿</h4><p>استمتع بالأذكار اليومية وتابع تقدمك الروحي يوماً بيوم</p></div></div>
    </div>

    <div class="sec-label">
      <div class="sec-label-icon sli-b">⚙</div>
      <span class="sec-label-text">التثبيت المحلي — للمطورين</span>
      <div class="sec-label-line"></div>
    </div>

    <div class="code-block">
      <div class="cb-header">
        <div class="cb-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
        <span class="cb-file">installation.sh</span>
        <span class="cb-lang">BASH</span>
      </div>
      <div class="cb-body">
<span class="co"># ── Clone & Enter ─────────────────────────────────────────</span>
<span class="cv">git</span> clone https://github.com/rambos2003-lab/noorify-azkar-bot
<span class="cv">cd</span> noorify-azkar-bot

<span class="co"># ── Install Dependencies ──────────────────────────────────</span>
<span class="cv">npm</span> install

<span class="co"># ── Environment Setup ─────────────────────────────────────</span>
<span class="ck">TELEGRAM_BOT_TOKEN</span>=<span class="cs">your_bot_token_here</span>  <span class="co"># add to .env</span>

<span class="co"># ── Launch Bot ────────────────────────────────────────────</span>
<span class="cv">npm</span> start
<span class="co"># → Noorify Bot is running! ✓</span>
      </div>
    </div>

    <div class="code-block">
      <div class="cb-header">
        <div class="cb-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
        <span class="cb-file">package.json</span>
        <span class="cb-lang">JSON</span>
      </div>
      <div class="cb-body">
{
  <span class="cs">"name"</span>: <span class="cs">"noorify-azkar-bot"</span>,
  <span class="cs">"version"</span>: <span class="cs">"2.0.0"</span>,
  <span class="cs">"main"</span>: <span class="cs">"app.js"</span>,
  <span class="cs">"dependencies"</span>: {
    <span class="cs">"node-telegram-bot-api"</span>: <span class="cs">"^0.61.0"</span>,
    <span class="cs">"node-cron"</span>: <span class="cs">"^3.0.0"</span>,
    <span class="cs">"dotenv"</span>: <span class="cs">"^16.0.0"</span>
  },
  <span class="cs">"scripts"</span>: { <span class="cs">"start"</span>: <span class="cs">"node app.js"</span> },
  <span class="cs">"engines"</span>: { <span class="cs">"node"</span>: <span class="cs">">=14.0.0"</span> }
}
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- STRUCTURE -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-o">📁</div>
      <span class="sec-label-text">هيكل المشروع</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="tree" dir="ltr">
<span class="tf">noorify-azkar-bot/</span>
<span class="tr">├──</span> <span class="tg">app.js</span>                   <span class="tc">  ← Entry point · Bot logic · Event handlers</span>
<span class="tr">├──</span> <span class="td">.env</span>                     <span class="tc">  ← Environment variables (TELEGRAM_BOT_TOKEN)</span>
<span class="tr">├──</span> <span class="td">.env.example</span>             <span class="tc">  ← Template for new contributors</span>
<span class="tr">├──</span> <span class="td">package.json</span>             <span class="tc">  ← Dependencies & npm scripts</span>
<span class="tr">├──</span> <span class="td">reminders_data.json</span>      <span class="tc">  ← Active reminders per user</span>
<span class="tr">├──</span> <span class="td">user_preferences.json</span>    <span class="tc">  ← User settings & intervals</span>
<span class="tr">├──</span> <span class="td">bot_stats.json</span>           <span class="tc">  ← Usage analytics & counters</span>
<span class="tr">├──</span> <span class="td">README.md</span>                <span class="tc">  ← Documentation</span>
<span class="tr">└──</span> <span class="td">.gitignore</span>               <span class="tc">  ← Excluded: .env, node_modules</span>
    </div>
  </section>

  <div class="divider"></div>

  <!-- TECH STACK -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-b">🛠</div>
      <span class="sec-label-text">التقنيات المستخدمة</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="tech-grid">
      <div class="tech-card"><span class="tech-icon">🟢</span><div class="tech-name">Node.js</div><div class="tech-ver">≥ 14.0.0</div></div>
      <div class="tech-card"><span class="tech-icon">✈</span><div class="tech-name">Telegraf</div><div class="tech-ver">Bot Framework</div></div>
      <div class="tech-card"><span class="tech-icon">⏱</span><div class="tech-name">node-cron</div><div class="tech-ver">Task Scheduler</div></div>
      <div class="tech-card"><span class="tech-icon">🚂</span><div class="tech-name">Railway</div><div class="tech-ver">Cloud Deployment</div></div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- PRIVACY -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-g">🔒</div>
      <span class="sec-label-text">الخصوصية والأمان</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="privacy-row">
      <div class="priv-card"><div class="priv-icon">🏠</div><div><div class="priv-title">تخزين محلي 100%</div><div class="priv-desc">جميع البيانات تُحفظ داخل الخادم فقط. لا توجد قاعدة بيانات خارجية.</div></div></div>
      <div class="priv-card"><div class="priv-icon">🚫</div><div><div class="priv-title">لا مشاركة للبيانات</div><div class="priv-desc">معلوماتك لا تُشارك مع أي طرف ثالث. بياناتك ملكك وحدك.</div></div></div>
      <div class="priv-card"><div class="priv-icon">🗑</div><div><div class="priv-title">حق الحذف الكامل</div><div class="priv-desc">يمكنك طلب حذف جميع بياناتك في أي وقت بدون قيود.</div></div></div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- ROADMAP -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-o">🗺</div>
      <span class="sec-label-text">خارطة الطريق</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="roadmap">
      <div class="road-item"><div class="road-dot rd-done">✓</div><div class="road-content"><h4 class="road-done-txt">أذكار عشوائية وموثوقة</h4><p>25+ ذكر من مصادر معتمدة — مكتمل</p></div></div>
      <div class="road-item"><div class="road-dot rd-done">✓</div><div class="road-content"><h4 class="road-done-txt">نظام التذكيرات الذكية</h4><p>4 فترات زمنية مع node-cron — مكتمل</p></div></div>
      <div class="road-item"><div class="road-dot rd-done">✓</div><div class="road-content"><h4 class="road-done-txt">المكتبة الرقمية والإحصائيات</h4><p>تتبع يومي وملفات قابلة للتحميل — مكتمل</p></div></div>
      <div class="road-item"><div class="road-dot rd-todo">○</div><div class="road-content"><h4 class="road-todo-txt">دعم اللغات المتعددة</h4><p>إنجليزي، فرنسي، أردو — قيد التطوير</p></div></div>
      <div class="road-item"><div class="road-dot rd-todo">○</div><div class="road-content"><h4 class="road-todo-txt">تذكيرات بوقت محدد يومياً</h4><p>تحديد ساعة معينة بدلاً من الفترات الثابتة</p></div></div>
      <div class="road-item"><div class="road-dot rd-todo">○</div><div class="road-content"><h4 class="road-todo-txt">واجهة ويب وتطبيق موبايل</h4><p>توسيع الوصول لمنصات أخرى</p></div></div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- VERSIONS -->
  <section>
    <div class="sec-label">
      <div class="sec-label-icon sli-g">📦</div>
      <span class="sec-label-text">الإصدارات</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="version-row"><span class="vtag vtag-latest">v2.0.0</span><span class="vdate">May 2024</span><span class="vdesc">نسخة احترافية — تذكيرات ذكية، مكتبة رقمية، إحصائيات متقدمة، واجهة محسّنة كاملاً</span></div>
    <div class="version-row"><span class="vtag vtag-old">v1.0.0</span><span class="vdate">2024</span><span class="vdesc">النسخة الأولى — أذكار عشوائية وأوامر بسيطة</span></div>
  </section>

  <div class="divider"></div>

  <!-- CONTACT -->
  <section id="contact">
    <div class="sec-label">
      <div class="sec-label-icon sli-b">📡</div>
      <span class="sec-label-text">تواصل معنا</span>
      <div class="sec-label-line"></div>
    </div>
    <div class="contact-grid">
      <a href="https://t.me/Noorify_bot" class="contact-card"><div class="contact-icon-wrap">✈</div><div class="contact-name">Telegram Bot</div><div class="contact-handle">@Noorify_bot</div></a>
      <a href="https://t.me/vx_rq" class="contact-card"><div class="contact-icon-wrap">💬</div><div class="contact-name">المطوّر الرئيسي</div><div class="contact-handle">@vx_rq</div></a>
      <a href="https://github.com/rambos2003-lab" class="contact-card"><div class="contact-icon-wrap">⎇</div><div class="contact-name">GitHub</div><div class="contact-handle">rambos2003-lab</div></a>
    </div>
  </section>

  <footer>
    <div class="foot-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <div class="foot-line">Made with <span class="foot-heart">♥</span> for the sake of Allah · <span class="foot-green">Noorify Team</span> · MIT License · v2.0.0</div>
  </footer>

</div>

<script>
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function initStars() {
  stars = [];
  const count = Math.floor((canvas.width * canvas.height) / 5500);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      delta: (Math.random() - 0.5) * 0.015,
      gold: Math.random() < 0.1
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.alpha += s.delta;
    if (s.alpha <= 0.05 || s.alpha >= 0.75) s.delta *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.gold
      ? `rgba(232,184,75,${s.alpha})`
      : `rgba(52,232,122,${s.alpha * 0.55})`;
    ctx.fill();
  });
  requestAnimationFrame(draw);
}

resize(); initStars(); draw();
window.addEventListener('resize', () => { resize(); initStars(); });

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'floatUp .65s ease both';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('section, .stats-bar').forEach(el => {
  el.style.opacity = '0';
  io.observe(el);
});
</script>
</body>
</html>
