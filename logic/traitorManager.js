// logic/traitorManager.js - Gestión del modo Traidor
// Un jugador es elegido secretamente como traidor. Su objetivo es ser eliminado.

import { state, getDatabase } from './gameState.js';

/**
 * Inicializa el modo Traidor: elige un jugador al azar como traidor.
 * El traidor se guarda en Firebase de forma que solo él pueda saber su rol.
 * @param {string[]} jugadorIDs - Lista de IDs de jugadores
 * @returns {object} Actualizaciones para Firebase
 */
export function inicializarModoTraidor(jugadorIDs) {
    // Elegir un jugador al azar como traidor
    const indiceTraidor = Math.floor(Math.random() * jugadorIDs.length);
    const traitorId = jugadorIDs[indiceTraidor];

    console.log(`🕵️ Modo Traidor: Jugador ${traitorId} es el traidor (secreto).`);

    return {
        [`partidas/${state.salaActual}/modoConfig/traidor/traitorId`]: traitorId,
        [`partidas/${state.salaActual}/modoConfig/traidor/revelado`]: false
    };
}

/**
 * Comprueba si un jugador específico es el traidor.
 * @param {string} jugadorId - ID del jugador a comprobar
 * @param {object} partida - Datos de la partida
 * @returns {boolean}
 */
export function esTraidor(jugadorId, partida) {
    return partida?.modoConfig?.traidor?.traitorId === jugadorId;
}

/**
 * Comprueba si el traidor fue eliminado (victoria del traidor).
 * Se llama después de cada eliminación.
 * @param {string} eliminadoNombre - Nombre del personaje eliminado
 * @param {object} partida - Datos de la partida
 * @returns {object|null} Datos de victoria del traidor, o null si no aplica
 */
export function comprobarVictoriaTraidor(eliminadoNombre, partida) {
    const traitorId = partida?.modoConfig?.traidor?.traitorId;
    if (!traitorId) return null;

    const jugadorTraidor = partida.jugadores?.[traitorId];
    if (!jugadorTraidor || !jugadorTraidor.personaje) return null;

    // Comprobar si el personaje del traidor fue eliminado (ya no está vivo)
    if (!jugadorTraidor.personaje.estaVivo) {
        return {
            nombreJugador: jugadorTraidor.nombre,
            nombrePersonaje: jugadorTraidor.personaje.nombre,
            esVictoriaTraidor: true
        };
    }

    return null;
}

/**
 * Obtiene el ID del traidor de una partida.
 * @param {object} partida - Datos de la partida
 * @returns {string|null}
 */
export function getTraitorId(partida) {
    return partida?.modoConfig?.traidor?.traitorId || null;
}
