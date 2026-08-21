"use strict";

const CACHE_ADMIN =
    "anotador-truco-admin-v2";

const ARCHIVOS_ADMIN = [
    "./",
    "./admin.html",
    "./admin.css",
    "./admin.js"
];


// =====================================================
// INSTALAR
// =====================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_ADMIN)
                .then(cache =>
                    cache.addAll(
                        ARCHIVOS_ADMIN
                    )
                )

        );

        self.skipWaiting();

    }
);


// =====================================================
// ACTIVAR
// =====================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(nombres =>

                    Promise.all(

                        nombres
                            .filter(
                                nombre =>
                                    nombre !== CACHE_ADMIN &&
                                    nombre.startsWith(
                                        "anotador-truco-admin-"
                                    )
                            )
                            .map(
                                nombre =>
                                    caches.delete(nombre)
                            )

                    )

                )

        );

        self.clients.claim();

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

        const url =
            new URL(
                request.url
            );


        // =============================================
        // FIREBASE CDN
        // =============================================

        if (
            url.hostname ===
            "www.gstatic.com" &&
            url.pathname.includes(
                "/firebasejs/"
            )
        ) {

            event.respondWith(

                fetch(request)
                    .then(response => {

                        const copia =
                            response.clone();

                        caches
                            .open(CACHE_ADMIN)
                            .then(cache =>
                                cache.put(
                                    request,
                                    copia
                                )
                            );

                        return response;

                    })
                    .catch(() =>
                        caches.match(
                            request
                        )
                    )

            );

            return;

        }


        // =============================================
        // ARCHIVOS DEL ADMIN
        // =============================================

        if (
            url.origin ===
            self.location.origin
        ) {

            event.respondWith(

                caches
                    .match(request)
                    .then(cacheado => {

                        if (cacheado) {
                            return cacheado;
                        }

                        return fetch(request)
                            .then(response => {

                                const copia =
                                    response.clone();

                                caches
                                    .open(CACHE_ADMIN)
                                    .then(cache =>
                                        cache.put(
                                            request,
                                            copia
                                        )
                                    );

                                return response;

                            });

                    })

            );

        }

    }
);