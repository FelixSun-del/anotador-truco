"use strict";


/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDoRxqYQzul22__ZpOTmcurjSnM6jL9MeU",

    authDomain:
        "anotador-de-truco-83ae4.firebaseapp.com",

    projectId:
        "anotador-de-truco-83ae4",

    storageBucket:
        "anotador-de-truco-83ae4.firebasestorage.app",

    messagingSenderId:
        "579527324889",

    appId:
        "1:579527324889:web:59229e5ab1d9e2f5a57ac8"

};


/* =====================================================
   INICIALIZAR FIREBASE
===================================================== */

let firebaseDisponible = false;
let auth = null;

try {

    if (
        typeof firebase !== "undefined" &&
        firebaseConfig.apiKey !== "TU_API_KEY"
    ) {

        firebase.initializeApp(
            firebaseConfig
        );

        auth = firebase.auth();

        firebaseDisponible = true;

        console.log(
            "🔥 Firebase iniciado correctamente."
        );

    } else {

        console.warn(
            "Firebase todavía no está configurado."
        );
    }

} catch (error) {

    console.error(
        "Error iniciando Firebase:",
        error
    );
}


/* =====================================================
   ESTADO
===================================================== */

const estado = {

    jugadores: 1,

    objetivo: 15,

    apuestas: true,

    puntos1: 0,

    puntos2: 0,

    fichas1: 100,

    fichas2: 100,

    apuesta1: 0,

    apuesta2: 0,

    historial1: [],

    historial2: [],

    terminada: false,

    partidasJugadas: 0
};

    /* =====================================================
   GUARDAR PARTIDA ACTUAL
===================================================== */

const CLAVE_PARTIDA =
    "anotadorTruco_partidaActual";

let partidaActiva = false;


function guardarPartidaActual() {

    if (!partidaActiva) {
        return;
    }


    const datos = {

        jugadores:
            estado.jugadores,

        objetivo:
            estado.objetivo,

        apuestas:
            estado.apuestas,

        puntos1:
            estado.puntos1,

        puntos2:
            estado.puntos2,

        fichas1:
            estado.fichas1,

        fichas2:
            estado.fichas2,

        apuesta1:
            estado.apuesta1,

        apuesta2:
            estado.apuesta2,

        historial1:
            estado.historial1,

        historial2:
            estado.historial2,

        terminada:
            estado.terminada,

        partidasJugadas:
            estado.partidasJugadas
    };


    localStorage.setItem(
        CLAVE_PARTIDA,
        JSON.stringify(datos)
    );
}


function cargarPartidaGuardada() {

    const guardado =
        localStorage.getItem(
            CLAVE_PARTIDA
        );


    if (!guardado) {
        return false;
    }


    try {

        const datos =
            JSON.parse(
                guardado
            );


        estado.jugadores =
            datos.jugadores ?? 1;

        estado.objetivo =
            datos.objetivo ?? 15;

        estado.apuestas =
            datos.apuestas ?? true;

        estado.puntos1 =
            datos.puntos1 ?? 0;

        estado.puntos2 =
            datos.puntos2 ?? 0;

        estado.fichas1 =
            datos.fichas1 ?? 100;

        estado.fichas2 =
            datos.fichas2 ?? 100;

        estado.apuesta1 =
            datos.apuesta1 ?? 0;

        estado.apuesta2 =
            datos.apuesta2 ?? 0;

        estado.historial1 =
            datos.historial1 ?? [];

        estado.historial2 =
            datos.historial2 ?? [];

        estado.terminada =
            datos.terminada ?? false;

        estado.partidasJugadas =
            datos.partidasJugadas ?? 0;


        partidaActiva = true;

        return true;


    } catch (error) {

        console.error(
            "Error cargando la partida:",
            error
        );

        localStorage.removeItem(
            CLAVE_PARTIDA
        );

        return false;
    }
}


function borrarPartidaGuardada() {

    partidaActiva = false;

    localStorage.removeItem(
        CLAVE_PARTIDA
    );
}

