// Contenido para: app.js (El nuevo)

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
    
    modalQuienSoy: document.getElementById('modalQuienSoy'),
    modalMiPersonaje: document.getElementById('modalMiPersonaje'),
    btnCerrarModal: document.getElementById('btnCerrarModal'),
    
    modalAsignarAtributo: document.getElementById('modalAsignarAtributo'),
    modalAsignarTitulo: document.getElementById('modalAsignarTitulo'),
    modalAtributoTexto: document.getElementById('modalAtributoTexto'),
    btnCerrarModalAsignar: document.getElementById('btnCerrarModalAsignar'),
    
    btnComenzarRonda: document.getElementById('btnComenzarRonda'),
};

// --- 2. INICIALIZAR MÓDULOS ---

// Pasamos las referencias de UI y los "handlers" de lógica a UIManager
UIManager.init(elementRefs, {
    handleCardClick: (personaje) => GameLogic.handleCardClick(personaje)
});

// Pasamos la 'database'
GameLogic.init(database); // 'database' viene del script de Firebase en index.html


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

// Pantalla de Juego
elementRefs.btnComenzarRonda.addEventListener('click', GameLogic.comenzarFaseAsignacion);

/**
 * ¡MODIFICADO! Ahora funciona con la lógica modular.
 */
elementRefs.btnQuienSoy.addEventListener('click', () => {
    const miPersonaje = GameLogic.getMiPersonaje();
    if (miPersonaje) {
        UIManager.mostrarModalQuienSoy(miPersonaje);
    } else {
        console.log("Aún no se ha cargado el personaje.");
    }
});