"use strict";


// =====================================================
// FIREBASE AUTHENTICATION
// =====================================================

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// =====================================================
// FIREBASE
// =====================================================

const auth = getAuth();


// =====================================================
// API
// =====================================================

const API_URL =
    "https://anotador-truco-backend.onrender.com";


// =====================================================
// ELEMENTOS
// =====================================================

const elementos = {

    visitas:
        document.getElementById("visitas"),

    usuarios:
        document.getElementById("usuarios"),

    instalaciones:
        document.getElementById("instalaciones"),

    activos:
        document.getElementById("activos"),

    instalacionesPwa:
        document.getElementById("instalacionesPwa"),

    grafico:
        document.getElementById("grafico"),

    periodo:
        document.getElementById("periodoGrafico"),

    listaPaises:
        document.getElementById("listaPaises"),

    listaDispositivos:
        document.getElementById("listaDispositivos"),

        fuentes:
        document.getElementById(
            "listaFuentes"
        ),

    opinionesSeccion:
        document.getElementById(
            "opinionesAdmin"
        ),

    promedioOpiniones:
        document.getElementById(
            "promedioOpiniones"
        ),

    totalOpiniones:
        document.getElementById(
            "totalOpiniones"
        ),

    sinLeerOpiniones:
        document.getElementById(
            "sinLeerOpiniones"
        ),

    toggleOpiniones:
        document.getElementById(
            "toggleOpiniones"
        ),

    contenidoOpiniones:
        document.getElementById(
            "contenidoOpiniones"
        ),

    flechaOpiniones:
        document.getElementById(
            "flechaOpiniones"
        ),

    listaOpiniones:
        document.getElementById(
            "listaOpiniones"
        ),

    mensajeOpiniones:
        document.getElementById(
            "mensajeOpinionesAdmin"
        ),

    cargarMasOpiniones:
        document.getElementById(
            "cargarMasOpiniones"
        )

};

// =====================================================
// ESTADO · OPINIONES
// =====================================================

let adminPrincipalActual =
    false;


let opinionesAdmin =
    [];


let opinionesMostradas =
    20;


const OPINIONES_POR_PAGINA =
    20;

// =====================================================
// PREPARAR FUENTES
// =====================================================

if (elementos.fuentes) {

    elementos.fuentes.classList.add(
        "fuentes"
    );

}


// =====================================================
// FILTROS
// =====================================================

const filtros =
    document.querySelectorAll(
        ".filtro"
    );


filtros.forEach(
    filtro => {

        filtro.addEventListener(
            "click",
            () => {

                filtros.forEach(
                    otro => {

                        otro.classList.remove(
                            "activo"
                        );

                    }
                );


                filtro.classList.add(
                    "activo"
                );


                const dias =
                    Number(
                        filtro.dataset.dias
                    );


                cargarDatos(
                    dias
                );

            }
        );

    }
);


// =====================================================
// DATOS OFFLINE
// =====================================================

function guardarDatosOffline(
    dias,
    datos
) {

    try {

        localStorage.setItem(

            `adminDatos_${dias}`,

            JSON.stringify({

                fecha:
                    Date.now(),

                datos

            })

        );

    } catch (error) {

        console.warn(
            "No se pudieron guardar los datos offline:",
            error
        );

    }

}


function obtenerDatosOffline(
    dias
) {

    try {

        const guardado =
            localStorage.getItem(
                `adminDatos_${dias}`
            );


        if (!guardado) {

            return null;

        }


        return JSON.parse(
            guardado
        );

    } catch (error) {

        console.warn(
            "No se pudieron leer los datos offline:",
            error
        );


        return null;

    }

}


// =====================================================
// UTILIDADES
// =====================================================

function formatearNumero(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "es-AR"
    );

}


function mostrarCargando() {

    elementos.visitas.textContent =
        "…";

    elementos.usuarios.textContent =
        "…";

    elementos.instalaciones.textContent =
        "…";

    elementos.instalacionesPwa.textContent =
        "…";

    elementos.activos.textContent =
        "…";

}


function mostrarSinDatos(
    dias
) {

    elementos.visitas.textContent =
        "Sin datos";

    elementos.usuarios.textContent =
        "Sin datos";

    elementos.instalaciones.textContent =
        "Sin datos";

    elementos.instalacionesPwa.textContent =
        "Sin datos";

    elementos.activos.textContent =
        "Sin datos";


    if (elementos.periodo) {

        elementos.periodo.textContent =
            `${dias} días · offline`;

    }


    crearGrafico(
        []
    );

    crearPaises(
        []
    );

    crearDispositivos(
        []
    );

    crearFuentes(
        []
    );

}


