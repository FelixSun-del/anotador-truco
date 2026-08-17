"use strict";


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

    historial: [],

    terminada: false

};


/* =====================================================
   PANTALLAS
===================================================== */

const pantallas = {

    1: document.getElementById("pantalla1"),

    2: document.getElementById("pantalla2"),

    3: document.getElementById("pantalla3"),

    4: document.getElementById("pantalla4"),

    5: document.getElementById("pantalla5"),

    ganador: document.getElementById("pantallaGanador")

};


function mostrarPantalla(numero) {

    Object.values(pantallas).forEach(pantalla => {

        if (pantalla) {

            pantalla.classList.add("oculto");

        }

    });


    if (pantallas[numero]) {

        pantallas[numero].classList.remove("oculto");

    }

}


/* =====================================================
   JUGADORES
===================================================== */

document
    .querySelectorAll(".jugadores")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            document
                .querySelectorAll(".jugadores")
                .forEach(b => {

                    b.classList.remove("seleccionado");

                });


            boton.classList.add("seleccionado");

            estado.jugadores =
                Number(boton.dataset.jugadores);

        });

    });


/* =====================================================
   OBJETIVO
===================================================== */

document
    .querySelectorAll(".objetivo")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            document
                .querySelectorAll(".objetivo")
                .forEach(b => {

                    b.classList.remove("seleccionado");

                });


            boton.classList.add("seleccionado");

            estado.objetivo =
                Number(boton.dataset.objetivo);

        });

    });


/* =====================================================
   APUESTAS SÍ / NO
===================================================== */

document
    .querySelectorAll(".apuestas")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            document
                .querySelectorAll(".apuestas")
                .forEach(b => {

                    b.classList.remove("seleccionado");

                });


            boton.classList.add("seleccionado");

            estado.apuestas =
                boton.dataset.apuestas === "si";

        });

    });


/* =====================================================
   PESTAÑA 1 → 2
===================================================== */

document
    .getElementById("siguiente1")
    .addEventListener("click", () => {

        mostrarPantalla(2);

    });


/* =====================================================
   PESTAÑA 1 → REGLAS
===================================================== */

document
    .getElementById("verReglas")
    .addEventListener("click", () => {

        mostrarPantalla(5);

    });


/* =====================================================
   REGLAS → PESTAÑA 1
===================================================== */

document
    .getElementById("volverReglas")
    .addEventListener("click", () => {

        mostrarPantalla(1);

    });


/* =====================================================
   PESTAÑA 2 → 3 O 4
===================================================== */

const siguiente2 = document.getElementById("siguiente2");

if (siguiente2) {

    siguiente2.addEventListener("click", function () {

        console.log("Siguiente 2 presionado");
        console.log("Apuestas:", estado.apuestas);

        if (estado.apuestas === true) {

            actualizarFichas();
            mostrarPantalla(3);

        } else {

            iniciarPartida();

        }

    });

}


/* =====================================================
   VOLVER 2 → 1
===================================================== */

const volver2 = document.getElementById("volver2");

if (volver2) {

    volver2.addEventListener("click", function () {

        mostrarPantalla(1);

    });

}


/* =====================================================
   APUESTAS PESTAÑA 3
===================================================== */

document
    .querySelectorAll(".apuesta")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            const equipo =
                Number(boton.dataset.equipo);

            const cantidad =
                Number(boton.dataset.apuesta);


            const fichas =
                equipo === 1
                    ? estado.fichas1
                    : estado.fichas2;


            if (cantidad > fichas) {

                alert(
                    "Ese equipo no tiene suficientes fichas."
                );

                return;

            }


            if (equipo === 1) {

                estado.apuesta1 = cantidad;

            } else {

                estado.apuesta2 = cantidad;

            }


            document
                .querySelectorAll(
                    `.apuesta[data-equipo="${equipo}"]`
                )
                .forEach(b => {

                    b.classList.remove("seleccionado");

                });


            boton.classList.add("seleccionado");


            const texto =
                document.getElementById(
                    `apuesta${equipo}Texto`
                );


            if (texto) {

                texto.textContent =
                    `Apuesta: ${cantidad} fichas`;

            }

        });

    });


/* =====================================================
   REINICIAR FICHAS
===================================================== */

