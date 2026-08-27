const express = require("express");
const cors = require("cors");
const path = require("path");

const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getAuth
} = require("firebase-admin/auth");

const {
    getFirestore,
    FieldValue
} = require("firebase-admin/firestore");

const {
    BetaAnalyticsDataClient
} = require("@google-analytics/data");

const app = express();


// =====================================================
// FIREBASE ADMIN
// =====================================================

const serviceAccount = require(
    process.env.RENDER
        ? "/etc/secrets/firebase-admin.json"
        : "./NO_PUBLICAR/anotador-de-truco-83ae4-firebase-adminsdk-fbsvc-73b944571e.json"
);

initializeApp({
    credential: cert(serviceAccount)
});

const db =
    getFirestore();


// =====================================================
// ADMINISTRADORES AUTORIZADOS
// =====================================================

const ADMIN_EMAILS = [
    "f341274@gmail.com",
    "dylansun271203@gmail.com",
    "johansabe1@gmail.com"
];


// =====================================================
// CONFIGURACIÓN
// =====================================================

const PORT =
    process.env.PORT || 3000;

const PROPERTY_ID =
    "549943222";

const OPINION_COOLDOWN_MS =
    60 * 1000;


const ultimaOpinionPorIp =
    new Map();

app.set(
    "trust proxy",
    1
);

app.use(cors());

app.use(
    express.json()
);


// =====================================================
// VERIFICAR ADMINISTRADOR
// =====================================================

async function verificarAdministrador(
    req,
    res,
    next
) {

    try {

        const authorization =
            req.headers.authorization;


        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                error: "No autenticado"
            });

        }


        const token =
            authorization.split("Bearer ")[1];


        const usuario =
            await getAuth().verifyIdToken(token);


        if (
            !usuario.email ||
            !ADMIN_EMAILS.includes(
                usuario.email
            )
        ) {

            return res.status(403).json({
                error: "No autorizado"
            });

        }


        req.usuario =
            usuario;


        next();


    } catch (error) {

        console.error(
            "❌ Error verificando autenticación:",
            error
        );


        return res.status(401).json({
            error:
                "Token inválido o expirado"
        });

    }

}


// =====================================================
// GOOGLE ANALYTICS
// =====================================================

const analyticsDataClient =
    new BetaAnalyticsDataClient({

        keyFilename:
            process.env.GOOGLE_APPLICATION_CREDENTIALS ||
            (
                process.env.RENDER
                    ? "/etc/secrets/google-credentials.json"
                    : "./NO_PUBLICAR/google-credentials.json"
            )

    });


// =====================================================
// FUNCIÓN GENERAL PARA ANALYTICS
// =====================================================

async function obtenerReporte({

    dias = 7,

    dimensions = [],

    metrics = []

}) {

    const [response] =
        await analyticsDataClient.runReport({

            property:
                `properties/${PROPERTY_ID}`,

            dateRanges: [

                {
                    startDate:
                        `${dias}daysAgo`,

                    endDate:
                        "today"
                }

            ],

            dimensions:
                dimensions.map(
                    nombre => ({
                        name: nombre
                    })
                ),

            metrics:
                metrics.map(
                    nombre => ({
                        name: nombre
                    })
                )

        });


    return response;

}


// =====================================================
// PRUEBA DEL SERVIDOR
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            estado:
                "online",

            mensaje:
                "🚀 Backend del Anotador de Truco funcionando"

        });

    }
);


// =====================================================
// ACCESO AL ADMIN
// =====================================================

const RUTA_ADMIN =
    path.join(
        __dirname,
        "..",
        "admin"
    );


app.get(
    "/admin",
    (req, res) => {

        res.redirect(
            "/admin/admin.html"
        );

    }
);


app.use(
    "/admin",
    express.static(
        RUTA_ADMIN
    )
);


// =====================================================
// USUARIOS
// =====================================================

app.get(
    "/api/usuarios",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    metrics: [
                        "activeUsers"
                    ]

                });


            const usuarios =
                response.rows?.[0]
                    ?.metricValues?.[0]
                    ?.value || "0";


            res.json({

                usuarios:
                    Number(usuarios)

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo usuarios:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener los usuarios"

            });

        }

    }
);


// =====================================================
// VISITAS
// =====================================================

app.get(
    "/api/visitas",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    metrics: [
                        "eventCount"
                    ]

                });


            const visitas =
                response.rows?.[0]
                    ?.metricValues?.[0]
                    ?.value || "0";


            res.json({

                visitas:
                    Number(visitas)

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo visitas:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener las visitas"

            });

        }

    }
);


// =====================================================
// INSTALACIONES
// =====================================================

