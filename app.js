// Contenido para: app.js

import * as UIManager from './uiManager.js';
import * as GameLogic from './gameLogic.js';

// --- 1. OBTENER REFERENCIAS DEL DOM ---
const elementRefs = {
    mainMenu: document.getElementById('mainMenu'),
    lobbyScreen: document.getElementById('lobbyScreen'),
    joinScreen: document.getElementById('joinScreen'),
    gameScreen: document.getElementById('gameScreen'),
    
    btnCrearPartida: document.getElementById('btnCrearPartida'),
    btnUnirsePartida: document.getElementById('btnUnirsePartida'),
    
    btnEmpezarPartida: document.getElementById('btnEmpezarPartida'),
    btnSalirLobby: document.getElementById('btnSalirLobby'),
    lobbyCodigoSala: document.getElementById('lobbyCodigoSala'),
    listaJugadoresLobby: document.getElementById('listaJugadoresLobby'),
    
    btnConfirmarUnirse: document.getElementById('btnConfirmarUnirse'),
    btnCancelarUnirse: document.getElementById('btnCancelarUnirse'),
    inputNombre: document.getElementById('inputNombre'),
    inputCodigoSala: document.getElementById('inputCodigoSala'),
    
    gameRondaTitulo: document.getElementById('gameRondaTitulo'),
    gameRondaInstruccion: document.getElementById('gameRondaInstruccion'),
    characterCarousel: document.getElementById('characterCarousel'),
    btnQuienSoy: document.getElementById('btnQuienSoy'),

    // ¡NUEVO! Temporizador
    gameTimer: document.getElementById('gameTimer'),
    
    modalQuienSoy: document.getElementById('modalQuienSoy'),
    modalMiPersonaje: document.getElementById('modalMiPersonaje'),
    btnCerrarModal: document.getElementById('btnCerrarModal'),
    
    modalAsignarAtributo: document.getElementById('modalAsignarAtributo'),
    modalAsignarTitulo: document.getElementById('modalAsignarTitulo'),
    modalAtributoTexto: document.getElementById('modalAtributoTexto'),
    btnCerrarModalAsignar: document.getElementById('btnCerrarModalAsignar'),
    
    btnComenzarRonda: document.getElementById('btnComenzarRonda'),
    btnComenzarDebate: document.getElementById('btnComenzarDebate'),

    // ¡NUEVO! Botón de mantener pulsado
    btnHoldToVote: document.getElementById('btnHoldToVote'),
    btnHoldProgress: document.getElementById('btnHoldProgress'),
};

// --- 2. INICIALIZAR MÓDULOS ---

UIManager.init(elementRefs, {
    handleCardClick: (personaje) => GameLogic.handleCardClick(personaje)
});

GameLogic.init(database); // 'database' viene del script de Firebase en index.html


// --- 3. LÓGICA LOCAL (PULSACIÓN LARGA) ---
let holdTimer = null; // Temporizador para la pulsación larga
const HOLD_DURATION = 2000; // 2 segundos

function startHold() {
    // Inicia la animación visual
    UIManager.actualizarBotonHold('start', HOLD_DURATION);
    
    // Inicia el temporizador lógico
    holdTimer = setTimeout(() => {
        console.log("¡Pulsación larga completada!");
        GameLogic.comenzarFaseVotacion();
    }, HOLD_DURATION);
}

function cancelHold() {
    // Cancela la animación visual
    UIManager.actualizarBotonHold('cancel');
    
    // Cancela el temporizador lógico
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }
}


// --- 4. CONECTAR "ESCUCHADORES" DE EVENTOS ---

// Menú Principal
elementRefs.btnCrearPartida.addEventListener('click', GameLogic.crearNuevaPartida);
elementRefs.btnUnirsePartida.addEventListener('click', UIManager.mostrarPantallaUnirse);

// Pantalla Unirse
elementRefs.btnConfirmarUnirse.addEventListener('click', () => {
    const codigo = elementRefs.inputCodigoSala.value.toUpperCase();
    const nombre = elementRefs.inputNombre.value;
    GameLogic.unirseAPartida(codigo, nombre);
});
elementRefs.btnCancelarUnirse.addEventListener('click', GameLogic.handleSalir);

// Pantalla Lobby
elementRefs.btnEmpezarPartida.addEventListener('click', GameLogic.empezarPartida);
elementRefs.btnSalirLobby.addEventListener('click', GameLogic.handleSalir);

// Modales
elementRefs.btnCerrarModal.addEventListener('click', () => elementRefs.modalQuienSoy.style.display = 'none');
elementRefs.btnCerrarModalAsignar.addEventListener('click', () => elementRefs.modalAsignarAtributo.style.display = 'none');

// Pantalla de Juego
elementRefs.btnComenzarRonda.addEventListener('click', GameLogic.comenzarFaseAsignacion);
elementRefs.btnComenzarDebate.addEventListener('click', GameLogic.comenzarFaseDebate);

elementRefs.btnQuienSoy.addEventListener('click', () => {
    const miPersonaje = GameLogic.getMiPersonaje();
    if (miPersonaje) {
        UIManager.mostrarModalQuienSoy(miPersonaje);
    }
});

// ¡NUEVO! Eventos para el botón de mantener pulsado
// Ratón
elementRefs.btnHoldToVote.addEventListener('mousedown', startHold);
elementRefs.btnHoldToVote.addEventListener('mouseup', cancelHold);
elementRefs.btnHoldToVote.addEventListener('mouseleave', cancelHold); // Si el ratón se va
// Táctil
elementRefs.btnHoldToVote.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evita el "mouse event" fantasma
    startHold();
});
elementRefs.btnHoldToVote.addEventListener('touchend', cancelHold);