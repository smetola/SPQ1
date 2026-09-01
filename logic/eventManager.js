// logic/eventManager.js - Gestión de eventos paranormales (Modo Maldición)
// Cada ronda, la mansión puede activar un evento que altera las reglas del juego.

import { state, getDatabase } from './gameState.js';

/**
 * Pool de eventos paranormales, agrupados por categoría.
 * Cada evento tiene: nombre, categoría, icono, narrativa (función), y efecto (función).
 * La narrativa recibe datos de la partida para personalizar el texto.
 * El efecto devuelve un objeto de actualizaciones para Firebase.
 */
const EVENTOS_PARANORMALES = [
    // ☠️ MUERTE
    {
        nombre: 'Muerte Fantasma',
        categoria: 'muerte',
        icono: '☠️',
        narrativa: (datos) =>
            `La mansión ha cobrado su tributo. ${datos.victima} ha sido encontrado sin vida en la biblioteca. Los espejos sonríen.`,
        efecto: (partida) => {
            const jugadores = partida.jugadores;
            const vivos = Object.entries(jugadores).filter(([_, j]) => j.personaje?.estaVivo);
            if (vivos.length <= 2) return null; // No activar si solo quedan 2

            const [idVictima, victima] = vivos[Math.floor(Math.random() * vivos.length)];
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/jugadores/${idVictima}/personaje/estaVivo`]: false
                },
                datos: { victima: victima.personaje.nombre }
            };
        }
    },
    {
        nombre: 'Reloj de Arena',
        categoria: 'muerte',
        icono: '⏳',
        narrativa: () =>
            `Un reloj de arena aparece en la mesa. La casa no tolera la indecisión. Si no os ponéis de acuerdo... ella decidirá por vosotros.`,
        efecto: () => {
            // Este evento no aplica cambios inmediatos; modifica la regla de empate
            // Se comprobará en votingManager al resolver la votación
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`]: 'relojDeArena'
                },
                datos: {}
            };
        }
    },

    // 🛡️ PROTECCIÓN
    {
        nombre: 'El Amuleto',
        categoria: 'proteccion',
        icono: '🛡️',
        narrativa: (datos) =>
            `Un amuleto antiguo brilla en el bolsillo de ${datos.protegido}. La casa no puede tocarle... esta noche.`,
        efecto: (partida) => {
            const jugadores = partida.jugadores;
            const vivos = Object.entries(jugadores).filter(([_, j]) => j.personaje?.estaVivo);
            if (vivos.length === 0) return null;

            const [idProtegido, protegido] = vivos[Math.floor(Math.random() * vivos.length)];
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/inmune`]: idProtegido,
                    [`partidas/${state.salaActual}/modoConfig/maldicion/inmuneTipo`]: 'publico'
                },
                datos: { protegido: protegido.personaje.nombre }
            };
        }
    },
    {
        nombre: 'Escudo de Niebla',
        categoria: 'proteccion',
        icono: '🌫️',
        narrativa: () =>
            `Una niebla densa recorre los pasillos. Alguien está protegido... pero ¿quién?`,
        efecto: (partida) => {
            const jugadores = partida.jugadores;
            const vivos = Object.entries(jugadores).filter(([_, j]) => j.personaje?.estaVivo);
            if (vivos.length === 0) return null;

            const [idProtegido] = vivos[Math.floor(Math.random() * vivos.length)];
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/inmune`]: idProtegido,
                    [`partidas/${state.salaActual}/modoConfig/maldicion/inmuneTipo`]: 'secreto'
                },
                datos: {}
            };
        }
    },

    // 💀 RESURRECCIÓN
    {
        nombre: 'El Regreso',
        categoria: 'resurreccion',
        icono: '💀',
        narrativa: (datos) =>
            `Las luces parpadean. Un grito resuena. ${datos.resucitado} ha regresado de entre los muertos. La mansión juega con vosotros.`,
        efecto: (partida) => {
            const jugadores = partida.jugadores;
            const muertos = Object.entries(jugadores).filter(([_, j]) => j.personaje && !j.personaje.estaVivo);
            if (muertos.length === 0) return null; // No hay muertos para resucitar

            const [idResucitado, resucitado] = muertos[Math.floor(Math.random() * muertos.length)];
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/jugadores/${idResucitado}/personaje/estaVivo`]: true
                },
                datos: { resucitado: resucitado.personaje.nombre }
            };
        }
    },
    {
        nombre: 'Sesión de Espiritismo',
        categoria: 'resurreccion',
        icono: '🕯️',
        narrativa: () =>
            `Las velas se encienden solas. Los espíritus tienen algo que decir. Esta noche, los muertos votan.`,
        efecto: () => {
            // Los muertos podrán votar esta ronda (se comprobará en votingManager)
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`]: 'muertosVotan'
                },
                datos: {}
            };
        }
    },

    // 🔀 CAOS
    {
        nombre: 'El Espejo',
        categoria: 'caos',
        icono: '🪞',
        narrativa: (datos) =>
            `Los espejos se derriten. Cuando la imagen se estabiliza, ${datos.personajeA} tiene la cara de ${datos.personajeB}... y viceversa.`,
        efecto: (partida) => {
            const jugadores = partida.jugadores;
            const vivos = Object.entries(jugadores).filter(([_, j]) => j.personaje?.estaVivo);
            if (vivos.length < 2) return null;

            // Elegir 2 personajes al azar
            const shuffled = [...vivos].sort(() => Math.random() - 0.5);
            const [idA, jugadorA] = shuffled[0];
            const [idB, jugadorB] = shuffled[1];

            // Intercambiar atributos asignados
            const atributosA = jugadorA.personaje.atributosAsignados || {};
            const atributosB = jugadorB.personaje.atributosAsignados || {};

            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/jugadores/${idA}/personaje/atributosAsignados`]: atributosB,
                    [`partidas/${state.salaActual}/jugadores/${idB}/personaje/atributosAsignados`]: atributosA
                },
                datos: {
                    personajeA: jugadorA.personaje.nombre,
                    personajeB: jugadorB.personaje.nombre
                }
            };
        }
    },
    {
        nombre: 'Posesión',
        categoria: 'caos',
        icono: '👻',
        narrativa: () =>
            `Una fuerza invisible guía vuestras manos. Esta noche, cada uno carga con su propia maldición.`,
        efecto: () => {
            // El atributo se autoasigna al propio personaje (se gestionará en attributeManager)
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`]: 'posesion'
                },
                datos: {}
            };
        }
    },
    {
        nombre: 'El Doble',
        categoria: 'caos',
        icono: '👥',
        narrativa: () =>
            `La mansión es generosa... o quizás cruel. Dos secretos por cabeza. Dos razones más para desconfiar.`,
        efecto: () => {
            // Cada jugador recibirá 2 atributos (se gestionará en attributeManager)
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`]: 'dobleAtributo'
                },
                datos: {}
            };
        }
    },

    // 👁️ INFORMACIÓN
    {
        nombre: 'Confesionario',
        categoria: 'informacion',
        icono: '🔍',
        narrativa: () =>
            `Los fantasmas susurran secretos. Esta noche, las paredes revelan quién asignó uno de los atributos de cada personaje...`,
        efecto: () => {
            // Se revela info de asignación (se gestionará en la UI al mostrar tarjetas)
            return {
                actualizaciones: {
                    [`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`]: 'confesionario'
                },
                datos: {}
            };
        }
    }
];

/**
 * Calcula la probabilidad de que ocurra un evento según el índice de progresión.
 * Sistema acumulativo: más avanza la partida, más probable es un evento.
 * @param {number} progressionIndex - Índice de progresión actual (0, 1, 2, ...)
 * @returns {number} Probabilidad entre 0 y 1
 */
function calcularProbabilidadEvento(progressionIndex) {
    if (progressionIndex <= 1) return 0.3;  // Rondas 1-2: 30%
    if (progressionIndex <= 3) return 0.6;  // Rondas 3-4: 60%
    if (progressionIndex <= 5) return 0.9;  // Rondas 5-6: 90%
    return 1.0;                              // Ronda 7+: 100%
}

/**
 * Selecciona un evento aleatorio del pool, evitando repetir el último evento.
 * @param {string|null} ultimoEvento - Nombre del último evento que ocurrió
 * @returns {object} Evento seleccionado
 */
function seleccionarEvento(ultimoEvento) {
    let pool = EVENTOS_PARANORMALES;

    // Si hay un último evento, filtrarlo para evitar repetición
    if (ultimoEvento) {
        const filtrado = pool.filter(e => e.nombre !== ultimoEvento);
        if (filtrado.length > 0) pool = filtrado;
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Ejecuta el sistema de eventos paranormales para la ronda actual.
 * Solo debe ser llamado por el ANFITRIÓN.
 * Determina si ocurre un evento, selecciona cuál y aplica sus efectos.
 * @returns {Promise<void>}
 */
export async function ejecutarEventoParanormal() {
    const database = getDatabase();

    const snapshot = await database.ref(`partidas/${state.salaActual}`).once('value');
    const partida = snapshot.val();
    if (!partida) return;

    const progressionIndex = partida.progressionIndex || 0;
    const probabilidad = calcularProbabilidadEvento(progressionIndex);
    const tirada = Math.random();

    console.log(`🔮 Maldición: probabilidad ${(probabilidad * 100).toFixed(0)}%, tirada: ${(tirada * 100).toFixed(0)}%`);

    if (tirada > probabilidad) {
        // No ocurre evento esta ronda
        console.log('🔮 No ha ocurrido ningún evento paranormal esta ronda.');
        database.ref(`partidas/${state.salaActual}`).update({
            'modoConfig/maldicion/eventoActual': null,
            'modoConfig/maldicion/eventoEspecial': null,
            'modoConfig/maldicion/inmune': null,
            'modoConfig/maldicion/inmuneTipo': null,
            faseActual: 'asignacion' // Saltar directamente a asignación
        });
        return;
    }

    // Ocurre un evento
    const ultimoEvento = partida.modoConfig?.maldicion?.ultimoEventoNombre || null;
    const evento = seleccionarEvento(ultimoEvento);

    console.log(`🔮 ¡Evento paranormal! "${evento.nombre}" (${evento.categoria})`);

    // Ejecutar el efecto del evento
    const resultado = evento.efecto(partida);

    // Si el efecto devuelve null (no se pudo aplicar), intentar otro evento
    if (!resultado) {
        console.log('🔮 Evento no aplicable, saltando...');
        database.ref(`partidas/${state.salaActual}`).update({
            'modoConfig/maldicion/eventoActual': null,
            'modoConfig/maldicion/eventoEspecial': null,
            'modoConfig/maldicion/inmune': null,
            'modoConfig/maldicion/inmuneTipo': null,
            faseActual: 'asignacion'
        });
        return;
    }

    // Preparar datos del evento para Firebase
    const eventoData = {
        nombre: evento.nombre,
        categoria: evento.categoria,
        icono: evento.icono,
        narrativa: evento.narrativa(resultado.datos)
    };

    // Aplicar actualizaciones del efecto + guardar datos del evento
    const actualizaciones = {
        ...resultado.actualizaciones,
        [`partidas/${state.salaActual}/modoConfig/maldicion/eventoActual`]: eventoData,
        [`partidas/${state.salaActual}/modoConfig/maldicion/ultimoEventoNombre`]: evento.nombre,
        [`partidas/${state.salaActual}/faseActual`]: 'evento'
    };

    database.ref().update(actualizaciones);
}

/**
 * Limpia los datos del evento actual y avanza a la fase de asignación.
 * Solo debe ser llamado por el ANFITRIÓN.
 */
export function continuarDespuesDeEvento() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}`).update({
        faseActual: 'asignacion'
        // NO limpiamos eventoEspecial aquí porque algunos eventos afectan la votación
    });
}

/**
 * Limpia los datos del evento especial al finalizar la ronda.
 * Se llama después de la votación para resetear efectos temporales.
 */
export function limpiarEventoRonda() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}/modoConfig/maldicion`).update({
        eventoActual: null,
        eventoEspecial: null,
        inmune: null,
        inmuneTipo: null
    });
}
