const de = require('../locales/de.json');
const en = require('../locales/en.json');
const fr = require('../locales/fr.json');
const es = require('../locales/es.json');
const pt = require('../locales/pt.json');
const ar = require('../locales/ar.json');
const tr = require('../locales/tr.json');
const id = require('../locales/id.json');
const ru = require('../locales/ru.json');
const zh = require('../locales/zh.json');
const hi = require('../locales/hi.json');
const th = require('../locales/th.json');

const locales = { de, en, fr, es, pt, ar, tr, id, ru, zh, hi, th };

const SUPPORTED_LANGS = Object.keys(locales);

function t(key, lang = 'de', params) {
  const locale = locales[lang] || locales.de;
  const raw = locale[key] != null ? locale[key] : (de[key] != null ? de[key] : key);
  if (!params) return raw;
  return String(raw).replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`
  );
}

function getLang(req) {
  const cookieLang = req.cookies && req.cookies.lang;
  const queryLang = req.query && req.query.lang;
  const acceptLang = req.headers['accept-language'];

  if (queryLang && locales[queryLang]) return queryLang;
  if (cookieLang && locales[cookieLang]) return cookieLang;
  if (acceptLang) {
    const primary = acceptLang.split(',')[0].split('-')[0].trim();
    if (locales[primary]) return primary;
  }
  return 'de';
}

function isSupported(lang) {
  return SUPPORTED_LANGS.includes(lang);
}

module.exports = { t, getLang, isSupported, SUPPORTED_LANGS };
