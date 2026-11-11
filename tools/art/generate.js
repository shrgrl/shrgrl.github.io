#!/usr/bin/env node
// Regenerates every original artwork under assets/images/art/.
//
//   node tools/art/generate.js
//
// All output is drawn from code in this folder. No third-party image, icon set,
// stock photo or font file is read, embedded or downloaded, so everything the
// site renders from assets/images/art/ is original work and carries no licence
// obligation.

const fs = require('fs');
const path = require('path');

const covers = require('./covers');
const blogs = require('./blogs');
const heroes = require('./heroes');

const OUT = path.join(__dirname, '..', '..', 'assets', 'images', 'art');

const FILES = {
  // Project and technoblog covers (also used as that post's hero background)
  'cover-graphics.svg': covers.graphics,
  'cover-web.svg': covers.web,
  'cover-parallel.svg': covers.parallel,
  'cover-iot.svg': covers.iot,
  'cover-restapi.svg': covers.restapi,
  'cover-abap.svg': covers.abap,
  'cover-sap.svg': covers.sapModules,
  'cover-fiori.svg': covers.fiori,
  'cover-odata.svg': covers.odata,
  'cover-rfc.svg': covers.rfc,
  'cover-ghpages.svg': covers.ghpages,
  'cover-nodered.svg': covers.nodered,
  'cover-selenium.svg': covers.selenium,

  // Blog hub covers
  'cover-technoblog.svg': blogs.technoblog,
  'cover-hobbylog.svg': blogs.hobbylog,
  'cover-polyblog.svg': blogs.polyblog,

  // Hobby and language covers
  'cover-streaming.svg': blogs.streaming,
  'cover-telegram.svg': blogs.telegramCover,
  'cover-diy.svg': blogs.diy,
  'cover-interview.svg': blogs.interview,
  'cover-english.svg': blogs.english,
  'cover-toefl.svg': blogs.toefl,

  // In-article figures
  'fig-sapui5.svg': blogs.figSapui5,
  'fig-leadership.svg': blogs.figLeadership,
  'fig-interview-star.svg': blogs.figInterviewChat,
  'fig-world-languages.svg': blogs.figWorldLanguages,
  'fig-toefl-sections.svg': blogs.figToeflSections,
  'fig-series-survival.svg': () => blogs.figSeriesCard('Squid Game', 'KOREAN · SURVIVAL DRAMA', '#e0556b', '#f2a65a', 401),
  'fig-series-borderland.svg': () => blogs.figSeriesCard('Alice in Borderland', 'JAPANESE · SURVIVAL THRILLER', '#4fa8c9', '#9b8cf2', 409),

  // Page heroes
  'hero-home.svg': heroes.home,
  'hero-blog.svg': heroes.blogHero,
  'hero-about.svg': heroes.about,
  'hero-projects.svg': heroes.projects,
  'hero-contact.svg': heroes.contact,
  'hero-privacy.svg': heroes.privacy,
  'hero-technology.svg': heroes.technologyHero,
  'hero-hobby.svg': heroes.hobbyHero,
  'hero-polyglot.svg': heroes.polyglotHero,
  'hero-default.svg': heroes.defaultHero,
};

fs.mkdirSync(OUT, { recursive: true });

let total = 0;
for (const [name, fn] of Object.entries(FILES)) {
  const svg = fn();
  fs.writeFileSync(path.join(OUT, name), svg, 'utf8');
  total += Buffer.byteLength(svg);
  console.log(`  ${name.padEnd(32)} ${(Buffer.byteLength(svg) / 1024).toFixed(1).padStart(6)} KB`);
}
console.log(`\n${Object.keys(FILES).length} files, ${(total / 1024).toFixed(0)} KB total -> assets/images/art/`);
