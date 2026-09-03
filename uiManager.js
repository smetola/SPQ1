// Contenido para: uiManager.js

import { generarLotePrueba, generarLotePruebaNombres } from './logic/attributeGenerator.js';
import * as VideoManager from './videoManager.js';

// Almacén para las referencias del DOM
let refs = {};
let logic = {}; // Almacén para la lógica (para el clic de la tarjeta)

/**
 * Inicializa el manager de UI con las referencias del DOM y la lógica.
 */
export function init(elementRefs, logicHandlers) {
    refs = elementRefs;
    logic = logicHandlers;
    
    // Inicializar el gestor de videos
    VideoManager.init();
}

// --- FUNCIONES DE NAVEGACIÓN ---

export function mostrarPantallaUnirse() {
    console.log("Mostrando pantalla para unirse...");
    refs.mainMenu.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.joinScreen.style.display = 'flex';
    refs.btnSalirPartida.style.display = 'none'; // Ocultar botón de salida
}

export function mostrarLobby(codigoSala) {
    console.log(`Mostrando lobby para la sala: ${codigoSala}`);
    refs.mainMenu.style.display = 'none';
    refs.joinScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'flex';
    refs.lobbyCodigoSala.textContent = codigoSala;
    refs.btnSalirPartida.style.display = 'none'; // Ocultar botón de salida en lobby

    ocultarModalResultados();
    ocultarModalFinJuego();
    VideoManager.hideVideo();
}

/**
 * ¡MODIFICADO!
 * Ya no acepta 'rondaActual'. El texto es genérico.
 */
export function mostrarPantallaJuego(esAnfitrion) {
    console.log("¡La partida ha empezado! Mostrando pantalla de juego.");
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'flex';
    refs.btnQuienSoy.style.display = 'block';
    refs.btnSalirPartida.style.display = 'flex'; // Mostrar botón de salida

    ocultarModalResultados();
    ocultarModalFinJuego();

    if (esAnfitrion) {
        // Texto genérico, solo se usa para la primera ronda
        refs.btnComenzarRonda.textContent = "[ COMENZAR RONDA ]";
        refs.btnComenzarRonda.style.display = 'block';
    }

    refs.gameRondaTitulo.textContent = "FASE DE CONOCIMIENTO";
    refs.gameRondaInstruccion.textContent = "Desliza para ver a todos los supervivientes.";
    VideoManager.hideVideo();
}

export function volverAlMenu() {
    console.log("Volviendo al menú principal...");

    refs.joinScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.storyScreen.style.display = 'none'; // Ocultar pantalla de historia
    refs.modalQuienSoy.style.display = 'none';
    refs.modalAsignarAtributo.style.display = 'none';
    ocultarModalResultados();
    ocultarModalFinJuego();
    refs.btnQuienSoy.style.display = 'none';
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnConfirmarVoto.style.display = 'none';
    refs.gameTimer.style.display = 'none';
    refs.btnSalirPartida.style.display = 'none'; // Ocultar botón de salida
    refs.mainMenu.style.display = 'flex';
    VideoManager.hideVideo();
}

// --- FUNCIONES DE OCULTAR ---

export function ocultarModalResultados() {
    if (refs.modalResultados) refs.modalResultados.style.display = 'none';
}

export function ocultarModalFinJuego() {
    if (refs.modalFinJuego) refs.modalFinJuego.style.display = 'none';
}

// --- FUNCIONES DE PANTALLA DE HISTORIA ---

export function mostrarPantallaHistoria(historia, esAnfitrion) {
    console.log("Mostrando pantalla de historia...");

    // Ocultar todas las demás pantallas
    refs.mainMenu.style.display = 'none';
    refs.joinScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';

    // Mostrar pantalla de historia
    refs.storyScreen.style.display = 'flex';
    refs.btnSalirPartida.style.display = 'flex';

    // Rellenar contenido
    refs.storyTitulo.textContent = historia.titulo;
    refs.storySubtitulo.textContent = historia.subtitulo;
    refs.storyTexto.innerHTML = historia.texto;

    // Mostrar botón solo para el anfitrión
    refs.btnComenzarViaje.style.display = esAnfitrion ? 'block' : 'none';

    // Cambiar el video de fondo según la historia
    VideoManager.setStoryVideo(historia.titulo);
}

export function ocultarPantallaHistoria() {
    refs.storyScreen.style.display = 'none';
    VideoManager.hideVideo();
}

// --- FUNCIONES DE MODAL CÓMO JUGAR ---

