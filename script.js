'use strict';

// Facultatif : ajoutez le chemin du logo NLA ORIGINAL en PNG ou SVG (fond transparent).
// Exemple : const BRAND_LOGO = 'assets/logo-nla-original.png';
const BRAND_LOGO = (window.NLA_SITE && window.NLA_SITE.logo) || ''; 
const CONTACT_EMAIL = (window.NLA_SITE && window.NLA_SITE.contact_email) || 'nla.asbl@gmail.com';
const artists = Array.isArray(window.NLA_ARTISTS) ? window.NLA_ARTISTS : [];

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

function applyBrandLogo() {
  if (!BRAND_LOGO) return;
  $$('.brand-mark').forEach(mark => {
    const image = document.createElement('img');
    image.src = BRAND_LOGO;
    image.alt = '';
    image.className = 'brand-original-logo';
    mark.replaceChildren(image);
  });
}
function visualFor(artist, additionalClass = '') {
  const visual = document.createElement('div');
  visual.className = `artist-visual ${additionalClass}`;
  visual.style.setProperty('--card-accent', artist.accent || '#e65f45');
  if (artist.image) {
    const image = document.createElement('img');
    image.src = artist.image;
    image.alt = `Photo de ${artist.name}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (artist.position) image.style.objectPosition = artist.position;
    visual.append(image);
  } else {
    const ghost = document.createElement('span');
    ghost.className = 'artist-ghost';
    ghost.textContent = artist.monogram || 'NLA';
    visual.append(ghost);
  }
  const symbol = document.createElement('span');
  symbol.className = 'artist-corner'; symbol.textContent = '✳'; symbol.setAttribute('aria-hidden', 'true');
  visual.append(symbol);
  return visual;
}
function makeArtistCard(artist) {
  const article = document.createElement('article'); article.className = 'artist-card';
  const open = document.createElement('button'); open.type = 'button'; open.className = 'artist-open';
  open.setAttribute('aria-label', `Voir la fiche de ${artist.name}`);
  open.append(visualFor(artist));
  const info = document.createElement('div'); info.className = 'artist-info';
  const meta = document.createElement('span'); meta.className = 'artist-category'; meta.textContent = `${artist.category} / ${artist.genre}`;
  const name = document.createElement('h3'); name.textContent = artist.name;
  const short = document.createElement('p'); short.textContent = artist.short;
  const arrow = document.createElement('span'); arrow.className = 'artist-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
  info.append(meta, name, short, arrow); open.append(info); article.append(open);
  open.addEventListener('click', () => showArtist(artist));
  return article;
}
function renderArtists(filter = 'Tous') {
  const grid = $('#artist-grid'); grid.replaceChildren();
  const visible = filter === 'Tous' ? artists : artists.filter(artist => artist.category === filter);
  visible.forEach(artist => grid.append(makeArtistCard(artist)));
  $('#artist-count').textContent = `${visible.length} PROFIL${visible.length === 1 ? '' : 'S'}`;
  if (visible.length === 0) {
    const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'Aucun profil dans cette catégorie pour le moment.';
    grid.append(empty);
  }
}
function safeVideoEmbed(link) {
  try {
    const u = new URL(link);
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(u.hostname)) {
      const id = u.searchParams.get('v') || u.pathname.match(/^\/shorts\/([\w-]+)/)?.[1];
      if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname === 'youtu.be') {
      const id=u.pathname.slice(1); if (/^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (['vimeo.com','www.vimeo.com'].includes(u.hostname)) {
      const id=u.pathname.split('/').filter(Boolean)[0]; if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return null;
}
function showArtist(artist) {
  const dialog = $('#artist-dialog');
  $('#dialog-title').textContent = artist.name;
  $('#dialog-meta').textContent = `${artist.category.toUpperCase()} — ${artist.genre} — ${artist.origin}`;
  $('#dialog-description').textContent = artist.description;
  $('#dialog-details').textContent = artist.details;
  $('#dialog-visual').replaceChildren(visualFor(artist, 'dialog-artwork'));
  const media = $('#dialog-media');
  media.replaceChildren();
  if (artist.video_file && /^\/?[\w./%-]+\.(mp4|webm)$/i.test(artist.video_file)) {
    const player = document.createElement('video'); player.controls = true; player.preload = 'none'; player.playsInline = true; player.src = artist.video_file; media.append(player);
  } else if (artist.video_url) {
    const embedded = safeVideoEmbed(artist.video_url);
    if (embedded) {
      const iframe = document.createElement('iframe'); iframe.src = embedded; iframe.title = `Vidéo de ${artist.name}`;
      iframe.loading = 'lazy'; iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.allowFullscreen = true; media.append(iframe);
    } else if (/^https:\/\//i.test(artist.video_url)) {
      const link = document.createElement('a'); link.href = artist.video_url; link.target = '_blank'; link.rel='noopener noreferrer'; link.textContent = 'Voir la vidéo ↗'; media.append(link);
    }
  }
  if (artist.website_url && /^https:\/\//i.test(artist.website_url)) {
    const link = document.createElement('a'); link.href = artist.website_url; link.target = '_blank'; link.rel='noopener noreferrer'; link.textContent = 'Site officiel ↗'; media.append(link);
  }
  $('#dialog-booking').onclick = () => {
    $('#artist-select').value = artist.name;
    dialog.close();
  };
  dialog.showModal();
}
function setupFilters() {
  $$('.filter-chip').forEach(button => button.addEventListener('click', () => {
    $$('.filter-chip').forEach(chip => { chip.classList.remove('active'); chip.setAttribute('aria-pressed', 'false'); });
    button.classList.add('active'); button.setAttribute('aria-pressed', 'true');
    renderArtists(button.dataset.filter);
  }));
}
function setupDialog() {
  const dialog = $('#artist-dialog');
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}
function setupMobileMenu() {
  const toggle = $('.menu-toggle'); const menu = $('#mobile-menu');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Ouvrir le menu'); menu.hidden = true; };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); menu.hidden = !open;
  });
  $$('a', menu).forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}
function setupBookingForm() {
  const form = $('#booking-form'); const select = $('#artist-select');
  artists.forEach(artist => { const option = document.createElement('option'); option.value = artist.name; option.textContent = artist.name; select.append(option); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const lines = [
      'Bonjour NLA Booking,', '', 'Je souhaite vous soumettre une demande de booking.', '',
      `Nom : ${values.name}`, `Organisation : ${values.organization || 'Non précisée'}`,
      `E-mail : ${values.email}`, `Téléphone : ${values.phone || 'Non précisé'}`,
      `Artiste / prestation : ${values.artist || 'À définir'}`, `Date : ${values.date || 'À définir'}`,
      `Ville / lieu : ${values.venue}`, `Budget : ${values.budget || 'À discuter'}`,
      '', 'Présentation du projet :', values.message, '', 'Merci et à bientôt.'
    ];
    const subject = `Demande de booking NLA — ${values.artist || values.venue}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    $('#form-status').textContent = 'Votre application de messagerie va s’ouvrir. Pensez à envoyer l’e-mail pour finaliser votre demande.';
    window.location.href = mailto;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyBrandLogo(); renderArtists(); setupFilters(); setupDialog(); setupMobileMenu(); setupBookingForm();
  document.querySelectorAll('.contact-mail, .footer-contact a').forEach(link => { link.href = `mailto:${CONTACT_EMAIL}`; });
  if (window.NLA_SITE?.hero_image) { const hero = document.querySelector('.hero-visual'); if(hero) { hero.style.backgroundImage = `linear-gradient(120deg,rgba(10,10,18,.45),rgba(10,10,18,.12)), url('${encodeURI(window.NLA_SITE.hero_image).replaceAll("'", '%27')}')`; hero.style.backgroundPosition='center';hero.style.backgroundSize='cover'; } }
  $('#copyright-year').textContent = new Date().getFullYear();
});
