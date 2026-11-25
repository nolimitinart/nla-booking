# NLA Booking — édition Pages CMS

Site vitrine de No Limit in Art ASBL, conservant le design original et les 6 photos fournies. Gestion des textes, photos, vidéos, services et réglages SEO via **Pages CMS**.

## Les fichiers modifiables dans Pages CMS

- **Textes et réglages du site** : `content/site.json` — titres, accroches, sections, services, logo, image d'accueil, contact, titre et description Google, domaine.
- **Artistes — textes, photos et vidéos** : `content/artists.json` — ajouter, retirer, masquer, classer les artistes, modifier les photos, textes et liens vidéo.
- **Médias** : dossier `assets/` (photos), `assets/videos/` (vidéos légères).

Les fichiers `artists.js`, `site-config.js`, `sitemap.xml` et `robots.txt` sont générés automatiquement. **Ne pas les modifier à la main.** Le site conserve une présentation prudente : les artistes ne sont pas présentés comme représentés sous mandat exclusif.

## Première mise en ligne avec GitHub + Pages CMS + Netlify

### 1. Mettre les fichiers sur GitHub
1. Créer un dépôt GitHub, par exemple `nla-booking`.
2. Importer **le contenu** de ce dossier à la racine du dépôt (en particulier `.pages.yml`, `index.html`, `netlify.toml`, `build.mjs`, `content/`, `assets/`).
3. Bien vérifier que GitHub montre `.pages.yml` à la **racine**, pas dans un sous-dossier.

### 2. Connecter Pages CMS
1. Ouvrir https://app.pagescms.org.
2. Se connecter avec GitHub.
3. Autoriser l'application Pages CMS sur le dépôt `nla-booking`.
4. Ouvrir le dépôt : les deux menus « Textes et réglages du site » et « Artistes — textes, photos et vidéos » doivent apparaître.
5. Modifier un champ, puis sauvegarder. Pages CMS enregistre un commit dans GitHub.

### 3. Connecter le site Netlify déjà créé
Le site existant est actuellement `https://chimerical-sunflower-f36dae.netlify.app/`. Pour **garder cette adresse** :
1. Ouvrir l'équipe et le site concerné dans https://app.netlify.com/.
2. Ouvrir **Site configuration > Build & deploy > Continuous deployment** (le nom exact des menus peut évoluer).
3. Lier le dépôt GitHub (`Link repository`/`Connect to Git provider`) si cette option existe pour le site.
4. Indiquer : **Build command : `node build.mjs`**, **Publish directory : `.`**. Le fichier `netlify.toml` contient déjà ces réglages.
5. Déclencher un premier déploiement et tester. Toute modification enregistrée via Pages CMS entraîne ensuite un nouveau déploiement automatique.

Si Netlify ne permet pas de rattacher le dépôt au site initial, importer le dépôt comme **nouveau site** puis transférer l'adresse/domaine voulu lorsque cela sera possible. Un simple dépôt manuel ZIP sur Netlify ne suffit **pas** à publier automatiquement les modifications faites dans Pages CMS.

### 4. SEO
Dans Pages CMS, modifier « Titre Google », « Description Google » et « Adresse publique du site » après publication. Le build met à jour `sitemap.xml`, `robots.txt`, la balise canonical et les métadonnées. Déclarer ensuite le sitemap dans Google Search Console.

### 5. Vidéos
Pour chaque artiste, ajouter de préférence une **URL publique YouTube ou Vimeo** ; la vidéo sera intégrée dans la fiche artiste. Les vidéos courtes MP4/WebM peuvent aussi être téléversées dans le dépôt GitHub, mais éviter les fichiers volumineux : GitHub impose des limites de taille et les gros médias ralentissent les déploiements.

## Pour prévisualiser en local

Node.js 18+ :

```bash
node build.mjs
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`.

Il est également possible d'ouvrir directement `index.html` **après** `node build.mjs` ; les éléments générés sont chargés depuis des fichiers JavaScript locaux.

## Important
- Le CMS nécessite un dépôt GitHub et l'autorisation de son application : il **n'est pas administrable directement sur Netlify Drop**.
- Le formulaire de booking continue d'ouvrir la messagerie du visiteur (`mailto:`) : **aucune soumission automatique** n'est faite côté serveur.
- Les champs SEO n'assurent pas à eux seuls le classement Google ; ajouter ensuite de vraies pages dédiées aux artistes pourra améliorer l'indexabilité.
- Pour le logo officiel, importer le fichier original sans changer sa forme.
