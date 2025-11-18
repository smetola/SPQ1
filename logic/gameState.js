// gameState.js - Estado compartido del juego

import { initConnectionManager, cleanupConnectionManager } from './connectionManager.js';

let database = null;
let modalManager = null; // Gestor de modales personalizados

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

    heConfirmadoMiVoto: false,
    processingVote: false, // ¡NUEVO SEMÁFORO!
};

// Inicialización de la base de datos
export function initDatabase(db) {
    database = db;
    // Inicializar sistema de gestión de conexión
    initConnectionManager();
}

export function getDatabase() {
    return database;
}

export function initModalManager(mm) {
    modalManager = mm;
}

export function getModalManager() {
    return modalManager;
}

// Resetear estado (al salir de la partida)
export function resetState() {
    // Limpiar sistema de conexión
    cleanupConnectionManager();
    
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
        timerInterval: null,
        heConfirmadoMiVoto: false,
        processingVote: false // ¡RESET SEMÁFORO!
    });
}