export function mostrarModalComoJugar() {
    refs.modalComoJugar.style.display = 'flex';
}

export function ocultarModalComoJugar() {
    refs.modalComoJugar.style.display = 'none';
}


// --- RESTO DE FUNCIONES ---

export function actualizarListaLobby(jugadores, jugadorIdActual) {
    refs.listaJugadoresLobby.innerHTML = '';
    if (jugadores) {
        let esAnfitrionEsteJugador = false;
        Object.entries(jugadores).forEach(([id, jugador]) => {
            const li = document.createElement('li');
            li.textContent = jugador.nombre;
            if (jugador.esAnfitrion) {
                li.textContent += " (Anfitrión 👑)";
                if (id === jugadorIdActual) esAnfitrionEsteJugador = true;
            }
            refs.listaJugadoresLobby.appendChild(li);
        });

        // Mostrar y habilitar botón si es anfitrión y hay suficientes jugadores
        if (esAnfitrionEsteJugador) {
            refs.btnEmpezarPartida.style.display = 'block';
            const numJugadores = Object.keys(jugadores).length;
            refs.btnEmpezarPartida.disabled = numJugadores < 2;
        } else {
            refs.btnEmpezarPartida.style.display = 'none';
        }
    }
}

/**
 * ¡MODIFICADO!
 * Ya no acepta 'rondaActual'. El texto es genérico.
 */
export function mostrarModalAsignacion(atributo, estoyVivo = true) {
    refs.modalAsignarTitulo.textContent = "FASE DE ASIGNACIÓN";
    refs.modalAtributoTexto.textContent = atributo;
    refs.modalAsignarAtributo.style.display = 'flex';

    // Añadir o quitar clase especial para muertos
    if (!estoyVivo) {
        refs.modalAsignarAtributo.classList.add('asignacion-opcional');
    } else {
        refs.modalAsignarAtributo.classList.remove('asignacion-opcional');
    }

    refs.gameRondaTitulo.textContent = "FASE DE ASIGNACIÓN";

    if (!estoyVivo) {
        refs.gameRondaInstruccion.textContent = "(OPCIONAL) Puedes asignar tu atributo si quieres, pero el debate comenzará sin ti si no lo haces.";
    } else {
        refs.gameRondaInstruccion.textContent = "Desliza y pulsa en un personaje para asignarle tu atributo.";
    }
}

export function mostrarModalQuienSoy(personaje) {
    construirModalPersonaje(personaje);
    refs.modalQuienSoy.style.display = 'flex';
}

export function actualizarCarousel(jugadores, miVotoActual, recuentoVotos) {
    refs.characterCarousel.innerHTML = '';
    const personajes = [];
    Object.entries(jugadores).forEach(([id, jugador]) => {
        if (jugador.personaje) {
            const personajeConId = { ...jugador.personaje, jugadorId: id };
            personajes.push(personajeConId);
        }
    });

    personajes.sort((a, b) => (a.estaVivo === b.estaVivo) ? 0 : a.estaVivo ? -1 : 1);

    personajes.forEach(personaje => {
        refs.characterCarousel.appendChild(
            crearTarjetaPersonaje(personaje, logic.handleCardClick, miVotoActual, recuentoVotos)
        );
    });
}

/**
 * ¡MODIFICADO!
 * Ya no acepta 'rondaActual'. El texto es genérico.
 */
export function mostrarBotonComenzarDebate() {
    refs.btnComenzarDebate.textContent = "[ COMENZAR DEBATE ]";
    refs.btnComenzarDebate.style.display = 'block';
}

export function ocultarBotonComenzarDebate() {
    refs.btnComenzarDebate.style.display = 'none';
}

export function ocultarBotonComenzarRonda() {
    refs.btnComenzarRonda.style.display = 'none';
}

/**
 * ¡MODIFICADO!
 * Si es ronda final (2 vivos), muestra mensaje especial para que los muertos sepan que pueden votar.
 */
export function mostrarFaseDebate(jugadoresVivos = null, estoyVivo = true) {
    const esRondaFinal = jugadoresVivos !== null && jugadoresVivos.length === 2;

    refs.gameRondaTitulo.textContent = "DEBATE Y VOTACIÓN";

    if (esRondaFinal && !estoyVivo) {
        refs.gameRondaInstruccion.textContent = "¡RONDA FINAL! Los caídos tienen voz. Tu voto decidirá el destino de los últimos supervivientes.";
    } else if (esRondaFinal) {
        refs.gameRondaInstruccion.textContent = "¡RONDA FINAL! Quedan solo 2 supervivientes. Los caídos decidirán vuestro destino.";
    } else {
        refs.gameRondaInstruccion.textContent = "¡Hora de debatir! Selecciona a quién eliminar y confirma tu voto.";
    }

    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.gameTimer.style.display = 'block';
}

