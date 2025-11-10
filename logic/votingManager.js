// logic/votingManager.js - Gestión de votación y eliminación

import { state, getDatabase } from './gameState.js';
import { mostrarResultadosVotacion } from './phaseManager.js';

/**
 * Selecciona un personaje para votar (voto no definitivo).
 * Se llama al hacer clic en una tarjeta durante la fase 'debate'.
 */
export function seleccionarVoto(personajeClickeado) {
    const database = getDatabase();
    
    // Comprobaciones síncronas (locales)
    if (state.faseAnterior !== 'debate') return;
    if (state.heConfirmadoMiVoto) {
        alert("Ya has confirmado tu voto, no puedes cambiarlo.");
        return;
    }
    if (!personajeClickeado.estaVivo) {
        alert("No puedes votar a un personaje muerto.");
        return;
    }

    // Escribir el voto "temporal" en Firebase
    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`)
        .set(personajeClickeado.jugadorId);
}

/**
 * Confirma (bloquea) el voto actual.
 * Se llama al pulsar el botón [CONFIRMAR VOTO].
 */
export function confirmarMiVoto() {
    const database = getDatabase();
    
    // Comprobar que hemos seleccionado a alguien
    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`).once('value').then(snap => {
        if (!snap.exists()) {
            alert("Debes seleccionar un personaje antes de confirmar tu voto.");
            return;
        }

        // Marcar nuestro voto como confirmado
        state.heConfirmadoMiVoto = true; // Feedback inmediato
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoConfirmado`).set(true);
    });
}

/**
 * Comprueba si todos han votado y elimina al más votado.
 * Esta función SOLO debe ser llamada por el Anfitrión.
 * Se dispara desde firebaseSync.js (si el tiempo acaba o todos confirman).
 */
export function comprobarYEliminar() {
    // Evitar doble ejecución si el anfitrión es rápido
    if (state.faseAnterior !== 'debate') return;
    
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida || partida.faseActual !== 'debate') return;

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
                idsEmpatados = [jugadorId]; // Inicia nueva lista de más votados
            } else if (votos === maxVotos) {
                idsEmpatados.push(jugadorId); // Añade al empate
            }
        });

        // --- 3. Aplicar eliminación ---
        const actualizaciones = {};
        let personajeEliminado = null;

        // Si hay un único ganador (más votado), se le elimina.
        // Si hay empate, ¡nadie es eliminado! (Más tensión para la sig. ronda)
        if (idsEmpatados.length === 1 && maxVotos > 0) {
            const idEliminado = idsEmpatados[0];
            personajeEliminado = jugadores[idEliminado].personaje.nombre;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${idEliminado}/personaje/estaVivo`] = false;
        } else {
            // Hubo empate o nadie votó
            personajeEliminado = "NADIE (EMPATE)";
        }

        // --- 4. Limpiar para la siguiente ronda ---
        Object.keys(jugadores).forEach(id => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoSeleccionado`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoConfirmado`] = null;
        });

        // Aplicar actualizaciones y cambiar a fase de resultados
        database.ref().update(actualizaciones).then(() => {
            // La fase de resultados mostrará quién fue eliminado (o si hubo empate)
            mostrarResultadosVotacion(personajeEliminado);
        });
    });
}