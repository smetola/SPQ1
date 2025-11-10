// gameState.js - Estado compartido del juego

let database = null;

// Estado del juego (compartido entre todos los módulos)
export const state = {
    salaActual: null,
    jugadorIdActual: null,
    miPersonajeSecreto: null,
    miAtributoParaAsignar: null,
    soyAnfitrion: false,
    primeraCargaJuego: true,
    faseAnterior: null,
    
    // Listeners de Firebase
    refJugadoresEnLobby: null,
    refEstadoPartida: null,
    refDatosJuego: null,

    // Temporizadores
    timerInterval: null,
};

// Inicialización de la base de datos
export function initDatabase(db) {
    database = db;
}

export function getDatabase() {
    return database;
}

// Resetear estado (al salir de la partida)
export function resetState() {
    // Limpiar temporizadores
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    // Limpiar listeners
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    if (state.refDatosJuego) state.refDatosJuego.off();

    // Resetear variables
    Object.assign(state, {
        salaActual: null,
        jugadorIdActual: null,
        miPersonajeSecreto: null,
        miAtributoParaAsignar: null,
        soyAnfitrion: false,
        primeraCargaJuego: true,
        faseAnterior: null,
        refJugadoresEnLobby: null,
        refEstadoPartida: null,
        refDatosJuego: null,
        timerInterval: null
    });
}
