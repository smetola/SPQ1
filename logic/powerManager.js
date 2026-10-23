// logic/powerManager.js - Gestión del modo Poderes (Tienda de Energía)
// Los jugadores acumulan energía cada ronda y pueden comprar poderes en la tienda.

import { state, getDatabase } from './gameState.js';

// Catálogo de poderes disponibles
// Escudo → votingManager.js (cancela eliminación)
// Voto Doble → votingManager.js (cuenta doble en recuento)
// Camuflaje → uiManager.js crearTarjetaPersonaje (oculta un atributo)
// Espiar → flujo UI: mostrarModalEspiar (revela asignador de atributo)
// Robar → flujo UI: mostrarModalRobar (mueve atributo entre personajes)
// Falsificar → flujo UI: mostrarModalFalsificar (cambia nombre de atributo)
export const CATALOGO_PODERES = [
    {
        id: 'escudo',
        nombre: 'Escudo',
        icono: '🛡️',
        coste: 3,
        descripcion: 'Te protege de la eliminación esta ronda.',
        tipo: 'votacion',
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
        descripcion: 'Oculta tu último atributo asignado a todos los demás durante esta ronda.',
        tipo: 'pasivo',
        usoUnico: true
    },
    {
        id: 'espiar',
        nombre: 'Espiar',
        icono: '👁️',
        coste: 1,
        descripcion: 'Elige un personaje y un atributo: te revela quién se lo asignó.',
        tipo: 'informacion',
        usoUnico: true
    },
    {
        id: 'robar',
        nombre: 'Robar Atributo',
        icono: '🤏',
        coste: 4,
        descripcion: 'Roba un atributo de otro personaje y asígnaselo a cualquier otro.',
        tipo: 'activo',
        usoUnico: true
    },
    {
        id: 'falsificar',
        nombre: 'Falsificar',
        icono: '📝',
        coste: 3,
        descripcion: 'Cambia el texto visible de uno de tus atributos por el que tú quieras.',
        tipo: 'activo',
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

/**
 * ESPIAR: Dado un objetivo y una clave de atributo, busca en Firebase quién lo asignó.
 * Los atributos asignados se guardan con la clave "asignador_<atributoKey>" en el personaje.
 * @returns {object} { exito, atributoValor, nombreAsignador }
 */
export async function ejecutarEspiar(miId, objetivoId, atributoKey, jugadores) {
    const database = getDatabase();
    const snapshot = await database.ref(`partidas/${state.salaActual}/jugadores/${objetivoId}/personaje`).once('value');
    const personaje = snapshot.val();
    if (!personaje) return { exito: false, error: 'Personaje no encontrado' };

    const atributoValor = personaje.atributosAsignados?.[atributoKey];
    if (!atributoValor) return { exito: false, error: 'Atributo no encontrado' };

    // Buscar el asignador: se guarda como metadatoAsignaciones/<atributoKey>/asignadorId
    const snapAsignador = await database.ref(`partidas/${state.salaActual}/jugadores/${objetivoId}/metadatoAsignaciones/${atributoKey}/asignadorId`).once('value');
    const asignadorId = snapAsignador.val();
    const nombreAsignador = asignadorId
        ? (jugadores[asignadorId]?.personaje?.nombre || asignadorId)
        : 'Desconocido (sin registro)';

    console.log(`👁️ Espiar: ${atributoValor} fue asignado por ${nombreAsignador}`);
    return { exito: true, atributoValor, nombreAsignador };
}

/**
 * ROBAR: Mueve el atributo de un personaje origen a un personaje destino.
 * @param {string} miId - Jugador que ejecuta el poder
 * @param {string} origenId - Jugador al que se roba el atributo
 * @param {string} atributoKey - Clave del atributo a robar
 * @param {string} destinoId - Jugador al que se le asigna el atributo robado
 */
export async function ejecutarRobar(miId, origenId, atributoKey, destinoId) {
    const database = getDatabase();
    const snapshot = await database.ref(`partidas/${state.salaActual}`).once('value');
    const partida = snapshot.val();
    if (!partida) return { exito: false, error: 'Partida no encontrada' };

    const atributoValor = partida.jugadores?.[origenId]?.personaje?.atributosAsignados?.[atributoKey];
    if (!atributoValor) return { exito: false, error: 'Atributo no encontrado en el origen' };

    // Generar nueva clave para el destino (para no sobreescribir las existentes)
    const nuevaClave = `atributo_robado_${Date.now()}`;

    const actualizaciones = {
        // Quitar del origen
        [`partidas/${state.salaActual}/jugadores/${origenId}/personaje/atributosAsignados/${atributoKey}`]: null,
        // Poner en el destino
        [`partidas/${state.salaActual}/jugadores/${destinoId}/personaje/atributosAsignados/${nuevaClave}`]: atributoValor
    };

    await database.ref().update(actualizaciones);
    console.log(`🤏 Robar: "${atributoValor}" movido de ${origenId} a ${destinoId}`);
    return { exito: true };
}

/**
 * FALSIFICAR: Cambia el texto visible de un atributo propio.
 * @param {string} miId - Jugador que ejecuta el poder
 * @param {string} atributoKey - Clave del atributo a falsificar
 * @param {string} nuevoNombre - El nuevo texto que se mostrará
 */
export async function ejecutarFalsificar(miId, atributoKey, nuevoNombre) {
    const database = getDatabase();
    if (!nuevoNombre || nuevoNombre.trim() === '') return { exito: false, error: 'El nuevo nombre no puede estar vacío' };

    await database.ref(`partidas/${state.salaActual}/jugadores/${miId}/personaje/atributosAsignados/${atributoKey}`).set(nuevoNombre.trim());
    console.log(`📝 Falsificar: atributo "${atributoKey}" ahora dice "${nuevoNombre.trim()}"`);
    return { exito: true };
}