/* =====================================================
   PANTALLAS
===================================================== */

const pantallas = {

    1:
        document.getElementById(
            "pantalla1"
        ),

    2:
        document.getElementById(
            "pantalla2"
        ),

    3:
        document.getElementById(
            "pantalla3"
        ),

    4:
        document.getElementById(
            "pantalla4"
        ),

    5:
        document.getElementById(
            "pantalla5"
        ),

    ganador:
        document.getElementById(
            "pantallaGanador"
        )


};


function mostrarPantalla(numero) {

    Object.values(pantallas)
        .forEach(pantalla => {

            if (pantalla) {

                pantalla.classList.add(
                    "oculto"
                );
            }
        });


    if (pantallas[numero]) {

        pantallas[numero]
            .classList
            .remove("oculto");
    }
}


// =====================================================
// BOTÓN ADMIN
// =====================================================

const botonAdmin =
    document.getElementById("botonAdmin");

const API_URL =
    "https://anotador-truco-backend.onrender.com";


// =====================================================
// COMPROBAR ADMINISTRADOR
// =====================================================

async function comprobarAdministrador(user) {

    if (!botonAdmin) {
        return;
    }


    // Siempre empieza oculto
    botonAdmin.classList.add(
        "oculto"
    );


    // No hay usuario autenticado
    if (!user) {
        return;
    }


    // =================================================
    // COMPROBAR VENCIMIENTO 7 / 30 DÍAS
    // =================================================

    const expiracionGuardada =
        localStorage.getItem(
            "adminSesionExpira"
        );


    if (expiracionGuardada) {

        const expiracion =
            Number(expiracionGuardada);


        if (
            Number.isFinite(expiracion) &&
            Date.now() >= expiracion
        ) {

            localStorage.removeItem(
                "adminSesionExpira"
            );

            localStorage.removeItem(
                "adminSesionDias"
            );


            await auth.signOut();


            return;

        }

    }


    try {

        // TOKEN FIREBASE
        const token =
            await user.getIdToken();


        // PREGUNTAR AL BACKEND
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


        // NO AUTORIZADO
        if (!respuesta.ok) {

            console.warn(
                "🔒 Usuario sin permisos de administrador."
            );

            return;

        }


        const datos =
            await respuesta.json();


        // AUTORIZADO
        if (datos.autorizado === true) {

            botonAdmin.classList.remove(
                "oculto"
            );


            console.log(
                "🔐 Administrador autorizado:",
                datos.email
            );

        }


    } catch (error) {

        console.error(
            "Error comprobando administrador:",
            error
        );


        botonAdmin.classList.add(
            "oculto"
        );

    }

}


// =====================================================
// ESTADO DE FIREBASE
// =====================================================

if (firebaseDisponible) {

    auth.onAuthStateChanged(
        user => {

            comprobarAdministrador(
                user
            );

        }
    );

}


// =====================================================
// ABRIR PANEL ADMIN
// =====================================================

if (botonAdmin) {

    botonAdmin.addEventListener(
        "click",
        () => {

            window.location.href =
             "../admin/admin.html";

        }
    );

}


/* =====================================================
   JUGADORES
===================================================== */

document
    .querySelectorAll(".jugadores")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".jugadores"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "seleccionado"
                        );
                    });


                boton.classList.add(
                    "seleccionado"
                );


                estado.jugadores =
                    Number(
                        boton.dataset.jugadores
                    );
            }
        );
    });


/* =====================================================
   OBJETIVO
===================================================== */

document
    .querySelectorAll(".objetivo")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".objetivo"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "seleccionado"
                        );
                    });


                boton.classList.add(
                    "seleccionado"
                );


                estado.objetivo =
                    Number(
                        boton.dataset.objetivo
                    );
            }
        );
    });


/* =====================================================
   APUESTAS SÍ / NO
===================================================== */

