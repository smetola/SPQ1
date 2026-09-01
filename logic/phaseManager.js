// phaseManager.js - Gestión de transiciones entre fases

import { state, getDatabase } from './gameState.js';
import * as UI from '../uiManager.js';
import { esModoActivo } from './modeManager.js';
import { ejecutarEventoParanormal } from './eventManager.js';

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

/**
 * ¡MODIFICADO! Ahora comprueba si el modo Maldición está activo.
 * Si lo está, ejecuta el evento paranormal ANTES de iniciar el debate.
 * El evento puede:
 *   - Activarse → se muestra la fase 'evento', y después el debate
 *   - No activarse (por probabilidad) → se salta directo al debate
 */
export function comenzarFaseDebate() {
    const database = getDatabase();
    UI.ocultarBotonComenzarDebate();

    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;

        // Si el modo Maldición está activo, intentar ejecutar evento primero
        if (esModoActivo('maldicion', partida)) {
            console.log('🔮 Modo Maldición activo: ejecutando evento paranormal...');
            ejecutarEventoYLuegoDebate(partida);
        } else {
            // Sin Maldición: ir directo al debate
            iniciarDebateReal(partida);
        }
    });
}

/**
 * Ejecuta el evento paranormal y decide si mostrar el evento o ir al debate.
 */
async function ejecutarEventoYLuegoDebate(partida) {
    const database = getDatabase();
    const progressionIndex = partida.progressionIndex || 0;

    // Calcular probabilidad localmente para decidir
    let probabilidad;
    if (progressionIndex <= 1) probabilidad = 0.3;
    else if (progressionIndex <= 3) probabilidad = 0.6;
    else if (progressionIndex <= 5) probabilidad = 0.9;
    else probabilidad = 1.0;

    const tirada = Math.random();
    console.log(`🔮 Maldición: probabilidad ${(probabilidad * 100).toFixed(0)}%, tirada: ${(tirada * 100).toFixed(0)}%`);

    if (tirada > probabilidad) {
        // No ocurre evento → ir directo al debate
        console.log('🔮 No ha ocurrido ningún evento. Directamente al debate.');
        // Limpiar estado de evento anterior si hubiera
        await database.ref(`partidas/${state.salaActual}/modoConfig/maldicion`).update({
            eventoActual: null,
            eventoEspecial: null,
            inmune: null,
            inmuneTipo: null
        });
        iniciarDebateReal(partida);
    } else {
        // Ocurre evento → ejecutar y mostrar fase 'evento'
        await ejecutarEventoParanormal();
        // El eventManager ya cambió la faseActual a 'evento'
        // El anfitrión verá un botón "Continuar" que llamará a continuarDesdeEvento()
    }
}

/**
 * Inicia el debate real (con reciclaje de atributos y timer).
 * Puede ser llamada directamente (sin Maldición) o después de un evento.
 */
export function iniciarDebateReal(partida) {
    const database = getDatabase();
    const DEBATE_DURACION_MS = 300000; // 5 minutos

    // Si no tenemos partida, leerla
    if (!partida) {
        database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
            iniciarDebateReal(snapshot.val());
        });
        return;
    }

    const actualizaciones = {};
    const listas = partida.listasAtributosDisponibles || {};
    const currentTier = partida.currentTier || 'bronce';

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
}

/**
 * Transiciona desde la fase 'evento' al debate real.
 * Solo debe ser llamada por el ANFITRIÓN al pulsar "Continuar" en el modal de evento.
 */
export function continuarDesdeEvento() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;
        iniciarDebateReal(partida);
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