function mostrarDatos(
    dias,
    datos,
    modoOffline = false
) {

    const {

        usuarios,
        visitas,
        instalaciones,
        datosGrafico,
        datosPaises,
        datosDispositivos,
        activos,
        datosFuentes

    } = datos;


    // =================================================
    // TARJETAS
    // =================================================

    elementos.usuarios.textContent =
        formatearNumero(
            usuarios?.usuarios
        );


    elementos.visitas.textContent =
        formatearNumero(
            visitas?.visitas
        );


    elementos.instalaciones.textContent =
        formatearNumero(
            instalaciones?.instalaciones
        );


    elementos.instalacionesPwa.textContent =
        formatearNumero(
            instalaciones?.instalaciones
        );


    elementos.activos.textContent =
        formatearNumero(
            activos?.activos
        );


    // =================================================
    // PERÍODO
    // =================================================

    if (elementos.periodo) {

        elementos.periodo.textContent =
            modoOffline
                ? `${dias} días · offline`
                : `${dias} días`;

    }


    // =================================================
    // CONTENIDO
    // =================================================

    crearGrafico(
        datosGrafico?.grafico || []
    );


    crearPaises(
        datosPaises?.paises || []
    );


    crearDispositivos(
        datosDispositivos?.dispositivos || []
    );


    crearFuentes(
        datosFuentes?.fuentes || []
    );

}


// =====================================================
// CARGAR DATOS
// =====================================================

async function cargarDatos(
    dias
) {

    mostrarCargando();


    try {

        // =================================================
        // USUARIO AUTENTICADO
        // =================================================

        const usuario =
            auth.currentUser;


        if (!usuario) {

            throw new Error(
                "No hay un usuario autenticado."
            );

        }


        // =================================================
        // TOKEN FIREBASE
        // =================================================

        const token =
            await usuario.getIdToken();


        // =================================================
        // OPCIONES
        // =================================================

        const opciones = {

            headers: {

                Authorization:
                    `Bearer ${token}`

            }

        };


        // =================================================
        // CONSULTAS AL BACKEND
        // =================================================

        console.time(
            "⏱️ Carga total Admin"
        );


        const [

            respuestaUsuarios,

            respuestaVisitas,

            respuestaInstalaciones,

            respuestaGrafico,

            respuestaPaises,

            respuestaDispositivos,

            respuestaActivos,

            respuestaFuentes

        ] = await Promise.all([


            fetch(

                `${API_URL}/api/usuarios?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/visitas?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/instalaciones?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/grafico?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/paises?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/dispositivos?dias=${dias}`,

                opciones

            ),


            fetch(

                `${API_URL}/api/activos`,

                opciones

            ),


            fetch(

                `${API_URL}/api/fuentes?dias=${dias}`,

                opciones

            )


        ]);


        console.timeEnd(
            "⏱️ Carga total Admin"
        );


        // =================================================
        // COMPROBAR RESPUESTAS
        // =================================================

        if (

            !respuestaUsuarios.ok ||

            !respuestaVisitas.ok ||

            !respuestaInstalaciones.ok ||

            !respuestaGrafico.ok ||

            !respuestaPaises.ok ||

            !respuestaDispositivos.ok ||

            !respuestaActivos.ok ||

            !respuestaFuentes.ok

        ) {

            throw new Error(
                "El backend no respondió correctamente."
            );

        }


        // =================================================
        // CONVERTIR RESPUESTAS
        // =================================================

        const usuarios =
            await respuestaUsuarios.json();


        const visitas =
            await respuestaVisitas.json();


        const instalaciones =
            await respuestaInstalaciones.json();


        const datosGrafico =
            await respuestaGrafico.json();


        const datosPaises =
            await respuestaPaises.json();


        const datosDispositivos =
            await respuestaDispositivos.json();


        const activos =
            await respuestaActivos.json();


        const datosFuentes =
            await respuestaFuentes.json();


        // =================================================
        // AGRUPAR DATOS
        // =================================================

        const datos = {

            usuarios,

            visitas,

            instalaciones,

            datosGrafico,

            datosPaises,

            datosDispositivos,

            activos,

            datosFuentes

        };


        // =================================================
        // GUARDAR COPIA OFFLINE
        // =================================================

        guardarDatosOffline(
            dias,
            datos
        );


        // =================================================
        // MOSTRAR ONLINE
        // =================================================

        mostrarDatos(

            dias,

            datos,

            false

        );


    } catch (error) {

        console.warn(

            "📴 Sin conexión. Intentando usar datos guardados:",

            error

        );


        // =================================================
        // BUSCAR COPIA LOCAL
        // =================================================

        const copia =
            obtenerDatosOffline(
                dias
            );


        if (

            !copia ||

            !copia.datos

        ) {

            mostrarSinDatos(
                dias
            );


            return;

        }


        // =================================================
        // MOSTRAR DATOS OFFLINE
        // =================================================

        mostrarDatos(

            dias,

            copia.datos,

            true

        );


        console.log(

            "📦 Datos offline cargados.",

            new Date(
                copia.fecha
            ).toLocaleString(
                "es-AR"
            )

        );

    }

}


