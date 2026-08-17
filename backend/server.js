const express = require("express");
const cors = require("cors");
const {
    BetaAnalyticsDataClient
} = require("@google-analytics/data");

const app = express();

// =====================================================
// CONFIGURACIÓN
// =====================================================

const PORT = process.env.PORT || 3000;
const PROPERTY_ID = "549943222";

app.use(cors());
app.use(express.json());


// =====================================================
// GOOGLE ANALYTICS
// =====================================================

// En tu PC:
// GOOGLE_APPLICATION_CREDENTIALS apunta a tu archivo JSON.
//
// En el hosting:
// vamos a configurar esta variable desde el panel del hosting.

const analyticsDataClient =
    new BetaAnalyticsDataClient({
        keyFilename:
            process.env.GOOGLE_APPLICATION_CREDENTIALS ||
            (process.env.RENDER
                ? "/etc/secrets/google-credentials.json"
                : "./NO_PUBLICAR/google-credentials.json")
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
                    startDate: `${dias}daysAgo`,
                    endDate: "today"
                }
            ],

            dimensions:
                dimensions.map(nombre => ({
                    name: nombre
                })),

            metrics:
                metrics.map(nombre => ({
                    name: nombre
                }))
        });

    return response;
}


// =====================================================
// PRUEBA DEL SERVIDOR
// =====================================================

app.get("/", (req, res) => {

    res.json({
        estado: "online",
        mensaje:
            "🚀 Backend del Anotador de Truco funcionando"
    });

});


// =====================================================
// USUARIOS
// =====================================================

app.get("/api/usuarios", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
            usuarios: Number(usuarios)
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

});


// =====================================================
// VISITAS
// =====================================================

app.get("/api/visitas", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
            visitas: Number(visitas)
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

});


// =====================================================
// INSTALACIONES
// =====================================================

app.get("/api/instalaciones", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
                        ?.value === "pwa_installed"
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

});


// =====================================================
// GRÁFICO DE VISITAS POR DÍA
// =====================================================

app.get("/api/grafico", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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

        response.rows?.forEach(row => {

            const fecha =
                row.dimensionValues?.[0]?.value;

            const visitas =
                Number(
                    row.metricValues?.[0]?.value || 0
                );

            if (fecha) {

                datosAnalytics[fecha] =
                    visitas;

            }

        });

        const grafico = [];

        const hoy =
            new Date();

        for (
            let i = dias - 1;
            i >= 0;
            i--
        ) {

            const fecha =
                new Date(hoy);

            fecha.setDate(
                hoy.getDate() - i
            );

            const año =
                fecha.getFullYear();

            const mes =
                String(
                    fecha.getMonth() + 1
                ).padStart(2, "0");

            const dia =
                String(
                    fecha.getDate()
                ).padStart(2, "0");

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

});


// =====================================================
// USUARIOS POR PAÍS
// =====================================================

app.get("/api/paises", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
            response.rows?.map(row => {

                const pais =
                    row.dimensionValues?.[0]
                        ?.value || "(not set)";

                const usuarios =
                    Number(
                        row.metricValues?.[0]
                            ?.value || 0
                    );

                return {
                    pais,
                    usuarios
                };

            }) || [];

        paises.sort(
            (a, b) =>
                b.usuarios - a.usuarios
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

});


// =====================================================
// DISPOSITIVOS
// =====================================================

app.get("/api/dispositivos", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
            response.rows?.map(row => ({

                dispositivo:
                    row.dimensionValues?.[0]?.value ||
                    "(not set)",

                usuarios:
                    Number(
                        row.metricValues?.[0]?.value || 0
                    )

            })) || [];

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

});

    // =====================================================
// FUENTES DE TRÁFICO
// =====================================================

app.get("/api/fuentes", async (req, res) => {

    try {

        const dias =
            Number(req.query.dias) || 7;

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
            response.rows?.map(row => {

                const fuente =
                    row.dimensionValues?.[0]?.value ||
                    "(not set)";

                const medio =
                    row.dimensionValues?.[1]?.value ||
                    "(not set)";

                const usuarios =
                    Number(
                        row.metricValues?.[0]?.value || 0
                    );

                return {
                    fuente,
                    medio,
                    usuarios
                };

            }) || [];

        fuentes.sort(
            (a, b) =>
                b.usuarios - a.usuarios
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

});

// =====================================================
// USUARIOS ACTIVOS AHORA
// =====================================================

app.get("/api/activos", async (req, res) => {

    try {

        const [response] =
            await analyticsDataClient.runRealtimeReport({

                property:
                    `properties/${PROPERTY_ID}`,

                metrics: [
                    {
                        name: "activeUsers"
                    }
                ]

            });

        const activos =
            response.rows?.[0]
                ?.metricValues?.[0]
                ?.value || "0";

        res.json({
            activos: Number(activos)
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

});


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