app.get(
    "/api/instalaciones",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    dimensions: [
                        "eventName"
                    ],

                    metrics: [
                        "eventCount"
                    ]

                });


            const fila =
                response.rows?.find(
                    row =>
                        row.dimensionValues?.[0]
                            ?.value ===
                        "pwa_installed"
                );


            const instalaciones =
                fila
                    ?.metricValues?.[0]
                    ?.value || "0";


            res.json({

                instalaciones:
                    Number(instalaciones)

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo instalaciones:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener las instalaciones"

            });

        }

    }
);


// =====================================================
// GRÁFICO DE VISITAS POR DÍA
// =====================================================

app.get(
    "/api/grafico",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    dimensions: [
                        "date"
                    ],

                    metrics: [
                        "eventCount"
                    ]

                });


            const datosAnalytics = {};


            response.rows?.forEach(
                row => {

                    const fecha =
                        row.dimensionValues?.[0]
                            ?.value;


                    const visitas =
                        Number(
                            row.metricValues?.[0]
                                ?.value || 0
                        );


                    if (fecha) {

                        datosAnalytics[
                            fecha
                        ] =
                            visitas;

                    }

                }
            );


            const grafico = [];


            // =================================================
            // FECHA ARGENTINA
            // =================================================

            const partesFecha =
                new Intl.DateTimeFormat(
                    "en-CA",
                    {

                        timeZone:
                            "America/Argentina/Buenos_Aires",

                        year:
                            "numeric",

                        month:
                            "2-digit",

                        day:
                            "2-digit"

                    }
                ).formatToParts(
                    new Date()
                );


            const añoActual =
                Number(
                    partesFecha.find(
                        parte =>
                            parte.type ===
                            "year"
                    ).value
                );


            const mesActual =
                Number(
                    partesFecha.find(
                        parte =>
                            parte.type ===
                            "month"
                    ).value
                );


            const diaActual =
                Number(
                    partesFecha.find(
                        parte =>
                            parte.type ===
                            "day"
                    ).value
                );


            const hoyArgentina =
                new Date(
                    añoActual,
                    mesActual - 1,
                    diaActual
                );


            // =================================================
            // CREAR LOS DÍAS
            // =================================================

            for (
                let i = dias - 1;
                i >= 0;
                i--
            ) {

                const fecha =
                    new Date(
                        hoyArgentina
                    );


                fecha.setDate(
                    hoyArgentina.getDate() - i
                );


                const año =
                    fecha.getFullYear();


                const mes =
                    String(
                        fecha.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const dia =
                    String(
                        fecha.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                const fechaFormato =
                    `${año}${mes}${dia}`;


                grafico.push({

                    dia:
                        fechaFormato,

                    visitas:
                        datosAnalytics[
                            fechaFormato
                        ] || 0

                });

            }


            res.json({

                grafico

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo gráfico:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudo obtener el gráfico"

            });

        }

    }
);


// =====================================================
// USUARIOS POR PAÍS
// =====================================================

app.get(
    "/api/paises",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    dimensions: [
                        "country"
                    ],

                    metrics: [
                        "activeUsers"
                    ]

                });


            const paises =
                response.rows?.map(
                    row => {

                        const pais =
                            row.dimensionValues?.[0]
                                ?.value ||
                            "(not set)";


                        const usuarios =
                            Number(
                                row.metricValues?.[0]
                                    ?.value || 0
                            );


                        return {

                            pais,

                            usuarios

                        };

                    }
                ) || [];


            paises.sort(
                (a, b) =>
                    b.usuarios -
                    a.usuarios
            );


            res.json({

                paises

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo países:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener los países"

            });

        }

    }
);


// =====================================================
// DISPOSITIVOS
// =====================================================

app.get(
    "/api/dispositivos",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    dimensions: [
                        "deviceCategory"
                    ],

                    metrics: [
                        "activeUsers"
                    ]

                });


            const dispositivos =
                response.rows?.map(
                    row => ({

                        dispositivo:
                            row.dimensionValues?.[0]
                                ?.value ||
                            "(not set)",

                        usuarios:
                            Number(
                                row.metricValues?.[0]
                                    ?.value || 0
                            )

                    })
                ) || [];


            res.json({

                dispositivos

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo dispositivos:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener los dispositivos"

            });

        }

    }
);


// =====================================================
// FUENTES DE TRÁFICO
// =====================================================