// =====================================================
// CREAR GRÁFICO
// =====================================================

function crearGrafico(
    datosGrafico
) {

    elementos.grafico.innerHTML =
        "";


    if (
        !datosGrafico.length
    ) {

        const mensaje =
            document.createElement(
                "div"
            );


        mensaje.textContent =
            "No hay datos para este período.";


        mensaje.className =
            "grafico-vacio";


        elementos.grafico.appendChild(
            mensaje
        );


        return;

    }


    const maximo =
        Math.max(

            ...datosGrafico.map(

                dato =>
                    Number(
                        dato.visitas
                    ) || 0

            )

        );


    datosGrafico.forEach(
        dato => {

            const barra =
                document.createElement(
                    "div"
                );


            barra.className =
                "barra";


            const visitas =
                Number(
                    dato.visitas
                ) || 0;


            const porcentaje =

                maximo > 0

                    ? (
                        visitas /
                        maximo
                    ) * 100

                    : 0;


            barra.style.height =
                `${porcentaje}%`;


            const numero =
                document.createElement(
                    "span"
                );


            numero.textContent =
                visitas.toLocaleString(
                    "es-AR"
                );


            const etiqueta =
                document.createElement(
                    "small"
                );


            const fecha =
                String(
                    dato.dia
                );


            if (
                fecha.length === 8
            ) {

                etiqueta.textContent =
                    `${fecha.slice(
                        6,
                        8
                    )}/${fecha.slice(
                        4,
                        6
                    )}`;

            } else {

                etiqueta.textContent =
                    fecha;

            }


            barra.appendChild(
                numero
            );


            barra.appendChild(
                etiqueta
            );


            elementos.grafico.appendChild(
                barra
            );

        }
    );

}


// =====================================================
// CREAR PAÍSES
// =====================================================

function crearPaises(
    paises
) {

    elementos.listaPaises.innerHTML =
        "";


    if (
        !paises.length
    ) {

        elementos.listaPaises.innerHTML = `

            <div class="fila">

                <span>
                    No hay datos disponibles
                </span>

                <strong>
                    0%
                </strong>

            </div>

        `;


        return;

    }


    const total =
        paises.reduce(

            (
                suma,
                pais
            ) =>

                suma +

                (
                    Number(
                        pais.usuarios
                    ) || 0
                ),

            0

        );


    paises.forEach(
        pais => {

            const cantidad =
                Number(
                    pais.usuarios
                ) || 0;


            const porcentaje =

                total > 0

                    ? Math.round(

                        (
                            cantidad /
                            total
                        ) * 100

                    )

                    : 0;


            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "fila";


            const nombre =
                document.createElement(
                    "span"
                );


            nombre.textContent =

                pais.pais ===
                "(not set)"

                    ? "🌎 Ubicación desconocida"

                    : `🌎 ${pais.pais}`;


            const porcentajeElemento =
                document.createElement(
                    "strong"
                );


            porcentajeElemento.textContent =
                `${cantidad} · ${porcentaje}%`;


            fila.appendChild(
                nombre
            );


            fila.appendChild(
                porcentajeElemento
            );


            elementos.listaPaises.appendChild(
                fila
            );

        }
    );

}


// =====================================================
// CREAR DISPOSITIVOS
// =====================================================

