"use strict";


const CACHE_NAME =
    "anotador-truco-app-v7";


/* =====================================================
   ARCHIVOS PRINCIPALES
===================================================== */

const ARCHIVOS = [

    "./",

    "./index.html",

    "./Style.css",

    "./script.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png",

    "./icons/qr-app.png"

];


/* =====================================================
   INSTALACIÓN
===================================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        ARCHIVOS
                    );

                })
                .then(() => {

                    return self.skipWaiting();

                })

        );

    }
);


/* =====================================================
   ACTIVACIÓN
===================================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(nombres => {

                    return Promise.all(

                        nombres
                            .filter(nombre => {

                                return (
                                    nombre !==
                                    CACHE_NAME
                                );

                            })
                            .map(nombre => {

                                return caches.delete(
                                    nombre
                                );

                            })

                    );

                })
                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


/* =====================================================
   FUNCIONAMIENTO OFFLINE
===================================================== */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(
                event.request.url
            );


        /*
         * Recursos de nuestra propia APP.
         */

        if (
            url.origin ===
            self.location.origin
        ) {

            event.respondWith(

                caches
                    .match(event.request)
                    .then(cache => {

                        if (cache) {

                            return cache;

                        }


                        return fetch(
                            event.request
                        )
                            .then(respuesta => {

                                if (
                                    !respuesta ||
                                    !respuesta.ok
                                ) {

                                    return respuesta;

                                }


                                const copia =
                                    respuesta.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )
                                    .then(cacheActual => {

                                        cacheActual.put(
                                            event.request,
                                            copia
                                        );

                                    });


                                return respuesta;

                            })
                            .catch(() => {

                                /*
                                 * Solamente una navegación
                                 * recibe el index como respaldo.
                                 */

                                if (
                                    event.request.mode ===
                                    "navigate"
                                ) {

                                    return caches.match(
                                        "./index.html"
                                    );

                                }


                                return new Response(
                                    "",
                                    {
                                        status: 503,
                                        statusText:
                                            "Offline"
                                    }
                                );

                            });

                    })

            );

        }

    }
);