document
    .querySelectorAll(".apuestas")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".apuestas"
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "seleccionado"
                        );
                    });


                boton.classList.add(
                    "seleccionado"
                );


                estado.apuestas =
                    boton.dataset.apuestas
                    === "si";
            }
        );
    });


/* =====================================================
   PANTALLA 1 → 2
===================================================== */

const siguiente1 =
    document.getElementById(
        "siguiente1"
    );


if (siguiente1) {

    siguiente1.addEventListener(
        "click",
        () => {

            mostrarPantalla(2);
        }
    );
}

    /* =====================================================
   ABRIR / CERRAR REGLAS
===================================================== */

const verReglas =
    document.getElementById(
        "verReglas"
    );


if (verReglas) {

    verReglas.addEventListener(
        "click",
        () => {

            mostrarPantalla(5);

        }
    );

}


const volverReglas =
    document.getElementById(
        "volverReglas"
    );


if (volverReglas) {

    volverReglas.addEventListener(
        "click",
        () => {

            mostrarPantalla(1);

        }
    );

}

/* =====================================================
                     REGLAS
===================================================== */

document
    .querySelectorAll(
        ".boton-regla"
    )
    .forEach(boton => {

        boton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const contenido =
                    boton.nextElementSibling;

                const flecha =
                    boton.querySelector(
                        "span"
                    );


                if (!contenido) {
                    return;
                }


                /*
                 * Guardamos si ESTE menú
                 * ya estaba abierto.
                 */

                const estabaAbierto =
                    !contenido.classList.contains(
                        "oculto"
                    );


                /*
                 * Cerramos todos los demás.
                 */

                document
                    .querySelectorAll(
                        ".boton-regla"
                    )
                    .forEach(otroBoton => {

                        if (
                            otroBoton === boton
                        ) {
                            return;
                        }


                        const otroContenido =
                            otroBoton
                                .nextElementSibling;

                        const otraFlecha =
                            otroBoton
                                .querySelector(
                                    "span"
                                );


                        if (otroContenido) {

                            otroContenido
                                .classList.add(
                                    "oculto"
                                );

                        }


                        if (otraFlecha) {

                            otraFlecha.textContent =
                                "▼";

                        }

                    });


                /*
                 * Si el actual estaba abierto,
                 * lo cerramos.
                 *
                 * Si estaba cerrado,
                 * lo abrimos.
                 */

                if (estabaAbierto) {

                    contenido.classList.add(
                        "oculto"
                    );

                    if (flecha) {
                        flecha.textContent =
                            "▼";
                    }

                } else {

                    contenido.classList.remove(
                        "oculto"
                    );

                    if (flecha) {
                        flecha.textContent =
                            "▲";
                    }

                }

            }
        );

    });


/* =====================================================
   PANTALLA 2
===================================================== */

const siguiente2 =
    document.getElementById(
        "siguiente2"
    );


if (siguiente2) {

    siguiente2.addEventListener(
        "click",
        () => {

            if (estado.apuestas) {

                actualizarFichas();

                mostrarPantalla(3);

            } else {

                iniciarPartida();
            }
        }
    );
}


const volver2 =
    document.getElementById(
        "volver2"
    );


if (volver2) {

    volver2.addEventListener(
        "click",
        () => {

            mostrarPantalla(1);
        }
    );
}


/* =====================================================
   APUESTAS
===================================================== */

document
    .querySelectorAll(".apuesta")
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                const equipo =
                    Number(
                        boton.dataset.equipo
                    );


                const cantidad =
                    Number(
                        boton.dataset.apuesta
                    );


                const fichas =
                    equipo === 1
                        ? estado.fichas1
                        : estado.fichas2;


                if (
                    cantidad >
                    fichas
                ) {

                    alert(
                        "Ese equipo no tiene suficientes fichas."
                    );

                    return;
                }


                if (equipo === 1) {

                    estado.apuesta1 =
                        cantidad;

                } else {

                    estado.apuesta2 =
                        cantidad;
                }


                document
                    .querySelectorAll(
                        `.apuesta[data-equipo="${equipo}"]`
                    )
                    .forEach(b => {

                        b.classList.remove(
                            "seleccionado"
                        );
                    });


                boton.classList.add(
                    "seleccionado"
                );


                const texto =
                    document.getElementById(
                        `apuesta${equipo}Texto`
                    );


                if (texto) {

                    texto.textContent =
                        `Apuesta: ${cantidad} fichas`;
                }
            }
        );
    });


