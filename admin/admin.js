"use strict";
const API_URL = "https://anotador-truco-backend.onrender.com";

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
        document.getElementById("listaDispositivos")

};


// =====================================================
// FILTROS
// =====================================================

const filtros =
    document.querySelectorAll(".filtro");


filtros.forEach(filtro => {

    filtro.addEventListener("click", () => {

        filtros.forEach(otro => {
            otro.classList.remove("activo");
        });

        filtro.classList.add("activo");

        const dias =
            Number(filtro.dataset.dias);

        cargarDatos(dias);

    });

});


// =====================================================
// CARGAR DATOS
// =====================================================

async function cargarDatos(dias) {

    try {

        // =================================================
        // MOSTRAR CARGANDO
        // =================================================

        elementos.visitas.textContent = "…";
        elementos.usuarios.textContent = "…";
        elementos.instalaciones.textContent = "…";
        elementos.instalacionesPwa.textContent = "…";
        elementos.activos.textContent = "…";


        // =================================================
        // CONSULTAS AL BACKEND
        // =================================================

        const [
    respuestaUsuarios,
    respuestaVisitas,
    respuestaInstalaciones,
    respuestaGrafico,
    respuestaPaises,
    respuestaDispositivos,
    respuestaActivos
] = await Promise.all([

    fetch(
        `${API_URL}/api/usuarios?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/visitas?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/instalaciones?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/grafico?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/paises?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/dispositivos?dias=${dias}`
    ),

    fetch(
        `${API_URL}/api/activos`
    )

]);


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
            !respuestaActivos.ok
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


        // =================================================
        // MOSTRAR TARJETAS
        // =================================================

        elementos.usuarios.textContent =
            Number(
                usuarios.usuarios
            ).toLocaleString("es-AR");


        elementos.visitas.textContent =
            Number(
                visitas.visitas
            ).toLocaleString("es-AR");


        elementos.instalaciones.textContent =
            Number(
                instalaciones.instalaciones
            ).toLocaleString("es-AR");


        elementos.instalacionesPwa.textContent =
            Number(
                instalaciones.instalaciones
            ).toLocaleString("es-AR");


        // =================================================
        // USUARIOS ACTIVOS AHORA
        // =================================================

        elementos.activos.textContent =
            Number(
                activos.activos
            ).toLocaleString("es-AR");


        elementos.periodo.textContent =
            `${dias} días`;


        // =================================================
        // CREAR GRÁFICO
        // =================================================

        crearGrafico(
            datosGrafico.grafico || []
        );


        // =================================================
        // CREAR PAÍSES
        // =================================================

        crearPaises(
            datosPaises.paises || []
        );


        // =================================================
        // CREAR DISPOSITIVOS
        // =================================================

        crearDispositivos(
            datosDispositivos.dispositivos || []
        );


    } catch (error) {

        console.error(
            "❌ Error cargando datos:",
            error
        );


        elementos.visitas.textContent =
            "Error";

        elementos.usuarios.textContent =
            "Error";

        elementos.instalaciones.textContent =
            "Error";

        elementos.instalacionesPwa.textContent =
            "Error";

        elementos.activos.textContent =
            "Error";

    }

}


// =====================================================
// CREAR GRÁFICO
// =====================================================

function crearGrafico(datosGrafico) {

    elementos.grafico.innerHTML = "";


    if (!datosGrafico.length) {

        const mensaje =
            document.createElement("div");

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
                    Number(dato.visitas) || 0
            )
        );


    datosGrafico.forEach(dato => {

        const barra =
            document.createElement("div");

        barra.className =
            "barra";


        const visitas =
            Number(dato.visitas) || 0;


        const porcentaje =
            maximo > 0
                ? (visitas / maximo) * 100
                : 0;


        barra.style.height =
            `${porcentaje}%`;


        const numero =
            document.createElement("span");

        numero.textContent =
            visitas;


        const etiqueta =
            document.createElement("small");


        const fecha =
            String(dato.dia);


        if (fecha.length === 8) {

            etiqueta.textContent =
                `${fecha.slice(6, 8)}/${fecha.slice(4, 6)}`;

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

    });

}


// =====================================================
// CREAR PAÍSES
// =====================================================

function crearPaises(paises) {

    elementos.listaPaises.innerHTML = "";


    if (!paises.length) {

        elementos.listaPaises.innerHTML = `
            <div class="fila">
                <span>No hay datos disponibles</span>
                <strong>0%</strong>
            </div>
        `;

        return;

    }


    const total =
        paises.reduce(
            (suma, pais) =>
                suma +
                (Number(pais.usuarios) || 0),
            0
        );


    paises.forEach(pais => {

        const porcentaje =
            total > 0
                ? Math.round(
                    (
                        (Number(pais.usuarios) || 0)
                        / total
                    ) * 100
                )
                : 0;


        const fila =
            document.createElement("div");

        fila.className =
            "fila";


        const nombre =
            document.createElement("span");

        nombre.textContent =
            pais.pais === "(not set)"
                ? "🌎 Ubicación desconocida"
                : `🌎 ${pais.pais}`;


        const porcentajeElemento =
            document.createElement("strong");

        porcentajeElemento.textContent =
            `${porcentaje}%`;


        fila.appendChild(
            nombre
        );

        fila.appendChild(
            porcentajeElemento
        );


        elementos.listaPaises.appendChild(
            fila
        );

    });

}


// =====================================================
// CREAR DISPOSITIVOS
// =====================================================

function crearDispositivos(dispositivos) {

    elementos.listaDispositivos.innerHTML = "";


    if (!dispositivos.length) {

        elementos.listaDispositivos.innerHTML = `
            <div class="dispositivo">
                <span>❓</span>
                <strong>0%</strong>
                <small>Sin datos</small>
            </div>
        `;

        return;

    }


    const total =
        dispositivos.reduce(
            (suma, dispositivo) =>
                suma +
                (Number(dispositivo.usuarios) || 0),
            0
        );


    dispositivos.forEach(dispositivo => {

        const porcentaje =
            total > 0
                ? Math.round(
                    (
                        (Number(dispositivo.usuarios) || 0)
                        / total
                    ) * 100
                )
                : 0;


        // =================================================
        // INFORMACIÓN DEL DISPOSITIVO
        // =================================================

        let icono = "❓";
        let nombre = "Desconocido";


        if (
            dispositivo.dispositivo === "mobile"
        ) {

            icono = "📱";
            nombre = "Celular";

        }


        if (
            dispositivo.dispositivo === "desktop"
        ) {

            icono = "💻";
            nombre = "PC";

        }


        if (
            dispositivo.dispositivo === "tablet"
        ) {

            icono = "📟";
            nombre = "Tablet";

        }


        if (
            dispositivo.dispositivo === "(not set)"
        ) {

            icono = "❓";
            nombre = "Desconocido";

        }


        // =================================================
        // CREAR ELEMENTO
        // =================================================

        const elemento =
            document.createElement("div");

        elemento.className =
            "dispositivo";


        elemento.innerHTML = `
            <span>${icono}</span>
            <strong>${porcentaje}%</strong>
            <small>${nombre}</small>
        `;


        elementos.listaDispositivos.appendChild(
            elemento
        );

    });

}


// =====================================================
// INICIO
// =====================================================

cargarDatos(7);