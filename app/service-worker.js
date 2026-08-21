"use strict";

const CACHE_NAME = "anotador-truco-app-v1";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./Style.css",
    "./script.js",
    "./manifest.json",
    "./service-worker.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* =====================================================
   INSTALACIÓN
===================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARCHIVOS);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =====================================================
   ACTIVACIÓN
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(nombres => {

                return Promise.all(

                    nombres
                        .filter(nombre => {
                            return nombre !== CACHE_NAME;
                        })
                        .map(nombre => {
                            return caches.delete(nombre);
                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =====================================================
   FUNCIONAMIENTO OFFLINE
===================================================== */

self.addEventListener("fetch", event => {

    /*
     * Solo manejamos solicitudes GET.
     */
    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(event.request)
            .then(respuestaCache => {

                /*
                 * Si existe en caché,
                 * usamos la versión guardada.
                 */
                if (respuestaCache) {
                    return respuestaCache;
                }


                /*
                 * Si no está en caché,
                 * intentamos obtenerla de Internet.
                 */
                return fetch(event.request)
                    .then(respuestaRed => {

                        /*
                         * Solo devolvemos la respuesta.
                         * No guardamos automáticamente
                         * recursos externos.
                         */
                        return respuestaRed;

                    })
                    .catch(() => {

                        /*
                         * Si no hay Internet,
                         * volvemos al index.
                         */
                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});