"use strict";


const CACHE_NAME =
    "anotador-truco-app-v12";

const CACHE_PREFIX =
    "anotador-truco-app-";


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
        nombre.startsWith(
            CACHE_PREFIX
        ) &&
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
   FUNCIONAMIENTO OFFLINE · NETWORK FIRST
===================================================== */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                event.request.url
            );


        /*
         * Solo controlamos archivos
         * de nuestra propia APP.
         */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
                .then(
                    respuesta => {

                        /*
                         * Si la respuesta es válida,
                         * guardamos la versión nueva.
                         */

                        if (
                            respuesta &&
                            respuesta.ok
                        ) {

                            const copia =
                                respuesta.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    cache => {

                                        cache.put(
                                            event.request,
                                            copia
                                        );

                                    }
                                );

                        }


                        return respuesta;

                    }
                )
                .catch(
                    async () => {

                        /*
                         * Sin conexión:
                         * buscamos la última versión
                         * disponible en caché.
                         */

                        const guardado =
                            await caches.match(
                                event.request
                            );


                        if (
                            guardado
                        ) {

                            return guardado;

                        }


                        /*
                         * Si era una navegación,
                         * mostramos la APP guardada.
                         */

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {

                            const indexGuardado =
                                await caches.match(
                                    "./index.html"
                                );


                            if (
                                indexGuardado
                            ) {

                                return indexGuardado;

                            }

                        }


                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText:
                                    "Offline"
                            }
                        );

                    }
                )

        );

    }
);