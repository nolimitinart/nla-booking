// Génération sans dépendance externe : Pages CMS modifie les fichiers content/*.json,
// Netlify lance ce script à chaque commit GitHub.
import {readFileSync, writeFileSync} from 'node:fs';
const load=filename=>JSON.parse(readFileSync(filename,'utf8'));
const site=load('content/site.json');
const artists=load('content/artists.json');
const safe=(s='')=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const url=(s='')=>String(s).replace(/\/$/,'');
function setElement(html,selector,value){
 const id=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return html.replace(new RegExp(`(<([a-z][a-z0-9]*)\\b[^>]*\\bid="${id}"[^>]*>)([\\s\\S]*?)(<\\/\\2>)`,'i'),(_,start,tag,old,end)=>start+safe(value??'')+end);
}
let html=readFileSync('index.html','utf8');
const fields={
 'hero-eyebrow':site.hero_eyebrow,'hero-line-1':site.hero_line_1,'hero-line-2':site.hero_line_2,'hero-line-3':site.hero_line_3,
 'hero-lead':site.hero_description,'artists-intro':site.artists_intro,'manifesto-title':site.manifesto_title,
 'manifesto-highlight':site.manifesto_highlight,'manifesto-text':site.manifesto_text,
 'about-paragraph-1':site.about_paragraph_1,'about-paragraph-2':site.about_paragraph_2,
 'contact-intro':site.contact_intro,'contact-address':site.contact_email,'footer-address':site.contact_email,
 'contact-location-text':site.contact_location,'footer-tagline':site.tagline};
for (const [id,value] of Object.entries(fields)) html=setElement(html,id,value);
for(let i=0;i<3;i++) for(const key of ['title','description','footer']) html=setElement(html,`service-${i+1}-${key}`,site.services?.[i]?.[key]||'');
html=html.replace(/<title>[^<]*<\/title>/,`<title>${safe(site.seo_title)}</title>`);
html=html.replace(/(<meta name="description" content=")[^"]*(")/,`$1${safe(site.seo_description)}$2`);
html=html.replace(/(<meta property="og:title" content=")[^"]*(")/,`$1${safe(site.seo_title)}$2`);
html=html.replace(/(<meta property="og:description" content=")[^"]*(")/,`$1${safe(site.seo_description)}$2`);
html=html.replace(/<link rel="canonical"[^>]*>\n?/g,'');
if(site.domain) html=html.replace('</head>',`  <link rel="canonical" href="${safe(url(site.domain))}/">\n</head>`);
writeFileSync('index.html',html);
writeFileSync('artists.js',`// Fichier généré automatiquement : modifier content/artists.json via Pages CMS.\nwindow.NLA_ARTISTS = ${JSON.stringify(artists.filter(a=>a.visible!==false),null,2)};\n`);
writeFileSync('site-config.js',`// Fichier généré automatiquement depuis content/site.json.\nwindow.NLA_SITE = ${JSON.stringify(site,null,2)};\n`);
const sitemap=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',`<url><loc>${safe(url(site.domain||'https://example.com'))}/</loc></url>`,'</urlset>'].join('\n');
writeFileSync('sitemap.xml',sitemap+'\n');
writeFileSync('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${url(site.domain||'https://example.com')}/sitemap.xml\n`);
console.log(`NLA Booking : ${artists.length} profils, site et SEO générés.`);
