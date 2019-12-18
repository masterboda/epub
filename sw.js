console.log("sw: service worker loaded");

const cachePrefix = "ePubViewer";
const revision = 39;              // Update on every change

self.importScripts('js/sources.js');
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