document
    .getElementById("reiniciarFichas")
    .addEventListener("click", () => {

        estado.fichas1 = 100;

        estado.fichas2 = 100;

        estado.apuesta1 = 0;

        estado.apuesta2 = 0;


        document
            .querySelectorAll(".apuesta")
            .forEach(boton => {

                boton.classList.remove("seleccionado");

            });


        document
            .getElementById("apuesta1Texto")
            .textContent = "Sin apuesta";


        document
            .getElementById("apuesta2Texto")
            .textContent = "Sin apuesta";


        actualizarFichas();

    });


/* =====================================================
   VOLVER 3 → 2
===================================================== */

const volver3 = document.getElementById("volver3");

if (volver3) {

    volver3.addEventListener("click", function () {

        mostrarPantalla(2);

    });

}


/* =====================================================
   PESTAÑA 3 → 4
===================================================== */

const siguiente3 = document.getElementById("siguiente3");

if (siguiente3) {

    siguiente3.addEventListener("click", function () {

        console.log("Siguiente 3 presionado");

        console.log(
            "Apuesta equipo 1:",
            estado.apuesta1
        );

        console.log(
            "Apuesta equipo 2:",
            estado.apuesta2
        );


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

    });

}


/* =====================================================
   INICIAR PARTIDA
===================================================== */

function iniciarPartida() {

    estado.puntos1 = 0;

    estado.puntos2 = 0;

    estado.historial = [];

    estado.terminada = false;

    actualizarTodo();

    mostrarPantalla(4);

}


/* =====================================================
   ACTUALIZAR FICHAS
===================================================== */

function actualizarFichas() {

    document
        .getElementById("fichasConfig1")
        .textContent = estado.fichas1;


    document
        .getElementById("fichasConfig2")
        .textContent = estado.fichas2;

}


/* =====================================================
   GENERAR PALITOS
===================================================== */

function generarPalitos(puntos) {

    let html = "";

    const gruposDeCinco =
        Math.floor(puntos / 5);

    const resto =
        puntos % 5;


    /* =================================================
       CADA GRUPO DE 5

       1 → |
       2 → |__
       3 → |__|
       4 → cuadrado completo
       5 → cuadrado + diagonal
    ================================================= */

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


    /* =================================================
       RESTO

       1 → |
       2 → |__
       3 → |__|
       4 → cuadrado
    ================================================= */

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

    document
        .getElementById("puntos1")
        .innerHTML =
        generarPalitos(estado.puntos1);


    document
        .getElementById("puntos2")
        .innerHTML =
        generarPalitos(estado.puntos2);


    document
        .getElementById("infoPartida")
        .textContent =
        `${estado.jugadores} vs ${estado.jugadores} · A ${estado.objetivo}`;


    document
        .getElementById("objetivoTexto")
        .textContent =
        `Objetivo: ${estado.objetivo} puntos`;


    actualizarFichas();

    actualizarHistorial();

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

        estado.puntos1 += cantidad;

        estado.puntos1 =
            Math.max(0, estado.puntos1);

    }


    if (equipo === 2) {

        estado.puntos2 += cantidad;

        estado.puntos2 =
            Math.max(0, estado.puntos2);

    }


    if (historial) {

        agregarHistorial(historial);

    }


    comprobarGanador();

    actualizarTodo();

}


/* =====================================================
   +1 / -1
===================================================== */

document
    .querySelectorAll(".boton-punto")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            const equipo =
                Number(boton.dataset.equipo);

            const sumar =
                boton.classList.contains("sumar");


            if (
                !sumar &&
                (
                    equipo === 1
                        ? estado.puntos1 <= 0
                        : estado.puntos2 <= 0
                )
            ) {

                return;

            }


            modificarPuntos(

                equipo,

                sumar ? 1 : -1,

                `Equipo ${equipo}: ${
                    sumar ? "+1" : "-1"
                }`

            );

        });

    });


/* =====================================================
   MENÚS DEL MARCADOR
===================================================== */

document
    .querySelectorAll(".boton-menu")
    .forEach(boton => {

        boton.addEventListener("click", event => {

            event.stopPropagation();


            const menu =
                boton.parentElement
                    .querySelector(".desplegable");


            document
                .querySelectorAll(".desplegable")
                .forEach(otro => {

                    if (otro !== menu) {

                        otro.classList.add("oculto");

                    }

                });


            menu.classList.toggle("oculto");

        });

    });