function crearDispositivos(
    dispositivos
) {

    elementos.listaDispositivos.innerHTML =
        "";


    if (
        !dispositivos.length
    ) {

        elementos.listaDispositivos.innerHTML = `

            <div class="dispositivo">

                <span>
                    ❓
                </span>

                <strong>
                    0%
                </strong>

                <small>
                    Sin datos
                </small>

            </div>

        `;


        return;

    }


    const total =
        dispositivos.reduce(

            (
                suma,
                dispositivo
            ) =>

                suma +

                (
                    Number(
                        dispositivo.usuarios
                    ) || 0
                ),

            0

        );


    dispositivos.forEach(
        dispositivo => {

            const cantidad =
                Number(
                    dispositivo.usuarios
                ) || 0;


            const porcentaje =

                total > 0

                    ? Math.round(

                        (
                            cantidad /
                            total
                        ) * 100

                    )

                    : 0;


            let icono =
                "❓";


            let nombre =
                "Sin origen identificado";


            if (

                dispositivo.dispositivo ===
                "mobile"

            ) {

                icono =
                    "📱";


                nombre =
                    "Celular";

            }


            if (

                dispositivo.dispositivo ===
                "desktop"

            ) {

                icono =
                    "💻";


                nombre =
                    "PC";

            }


            if (

                dispositivo.dispositivo ===
                "tablet"

            ) {

                icono =
                    "📟";


                nombre =
                    "Tablet";

            }


            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "dispositivo";


            elemento.innerHTML = `

                <span>
                    ${icono}
                </span>

                <strong>
                    ${porcentaje}%
                </strong>

                <small>
                    ${nombre} ·
                    ${cantidad.toLocaleString(
                        "es-AR"
                    )}
                    usuarios
                </small>

            `;


            elementos.listaDispositivos.appendChild(
                elemento
            );

        }
    );

}


// =====================================================
// CREAR FUENTES
// =====================================================

function crearFuentes(
    fuentes
) {

    elementos.fuentes.innerHTML =
        "";


    if (
        !fuentes.length
    ) {

        elementos.fuentes.innerHTML = `

            <div class="fuente">

                <span>
                    🔗 Sin datos
                </span>

                <strong>
                    0%
                </strong>

            </div>

        `;


        return;

    }


    // =================================================
    // AGRUPAR FUENTES
    // =================================================

    const fuentesAgrupadas =
        {};


    fuentes.forEach(
        fuente => {

            const fuenteOriginal =
                String(

                    fuente.fuente ||

                    "(not set)"

                ).toLowerCase();


            console.log(

                "🔗 FUENTE ANALYTICS:",

                fuente

            );


            let nombre;

            let icono;


            if (

                fuenteOriginal ===
                "(direct)"

            ) {

                nombre =
                    "Enlace directo";


                icono =
                    "🔗";


            } else if (

                fuenteOriginal ===
                "(not set)"

            ) {

                nombre =
                    "Desconocido";


                icono =
                    "❓";


            } else if (

                fuenteOriginal.includes(
                    "chatgpt"
                )

            ) {

                nombre =
                    "ChatGPT";


                icono =
                    "🤖";


            } else if (

                fuenteOriginal.includes(
                    "github"
                )

            ) {

                nombre =
                    "GitHub";


                icono =
                    "💻";


            } else if (

                fuenteOriginal.includes(
                    "google"
                )

            ) {

                nombre =
                    "Google";


                icono =
                    "🔎";


            } else {

                nombre =
                    fuente.fuente;


                icono =
                    "🔗";

            }


            if (
                !fuentesAgrupadas[
                    nombre
                ]
            ) {

                fuentesAgrupadas[
                    nombre
                ] = {

                    nombre,

                    icono,

                    usuarios:
                        0

                };

            }


            fuentesAgrupadas[
                nombre
            ].usuarios +=

                Number(
                    fuente.usuarios
                ) || 0;

        }
    );


    const fuentesFinales =
        Object.values(
            fuentesAgrupadas
        );


    const total =
        fuentesFinales.reduce(

            (
                suma,
                fuente
            ) =>

                suma +
                fuente.usuarios,

            0

        );


    // =================================================
    // ORDENAR
    // =================================================

    fuentesFinales.sort(

        (
            a,
            b
        ) =>

            b.usuarios -
            a.usuarios

    );


    // =================================================
    // MOSTRAR
    // =================================================

    fuentesFinales.forEach(
        fuente => {

            const porcentaje =

                total > 0

                    ? Math.round(

                        (
                            fuente.usuarios /
                            total
                        ) * 100

                    )

                    : 0;


const elemento =
    document.createElement(
        "div"
    );


elemento.className =
    "fuente";


const nombreFuente =
    document.createElement(
        "span"
    );


nombreFuente.textContent =
    `${fuente.icono} ${fuente.nombre}`;


const datosFuente =
    document.createElement(
        "strong"
    );


datosFuente.textContent =
    `${fuente.usuarios} · ${porcentaje}%`;


elemento.appendChild(
    nombreFuente
);


elemento.appendChild(
    datosFuente
);


elementos.fuentes.appendChild(
    elemento
);

        }
    );

}