/* =====================================================
   REINICIAR FICHAS
===================================================== */

const reiniciarFichas =
    document.getElementById(
        "reiniciarFichas"
    );


if (reiniciarFichas) {

    reiniciarFichas.addEventListener(
        "click",
        () => {

            estado.fichas1 = 100;

            estado.fichas2 = 100;

            estado.apuesta1 = 0;

            estado.apuesta2 = 0;


            document
                .querySelectorAll(
                    ".apuesta"
                )
                .forEach(boton => {

                    boton.classList.remove(
                        "seleccionado"
                    );
                });


            document.getElementById(
                "apuesta1Texto"
            ).textContent =
                "Sin apuesta";


            document.getElementById(
                "apuesta2Texto"
            ).textContent =
                "Sin apuesta";


            actualizarFichas();
        }
    );
}


/* =====================================================
   PANTALLA 3
===================================================== */

const volver3 =
    document.getElementById(
        "volver3"
    );


if (volver3) {

    volver3.addEventListener(
        "click",
        () => {

            mostrarPantalla(2);
        }
    );
}


const siguiente3 =
    document.getElementById(
        "siguiente3"
    );


if (siguiente3) {

    siguiente3.addEventListener(
        "click",
        () => {

            if (
                estado.apuesta1 <= 0 ||
                estado.apuesta2 <= 0
            ) {

                alert(
                    "Los dos equipos deben elegir una apuesta."
                );

                return;
            }


            if (
                estado.apuesta1 !==
                estado.apuesta2
            ) {

                alert(
                    "Los dos equipos deben apostar la misma cantidad."
                );

                return;
            }


            iniciarPartida();
        }
    );
}


/* =====================================================
   INICIAR PARTIDA
===================================================== */

function iniciarPartida() {

    estado.puntos1 = 0;

    estado.puntos2 = 0;

    estado.historial1 = [];

    estado.historial2 = [];

    estado.terminada = false;

    estado.partidasJugadas++;

    partidaActiva = true;

    actualizarTodo();

    mostrarPantalla(4);
}


/* =====================================================
   FICHAS
===================================================== */

function actualizarFichas() {

    const fichas1 =
        document.getElementById(
            "fichasConfig1"
        );

    const fichas2 =
        document.getElementById(
            "fichasConfig2"
        );


    if (fichas1) {

        fichas1.textContent =
            estado.fichas1;
    }


    if (fichas2) {

        fichas2.textContent =
            estado.fichas2;
    }
}


/* =====================================================
   PALITOS
===================================================== */

function generarPalitos(puntos) {

    let html = "";

    const gruposDeCinco =
        Math.floor(
            puntos / 5
        );

    const resto =
        puntos % 5;


    for (
        let i = 0;
        i < gruposDeCinco;
        i++
    ) {

        html += `

            <span class="grupo-palitos">

                <span class="linea vertical v1"></span>

                <span class="linea horizontal h1"></span>

                <span class="linea vertical v2"></span>

                <span class="linea horizontal h2"></span>

                <span class="linea diagonal"></span>

            </span>

        `;
    }


    if (resto > 0) {

        html += `
            <span class="grupo-palitos">
        `;


        if (resto >= 1) {

            html += `
                <span class="linea vertical v1"></span>
            `;
        }


        if (resto >= 2) {

            html += `
                <span class="linea horizontal h1"></span>
            `;
        }


        if (resto >= 3) {

            html += `
                <span class="linea vertical v2"></span>
            `;
        }


        if (resto >= 4) {

            html += `
                <span class="linea horizontal h2"></span>
            `;
        }


        html += `
            </span>
        `;
    }


    return html;
}


