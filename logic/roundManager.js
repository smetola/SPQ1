// roundManager.js - Gestión de rondas

import { state, getDatabase, getModalManager } from './gameState.js';
import * as Data from '../gameData.js';
import { obtenerPoolAtributos, obtenerPoolNombres } from './attributeGenerator.js';
import { esModoActivo } from './modeManager.js';
import { inicializarModoTraidor } from './traitorManager.js';
import { inicializarModoAlianzas } from './allianceManager.js';
import { inicializarModoPoderes, otorgarEnergiaRonda, limpiarPoderesRonda } from './powerManager.js';

// Generar pools expandidos de atributos (originales + generados)
function generarPoolsExpandidos() {
    return {
        bronce: obtenerPoolAtributos('bronce', 20),
        plata: obtenerPoolAtributos('plata', 20),
        oro: obtenerPoolAtributos('oro', 20),
        platino: obtenerPoolAtributos('platino', 20),
        diamante: obtenerPoolAtributos('diamante', 20),
        lifeordeath: obtenerPoolAtributos('lifeordeath', 15)
    };
}

// Función auxiliar: selección aleatoria
function seleccionarElementoAleatorio(array, borrar = false) {
    if (array.length === 0) return "Dato Agotado";
    const indice = Math.floor(Math.random() * array.length);
    const elemento = array[indice];
    if (borrar) array.splice(indice, 1);
    return elemento;
}

/**
 * ¡MODIFICADO!
 * Ya no usa 'rondaActual'. En su lugar, crea un array de progresión
 * de tiers basado en el número de jugadores.
 */
export async function empezarPartida() {
    const database = getDatabase();
    const modal = getModalManager();

    // CRÍTICO: Cancelar el onDisconnect del lobby para que la partida no se borre
    if (state.soyAnfitrion) {
        const partidaRef = database.ref(`partidas/${state.salaActual}`);
        partidaRef.onDisconnect().cancel();
        console.log('🔌 onDisconnect del lobby cancelado - partida persistente');
    }

    database.ref(`partidas/${state.salaActual}`).once('value').then(async (snapshot) => {
        const jugadorIDs = Object.keys(snapshot.val().jugadores);
        const numJugadores = jugadorIDs.length;

        if (numJugadores < 2) {
            await modal.mostrarAlerta("Se necesitan al menos 2 jugadores para empezar.", "JUGADORES INSUFICIENTES");
            return;
        }

        const actualizaciones = {};
        let nombresDisponibles = obtenerPoolNombres(30); // Pool expandido con nombres españoles

        // 1. Generar pools COMPLETOS primero
        let listasAtributos = generarPoolsExpandidos();

        // 2. Extraer atributos básicos del pool de BRONCE para que no se repitan
        // (Usamos splice para sacarlos físicamente del array)
        jugadorIDs.forEach((id) => {
            // Sacar un atributo aleatorio de la lista de bronce generada
            const indiceAtributo = Math.floor(Math.random() * listasAtributos.bronce.length);
            const atributoBasico = listasAtributos.bronce.splice(indiceAtributo, 1)[0];

            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje`] = {
                nombre: seleccionarElementoAleatorio(nombresDisponibles, true),
                edad: Math.floor(Math.random() * 43) + 18,
                atributoBasico: atributoBasico, // Usar el extraído
                atributosAsignados: {},
                estaVivo: true
            };
        });

        // 3. Guardar las listas YA RECORTADAS
        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = listasAtributos;

        // Inicializar índice de progresión
        actualizaciones[`partidas/${state.salaActual}/progressionIndex`] = 0;

        // Seleccionar historia según los modos activos
        const modosActivos = snapshot.val().modosActivos || [];
        let historiaSeleccionada;

        // Buscar historias vinculadas a modos activos
        const historiasVinculadas = Data.HISTORIAS.filter(h => 
            h.modoVinculado && modosActivos.includes(h.modoVinculado)
        );

        if (historiasVinculadas.length > 0) {
            // Si hay historias vinculadas a modos activos, elegir una de ellas
            historiaSeleccionada = historiasVinculadas[Math.floor(Math.random() * historiasVinculadas.length)];
        } else {
            // Si no, elegir entre las historias genéricas (sin modoVinculado)
            const historiasGenericas = Data.HISTORIAS.filter(h => !h.modoVinculado);
            historiaSeleccionada = historiasGenericas[Math.floor(Math.random() * historiasGenericas.length)];
        }

        actualizaciones[`partidas/${state.salaActual}/historiaActual`] = historiaSeleccionada;

        // MODO TRAIDOR: Inicializar si está activo
        if (modosActivos.includes('traidor')) {
            const traitorUpdates = inicializarModoTraidor(jugadorIDs);
            Object.assign(actualizaciones, traitorUpdates);
        }

        // MODO ALIANZAS: Inicializar si está activo
        if (modosActivos.includes('alianzas')) {
            const alianzaUpdates = inicializarModoAlianzas(jugadorIDs);
            Object.assign(actualizaciones, alianzaUpdates);
        }

        // MODO PODERES: Inicializar si está activo
        if (modosActivos.includes('poderes')) {
            const poderUpdates = inicializarModoPoderes(jugadorIDs);
            Object.assign(actualizaciones, poderUpdates);
        }

        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'historia';
        actualizaciones[`partidas/${state.salaActual}/estado`] = 'jugando';

        database.ref().update(actualizaciones)
            .catch((err) => console.error("Error al actualizar la partida:", err));
    });
}

/**
 * ¡MODIFICADO!
 * Ya no incrementa 'rondaActual'. En su lugar, incrementa 'progressionIndex'.
 */
export function avanzarSiguienteRonda() {
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();

        const personajesVivos = Object.values(partida.jugadores)
            .filter(j => j.personaje?.estaVivo).length;

        if (personajesVivos <= 1) {
            // ¡FIN DEL JUEGO!
            let ganadorData = null;

            if (personajesVivos === 1) {
                const jugadorGanador = Object.values(partida.jugadores).find(j => j.personaje?.estaVivo);
                if (jugadorGanador) {
                    ganadorData = {
                        nombreJugador: jugadorGanador.nombre,
                        nombrePersonaje: jugadorGanador.personaje.nombre
                    };
                }
            }

            database.ref(`partidas/${state.salaActual}`).update({
                faseActual: 'fin',
                ganador: ganadorData
            });
        } else {
            // Comprobar si hubo empate
            const ultimoEliminado = partida.ultimoEliminado;
            let nuevoIndex = partida.progressionIndex || 0;

            if (ultimoEliminado === "NADIE (EMPATE)") {
                console.log("Empate detectado. Repitiendo ronda (mismo tier).");
                // NO incrementamos el índice
            } else {
                nuevoIndex++;
            }

            database.ref(`partidas/${state.salaActual}`).update({
                progressionIndex: nuevoIndex,
                faseActual: 'conocimiento'
            });

            // MODO PODERES: Otorgar energía y limpiar poderes de la ronda
            const modosActivos = partida.modosActivos || [];
            if (modosActivos.includes('poderes')) {
                const energiaUpdates = otorgarEnergiaRonda(partida);
                const limpiarUpdates = limpiarPoderesRonda(partida);
                database.ref().update({ ...energiaUpdates, ...limpiarUpdates });
            }
        }
    });
}