// =====================================================
// OPINIONES · SOLO ADMIN PRINCIPAL
// =====================================================

function ocultarOpinionesAdmin() {

    adminPrincipalActual =
        false;


    if (
        elementos.opinionesSeccion
    ) {

        elementos.opinionesSeccion.hidden =
            true;

    }

}


/* =====================================================
   ORDENAR
===================================================== */

function ordenarOpinionesAdmin() {

    opinionesAdmin.sort(
        (a, b) => {

            if (
                a.leida !==
                b.leida
            ) {

                return a.leida
                    ? 1
                    : -1;

            }


            const fechaA =
                a.fecha
                    ? new Date(
                        a.fecha
                    ).getTime()
                    : 0;


            const fechaB =
                b.fecha
                    ? new Date(
                        b.fecha
                    ).getTime()
                    : 0;


            return (
                fechaB -
                fechaA
            );

        }
    );

}


/* =====================================================
   RESUMEN
===================================================== */

function actualizarResumenOpiniones() {

    const total =
        opinionesAdmin.length;


    const sinLeer =
        opinionesAdmin.filter(
            opinion =>
                !opinion.leida
        ).length;


    const suma =
        opinionesAdmin.reduce(
            (
                acumulado,
                opinion
            ) =>
                acumulado +
                (
                    Number(
                        opinion.estrellas
                    ) || 0
                ),
            0
        );


    const promedio =
        total > 0
            ? (
                suma /
                total
            ).toFixed(1)
            : "0.0";


    elementos.promedioOpiniones.textContent =
        `${promedio} / 5`;


    elementos.totalOpiniones.textContent =
        total.toLocaleString(
            "es-AR"
        );


    elementos.sinLeerOpiniones.textContent =
        sinLeer.toLocaleString(
            "es-AR"
        );

}


/* =====================================================
   FORMATEAR FECHA
===================================================== */

function formatearFechaOpinion(
    fecha
) {

    if (
        !fecha
    ) {

        return "Sin fecha";

    }


    const objetoFecha =
        new Date(
            fecha
        );


    if (
        Number.isNaN(
            objetoFecha.getTime()
        )
    ) {

        return "Sin fecha";

    }


    return new Intl.DateTimeFormat(
        "es-AR",
        {

            timeZone:
                "America/Argentina/Buenos_Aires",

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    ).format(
        objetoFecha
    );

}


/* =====================================================
   ESTRELLAS
===================================================== */

function crearTextoEstrellas(
    valor
) {

    const cantidad =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    Number(
                        valor
                    ) || 0
                )
            )
        );


    return (
        "★".repeat(
            cantidad
        ) +
        "☆".repeat(
            5 - cantidad
        )
    );

}


/* =====================================================
   DIBUJAR OPINIONES
===================================================== */

