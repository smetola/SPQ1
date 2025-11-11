// phaseManager.js - Gestión de transiciones entre fases

import { state, getDatabase } from './gameState.js';
import * as UI from '../uiManager.js';

// Comenzar fase de asignación (reparte atributos a los jugadores)
// Esta función se importa y usa desde attributeManager, pero la dejo aquí 
// porque gestiona la TRANSICIÓN de fase
export function comenzarFaseAsignacion() {
    // Esta función está ahora en attributeManager.js
    // La importamos desde allí para evitar duplicados
}

// Comenzar fase de debate
export function comenzarFaseDebate() {
    const database = getDatabase();
    UI.ocultarBotonComenzarDebate();
    
    const DEBATE_DURACION_MS = 300000; // 5 minutos

    database.ref(`partidas/${state.salaActual}`).update({
        faseActual: 'debate',
        debateEndTime: Date.now() + DEBATE_DURACION_MS
    }).catch((err) => console.error("Error al cambiar a debate:", err));
}

// Comenzar fase de votación
export function comenzarFaseVotacion() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).update({
        faseActual: 'votacion',
        debateEndTime: null
    }).catch((err) => console.error("Error al cambiar a votación:", err));
}

// Comenzar fase de resultados (mostrar quién fue eliminado)
export function mostrarResultadosVotacion(personajeEliminado) {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).update({
        faseActual: 'resultados',
        ultimoEliminado: personajeEliminado,
        debateEndTime: null // Limpiamos el temporizador
    });
}
