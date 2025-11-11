// logic/votingManager.js - Gestión de votación y eliminación

import { state, getDatabase } from './gameState.js';
// ¡Eliminada la importación de 'mostrarResultadosVotacion'!

/**
 * Selecciona un personaje para votar (voto no definitivo).
 * Se llama al hacer clic en una tarjeta durante la fase 'debate'.
 */
export function seleccionarVoto(personajeClickeado) {
    const database = getDatabase();
    
    if (state.faseAnterior !== 'debate') return;
    if (state.heConfirmadoMiVoto) {
        alert("Ya has confirmado tu voto, no puedes cambiarlo.");
        return;
    }
    if (!personajeClickeado.estaVivo) {
        alert("No puedes votar a un personaje muerto.");
        return;
    }

    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`)
        .set(personajeClickeado.jugadorId);
}

/**
 * Confirma (bloquea) el voto actual.
 * Se llama al pulsar el botón [CONFIRMAR VOTO].
 */
export function confirmarMiVoto() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`).once('value').then(snap => {
        if (!snap.exists()) {
            alert("Debes seleccionar un personaje antes de confirmar tu voto.");
            return;
        }

        state.heConfirmadoMiVoto = true;
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoConfirmado`).set(true);
    });
}

/**
 * ¡REESCRITA!
 * Comprueba si todos han votado y elimina al más votado.
 * Esta función SOLO debe ser llamada por el Anfitrión.
 */
export function comprobarYEliminar() {
    // ¡NUEVO! Semáforo para evitar que la función se llame varias veces
    // mientras se procesa la votación.
    if (state.processingVote) return;
    state.processingVote = true;
    
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        
        // Si la partida no existe o YA NO ESTÁ en debate (porque otro timer la cambió),
        // liberamos el semáforo y salimos.
        if (!partida || partida.faseActual !== 'debate') {
            state.processingVote = false;
            return;
        }

        const jugadores = partida.jugadores;
        const jugadoresVivos = Object.entries(jugadores).filter(([id, j]) => j.personaje?.estaVivo);
        
        // --- 1. Recuento de votos ---
        const recuentoVotos = {};
        jugadoresVivos.forEach(([id, jugador]) => {
            const voto = jugador.votoSeleccionado;
            if (voto) {
                recuentoVotos[voto] = (recuentoVotos[voto] || 0) + 1;
            }
        });

        // --- 2. Encontrar al más votado ---
        let maxVotos = 0;
        let idsEmpatados = [];

        Object.keys(recuentoVotos).forEach((jugadorId) => {
            const votos = recuentoVotos[jugadorId];
            if (votos > maxVotos) {
                maxVotos = votos;
                idsEmpatados = [jugadorId];
            } else if (votos > 0 && votos === maxVotos) { // Asegurarse de que maxVotos > 0
                idsEmpatados.push(jugadorId);
            }
        });

        // --- 3. Aplicar eliminación ---
        const actualizaciones = {};
        let personajeEliminado = null;

        if (idsEmpatados.length === 1 && maxVotos > 0) {
            const idEliminado = idsEmpatados[0];
            personajeEliminado = jugadores[idEliminado].personaje.nombre;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${idEliminado}/personaje/estaVivo`] = false;
        } else {
            personajeEliminado = "NADIE (EMPATE)";
        }

        // --- 4. Limpiar para la siguiente ronda ---
        Object.keys(jugadores).forEach(id => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoSeleccionado`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoConfirmado`] = null;
        });

        // --- 5. ¡LÓGICA MOVIDA AQUÍ! ---
        // Transicionamos a 'resultados' EN LA MISMA ACTUALIZACIÓN
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'resultados';
        actualizaciones[`partidas/${state.salaActual}/ultimoEliminado`] = personajeEliminado;
        actualizaciones[`partidas/${state.salaActual}/debateEndTime`] = null;
        
        // Aplicar la actualización única.
        // El semáforo (processingVote) se liberará en firebaseSync
        // cuando detecte el cambio de fase.
        database.ref().update(actualizaciones);
    });
}