function renderizarOpinionesAdmin() {

    if (
        !elementos.listaOpiniones
    ) {

        return;

    }


    elementos.listaOpiniones.textContent =
        "";


    ordenarOpinionesAdmin();


    if (
        opinionesAdmin.length ===
        0
    ) {

        const vacio =
            document.createElement(
                "p"
            );


        vacio.className =
            "opinion-admin-sin-comentario";


        vacio.textContent =
            "Todavía no hay opiniones.";


        elementos.listaOpiniones
            .appendChild(
                vacio
            );


        elementos.cargarMasOpiniones.hidden =
            true;


        return;

    }


    const visibles =
        opinionesAdmin.slice(
            0,
            opinionesMostradas
        );


    visibles.forEach(
        opinion => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "opinion-admin-item";


            if (
                opinion.leida
            ) {

                item.classList.add(
                    "leida"
                );

            }


            /* =========================================
               CHECK
            ========================================= */

            const check =
                document.createElement(
                    "button"
                );


            check.type =
                "button";


            check.className =
                "opinion-admin-check";


            check.textContent =
                opinion.leida
                    ? "☑"
                    : "☐";


            check.setAttribute(
                "aria-label",
                opinion.leida
                    ? "Marcar como no leída"
                    : "Marcar como leída"
            );


            /* =========================================
               CUERPO
            ========================================= */

            const cuerpo =
                document.createElement(
                    "div"
                );


            cuerpo.className =
                "opinion-admin-cuerpo";


            const superior =
                document.createElement(
                    "div"
                );


            superior.className =
                "opinion-admin-superior";


            const nombre =
                document.createElement(
                    "span"
                );


            nombre.className =
                "opinion-admin-nombre";


            nombre.textContent =
                opinion.nombre ||
                "Anónimo";


            const fecha =
                document.createElement(
                    "span"
                );


            fecha.className =
                "opinion-admin-fecha";


            fecha.textContent =
                formatearFechaOpinion(
                    opinion.fecha
                );


            superior.appendChild(
                nombre
            );


            superior.appendChild(
                fecha
            );


            /* =========================================
               ESTRELLAS
            ========================================= */

            const estrellas =
                document.createElement(
                    "div"
                );


            estrellas.className =
                "opinion-admin-estrellas";


            estrellas.textContent =
                crearTextoEstrellas(
                    opinion.estrellas
                );


            /* =========================================
               COMENTARIO
            ========================================= */

            const comentario =
                document.createElement(
                    "p"
                );


            comentario.className =
                "opinion-admin-comentario";


            if (
                opinion.comentario
            ) {

                comentario.textContent =
                    opinion.comentario;

            } else {

                comentario.textContent =
                    "Sin comentario.";


                comentario.classList.add(
                    "opinion-admin-sin-comentario"
                );

            }


            /* =========================================
               ESTADO
            ========================================= */

            const estado =
                document.createElement(
                    "span"
                );


            estado.className =
                "opinion-admin-estado";


            estado.textContent =
                opinion.leida
                    ? "Leída"
                    : "Sin leer";


            /* =========================================
               ARMAR
            ========================================= */

            cuerpo.appendChild(
                superior
            );


            cuerpo.appendChild(
                estrellas
            );


            cuerpo.appendChild(
                comentario
            );


            cuerpo.appendChild(
                estado
            );


            item.appendChild(
                check
            );


            item.appendChild(
                cuerpo
            );


            elementos.listaOpiniones
                .appendChild(
                    item
                );


            /* =========================================
               CAMBIAR LEÍDA
            ========================================= */

            check.addEventListener(
                "click",
                async () => {

                    const usuario =
                        auth.currentUser;


                    if (
                        !usuario ||
                        !adminPrincipalActual
                    ) {

                        return;

                    }


                    check.disabled =
                        true;


                    elementos.mensajeOpiniones.textContent =
                        "";


                    try {

                        const token =
                            await usuario
                                .getIdToken();


                        const nuevoEstado =
                            !opinion.leida;


                        const respuesta =
                            await fetch(
                                `${API_URL}/api/admin/opiniones/${encodeURIComponent(
                                    opinion.id
                                )}/leida`,
                                {

                                    method:
                                        "PATCH",

                                    headers: {

                                        Authorization:
                                            `Bearer ${token}`,

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            leida:
                                                nuevoEstado

                                        })

                                }
                            );


                        if (
                            !respuesta.ok
                        ) {

                            throw new Error(
                                `HTTP ${respuesta.status}`
                            );

                        }


                        opinion.leida =
                            nuevoEstado;


                        actualizarResumenOpiniones();


                        renderizarOpinionesAdmin();


                    } catch (error) {

                        console.error(
                            "❌ Error actualizando opinión:",
                            error
                        );


                        elementos.mensajeOpiniones.textContent =
                            "No se pudo actualizar la opinión.";

                    } finally {

                        check.disabled =
                            false;

                    }

                }
            );

        }
    );


    elementos.cargarMasOpiniones.hidden =
        opinionesMostradas >=
        opinionesAdmin.length;

}


/* =====================================================
   CARGAR OPINIONES
===================================================== */

