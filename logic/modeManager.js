// logic/modeManager.js - Sistema central de gestión de modos de juego
// Controla qué modos están activos y proporciona utilidades para consultarlos.

import { state, getDatabase } from './gameState.js';

// Modos disponibles en el juego
export const MODOS_DISPONIBLES = [
    {
        id: 'maldicion',
        nombre: 'Maldición',
        icono: '🔮',
        descripcion: 'Eventos paranormales aleatorios cada ronda.',
        color: '#9b59b6' // Púrpura
    },
    {
        id: 'poderes',
        nombre: 'Poderes',
        icono: '⚡',
        descripcion: 'Compra poderes con puntos de energía.',
        color: '#f1c40f' // Amarillo
    },
    {
        id: 'alianzas',
        nombre: 'Alianzas',
        icono: '💕',
        descripcion: 'Pactos secretos entre jugadores.',
        color: '#e74c3c' // Rojo
    },
    {
        id: 'traidor',
        nombre: 'Traidor',
        icono: '🕵️',
        descripcion: 'Un jugador tiene un objetivo secreto opuesto.',
        color: '#2ecc71' // Verde
    }
];

/**
 * Guarda los modos seleccionados por el anfitrión en Firebase.
 * @param {string[]} modos - Array de IDs de modos activos (ej. ["maldicion", "traidor"])
 */
export function guardarModosSeleccionados(modos) {
    const database = getDatabase();
    if (!state.salaActual) return;

    database.ref(`partidas/${state.salaActual}/modosActivos`).set(modos)
        .catch(err => console.error("Error al guardar modos:", err));
}

/**
 * Toggle de un modo: lo añade si no está, lo quita si está.
 * @param {string} modoId - ID del modo a togglear
 * @param {string[]} modosActuales - Array actual de modos activos
 * @returns {string[]} Nuevo array de modos activos
 */
export function toggleModo(modoId, modosActuales) {
    const nuevos = [...modosActuales];
    const index = nuevos.indexOf(modoId);

    if (index === -1) {
        nuevos.push(modoId);
    } else {
        nuevos.splice(index, 1);
    }

    return nuevos;
}

/**
 * Comprueba si un modo específico está activo en la partida actual.
 * Se usa desde cualquier módulo para condicionar lógica.
 * @param {string} modoId - ID del modo a comprobar
 * @param {object} partida - Datos completos de la partida (snapshot de Firebase)
 * @returns {boolean}
 */
export function esModoActivo(modoId, partida) {
    if (!partida || !partida.modosActivos) return false;
    return partida.modosActivos.includes(modoId);
}

/**
 * Obtiene los modos activos de una partida.
 * @param {object} partida - Datos completos de la partida
 * @returns {string[]} Array de IDs de modos activos
 */
export function getModosActivos(partida) {
    if (!partida || !partida.modosActivos) return [];
    return partida.modosActivos;
}

/**
 * Obtiene la info completa de un modo por su ID.
 * @param {string} modoId
 * @returns {object|null}
 */
export function getInfoModo(modoId) {
    return MODOS_DISPONIBLES.find(m => m.id === modoId) || null;
}