app.get(
    "/api/fuentes",
    verificarAdministrador,
    async (req, res) => {

        try {

            const dias =
                Number(
                    req.query.dias
                ) || 7;


            const response =
                await obtenerReporte({

                    dias,

                    dimensions: [

                        "sessionSource",

                        "sessionMedium"

                    ],

                    metrics: [

                        "activeUsers"

                    ]

                });


            const fuentes =
                response.rows?.map(
                    row => {

                        const fuente =
                            row.dimensionValues?.[0]
                                ?.value ||
                            "(not set)";


                        const medio =
                            row.dimensionValues?.[1]
                                ?.value ||
                            "(not set)";


                        const usuarios =
                            Number(
                                row.metricValues?.[0]
                                    ?.value || 0
                            );


                        return {

                            fuente,

                            medio,

                            usuarios

                        };

                    }
                ) || [];


            fuentes.sort(
                (a, b) =>
                    b.usuarios -
                    a.usuarios
            );


            res.json({

                fuentes

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo fuentes de tráfico:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener las fuentes de tráfico"

            });

        }

    }
);


// =====================================================
// USUARIOS ACTIVOS AHORA
// =====================================================

app.get(
    "/api/activos",
    verificarAdministrador,
    async (req, res) => {

        try {

            const [response] =
                await analyticsDataClient
                    .runRealtimeReport({

                        property:
                            `properties/${PROPERTY_ID}`,

                        metrics: [

                            {
                                name:
                                    "activeUsers"
                            }

                        ]

                    });


            const activos =
                response.rows?.[0]
                    ?.metricValues?.[0]
                    ?.value || "0";


            res.json({

                activos:
                    Number(activos)

            });


        } catch (error) {

            console.error(
                "❌ Error obteniendo usuarios activos:",
                error
            );


            res.status(500).json({

                error:
                    "No se pudieron obtener los usuarios activos"

            });

        }

    }
);

// =====================================================
// RECIBIR OPINIONES
// =====================================================

app.post(
    "/api/opiniones",
    async (req, res) => {

        try {

            const estrellas =
                Number(
                    req.body?.estrellas
                );


            const comentario =
                typeof req.body?.comentario ===
                    "string"
                    ? req.body.comentario.trim()
                    : "";

            const nombre =
                typeof req.body?.nombre ===
                    "string"
                    ? req.body.nombre.trim()
                    : "";

            // =============================================
            // VALIDAR ESTRELLAS
            // =============================================

            if (
                !Number.isInteger(
                    estrellas
                ) ||
                estrellas < 1 ||
                estrellas > 5
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "La valoración debe ser de 1 a 5 estrellas."
                    });

            }
            
            if (
                nombre.length >
                30
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "El nombre es demasiado largo."
                    });

            }


            // =============================================
            // VALIDAR COMENTARIO
            // =============================================

            if (
                comentario.length >
                600
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "El comentario es demasiado largo."
                    });

            }


            // =============================================
            // PROTECCIÓN BÁSICA CONTRA SPAM
            // =============================================

            const forwarded =
            req.headers[
                "x-forwarded-for"
            ];


            const ip =
                typeof forwarded ===
                    "string"
                    ? forwarded
                        .split(",")[0]
                        .trim()
                    : (
                        req.socket.remoteAddress ||
                        "desconocido"
                    );


            const ahora =
                Date.now();


            const ultimoEnvio =
                ultimaOpinionPorIp.get(
                    ip
                );


            if (
                ultimoEnvio &&
                ahora - ultimoEnvio <
                    OPINION_COOLDOWN_MS
            ) {

                return res
                    .status(429)
                    .json({
                        error:
                            "Esperá un momento antes de enviar otra opinión."
                    });

            }


            // =============================================
            // GUARDAR EN FIRESTORE
            // =============================================

            await db
                .collection(
                    "opiniones"
                )
                .add({

                    nombre,

                    estrellas,

                    comentario,

                    fecha:
                        FieldValue.serverTimestamp(),

                    leida:
                        false

                });


            // Solo guardamos temporalmente
            // cuándo envió esa IP.
            // La IP NO se guarda en Firebase.

            ultimaOpinionPorIp.set(
                ip,
                ahora
            );


            return res
                .status(201)
                .json({

                    ok:
                        true,

                    mensaje:
                        "Opinión recibida."

                });


        } catch (error) {

            console.error(
                "❌ Error guardando opinión:",
                error
            );


            return res
                .status(500)
                .json({

                    error:
                        "No se pudo guardar la opinión."

                });

        }

    }
);

// =====================================================
// COMPROBAR ACCESO ADMIN
// =====================================================

app.get(
    "/api/admin/check",
    verificarAdministrador,
    (req, res) => {

        res.json({

            autorizado: true,

            email:
                req.usuario.email

        });

    }
);

// =====================================================
// SERVIDOR
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Backend funcionando en http://0.0.0.0:${PORT}`
        );

    }
);