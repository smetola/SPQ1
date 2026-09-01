// logic/allianceManager.js - Gestión del modo Alianzas
// Los jugadores pueden formar pactos secretos. Si uno muere, su aliado muere también.
// Variantes: A (Pacto Mutuo), B (Guardián/Protegido), C (Triángulo)

import { state, getDatabase } from './gameState.js';

// Variantes de alianza
const VARIANTES = ['pactoMutuo', 'triangulo'];
// Nota: 'guardian' (variante B) se puede añadir después

/**
 * Selecciona una variante de alianza al azar.
 * @returns {string} ID de la variante
 */
function seleccionarVariante() {
    return VARIANTES[Math.floor(Math.random() * VARIANTES.length)];
}

/**
 * Inicializa el modo Alianzas al empezar la partida.
 * Selecciona la variante y prepara el estado (los pactos se forman en la primera ronda).
 * @param {string[]} jugadorIDs - Lista de IDs de jugadores
 * @returns {object} Actualizaciones para Firebase
 */
export function inicializarModoAlianzas(jugadorIDs) {
    const variante = seleccionarVariante();

    console.log(`💕 Modo Alianzas: variante "${variante}" seleccionada.`);

    return {
        [`partidas/${state.salaActual}/modoConfig/alianzas/variante`]: variante,
        [`partidas/${state.salaActual}/modoConfig/alianzas/pactos`]: null,
        [`partidas/${state.salaActual}/modoConfig/alianzas/fasePacto`]: true, // Se mostrará en la primera ronda
        [`partidas/${state.salaActual}/modoConfig/alianzas/propuestas`]: null
    };
}

/**
 * Propone un pacto entre dos jugadores (Variante A: Pacto Mutuo).
 * El jugador A propone a B. Si B acepta, se forma el pacto.
 * @param {string} proponenteId - ID del jugador que propone
 * @param {string} destinatarioId - ID del jugador al que se propone
 */
