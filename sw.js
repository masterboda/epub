//@ts-nocheck
console.log("sw: service worker loaded");

const cachePrefix = "ePubViewer";
const revision = 39;              // Update on every change

const appItems = ["./", "index.html", "reader.html", "https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700,800,900&display=swap", "css/estilos_base.css", "css/estilos.css", "libs/css/normalize.min.css", "dist/vconsole.min.js", "css/style.css", "images/icons/home.png", "images/on/thumb1.png", "images/on/thumb2.png", "images/on/thumb3.png", "images/on/thumb4.png", "images/on/thumb5.png", "libs/css/font-awesome-5.10.2/css/all.min.css", "images/icons/arrow-left.png", "libs/css/animate.css", "https://fonts.googleapis.com/css?family=Arbutus+Slab", "polyfills/babel-polyfill.min.js", "polyfills/fetch.js", "polyfills/pep.min.js", "images/icons/arrow-right.png", "images/icons/logo.png", "js/script.js", "libs/js/sanitize-html.min.js", "images/icons/nav.png", "images/icons/text-tool.png", "images/icons/search.png", "images/icons/bookmark.png", "libs/js/jszip.min.js", "libs/js/epub.js"];
// Set the cache as the active cache.
self.addEventListener('activate', event =>
	self.clients.claim());

// Immediately activate the new cache.
self.addEventListener('install', event => {
    console.log('sw: onInstall');
    event.waitUntil(
        caches.open(`${cachePrefix}-${revision}`)
            .then(cache => {
                    cache.addAll(appItems);
                    self.skipWaiting();
                }
            )
    )
});

// Handle request.
self.addEventListener('fetch', event => {
    if (
        event.request.url.startsWith(self.location.origin) || 
        event.request.url.match(/fonts.(googleapis|gstatic).com/) || 
        event.request.url.match(/dict.geek1011.net/)
/* Cache first: */
    ) event.respondWith(
        caches.open(`${cachePrefix}-${revision}`).then(
            cache => cache.match(event.request).then(resp => resp 
                ? resp 
                : fetch(event.request).then(
                    resp => cache.put(event.request, resp.clone()).then(() => resp)))));
});
/**/
/* Network first (currently broken):
    ) event.respondWith(
        fetch(event.request).catch(
            err => caches.open(`${cachePrefix}-${revision}`).then(
                cache => cache.match(event.request))))});
/**/

// Delete old caches.
self.addEventListener('activate', event =>
    event.waitUntil(
        caches.keys().then(
            ns => Promise.all(ns.filter(
                n => n.startsWith(cachePrefix) && !n.endsWith(revision)).map(
                n => caches.delete(n))))));


self.addEventListener('beforeinstallprompt', (e) => {
  // Stash the event so it can be triggered later.
  deferredPrompt = e;

});
