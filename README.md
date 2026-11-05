# Project 35 – The Better Me Challenge
Offline-first PWA. No build step. Serve the folder over HTTPS (or localhost) and open on Android Chrome → menu → Install app.
Local: `cd project35 && python3 -m http.server 8035` → http://localhost:8035
Files: js/engine.js (rule-based coach), js/data.js (exercise library + weekly template), js/player.js (workout screen), js/app.js (UI), sw.js (offline).
Data lives in the browser (localStorage + IndexedDB for photos). Settings → Export backup.