export function proponerPacto(proponenteId, destinatarioId) {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}/modoConfig/alianzas/propuestas/${proponenteId}`).set({
        a: destinatarioId,
        timestamp: Date.now()
    });
}

/**
 * Acepta o rechaza una propuesta de pacto.
 * Si se acepta, se forma un pacto mutuo.
 * @param {string} aceptanteId - ID del jugador que acepta/rechaza
 * @param {string} proponenteId - ID del jugador que propuso
 * @param {boolean} acepta - true si acepta, false si rechaza
 */
export function responderPacto(aceptanteId, proponenteId, acepta) {
    const database = getDatabase();

    if (acepta) {
        // Formar pacto
        const pactoId = `${proponenteId}_${aceptanteId}`;
        database.ref(`partidas/${state.salaActual}/modoConfig/alianzas`).update({
            [`pactos/${pactoId}`]: {
                jugadorA: proponenteId,
                jugadorB: aceptanteId,
                tipo: 'pactoMutuo'
            },
            [`propuestas/${proponenteId}`]: null // Limpiar propuesta
        });
        console.log(`💕 Pacto formado: ${proponenteId} ↔ ${aceptanteId}`);
    } else {
        // Rechazar
        database.ref(`partidas/${state.salaActual}/modoConfig/alianzas/propuestas/${proponenteId}`).remove();
        console.log(`💔 Pacto rechazado: ${proponenteId} → ${aceptanteId}`);
    }
}

/**
 * Asigna pactos automáticos para la variante Triángulo.
 * En un triángulo: A protege a B, B protege a C, C protege a A.
 * Si tu protegido muere, tú también mueres.
 * @param {string[]} jugadorIDs - Lista de IDs de jugadores vivos
 * @returns {object} Actualizaciones para Firebase
 */
export function generarTriangulo(jugadorIDs) {
    if (jugadorIDs.length < 3) return {};

    // Mezclar aleatoriamente
    const shuffled = [...jugadorIDs].sort(() => Math.random() - 0.5);

    // Seleccionar 3 jugadores para el triángulo
    const triangulo = shuffled.slice(0, 3);

    const actualizaciones = {};
    const pactos = {};

    // A → B, B → C, C → A (cada uno "protege" al siguiente)
    for (let i = 0; i < 3; i++) {
        const protector = triangulo[i];
        const protegido = triangulo[(i + 1) % 3];
        const pactoId = `tri_${protector}_${protegido}`;

        pactos[pactoId] = {
            jugadorA: protector, // Protector
            jugadorB: protegido, // Protegido
            tipo: 'triangulo'
        };
    }

    actualizaciones[`partidas/${state.salaActual}/modoConfig/alianzas/pactos`] = pactos;
    actualizaciones[`partidas/${state.salaActual}/modoConfig/alianzas/triangulo`] = triangulo;

    return actualizaciones;
}

/**
 * Comprueba si un jugador eliminado tiene aliados vinculados que deben morir también.
 * @param {string} eliminadoId - ID del jugador eliminado
 * @param {object} partida - Datos completos de la partida
 * @returns {string[]} Array de IDs de jugadores que deben morir en cadena
 */
export function obtenerMuertesVinculadas(eliminadoId, partida) {
    const pactos = partida?.modoConfig?.alianzas?.pactos;
    if (!pactos) return [];

    const variante = partida.modoConfig.alianzas.variante;
    const muertosVinculados = [];

    Object.values(pactos).forEach(pacto => {
        if (variante === 'pactoMutuo') {
            // Pacto Mutuo: si muere A, muere B y viceversa
            if (pacto.jugadorA === eliminadoId) {
                muertosVinculados.push(pacto.jugadorB);
            } else if (pacto.jugadorB === eliminadoId) {
                muertosVinculados.push(pacto.jugadorA);
            }
        } else if (variante === 'triangulo') {
            // Triángulo: si muere el protegido (B), muere el protector (A)
            if (pacto.jugadorB === eliminadoId) {
                muertosVinculados.push(pacto.jugadorA);
            }
        }
    });

    return muertosVinculados;
}

/**
 * Comprueba condición de victoria del modo Alianzas.
 * En Alianzas, dos jugadores aliados pueden ganar juntos si son los últimos 2 vivos.
 * @param {object} partida - Datos completos de la partida
 * @returns {object|null} Datos de victoria conjunta o null
 */
export function comprobarVictoriaAlianza(partida) {
    const pactos = partida?.modoConfig?.alianzas?.pactos;
    if (!pactos) return null;

    const jugadores = partida.jugadores;
    const vivos = Object.entries(jugadores).filter(([_, j]) => j.personaje?.estaVivo);

    // Si quedan exactamente 2 vivos, comprobar si están aliados
    if (vivos.length === 2) {
        const [idA] = vivos[0];
        const [idB] = vivos[1];

        const sonAliados = Object.values(pactos).some(p => 
            (p.jugadorA === idA && p.jugadorB === idB) ||
            (p.jugadorA === idB && p.jugadorB === idA)
        );

        if (sonAliados) {
            return {
                tipo: 'alianza',
                jugadores: [
                    { id: idA, nombre: vivos[0][1].personaje.nombre },
                    { id: idB, nombre: vivos[1][1].personaje.nombre }
                ]
            };
        }
    }

    return null;
}

/**
 * Finaliza la fase de pactos y avanza al juego normal.
 */
export function finalizarFasePacto() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}/modoConfig/alianzas`).update({
        fasePacto: false,
        propuestas: null
    });
}

/**
 * Obtiene la info del aliado de un jugador (para mostrar en la UI).
 * @param {string} jugadorId - ID del jugador
 * @param {object} partida - Datos de la partida
 * @returns {object|null} Info del pacto o null
 */
export function getMiPacto(jugadorId, partida) {
    const pactos = partida?.modoConfig?.alianzas?.pactos;
    if (!pactos) return null;

    for (const [_, pacto] of Object.entries(pactos)) {
        if (pacto.jugadorA === jugadorId || pacto.jugadorB === jugadorId) {
            const aliadoId = pacto.jugadorA === jugadorId ? pacto.jugadorB : pacto.jugadorA;
            const aliado = partida.jugadores?.[aliadoId];
            return {
                aliadoId,
                aliadoNombre: aliado?.personaje?.nombre || '???',
                aliadoJugador: aliado?.nombre || '???',
                tipo: pacto.tipo
            };
        }
    }

    return null;
}