/* =====================================================
   ACTUALIZAR TODO
===================================================== */

function actualizarTodo() {

    const puntos1 =
        document.getElementById(
            "puntos1"
        );

    const puntos2 =
        document.getElementById(
            "puntos2"
        );

    const infoPartida =
        document.getElementById(
            "infoPartida"
        );

    const objetivoTexto =
        document.getElementById(
            "objetivoTexto"
        );


if (puntos1) {

    puntos1.classList.toggle(
        "puntos-compactos",
        estado.objetivo === 30 &&
        estado.puntos1 >= 16
    );

    puntos1.innerHTML =
        generarPalitos(
            estado.puntos1
        );
}


if (puntos2) {

    puntos2.classList.toggle(
        "puntos-compactos",
        estado.objetivo === 30 &&
        estado.puntos2 >= 16
    );

    puntos2.innerHTML =
        generarPalitos(
            estado.puntos2
        );
}


    if (infoPartida) {

        infoPartida.textContent =
            `${estado.jugadores} vs ${estado.jugadores} · A ${estado.objetivo}`;
    }


    if (objetivoTexto) {

        objetivoTexto.textContent =
            `Objetivo: ${estado.objetivo} puntos`;
    }


    actualizarFichas();

    actualizarHistorial();

    guardarPartidaActual();
}


/* =====================================================
   MODIFICAR PUNTOS
===================================================== */

function modificarPuntos(
    equipo,
    cantidad,
    historial
) {

    if (estado.terminada) {
        return;
    }


    if (equipo === 1) {

        estado.puntos1 +=
            cantidad;

        estado.puntos1 =
            Math.max(
                0,
                estado.puntos1
            );
    }


    if (equipo === 2) {

        estado.puntos2 +=
            cantidad;

        estado.puntos2 =
            Math.max(
                0,
                estado.puntos2
            );
    }


    if (historial) {

    agregarHistorial(
        equipo,
        historial
    );
}


    comprobarGanador();

    actualizarTodo();
}


/* =====================================================
   +1 / -1
===================================================== */

document
    .querySelectorAll(
        ".boton-punto"
    )
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                if (estado.terminada) {
                    return;
                }


                const equipo =
                    Number(
                        boton.dataset.equipo
                    );


                const sumar =
                    boton.classList
                        .contains(
                            "sumar"
                        );


                const puntosActuales =
                    equipo === 1
                        ? estado.puntos1
                        : estado.puntos2;


                if (
                    !sumar &&
                    puntosActuales <= 0
                ) {

                    return;
                }


                modificarPuntos(

                    equipo,

                    sumar
                        ? 1
                        : -1,

                    `Equipo ${equipo}: ${
                        sumar
                            ? "+1"
                            : "-1"
                    }`
                );
            }
        );
    });


/* =====================================================
   MENÚS
===================================================== */

document
    .querySelectorAll(
        ".boton-menu"
    )
    .forEach(boton => {

        boton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const menu =
                    boton.parentElement
                        ?.querySelector(
                            ".desplegable"
                        );


                if (!menu) {
                    return;
                }


                document
                    .querySelectorAll(
                        ".desplegable"
                    )
                    .forEach(otro => {

                        if (
                            otro !== menu
                        ) {

                            otro.classList.add(
                                "oculto"
                            );
                        }
                    });


                menu.classList.toggle(
                    "oculto"
                );
            }
        );
    });


/* =====================================================
   OPCIONES DE MENÚ
===================================================== */

