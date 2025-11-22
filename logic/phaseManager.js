// phaseManager.js - Gestión de transiciones entre fases

import { state, getDatabase } from './gameState.js';
import * as UI from '../uiManager.js';

// Comenzar fase de conocimiento (transición desde la historia)
export function comenzarFaseConocimiento() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}`).update({
        faseActual: 'conocimiento'
    }).catch((err) => console.error("Error al cambiar a conocimiento:", err));
}

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

    // Leer estado para reciclar atributos no asignados
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;

        const actualizaciones = {};
        const listas = partida.listasAtributosDisponibles || {};
        const currentTier = partida.currentTier || 'bronce'; // Asumimos tier actual si no hay dato

        // 1. Detectar y reciclar atributos no asignados
        Object.keys(partida.jugadores).forEach(id => {
            const jugador = partida.jugadores[id];
            if (jugador.atributoParaAsignar) {
                console.log(`♻️ Reciclando atributo no asignado de ${jugador.nombre}: ${jugador.atributoParaAsignar.nombre}`);

                // Devolver al pool correspondiente
                if (!listas[currentTier]) listas[currentTier] = [];
                listas[currentTier].push(jugador.atributoParaAsignar);

                // Limpiar del jugador
                actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/atributoParaAsignar`] = null;
            }
        });

        // 2. Actualizar listas recicladas
        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = listas;

        // 3. Cambiar fase
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'debate';
        actualizaciones[`partidas/${state.salaActual}/debateEndTime`] = Date.now() + DEBATE_DURACION_MS;

        database.ref().update(actualizaciones)
            .catch((err) => console.error("Error al cambiar a debate:", err));
    });
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