export function mostrarPantallaFinJuego() {
    refs.gameRondaTitulo.textContent = "PARTIDA TERMINADA";
    refs.gameRondaInstruccion.textContent = "Este es el tablero final. ¡Solo puede quedar 1!";

    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnConfirmarVoto.style.display = 'none';
    refs.gameTimer.style.display = 'none';
}


export function actualizarTimer(segundosRestantes, mostrar = true) {
    if (!mostrar) {
        refs.gameTimer.style.display = 'none';
        return;
    }

    refs.gameTimer.style.display = 'block';

    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = Math.floor(segundosRestantes % 60);

    const minutosStr = minutos < 10 ? '0' + minutos : minutos;
    const segundosStr = segundos < 10 ? '0' + segundos : segundos;

    refs.gameTimer.textContent = `${minutosStr}:${segundosStr}`;
}

export function gestionarBotonConfirmar(mostrar, confirmado, seleccionado, estoyVivo = true, historiaActual = null, esRondaFinal = false) {
    const btn = refs.btnConfirmarVoto;
    if (!btn) return;

    if (!mostrar) {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = 'block';

    // Si el jugador está muerto y NO es ronda final, mostrar mensaje narrativo
    if (!estoyVivo && !esRondaFinal) {
        btn.disabled = true;

        // Solo generar el mensaje la primera vez que se bloquea el botón para evitar que parpadee
        // cada vez que otro jugador vota y Firebase actualiza el estado.
        if (!btn.classList.contains('mensaje-muerto')) {
            btn.classList.add('locked', 'mensaje-muerto');

            // Importar y seleccionar mensaje aleatorio según la historia
            import('./gameData.js').then(module => {
                const tituloHistoria = historiaActual?.titulo || null;
                const mensajeAleatorio = module.obtenerMensajeMuertoAleatorio(tituloHistoria);
                btn.textContent = mensajeAleatorio;
            });
        }
        return;
    }

    // Lógica normal para jugadores vivos (o muertos en ronda final)
    btn.classList.remove('mensaje-muerto');

    // Si es ronda final y el jugador está muerto, añadir indicador especial
    if (!estoyVivo && esRondaFinal) {
        btn.classList.add('voto-desde-mas-alla');
    } else {
        btn.classList.remove('voto-desde-mas-alla');
    }

    if (confirmado) {
        btn.disabled = true;
        btn.textContent = !estoyVivo && esRondaFinal
            ? "[ VOTO DESDE EL MÁS ALLÁ CONFIRMADO ]"
            : "[ VOTO CONFIRMADO ]";
        btn.classList.add('locked');
    } else if (seleccionado) {
        btn.disabled = false;
        btn.textContent = !estoyVivo && esRondaFinal
            ? "[ CONFIRMAR VOTO DESDE EL MÁS ALLÁ ]"
            : "[ CONFIRMAR VOTO ]";
        btn.classList.remove('locked');
    } else {
        btn.disabled = true;
        btn.textContent = !estoyVivo && esRondaFinal
            ? "[ SELECCIONA DESDE EL MÁS ALLÁ ]"
            : "[ SELECCIONA UN PERSONAJE ]";
        btn.classList.remove('locked');
    }
}

export function actualizarBotonHold(estado, duracionMs = 2000) {
    // Obsoleto
}

export function mostrarModalResultados(nombreEliminado, esAnfitrion) {
    if (!refs.modalResultados) return;

    if (nombreEliminado === "NADIE (EMPATE)") {
        refs.modalResultadosTitulo.textContent = "¡EMPATE!";
        refs.modalResultadosTexto.innerHTML = `Hubo un empate en la votación.
            <strong>NADIE</strong>
            ...ha sido eliminado. La tensión aumenta...`;
    } else {
        refs.modalResultadosTitulo.textContent = "RESULTADOS DE LA VOTACIÓN";
        refs.modalResultadosTexto.innerHTML = `Tras el debate, el grupo ha decidido que...
            <strong>${nombreEliminado.toUpperCase()}</strong>
            ...ha sido eliminado.`;
    }

    if (esAnfitrion) {
        refs.btnSiguienteRonda.style.display = 'block';
        refs.btnCerrarModalResultados.style.display = 'none';
    } else {
        refs.btnSiguienteRonda.style.display = 'none';
        refs.btnCerrarModalResultados.style.display = 'block';
    }

    refs.modalResultados.style.display = 'flex';
}

export function mostrarModalFinJuego(ganador, esAnfitrion) {
    if (!refs.modalFinJuego) return;

    ocultarModalResultados();

    if (ganador) {
        refs.modalGanadorTexto.innerHTML = `
            <span>El único superviviente es...</span>
            <strong>${ganador.nombrePersonaje.toUpperCase()}</strong>
            <span>controlado por...</span>
            <strong>${ganador.nombreJugador.toUpperCase()}</strong>
        `;
    } else {
        refs.modalGanadorTexto.innerHTML = `
            <span>¡Nadie ha sobrevivido!</span>
            <strong>EMPATE FINAL</strong>
        `;
    }

    refs.btnVerTablero.style.display = 'block';

    if (esAnfitrion) {
        refs.btnReiniciarLobby.style.display = 'block';
        refs.btnSalirAlMenu.style.display = 'none';
    } else {
        refs.btnReiniciarLobby.style.display = 'none';
        refs.btnSalirAlMenu.style.display = 'block';
    }

    refs.modalFinJuego.style.display = 'flex';
}


// --- FUNCIONES AUXILIARES DE UI (Privadas) ---

function crearTarjetaPersonaje(personaje, clickHandler, miVotoActual, recuentoVotos) {
    const card = document.createElement('div');
    card.className = 'character-card';

    if (!personaje.estaVivo) {
        card.classList.add('muerto');
    }

    if (personaje.jugadorId === miVotoActual) {
        card.classList.add('selected');
    }

    const atributosObj = personaje.atributosAsignados || {};
    const atributosHTML = Object.values(atributosObj);

    card.innerHTML = `
        <h4>${personaje.nombre.toUpperCase()}</h4>
        <span>Edad: ${personaje.edad}</span>
        <ul>
            <li>${personaje.atributoBasico}</li>
            ${atributosHTML.map(attr => `<li>${attr}</li>`).join('')}
        </ul>
    `;

    const numVotos = recuentoVotos[personaje.jugadorId] || 0;
    const voteCounter = document.createElement('div');
    voteCounter.className = 'vote-counter';
    if (numVotos === 0) {
        voteCounter.classList.add('hidden');
    }
    voteCounter.textContent = numVotos;
    card.appendChild(voteCounter);

    card.addEventListener('click', () => clickHandler(personaje));

    return card;
}

function construirModalPersonaje(personaje) {
    const atributosObj = personaje.atributosAsignados || {};
    const atributosHTML = Object.values(atributosObj);
    refs.modalMiPersonaje.innerHTML = `
        <h4>${personaje.nombre.toUpperCase()}</h4>
        <span>Edad: ${personaje.edad}</span>
        <ul>
            <li>${personaje.atributoBasico}</li>
            ${atributosHTML.map(attr => `<li>${attr}</li>`).join('')}
        </ul>
    `;
}
// --- FUNCIONES PARA MODAL DE TESTING DE ATRIBUTOS ---

let nivelActualTest = 'bronce'; // Nivel por defecto

/**
 * Muestra el modal de testing de atributos
 */
export function mostrarModalTestAtributos() {
    refs.modalTestAtributos.style.display = 'flex';
    nivelActualTest = 'bronce';
    actualizarBotonNivelActivo('bronce');
    renderizarLotePrueba('bronce');
}

/**
 * Oculta el modal de testing de atributos
 */
export function ocultarModalTestAtributos() {
    refs.modalTestAtributos.style.display = 'none';
}

/**
 * Cambia el nivel seleccionado en el test
 */
export function cambiarNivelTest(nivel) {
    nivelActualTest = nivel;
    actualizarBotonNivelActivo(nivel);
    renderizarLotePrueba(nivel);
}

/**
 * Regenera los atributos del nivel actual
 */
export function regenerarTestAtributos() {
    renderizarLotePrueba(nivelActualTest);
}

/**
 * Renderiza el lote de prueba para un nivel
 */
function renderizarLotePrueba(nivel) {
    const lote = generarLotePrueba(nivel, 15);

    // Actualizar tono
    document.getElementById('testTonoTexto').textContent = lote.tono;

    // Renderizar originales
    const listaOriginales = document.getElementById('testOriginalesLista');
    listaOriginales.innerHTML = lote.originales
        .map(attr => `<li>${attr}</li>`)
        .join('');

    // Renderizar generados
    const listaGenerados = document.getElementById('testGeneradosLista');
    listaGenerados.innerHTML = lote.generados
        .map(attr => `<li>${attr}</li>`)
        .join('');
}

/**
 * Actualiza el botón activo en el selector de niveles
 */
function actualizarBotonNivelActivo(nivel) {
    document.querySelectorAll('.btn-nivel-test').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.nivel === nivel) {
            btn.classList.add('active');
        }
    });
}