document
    .querySelectorAll(
        ".desplegable button"
    )
    .forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                if (estado.terminada) {
                    return;
                }


                const equipo =
                    Number(
                        boton.dataset.equipo
                    );


                const nombre =
                    boton.dataset.nombre;


                if (
                    boton.dataset.falta ===
                    "true"
                ) {

                    resolverFalta(
                        equipo,
                        nombre
                    );

                } else {

                    const puntos =
                        Number(
                            boton.dataset.puntos
                        );


                    modificarPuntos(

                        equipo,

                        puntos,

                        `Equipo ${equipo}: ${nombre} · +${puntos}`
                    );
                }


                cerrarMenus();
            }
        );
    });


document.addEventListener(
    "click",
    cerrarMenus
);


function cerrarMenus() {

    document
        .querySelectorAll(
            ".desplegable"
        )
        .forEach(menu => {

            menu.classList.add(
                "oculto"
            );
        });
}


/* =====================================================
   FALTA
===================================================== */

function resolverFalta(
    equipo,
    nombre
) {

    const otro =
        equipo === 1
            ? 2
            : 1;


    const puntosOtro =
        otro === 1
            ? estado.puntos1
            : estado.puntos2;


    /*
        La falta se calcula según lo que le
        falta al rival para llegar al objetivo.
    */

    const necesarios =
        Math.max(
            estado.objetivo -
            puntosOtro,
            0
        );


    modificarPuntos(

        equipo,

        necesarios,

        `Equipo ${equipo}: ${nombre} · +${necesarios}`
    );
}


/* =====================================================
   HISTORIAL
===================================================== */

function agregarHistorial(
    equipo,
    texto
) {

    /*
        Como cada columna ya dice Equipo 1 / Equipo 2,
        sacamos "Equipo X:" del texto para no repetirlo.
    */

    const textoLimpio =
        texto.replace(
            /^Equipo \d+:\s*/,
            ""
        );


    if (equipo === 1) {

        estado.historial1.push(
            textoLimpio
        );

    } else {

        estado.historial2.push(
            textoLimpio
        );
    }


    actualizarHistorial();
}


function actualizarHistorial() {

    const historial1 =
        document.getElementById(
            "historial1"
        );

    const historial2 =
        document.getElementById(
            "historial2"
        );


    if (
        !historial1 ||
        !historial2
    ) {
        return;
    }


    function mostrarHistorial(
        elemento,
        jugadas
    ) {

        if (jugadas.length === 0) {

            elemento.innerHTML =
                `
                    <div class="historial-vacio">
                        Sin jugadas
                    </div>
                `;

            return;
        }


        elemento.innerHTML =
            jugadas
                .map(jugada =>
                    `
                        <div class="entrada">
                            ${jugada}
                        </div>
                    `
                )
                .join("");
    }


    mostrarHistorial(
        historial1,
        estado.historial1
    );

    mostrarHistorial(
        historial2,
        estado.historial2
    );
}


/* =====================================================
   HISTORIAL
===================================================== */

const botonHistorial =
    document.getElementById(
        "botonHistorial"
    );


if (botonHistorial) {

    botonHistorial.addEventListener(
        "click",
        () => {

            const historial =
                document.getElementById(
                    "historial"
                );


            if (historial) {

                historial.classList.toggle(
                    "oculto"
                );
            }
        }
    );
}


/* =====================================================
   GANADOR
===================================================== */

function comprobarGanador() {

    if (
        estado.puntos1 >=
        estado.objetivo
    ) {

        estado.puntos1 =
            estado.objetivo;

        terminarPartida(1);

        return;
    }


    if (
        estado.puntos2 >=
        estado.objetivo
    ) {

        estado.puntos2 =
            estado.objetivo;

        terminarPartida(2);
    }
}


/* =====================================================
   TERMINAR PARTIDA
===================================================== */

