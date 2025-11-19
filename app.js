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
    waitingMessage: document.getElementById('waitingMessage'),
    waitingMessageText: document.getElementById('waitingMessageText'),
    
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

    // Modal de transferencia de anfitrión
    modalTransferenciaAnfitrion: document.getElementById('modalTransferenciaAnfitrion'),
    listaJugadoresTransferencia: document.getElementById('listaJugadoresTransferencia'),
    btnCerrarPartidaDefinitivo: document.getElementById('btnCerrarPartidaDefinitivo'),
    btnCancelarSalida: document.getElementById('btnCancelarSalida'),

    // Pantalla de historia
    storyScreen: document.getElementById('storyScreen'),
    storyTitulo: document.getElementById('storyTitulo'),
    storySubtitulo: document.getElementById('storySubtitulo'),
    storyTexto: document.getElementById('storyTexto'),
    btnComenzarViaje: document.getElementById('btnComenzarViaje'),

    // Modal de Cómo Jugar
    modalComoJugar: document.getElementById('modalComoJugar'),
    btnComoJugar: document.getElementById('btnComoJugar'),
    btnCerrarComoJugar: document.getElementById('btnCerrarComoJugar'),
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
elementRefs.btnComoJugar.addEventListener('click', UIManager.mostrarModalComoJugar);

// Indicador visual de conexión (opcional pero útil)
const crearIndicadorConexion = () => {
    const indicador = document.createElement('div');
    indicador.id = 'connectionIndicator';
    indicador.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #00ff00;
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
        z-index: 10000;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(indicador);
    return indicador;
};

const indicadorConexion = crearIndicadorConexion();

// Escuchar cambios de conexión para actualizar el indicador visual
database.ref('.info/connected').on('value', (snapshot) => {
    const conectado = snapshot.val() === true;
    if (conectado) {
        indicadorConexion.style.backgroundColor = '#00ff00';
        indicadorConexion.style.boxShadow = '0 0 8px rgba(0, 255, 0, 0.6)';
        indicadorConexion.title = 'Conectado';
    } else {
        indicadorConexion.style.backgroundColor = '#ff4444';
        indicadorConexion.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.6)';
        indicadorConexion.title = 'Desconectado - Reconectando...';
    }
});


// Modal Cómo Jugar
elementRefs.btnCerrarComoJugar.addEventListener('click', UIManager.ocultarModalComoJugar);

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

// Ajustes de Inicio (Engranaje)
elementRefs.btnAjustesInicio = document.getElementById('btnAjustesInicio');
elementRefs.menuAjustes = document.getElementById('menuAjustes');
elementRefs.btnAbrirTestAtributos = document.getElementById('btnAbrirTestAtributos');

if (elementRefs.btnAjustesInicio) {
    elementRefs.btnAjustesInicio.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que se cierre inmediatamente
        const estaVisible = elementRefs.menuAjustes.style.display === 'block';
        elementRefs.menuAjustes.style.display = estaVisible ? 'none' : 'block';
    });
}

if (elementRefs.btnAbrirTestAtributos) {
    elementRefs.btnAbrirTestAtributos.addEventListener('click', () => {
        elementRefs.menuAjustes.style.display = 'none';
        UIManager.mostrarModalTestAtributos();
    });
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (elementRefs.menuAjustes && elementRefs.menuAjustes.style.display === 'block') {
        if (!elementRefs.menuAjustes.contains(e.target) && !elementRefs.btnAjustesInicio.contains(e.target)) {
            elementRefs.menuAjustes.style.display = 'none';
        }
    }
});

elementRefs.modalTestAtributos = document.getElementById('modalTestAtributos');
elementRefs.btnCerrarTestAtributos = document.getElementById('btnCerrarTestAtributos');
elementRefs.btnRegenerarTest = document.getElementById('btnRegenerarTest');
elementRefs.btnRegenerarNombres = document.getElementById('btnRegenerarNombres');

if (elementRefs.btnCerrarTestAtributos) {
    elementRefs.btnCerrarTestAtributos.addEventListener('click', UIManager.ocultarModalTestAtributos);
}

if (elementRefs.btnRegenerarTest) {
    elementRefs.btnRegenerarTest.addEventListener('click', UIManager.regenerarTestAtributos);
}

if (elementRefs.btnRegenerarNombres) {
    elementRefs.btnRegenerarNombres.addEventListener('click', UIManager.regenerarTestNombres);
}

// Botones de selector de nivel en el modal de testing
const botonesNivelTest = document.querySelectorAll('.btn-nivel-test');
if (botonesNivelTest.length > 0) {
    botonesNivelTest.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nivel = e.target.dataset.nivel;
            UIManager.cambiarNivelTest(nivel);
        });
    });
}

// Botones de pestañas en el modal de testing
const botonesTabTest = document.querySelectorAll('.btn-tab-test');
if (botonesTabTest.length > 0) {
    botonesTabTest.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            UIManager.cambiarTabTest(tab);
        });
    });
}

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