async function cargarOpinionesAdmin(
    usuario
) {

    if (
        !usuario ||
        !adminPrincipalActual
    ) {

        ocultarOpinionesAdmin();

        return;

    }


    elementos.opinionesSeccion.hidden =
        false;


    elementos.promedioOpiniones.textContent =
        "…";


    elementos.totalOpiniones.textContent =
        "…";


    elementos.sinLeerOpiniones.textContent =
        "…";


    elementos.mensajeOpiniones.textContent =
        "";


    try {

        const token =
            await usuario
                .getIdToken();


        const respuesta =
            await fetch(
                `${API_URL}/api/admin/opiniones`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    },

                    cache:
                        "no-store"

                }
            );


        if (
            respuesta.status ===
            403
        ) {

            ocultarOpinionesAdmin();

            return;

        }


        if (
            !respuesta.ok
        ) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        opinionesAdmin =
            Array.isArray(
                datos.opiniones
            )
                ? datos.opiniones
                : [];


        opinionesMostradas =
            OPINIONES_POR_PAGINA;


        actualizarResumenOpiniones();


        renderizarOpinionesAdmin();


    } catch (error) {

        console.error(
            "❌ Error cargando opiniones:",
            error
        );


        elementos.mensajeOpiniones.textContent =
            "Necesitás conexión para cargar las opiniones.";


        elementos.promedioOpiniones.textContent =
            "—";


        elementos.totalOpiniones.textContent =
            "—";


        elementos.sinLeerOpiniones.textContent =
            "—";

    }

}


/* =====================================================
   ABRIR / CERRAR CARPETA
===================================================== */

elementos.toggleOpiniones
    ?.addEventListener(
        "click",
        () => {

            const abrir =
                elementos.contenidoOpiniones
                    .hidden;


            elementos.contenidoOpiniones.hidden =
                !abrir;


            elementos.toggleOpiniones
                .setAttribute(
                    "aria-expanded",
                    abrir
                        ? "true"
                        : "false"
                );


            elementos.flechaOpiniones.textContent =
                abrir
                    ? "▲"
                    : "▼";

        }
    );


/* =====================================================
   CARGAR MÁS
===================================================== */

elementos.cargarMasOpiniones
    ?.addEventListener(
        "click",
        () => {

            opinionesMostradas +=
                OPINIONES_POR_PAGINA;


            renderizarOpinionesAdmin();

        }
    );

// =====================================================
// COMPROBAR ACCESO ANTES DE CARGAR DATOS
// =====================================================

async function usuarioPuedeCargarDatos(
    usuario
) {

    try {

        const token =
            await usuario.getIdToken();


        const respuesta =
            await fetch(
                `${API_URL}/api/admin/check`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (
            respuesta.status === 401 ||
            respuesta.status === 403
        ) {

            localStorage.removeItem(
                "adminAutorizadoUid"
            );


            return false;

        }


        if (
            !respuesta.ok
        ) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        if (
            datos.autorizado !==
            true
        ) {

            adminPrincipalActual =
                false;

            return false;

        }


        adminPrincipalActual =
            datos.adminPrincipal ===
            true;


        localStorage.setItem(
            "adminAutorizadoUid",
            usuario.uid
        );


        return true;


    } catch (error) {

        /*
         * Si no hay Internet,
         * solamente permitimos usar
         * datos offline al MISMO usuario
         * autorizado anteriormente.
         */

        adminPrincipalActual =
            false;


        if (
            elementos.opinionesSeccion
        ) {

            elementos.opinionesSeccion.hidden =
                true;

        }

        const uidAutorizado =
            localStorage.getItem(
                "adminAutorizadoUid"
            );


        if (
            uidAutorizado ===
            usuario.uid
        ) {

            console.warn(
                "📴 Admin autorizado en modo offline."
            );


            return true;

        }


        console.warn(
            "🔒 No se pudo autorizar la carga de datos.",
            error
        );


        return false;

    }

}


// =====================================================
// ESPERAR A FIREBASE
// =====================================================

onAuthStateChanged(

    auth,

    async usuario => {

        if (
            !usuario
        ) {

            console.log(
                "🔒 No hay usuario autenticado. Datos no cargados."
            );

            ocultarOpinionesAdmin();

            return;

        }


        const autorizado =
            await usuarioPuedeCargarDatos(
                usuario
            );


        if (
            !autorizado
        ) {

            console.warn(
                "⛔ Usuario sin permisos. Estadísticas no cargadas."
            );


            return;

        }


        console.log(
            "🔓 Usuario autorizado:",
            usuario.email
        );


        cargarDatos(
            7
        );


        if (
            adminPrincipalActual
        ) {

            cargarOpinionesAdmin(
                usuario
            );

        } else {

            ocultarOpinionesAdmin();

        }
    }

);