function terminarPartida(
    ganador
) {

    if (estado.terminada) {
        return;
    }


    estado.terminada = true;


    /* FICHAS */

    if (
        estado.apuestas &&
        estado.apuesta1 > 0 &&
        estado.apuesta2 > 0 &&
        estado.apuesta1 ===
        estado.apuesta2
    ) {

        const cantidad =
            estado.apuesta1;


        if (ganador === 1) {

            estado.fichas1 +=
                cantidad;

            estado.fichas2 =
                Math.max(
                    0,
                    estado.fichas2 -
                    cantidad
                );

        } else {

            estado.fichas2 +=
                cantidad;

            estado.fichas1 =
                Math.max(
                    0,
                    estado.fichas1 -
                    cantidad
                );
        }
    }


    const resultado1 =
        document.getElementById(
            "resultado1"
        );

    const resultado2 =
        document.getElementById(
            "resultado2"
        );

    const fichasFinal1 =
        document.getElementById(
            "fichasFinal1"
        );

    const fichasFinal2 =
        document.getElementById(
            "fichasFinal2"
        );

    const textoGanador =
        document.getElementById(
            "textoGanador"
        );


    if (resultado1) {

        resultado1.textContent =
            estado.puntos1;
    }


    if (resultado2) {

        resultado2.textContent =
            estado.puntos2;
    }


    if (fichasFinal1) {

        fichasFinal1.textContent =
            estado.fichas1;
    }


    if (fichasFinal2) {

        fichasFinal2.textContent =
            estado.fichas2;
    }


    if (textoGanador) {

        textoGanador.textContent =
            `Ganó el Equipo ${ganador}`;
    }


    mostrarPantalla(
        "ganador"
    );
}


/* =====================================================
   NUEVA PARTIDA
===================================================== */

function nuevaPartida() {

    estado.puntos1 = 0;

    estado.puntos2 = 0;

    estado.apuesta1 = 0;

    estado.apuesta2 = 0;

    estado.historial1 = [];

    estado.historial2 = [];

    estado.terminada = false;


    document
        .querySelectorAll(
            ".apuesta"
        )
        .forEach(boton => {

            boton.classList.remove(
                "seleccionado"
            );
        });


    const apuesta1Texto =
        document.getElementById(
            "apuesta1Texto"
        );

    const apuesta2Texto =
        document.getElementById(
            "apuesta2Texto"
        );


    if (apuesta1Texto) {

        apuesta1Texto.textContent =
            "Sin apuesta";
    }


    if (apuesta2Texto) {

        apuesta2Texto.textContent =
            "Sin apuesta";
    }

    borrarPartidaGuardada();

    actualizarTodo();

    mostrarPantalla(1);
}


/* =====================================================
   NUEVA PARTIDA
===================================================== */

const nuevaPartidaBoton =
    document.getElementById(
        "nuevaPartida"
    );


if (nuevaPartidaBoton) {

    nuevaPartidaBoton.addEventListener(
        "click",
        nuevaPartida
    );
}


const nuevaPartidaGanador =
    document.getElementById(
        "nuevaPartidaGanador"
    );


if (nuevaPartidaGanador) {

    nuevaPartidaGanador.addEventListener(
        "click",
        nuevaPartida
    );
}


/* =====================================================
   INICIO
===================================================== */

const jugadorInicial =
    document.querySelector(
        '.jugadores[data-jugadores="1"]'
    );


if (jugadorInicial) {

    jugadorInicial.classList.add(
        "seleccionado"
    );
}


const objetivoInicial =
    document.querySelector(
        '.objetivo[data-objetivo="15"]'
    );


if (objetivoInicial) {

    objetivoInicial.classList.add(
        "seleccionado"
    );
}


const apuestasInicial =
    document.querySelector(
        '.apuestas[data-apuestas="si"]'
    );


if (apuestasInicial) {

    apuestasInicial.classList.add(
        "seleccionado"
    );
}


if (
    cargarPartidaGuardada()
) {

    actualizarTodo();

    mostrarPantalla(4);

} else {

    actualizarTodo();
}


/* =====================================================
   PWA
===================================================== */

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "📱 Anotador de Truco instalado"
        );


        if (
            typeof gtag ===
            "function"
        ) {

            gtag(
                "event",
                "pwa_installed"
            );
        }
    }
);