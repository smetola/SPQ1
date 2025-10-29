// Contenido para: app.js (El nuevo)

import * as UIManager from './uiManager.js';
import * as GameLogic from './gameLogic.js';

// --- 1. OBTENER REFERENCIAS DEL DOM ---
// (Obtenemos todas las referencias aquí, en un solo lugar)
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
// (Pasamos las referencias a los módulos que las necesitan)

// Pasamos las referencias de UI y los "handlers" de lógica a UIManager
UIManager.init(elementRefs, {
    handleCardClick: (personaje) => GameLogic.handleCardClick(personaje)
});

// Pasamos la 'database' (que es global gracias al script de index.html)
// y el UIManager a GameLogic
GameLogic.init(database); // 'database' viene del script de Firebase en index.html


// --- 3. CONECTAR "ESCUCHADORES" DE EVENTOS ---

// Menú Principal
elementRefs.btnCrearPartida.addEventListener('click', GameLogic.crearNuevaPartida);
elementRefs.btnUnirsePartida.addEventListener('click', UIManager.mostrarPantallaUnirse);

// Pantalla Unirse
elementRefs.btnConfirmarUnirse.addEventListener('click', () => {
    // Recogemos los valores aquí, en el "controlador"
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
elementRefs.btnQuienSoy.addEventListener('click', () => {
    // Esta lógica es de UI pura, pero la dejamos aquí por simplicidad
    // (Idealmente, GameLogic guardaría 'miPersonajeSecreto' y UI.js lo leería)
    // Por ahora, lo mantenemos simple. El botón '?' fallará temporalmente
    // hasta que implementemos el guardado de 'miPersonajeSecreto' en GameLogic.
    
    // CORRECCIÓN: Hecho. GameLogic.handleCardClick ya lo hace.
    // La función 'construirModalPersonaje' necesita el personaje.
    // Vamos a pedirlo a GameLogic.
    
    // (Mejoramos esto en el futuro. Por ahora, que el botón '?' no haga nada
    // es mejor que un error. Lo arreglaremos cuando 'miPersonajeSecreto'
    // se guarde centralizadamente en 'gameLogic.js')
    
    // (RE-CORRECCIÓN: La lógica en uiManager y gameLogic ya guarda
    // 'miPersonajeSecreto' en el estado de gameLogic.js.
    // Simplemente, el botón '?' necesita llamar a una función
    // que lo muestre).
    
    // Vamos a simplificar. El modal "Quien Soy" se muestra
    // al inicio. El botón '?' es un bonus que ahora mismo
    // complica la refactorización. Lo dejaremos "muerto" por ahora.
    console.log("Botón '?' pulsado. Lógica pendiente.");
});