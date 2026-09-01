// logic/powerManager.js - Gestión del modo Poderes (Tienda de Energía)
// Los jugadores acumulan energía cada ronda y pueden comprar poderes en la tienda.

import { state, getDatabase } from './gameState.js';

// Catálogo de poderes disponibles
export const CATALOGO_PODERES = [
    {
        id: 'escudo',
        nombre: 'Escudo',
        icono: '🛡️',
        coste: 3,
        descripcion: 'Te protege de la eliminación esta ronda.',
        tipo: 'votacion', // Afecta a la votación
        usoUnico: true
    },
    {
        id: 'votoDoble',
        nombre: 'Voto Doble',
        icono: '✌️',
        coste: 2,
        descripcion: 'Tu voto cuenta el doble esta ronda.',
        tipo: 'votacion',
        usoUnico: true
    },
    {
        id: 'camuflaje',
        nombre: 'Camuflaje',
        icono: '🎭',
        coste: 2,
        descripcion: 'Oculta uno de tus atributos esta ronda.',
        tipo: 'atributo',
        usoUnico: true
    },
    {
        id: 'robar',
        nombre: 'Robar Atributo',
        icono: '🤏',
        coste: 4,
        descripcion: 'Mueve un atributo de un personaje a otro.',
        tipo: 'atributo',
        usoUnico: true
    },
    {
        id: 'espiar',
        nombre: 'Espiar',
        icono: '👁️',
        coste: 1,
        descripcion: 'Revela quién asignó un atributo a un personaje.',
        tipo: 'informacion',
        usoUnico: true
    },
    {
        id: 'falsificar',
        nombre: 'Falsificar',
        icono: '📝',
        coste: 3,
        descripcion: 'Cambia el nombre de uno de tus atributos visibles.',
        tipo: 'atributo',
        usoUnico: true
    }
];

// Energía base que se gana por ronda
const ENERGIA_POR_RONDA = 1;
// Energía bonus por sobrevivir a una eliminación (no fuiste el más votado)
const ENERGIA_BONUS_SUPERVIVENCIA = 1;

/**
 * Inicializa el modo Poderes al empezar la partida.
 * Cada jugador empieza con 1 de energía.
 * @param {string[]} jugadorIDs - Lista de IDs de jugadores
 * @returns {object} Actualizaciones para Firebase
 */
export function inicializarModoPoderes(jugadorIDs) {
    const actualizaciones = {};

    jugadorIDs.forEach(id => {
        actualizaciones[`partidas/${state.salaActual}/modoConfig/poderes/energia/${id}`] = 1;
        actualizaciones[`partidas/${state.salaActual}/modoConfig/poderes/poderesActivos/${id}`] = null;
    });

    actualizaciones[`partidas/${state.salaActual}/modoConfig/poderes/tiendaAbierta`] = false;

    console.log('⚡ Modo Poderes inicializado. Cada jugador tiene 1 de energía.');
    return actualizaciones;
}

/**
 * Otorga energía a todos los jugadores vivos al inicio de cada ronda.
 * @param {object} partida - Datos de la partida
 * @returns {object} Actualizaciones para Firebase
 */
export function otorgarEnergiaRonda(partida) {
    const actualizaciones = {};
    const jugadores = partida.jugadores;

    Object.entries(jugadores).forEach(([id, j]) => {
        if (j.personaje?.estaVivo) {
            const energiaActual = partida.modoConfig?.poderes?.energia?.[id] || 0;
            actualizaciones[`partidas/${state.salaActual}/modoConfig/poderes/energia/${id}`] = 
                energiaActual + ENERGIA_POR_RONDA;
        }
    });

    return actualizaciones;
}

/**
 * Compra un poder de la tienda.
 * @param {string} jugadorId - ID del jugador que compra
 * @param {string} poderId - ID del poder a comprar
 */
export async function comprarPoder(jugadorId, poderId) {
    const database = getDatabase();

    const snapshot = await database.ref(`partidas/${state.salaActual}`).once('value');
    const partida = snapshot.val();
    if (!partida) return { exito: false, error: 'Partida no encontrada' };

    const poder = CATALOGO_PODERES.find(p => p.id === poderId);
    if (!poder) return { exito: false, error: 'Poder no encontrado' };

    const energiaActual = partida.modoConfig?.poderes?.energia?.[jugadorId] || 0;
    if (energiaActual < poder.coste) {
        return { exito: false, error: 'Energía insuficiente' };
    }

    // Descontar energía y activar poder
    const actualizaciones = {
        [`partidas/${state.salaActual}/modoConfig/poderes/energia/${jugadorId}`]: energiaActual - poder.coste,
        [`partidas/${state.salaActual}/modoConfig/poderes/poderesActivos/${jugadorId}/${poderId}`]: {
            activado: true,
            rondaCompra: partida.progressionIndex || 0
        }
    };

    await database.ref().update(actualizaciones);
    console.log(`⚡ ${jugadorId} compró ${poder.nombre} por ${poder.coste} energía.`);
    return { exito: true };
}

/**
 * Comprueba si un jugador tiene un poder activo.
 * @param {string} jugadorId - ID del jugador
 * @param {string} poderId - ID del poder
 * @param {object} partida - Datos de la partida
 * @returns {boolean}
 */
export function tienePoderActivo(jugadorId, poderId, partida) {
    return !!partida?.modoConfig?.poderes?.poderesActivos?.[jugadorId]?.[poderId]?.activado;
}

/**
 * Obtiene la energía actual de un jugador.
 * @param {string} jugadorId
 * @param {object} partida
 * @returns {number}
 */
export function getEnergia(jugadorId, partida) {
    return partida?.modoConfig?.poderes?.energia?.[jugadorId] || 0;
}

/**
 * Limpia los poderes de uso único usados al finalizar la ronda.
 * @returns {object} Actualizaciones para Firebase
 */
export function limpiarPoderesRonda(partida) {
    const actualizaciones = {};
    const poderesActivos = partida?.modoConfig?.poderes?.poderesActivos;

    if (poderesActivos) {
        Object.entries(poderesActivos).forEach(([jugadorId, poderes]) => {
            if (poderes) {
                Object.entries(poderes).forEach(([poderId, datos]) => {
                    const poder = CATALOGO_PODERES.find(p => p.id === poderId);
                    if (poder?.usoUnico && datos?.activado) {
                        actualizaciones[`partidas/${state.salaActual}/modoConfig/poderes/poderesActivos/${jugadorId}/${poderId}`] = null;
                    }
                });
            }
        });
    }

    return actualizaciones;
}

/**
 * Abre/cierra la tienda para un jugador.
 */
export function toggleTienda(abrir) {
    const database = getDatabase();
    database.ref(`partidas/${state.salaActual}/modoConfig/poderes/tiendaAbierta`).set(abrir);
}