/* --- ================================= --- */
/* ---  MENSAJES DE ESPERA (NO ANFITRIÓN) --- */
/* --- ================================= --- */

/**
 * Muestra un mensaje de espera para jugadores que no son anfitrión
 * @param {string} mensaje - El texto del mensaje a mostrar
 */
export function mostrarMensajeEspera(mensaje) {
    refs.waitingMessageText.textContent = mensaje;
    refs.waitingMessage.style.display = 'block';
}

/**
 * Oculta el mensaje de espera
 */
export function ocultarMensajeEspera() {
    refs.waitingMessage.style.display = 'none';
}

/**
 * Muestra el mensaje según la fase actual (para jugadores no anfitrión)
 * @param {string} fase - La fase actual del juego
 */
export function actualizarMensajeEsperaSegunFase(fase) {
    const mensajes = {
        'conocimiento': 'Esperando a que el anfitrión comience la ronda...',
        'asignacion': 'Esperando a que se complete la fase de asignación...',
        'debate': 'Esperando a que todos terminen de debatir...',
        'votacion': 'Esperando a que todos voten...',
        'resultados': 'Esperando al anfitrión para la siguiente ronda...',
        'finJuego': 'Esperando al anfitrión...'
    };

    const mensaje = mensajes[fase] || 'Esperando...';
    mostrarMensajeEspera(mensaje);
}

