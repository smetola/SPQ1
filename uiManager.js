// Contenido para: uiManager.js

import { generarLotePrueba } from './logic/attributeGenerator.js';

// Almacén para las referencias del DOM
let refs = {};
let logic = {}; // Almacén para la lógica (para el clic de la tarjeta)

/**
 * Inicializa el manager de UI con las referencias del DOM y la lógica.
 */
export function init(elementRefs, logicHandlers) {
    refs = elementRefs;
    logic = logicHandlers;
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
}

export function ocultarPantallaHistoria() {
    refs.storyScreen.style.display = 'none';
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
        refs.btnEmpezarPartida.style.display = esAnfitrionEsteJugador ? 'block' : 'none';
    }
}

/**
 * ¡MODIFICADO!
 * Ya no acepta 'rondaActual'. El texto es genérico.
 */
export function mostrarModalAsignacion(atributo) {
    refs.modalAsignarTitulo.textContent = "FASE DE ASIGNACIÓN";
    refs.modalAtributoTexto.textContent = atributo;
    refs.modalAsignarAtributo.style.display = 'flex';
    
    refs.gameRondaTitulo.textContent = "FASE DE ASIGNACIÓN";
    refs.gameRondaInstruccion.textContent = "Desliza y pulsa en un personaje para asignarle tu atributo.";
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
 * Ya no acepta 'rondaActual'. El texto es genérico.
 */
export function mostrarFaseDebate() {
    refs.gameRondaTitulo.textContent = "DEBATE Y VOTACIÓN";
    refs.gameRondaInstruccion.textContent = "¡Hora de debatir! Selecciona a quién eliminar y confirma tu voto.";
    
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

export function gestionarBotonConfirmar(mostrar, confirmado, seleccionado) {
    const btn = refs.btnConfirmarVoto;
    if (!btn) return;

    if (!mostrar) {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = 'block';

    if (confirmado) {
        btn.disabled = true;
        btn.textContent = "[ VOTO CONFIRMADO ]";
        btn.classList.add('locked');
    } else if (seleccionado) {
        btn.disabled = false;
        btn.textContent = "[ CONFIRMAR VOTO ]";
        btn.classList.remove('locked');
    } else {
        btn.disabled = true;
        btn.textContent = "[ SELECCIONA UN PERSONAJE ]";
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

