// gameLogic.js - Punto de entrada principal (re-exporta módulos)

import { state, initDatabase } from './logic/gameState.js';
import { crearNuevaPartida, unirseAPartida, handleSalir } from './logic/lobbyManager.js';
import { empezarPartida, avanzarSiguienteRonda } from './logic/roundManager.js';
import { comenzarFaseDebate } from './logic/phaseManager.js'; // Importa menos de phaseManager
import { repartirAtributos, asignarAtributoAPersonaje } from './logic/attributeManager.js';
import { seleccionarVoto, confirmarMiVoto } from './logic/votingManager.js'; // ¡NUEVAS importaciones!

// Inicialización
export function init(db) {
    initDatabase(db);
}

// Getter de estado
export function getMiPersonaje() {
    return state.miPersonajeSecreto;
}

// Re-exportar funciones del lobby
export { crearNuevaPartida, unirseAPartida, handleSalir };

// Re-exportar funciones de rondas
export { empezarPartida, avanzarSiguienteRonda };

// Re-exportar funciones de fases
export { comenzarFaseDebate };
// 'comenzarFaseVotacion' ya no se llama desde la UI, sino desde el temporizador o el host

// Re-exportar funciones de atributos
export const comenzarFaseAsignacion = repartirAtributos;

// Re-exportar funciones de votación
export { confirmarMiVoto }; // Para el botón de app.js

/**
 * ¡NUEVO! Esta función "router" decide qué hacer cuando se hace clic en una tarjeta
 * basándose en la fase actual del juego.
 */
export function handleCardClick(personaje) {
    // Usamos 'faseAnterior' porque es el estado síncrono más fiable que tenemos
    if (state.faseAnterior === 'asignacion') {
        asignarAtributoAPersonaje(personaje);
    } else if (state.faseAnterior === 'debate') {
        seleccionarVoto(personaje);
    }
}