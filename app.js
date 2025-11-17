// Contenido para: app.js

import * as UIManager from './uiManager.js';
import * as GameLogic from './gameLogic.js';
import * as ModalManager from './modalManager.js';

// --- 1. OBTENER REFERENCIAS DEL DOM ---
const elementRefs = {
    mainMenu: document.getElementById('mainMenu'),
    lobbyScreen: document.getElementById('lobbyScreen'),
    joinScreen: document.getElementById('joinScreen'),
    gameScreen: document.getElementById('gameScreen'),
    
    btnCrearPartida: document.getElementById('btnCrearPartida'),
    btnUnirsePartida: document.getElementById('btnUnirsePartida'),
    btnSalirPartida: document.getElementById('btnSalirPartida'),
    
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

    btnConfirmarVoto: document.getElementById('btnConfirmarVoto'),

    modalResultados: document.getElementById('modalResultados'),
    modalResultadosTitulo: document.getElementById('modalResultadosTitulo'),
    modalResultadosTexto: document.getElementById('modalResultadosTexto'),
    btnSiguienteRonda: document.getElementById('btnSiguienteRonda'),
    btnCerrarModalResultados: document.getElementById('btnCerrarModalResultados'),

    // ¡MODIFICADAS/NUEVAS REFERENCIAS!
    modalFinJuego: document.getElementById('modalFinJuego'),
    modalGanadorTexto: document.getElementById('modalGanadorTexto'),
    btnVerTablero: document.getElementById('btnVerTablero'),
    btnReiniciarLobby: document.getElementById('btnReiniciarLobby'), // ¡NUEVO!
    btnSalirAlMenu: document.getElementById('btnSalirAlMenu'), // ¡RENOMBRADO!

    // Modal genérico
    modalGenerico: document.getElementById('modalGenerico'),
    modalGenericoTitulo: document.getElementById('modalGenericoTitulo'),
    modalGenericoTexto: document.getElementById('modalGenericoTexto'),
    modalGenericoInput: document.getElementById('modalGenericoInput'),
    btnModalGenericoConfirmar: document.getElementById('btnModalGenericoConfirmar'),
    btnModalGenericoCancelar: document.getElementById('btnModalGenericoCancelar'),

    // Pantalla de historia
    storyScreen: document.getElementById('storyScreen'),
    storyTitulo: document.getElementById('storyTitulo'),
    storySubtitulo: document.getElementById('storySubtitulo'),
    storyTexto: document.getElementById('storyTexto'),
    btnComenzarViaje: document.getElementById('btnComenzarViaje'),
};

// --- 2. INICIALIZAR MÓDULOS ---

ModalManager.init(elementRefs);

UIManager.init(elementRefs, {
    handleCardClick: (personaje) => GameLogic.handleCardClick(personaje)
});

GameLogic.init(database, ModalManager); // 'database' viene del script de Firebase en index.html


// --- 3. CONECTAR "ESCUCHADORES" DE EVENTOS ---

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

// Pantalla de Historia
elementRefs.btnComenzarViaje.addEventListener('click', GameLogic.comenzarFaseConocimiento);

// Pantalla de Juego
elementRefs.btnComenzarRonda.addEventListener('click', GameLogic.comenzarFaseAsignacion);
elementRefs.btnComenzarDebate.addEventListener('click', GameLogic.comenzarFaseDebate);
elementRefs.btnConfirmarVoto.addEventListener('click', GameLogic.confirmarMiVoto);

// Botón de salida global (con confirmación)
elementRefs.btnSalirPartida.addEventListener('click', async () => {
    const confirmar = await ModalManager.mostrarConfirmacion(
        '¿Estás seguro de que quieres abandonar la partida?',
        'ABANDONAR PARTIDA'
    );
    if (confirmar) {
        GameLogic.handleSalir();
    }
});

elementRefs.btnQuienSoy.addEventListener('click', () => {
    const miPersonaje = GameLogic.getMiPersonaje();
    if (miPersonaje) {
        UIManager.mostrarModalQuienSoy(miPersonaje);
    }
});

// Modal de Resultados
elementRefs.btnSiguienteRonda.addEventListener('click', () => {
    elementRefs.modalResultados.style.display = 'none';
    GameLogic.avanzarSiguienteRonda();
});

elementRefs.btnCerrarModalResultados.addEventListener('click', () => {
    elementRefs.modalResultados.style.display = 'none';
});

// ¡MODIFICADO! Listeners para el modal de Fin de Juego
elementRefs.btnVerTablero.addEventListener('click', () => {
    elementRefs.modalFinJuego.style.display = 'none';
    // El tablero final ya está visible detrás (lo prepara firebaseSync)
});

elementRefs.btnReiniciarLobby.addEventListener('click', () => {
    // ¡NUEVO! Solo el anfitrión ve este botón y reinicia la partida
    GameLogic.reiniciarPartida();
});

elementRefs.btnSalirAlMenu.addEventListener('click', () => {
    // ¡MODIFICADO! El jugador normal sale al menú principal
    GameLogic.handleSalir();
});