document
    .querySelectorAll(".desplegable button")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            if (estado.terminada) {

                return;

            }


            const equipo =
                Number(boton.dataset.equipo);

            const nombre =
                boton.dataset.nombre;


            if (
                boton.dataset.falta === "true"
            ) {

                resolverFalta(
                    equipo,
                    nombre
                );

            } else {

                modificarPuntos(

                    equipo,

                    Number(
                        boton.dataset.puntos
                    ),

                    `Equipo ${equipo}: ${nombre} · +${
                        boton.dataset.puntos
                    }`

                );

            }


            cerrarMenus();

        });

    });


document.addEventListener(
    "click",
    cerrarMenus
);


function cerrarMenus() {

    document
        .querySelectorAll(".desplegable")
        .forEach(menu => {

            menu.classList.add("oculto");

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
        equipo === 1 ? 2 : 1;


    const puntosOtro =
        otro === 1
            ? estado.puntos1
            : estado.puntos2;


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

function agregarHistorial(texto) {

    estado.historial.push(texto);

    actualizarHistorial();

}


function actualizarHistorial() {

    const historial =
        document.getElementById("historial");


    if (!historial) {

        return;

    }


    if (
        estado.historial.length === 0
    ) {

        historial.innerHTML =
            "Sin jugadas todavía";

        return;

    }


    historial.innerHTML =
        estado.historial
            .map(
                jugada =>
                    `<div class="entrada">${jugada}</div>`
            )
            .join("");

}


/* =====================================================
   BOTÓN HISTORIAL
===================================================== */

document
    .getElementById("botonHistorial")
    .addEventListener("click", () => {

        document
            .getElementById("historial")
            .classList.toggle("oculto");

    });


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


function terminarPartida(ganador) {

    estado.terminada = true;


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

            estado.fichas1 += cantidad;

            estado.fichas2 =
                Math.max(
                    0,
                    estado.fichas2 -
                    cantidad
                );

        } else {

            estado.fichas2 += cantidad;

            estado.fichas1 =
                Math.max(
                    0,
                    estado.fichas1 -
                    cantidad
                );

        }

    }


    document
        .getElementById("resultado1")
        .textContent =
        estado.puntos1;


    document
        .getElementById("resultado2")
        .textContent =
        estado.puntos2;


    document
        .getElementById("fichasFinal1")
        .textContent =
        estado.fichas1;


    document
        .getElementById("fichasFinal2")
        .textContent =
        estado.fichas2;


    document
        .getElementById("textoGanador")
        .textContent =
        `Ganó el Equipo ${ganador}`;


    mostrarPantalla("ganador");

}


/* =====================================================
   NUEVA PARTIDA
===================================================== */

function nuevaPartida() {

    estado.puntos1 = 0;

    estado.puntos2 = 0;

    estado.apuesta1 = 0;

    estado.apuesta2 = 0;

    estado.historial = [];

    estado.terminada = false;


    document
        .querySelectorAll(".apuesta")
        .forEach(boton => {

            boton.classList.remove(
                "seleccionado"
            );

        });


    document
        .getElementById("apuesta1Texto")
        .textContent =
        "Sin apuesta";


    document
        .getElementById("apuesta2Texto")
        .textContent =
        "Sin apuesta";


    actualizarTodo();

    mostrarPantalla(1);

}


document
    .getElementById("nuevaPartida")
    .addEventListener(
        "click",
        nuevaPartida
    );


document
    .getElementById("nuevaPartidaGanador")
    .addEventListener(
        "click",
        nuevaPartida
    );


/* =====================================================
   MENÚS DE REGLAS
===================================================== */

document
    .querySelectorAll(".boton-regla")
    .forEach(boton => {

        boton.addEventListener("click", event => {

            event.stopPropagation();


            const contenido =
                boton.nextElementSibling;


            const flecha =
                boton.querySelector("span");


            if (!contenido) {

                return;

            }


            contenido.classList.toggle("oculto");


            if (
                contenido.classList.contains("oculto")
            ) {

                if (flecha) {

                    flecha.textContent = "▼";

                }

            } else {

                if (flecha) {

                    flecha.textContent = "▲";

                }

            }

        });

    });


/* =====================================================
   INICIO
===================================================== */

document
    .querySelector(
        '.jugadores[data-jugadores="1"]'
    )
    .classList.add("seleccionado");


document
    .querySelector(
        '.objetivo[data-objetivo="15"]'
    )
    .classList.add("seleccionado");


actualizarTodo();


/* =====================================================
   DETECTAR INSTALACIÓN DE LA PWA
===================================================== */

window.addEventListener("appinstalled", () => {

    console.log("📱 Anotador de Truco instalado");

    if (typeof gtag === "function") {

        gtag("event", "pwa_installed");

    }

});