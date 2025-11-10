// gameLogic.js - Punto de entrada principal (re-exporta módulos)

import { state, initDatabase } from './logic/gameState.js';
import { crearNuevaPartida, unirseAPartida, handleSalir } from './logic/lobbyManager.js';
import { empezarPartida, avanzarSiguienteRonda } from './logic/roundManager.js';
import { comenzarFaseDebate, comenzarFaseVotacion } from './logic/phaseManager.js';
import { repartirAtributos, asignarAtributoAPersonaje } from './logic/attributeManager.js';
import { votarPersonaje, comprobarYEliminar } from './logic/votingManager.js';

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
export { comenzarFaseDebate, comenzarFaseVotacion };

// Re-exportar funciones de atributos
export const comenzarFaseAsignacion = repartirAtributos;
export const handleCardClick = asignarAtributoAPersonaje;

// Re-exportar funciones de votación (para el futuro)
export { votarPersonaje, comprobarYEliminar };