/**
 * Cambia la pestaña activa en el modal de testing
 */
export function cambiarTabTest(tabId) {
    // Actualizar botones
    document.querySelectorAll('.btn-tab-test').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Actualizar contenido
    // Construimos el ID esperado: 'testTab' + 'Nombres' (Capitalizado)
    const targetId = 'testTab' + tabId.charAt(0).toUpperCase() + tabId.slice(1);

    document.querySelectorAll('.test-tab-content').forEach(content => {
        if (content.id === targetId) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // Si es la pestaña de nombres, cargar datos iniciales si está vacía
    if (tabId === 'nombres') {
        const lista = document.getElementById('testNombresComunes');
        if (lista && lista.children.length === 0) {
            regenerarTestNombres();
        }
    }
}

/**
 * Regenera los nombres de prueba
 */
export function regenerarTestNombres() {
    const lote = generarLotePruebaNombres(10);

    renderizarListaNombres('testNombresOriginales', lote.originales);
    renderizarListaNombres('testNombresComunes', lote.comunes);
    renderizarListaNombres('testNombresAntiguos', lote.antiguos);
    renderizarListaNombres('testNombresRaros', lote.raros);
}

function renderizarListaNombres(elementId, nombres) {
    const lista = document.getElementById(elementId);
    if (lista) {
        lista.innerHTML = nombres.map(n => `<li>${n}</li>`).join('');
    }
}

// --- FUNCIONES MODO DESARROLLADOR ---

let devModeEnabled = false;

export function toggleDevMode(enabled) {
    devModeEnabled = enabled;
    const devOverlay = document.getElementById('devOverlay');
    const btnAnadirBot = document.getElementById('btnAnadirBot');

    if (devOverlay) {
        devOverlay.style.display = enabled ? 'block' : 'none';
    }

    if (btnAnadirBot) {
        btnAnadirBot.style.display = enabled ? 'block' : 'none';
    }
    console.log("Modo Desarrollador:", enabled ? "ACTIVADO" : "DESACTIVADO");
}

export function updateDevOverlay(info) {
    if (!devModeEnabled) return;

    const content = document.getElementById('devContent');
    if (!content) return;

    let html = '';

    if (info.tier) {
        html += `<div>TIER: <strong>${info.tier.toUpperCase()}</strong></div>`;
    }
    if (info.fase) {
        html += `<div>FASE: ${info.fase.toUpperCase()}</div>`;
    }
    if (info.jugadorId) {
        html += `<div>ID: ${info.jugadorId.substring(0, 6)}...</div>`;
    }

    content.innerHTML = html;
}


// --- SELECTOR DE MODOS DE JUEGO (LOBBY) ---

/**
 * Muestra el selector de modos en el lobby.
 * Si es anfitrión, muestra los botones toggle interactivos.
 * Si no es anfitrión, muestra solo un indicador de texto con los modos seleccionados.
 * @param {boolean} esAnfitrion
 */
export function mostrarSelectorModos(esAnfitrion) {
    const selector = document.getElementById('modeSelector');
    const indicador = document.getElementById('modosActivosIndicador');

    if (esAnfitrion) {
        if (selector) selector.style.display = 'block';
        if (indicador) indicador.style.display = 'none';
    } else {
        if (selector) selector.style.display = 'none';
        if (indicador) indicador.style.display = 'block';
    }
}

/**
 * Oculta tanto el selector como el indicador de modos.
 */
export function ocultarSelectorModos() {
    const selector = document.getElementById('modeSelector');
    const indicador = document.getElementById('modosActivosIndicador');
    if (selector) selector.style.display = 'none';
    if (indicador) indicador.style.display = 'none';
}

/**
 * Actualiza la UI del selector de modos según los modos activos en Firebase.
 * Sincroniza los botones toggle del anfitrión y el texto del indicador de no-anfitriones.
 * @param {string[]} modosActivos - Array de IDs de modos activos
 */
export function actualizarModosVisuales(modosActivos) {
    const modos = modosActivos || [];

    // 1. Actualizar botones toggle del anfitrión
    const botones = document.querySelectorAll('.mode-toggle');
    botones.forEach(btn => {
        const modoId = btn.dataset.mode;
        if (modos.includes(modoId)) {
            btn.classList.add('activo');
        } else {
            btn.classList.remove('activo');
        }
    });

    // 2. Actualizar indicador de texto para no-anfitriones
    const textoEl = document.getElementById('modosActivosTexto');
    if (textoEl) {
        if (modos.length === 0) {
            textoEl.textContent = 'Clásico';
        } else {
            const ICONOS = {
                maldicion: '🔮 Maldición',
                poderes: '⚡ Poderes',
                alianzas: '💕 Alianzas',
                traidor: '🕵️ Traidor'
            };
            textoEl.textContent = modos.map(m => ICONOS[m] || m).join(' + ');
        }
    }
}


// --- MODAL DE EVENTO PARANORMAL (MODO MALDICIÓN) ---

/**
 * Muestra el modal de evento paranormal con los datos del evento.
 * @param {object} evento - Datos del evento: { nombre, categoria, icono, narrativa }
 * @param {boolean} esAnfitrion - Si true, muestra el botón "Continuar"
 */
export function mostrarModalEvento(evento, esAnfitrion) {
    const modal = document.getElementById('modalEvento');
    const icono = document.getElementById('eventoIcono');
    const titulo = document.getElementById('eventoTitulo');
    const narrativa = document.getElementById('eventoNarrativa');
    const btnContinuar = document.getElementById('btnContinuarEvento');

    if (!modal) return;

    // Rellenar datos del evento
    if (icono) icono.textContent = evento.icono || '🔮';
    if (titulo) titulo.textContent = evento.nombre || 'EVENTO PARANORMAL';
    if (narrativa) narrativa.textContent = evento.narrativa || 'Algo sucede...';

    // Solo el anfitrión ve el botón Continuar
    if (btnContinuar) {
        btnContinuar.style.display = esAnfitrion ? 'block' : 'none';
    }

    modal.style.display = 'flex';
}

/**
 * Oculta el modal de evento paranormal.
 */
export function ocultarModalEvento() {
    const modal = document.getElementById('modalEvento');
    if (modal) modal.style.display = 'none';
}


// --- INDICADOR DE TRAIDOR (MODO TRAIDOR) ---

/**
 * Muestra el indicador de rol de traidor (solo para el traidor).
 */
export function mostrarIndicadorTraidor() {
    const indicador = document.getElementById('traitorIndicador');
    if (indicador) indicador.style.display = 'block';
}

/**
 * Oculta el indicador de rol de traidor.
 */
export function ocultarIndicadorTraidor() {
    const indicador = document.getElementById('traitorIndicador');
    if (indicador) indicador.style.display = 'none';
}

/**
 * Muestra la revelación del traidor en la pantalla de fin de juego.
 * @param {string} nombreJugador - Nombre real del jugador traidor
 * @param {string} nombrePersonaje - Nombre del personaje del traidor
 * @param {boolean} fueEliminado - Si el traidor fue eliminado (victoria del traidor)
 */
export function mostrarRevelacionTraidor(nombreJugador, nombrePersonaje, fueEliminado) {
    // Buscar o crear el contenedor de revelación
    let reveal = document.getElementById('traitorReveal');
    if (!reveal) {
        reveal = document.createElement('div');
        reveal.id = 'traitorReveal';
        reveal.className = 'traitor-reveal';

        // Insertar en el modal de fin de juego
        const modalFinJuego = document.getElementById('modalFinJuego');
        if (modalFinJuego) {
            const modalContent = modalFinJuego.querySelector('.modal-content');
            if (modalContent) modalContent.appendChild(reveal);
        }
    }

    const resultado = fueEliminado
        ? '¡VICTORIA DEL TRAIDOR! Logró ser eliminado.'
        : 'El traidor NO logró su objetivo.';

    reveal.innerHTML = `
        <h4 class="traitor-reveal-title">🕵️ REVELACIÓN: EL TRAIDOR</h4>
        <p class="traitor-reveal-text">
            <strong>${nombreJugador}</strong> (${nombrePersonaje}) era el traidor.<br>
            ${resultado}
        </p>
    `;
    reveal.style.display = 'block';
}


// --- MODO ALIANZAS ---

/**
 * Muestra el modal de pacto mutuo con la lista de jugadores disponibles.
 * @param {object} jugadores - Jugadores de la partida
 * @param {string} miId - ID del jugador actual
 * @param {object} partida - Datos de la partida
 */
export function mostrarModalPacto(jugadores, miId, partida) {
    const modal = document.getElementById('modalPacto');
    const lista = document.getElementById('pactoListaJugadores');
    const estado = document.getElementById('pactoEstado');
    const btnSkip = document.getElementById('btnSkipPacto');

    if (!modal || !lista) return;

    // Comprobar si ya tengo pacto
    const pactos = partida.modoConfig?.alianzas?.pactos;
    if (pactos) {
        const tengoPackto = Object.values(pactos).some(p => 
            p.jugadorA === miId || p.jugadorB === miId
        );
        if (tengoPackto) {
            modal.style.display = 'none'; // Ya tengo pacto
            return;
        }
    }

    // Comprobar si ya he propuesto
    const propuestas = partida.modoConfig?.alianzas?.propuestas;
    if (propuestas && propuestas[miId]) {
        if (estado) {
            estado.style.display = 'block';
            estado.textContent = 'Esperando respuesta a tu propuesta de pacto...';
        }
        lista.innerHTML = '';
        if (btnSkip) btnSkip.style.display = 'none';
        modal.style.display = 'flex';
        return;
    }

    // Comprobar si alguien me ha propuesto
    if (propuestas) {
        const propuestaParaMi = Object.entries(propuestas).find(([_, p]) => p.a === miId);
        if (propuestaParaMi) {
            const [proponenteId] = propuestaParaMi;
            const proponente = jugadores[proponenteId];
            mostrarPropuestaPactoRecibida(proponente?.nombre || '???', proponenteId);
            modal.style.display = 'none'; // Ocultar el selector, mostrar la propuesta
            return;
        }
    }

    // Mostrar lista de jugadores para proponer pacto
    lista.innerHTML = '';
    if (estado) estado.style.display = 'none';
    if (btnSkip) btnSkip.style.display = 'block';

    Object.entries(jugadores).forEach(([id, j]) => {
        if (id === miId) return; // No mostrarme a mí mismo
        if (!j.personaje?.estaVivo) return; // Solo vivos

        const btn = document.createElement('button');
        btn.className = 'pacto-jugador-btn';
        btn.textContent = `💕 ${j.personaje.nombre}`;
        btn.dataset.jugadorId = id;
        btn.addEventListener('click', () => {
            import('../logic/allianceManager.js').then(AM => {
                AM.proponerPacto(miId, id);
                if (estado) {
                    estado.style.display = 'block';
                    estado.textContent = `Propuesta enviada a ${j.personaje.nombre}...`;
                }
                lista.innerHTML = '';
                if (btnSkip) btnSkip.style.display = 'none';
            });
        });
        lista.appendChild(btn);
    });

    modal.style.display = 'flex';
}

/**
 * Muestra el modal de propuesta de pacto recibida.
 */
export function mostrarPropuestaPactoRecibida(nombreProponente, proponenteId) {
    const modal = document.getElementById('modalPropuestaPacto');
    const texto = document.getElementById('propuestaPactoTexto');

    if (!modal) return;
    if (texto) texto.textContent = `${nombreProponente} quiere aliarse contigo. ¿Aceptas vincular vuestros destinos?`;

    // Guardar proponenteId para los botones
    modal.dataset.proponenteId = proponenteId;
    modal.style.display = 'flex';
}

/**
 * Oculta los modales de alianzas.
 */
export function ocultarModalesPacto() {
    const modal1 = document.getElementById('modalPacto');
    const modal2 = document.getElementById('modalPropuestaPacto');
    if (modal1) modal1.style.display = 'none';
    if (modal2) modal2.style.display = 'none';
}

/**
 * Actualiza el indicador de aliado durante el juego.
 * @param {string} jugadorId - Mi ID
 * @param {object} partida - Datos de la partida
 */
export function actualizarIndicadorAliado(jugadorId, partida) {
    const indicador = document.getElementById('aliadoIndicador');
    const nombreEl = document.getElementById('aliadoNombre');
    if (!indicador || !nombreEl) return;

    const pactos = partida.modoConfig?.alianzas?.pactos;
    if (!pactos) {
        indicador.style.display = 'none';
        return;
    }

    // Buscar si tengo aliado
    for (const pacto of Object.values(pactos)) {
        if (pacto.jugadorA === jugadorId || pacto.jugadorB === jugadorId) {
            const aliadoId = pacto.jugadorA === jugadorId ? pacto.jugadorB : pacto.jugadorA;
            const aliado = partida.jugadores?.[aliadoId];
            if (aliado?.personaje) {
                nombreEl.textContent = aliado.personaje.nombre;
                indicador.style.display = 'block';

                // Si el aliado está muerto, indicar peligro
                if (!aliado.personaje.estaVivo) {
                    indicador.style.borderColor = '#888';
                    indicador.style.color = '#888';
                    nombreEl.textContent = aliado.personaje.nombre + ' ☠️';
                }
                return;
            }
        }
    }

    indicador.style.display = 'none';
}


// --- MODO PODERES (TIENDA) ---

/**
 * Muestra la barra de energía y actualiza el valor.
 * @param {number} energia - Energía actual del jugador
 */
export function actualizarBarraEnergia(energia) {
    const barra = document.getElementById('poderBarraEnergia');
    const valor = document.getElementById('poderEnergiaValor');
    if (barra) barra.style.display = 'flex';
    if (valor) valor.textContent = energia;
}

/**
 * Oculta la barra de energía.
 */
export function ocultarBarraEnergia() {
    const barra = document.getElementById('poderBarraEnergia');
    if (barra) barra.style.display = 'none';
}

/**
 * Abre la tienda de poderes con el catálogo actualizado.
 * @param {Array} catalogo - Lista de poderes disponibles (de CATALOGO_PODERES)
 * @param {number} energiaActual - Energía del jugador
 * @param {object} poderesActivos - Poderes ya comprados del jugador
 * @param {Function} onComprar - Callback al hacer clic en un poder: fn(poderId)
 */
export function mostrarTienda(catalogo, energiaActual, poderesActivos, onComprar) {
    const modal = document.getElementById('modalTienda');
    const contenedor = document.getElementById('tiendaCatalogo');
    if (!modal || !contenedor) return;

    contenedor.innerHTML = '';

    catalogo.forEach(poder => {
        const yaComprado = poderesActivos?.[poder.id]?.activado;
        const sinEnergia = energiaActual < poder.coste;

        const card = document.createElement('div');
        card.className = 'tienda-poder-card';
        if (yaComprado) card.classList.add('poder-comprado');
        else if (sinEnergia) card.classList.add('poder-disabled');

        card.innerHTML = `
            <span class="poder-card-icono">${poder.icono}</span>
            <div class="poder-card-info">
                <div class="poder-card-nombre">${poder.nombre}</div>
                <div class="poder-card-desc">${poder.descripcion}</div>
            </div>
            <span class="poder-card-coste">⚡${poder.coste}</span>
        `;

        if (!yaComprado && !sinEnergia) {
            card.addEventListener('click', () => onComprar(poder.id));
        }

        contenedor.appendChild(card);
    });

    modal.style.display = 'flex';
}

/**
 * Cierra la tienda de poderes.
 */
export function cerrarTienda() {
    const modal = document.getElementById('modalTienda');
    if (modal) modal.style.display = 'none';
}
