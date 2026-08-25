"use strict";


// =====================================================
// CACHE
// =====================================================

const CACHE_ADMIN =
    "anotador-truco-admin-v5";


const ARCHIVOS_ADMIN = [

    "./",

    "./admin.html",

    "./admin.css",

    "./admin.js",

    "./manifest.json",

    "./icons/admin-icon-192.png",

    "./icons/admin-icon-512.png"

];


// =====================================================
// INSTALAR
// =====================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            (
                async () => {

                    const cache =
                        await caches.open(
                            CACHE_ADMIN
                        );


                    await cache.addAll(
                        ARCHIVOS_ADMIN
                    );


                    /*
                     * Activamos inmediatamente
                     * la nueva versión.
                     */

                    await self.skipWaiting();

                }
            )()

        );

    }
);


// =====================================================
// ACTIVAR
// =====================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            (
                async () => {

                    const nombres =
                        await caches.keys();


                    await Promise.all(

                        nombres

                            .filter(
                                nombre =>

                                    nombre !==
                                    CACHE_ADMIN &&

                                    nombre.startsWith(
                                        "anotador-truco-admin-"
                                    )
                            )

                            .map(
                                nombre =>
                                    caches.delete(
                                        nombre
                                    )
                            )

                    );


                    /*
                     * La versión nueva toma
                     * el control inmediatamente.
                     */

                    await self.clients.claim();

                }
            )()

        );

    }
);


// =====================================================
// PETICIONES
// =====================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * Solo trabajamos con GET.
         */

        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        // =================================================
        // FIREBASE CDN
        // =================================================

        if (

            url.hostname ===
            "www.gstatic.com" &&

            url.pathname.includes(
                "/firebasejs/"
            )

        ) {

            event.respondWith(

                (
                    async () => {

                        try {

                            /*
                             * Primero Internet.
                             */

                            const response =
                                await fetch(
                                    request
                                );


                            /*
                             * Solo guardamos
                             * respuestas válidas.
                             */

                            if (
                                response &&
                                response.ok
                            ) {

                                const cache =
                                    await caches.open(
                                        CACHE_ADMIN
                                    );


                                await cache.put(
                                    request,
                                    response.clone()
                                );

                            }


                            return response;


                        } catch (error) {

                            /*
                             * Si no hay conexión,
                             * usamos Firebase cacheado.
                             */

                            const cacheado =
                                await caches.match(
                                    request
                                );


                            if (
                                cacheado
                            ) {

                                return cacheado;

                            }


                            throw error;

                        }

                    }
                )()

            );


            return;

        }


        // =================================================
        // ARCHIVOS DEL ADMIN
        // =================================================

        if (
            url.origin ===
            self.location.origin
        ) {


            // =============================================
            // NAVEGACIÓN
            // =============================================

            if (
                request.mode ===
                "navigate"
            ) {

                event.respondWith(

                    (
                        async () => {

                            try {

                                /*
                                 * Para HTML intentamos
                                 * primero obtener la
                                 * versión más nueva.
                                 */

                                const response =
                                    await fetch(
                                        request
                                    );


                                if (
                                    response &&
                                    response.ok
                                ) {

                                    const cache =
                                        await caches.open(
                                            CACHE_ADMIN
                                        );


                                    await cache.put(
                                        request,
                                        response.clone()
                                    );

                                }


                                return response;


                            } catch (error) {

                                /*
                                 * Sin Internet:
                                 * buscamos primero la
                                 * página solicitada.
                                 */

                                const cacheado =
                                    await caches.match(
                                        request
                                    );


                                if (
                                    cacheado
                                ) {

                                    return cacheado;

                                }


                                /*
                                 * Último recurso:
                                 * admin.html.
                                 */

                                const adminOffline =
                                    await caches.match(
                                        "./admin.html"
                                    );


                                if (
                                    adminOffline
                                ) {

                                    return adminOffline;

                                }


                                return Response.error();

                            }

                        }
                    )()

                );


                return;

            }


            // =============================================
            // CSS / JS / MANIFEST / ICONOS
            // =============================================

            event.respondWith(

                (
                    async () => {

                        /*
                         * Primero buscamos
                         * en el caché.
                         */

                        const cacheado =
                            await caches.match(
                                request
                            );


                        if (
                            cacheado
                        ) {

                            return cacheado;

                        }


                        try {

                            const response =
                                await fetch(
                                    request
                                );


                            /*
                             * Nunca cacheamos
                             * errores 404, 500, etc.
                             */

                            if (
                                response &&
                                response.ok
                            ) {

                                const cache =
                                    await caches.open(
                                        CACHE_ADMIN
                                    );


                                await cache.put(
                                    request,
                                    response.clone()
                                );

                            }


                            return response;


                        } catch (error) {

                            return Response.error();

                        }

                    }
                )()

            );

        }

    }
);