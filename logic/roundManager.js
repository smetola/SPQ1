// roundManager.js - Gestión de rondas

import { state, getDatabase, getModalManager } from './gameState.js';
import * as Data from '../gameData.js';
import { obtenerPoolAtributos } from './attributeGenerator.js';

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

        // --- ¡NUEVA LÓGICA DE PROGRESIÓN! ---
        let progresionTiers = [];
        const baseProgression = ["bronce", "plata", "oro"];
        const finProgression = ["lifeordeath", "lifeordeath", "lifeordeath"]; // Relleno para el final

        if (numJugadores <= 4) {
            // (4p) B, P, O, P, D, L
            progresionTiers = [...baseProgression, "platino", "diamante", ...finProgression];
        } else if (numJugadores === 5) {
            // (5p) B, P, O, P, D, D, L
            progresionTiers = [...baseProgression, "platino", "diamante", "diamante", ...finProgression];
        } else {
            // (6p+) B, P, O, P, P, D, D, L
            progresionTiers = [...baseProgression, "platino", "platino", "diamante", "diamante", ...finProgression];
        }
        // ------------------------------------

        const actualizaciones = {};
        let nombresDisponibles = [...Data.NOMBRES_PERSONAJE];
        let atributosBasicosDisponibles = [...Data.ATRIBUTOS_BRONCE];

        jugadorIDs.forEach((id) => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje`] = {
                nombre: seleccionarElementoAleatorio(nombresDisponibles, true),
                edad: Math.floor(Math.random() * 43) + 18,
                atributoBasico: seleccionarElementoAleatorio(atributosBasicosDisponibles, true),
                atributosAsignados: {},
                estaVivo: true
            };
        });

        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = generarPoolsExpandidos();
        
        // ¡NUEVO! Guarda la progresión en Firebase
        actualizaciones[`partidas/${state.salaActual}/progresionTiers`] = progresionTiers;
        actualizaciones[`partidas/${state.salaActual}/progressionIndex`] = 0;
        
        // Seleccionar historia aleatoria
        const historiaSeleccionada = Data.HISTORIAS[Math.floor(Math.random() * Data.HISTORIAS.length)];
        actualizaciones[`partidas/${state.salaActual}/historiaActual`] = historiaSeleccionada;
        
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
            // ¡NUEVO! Incrementar el índice de progresión
            let nuevoIndex = (partida.progressionIndex || 0) + 1;
            
            // Evitar que el índice se salga del array
            if (nuevoIndex >= partida.progresionTiers.length) {
                nuevoIndex = partida.progresionTiers.length - 1;
            }

            database.ref(`partidas/${state.salaActual}`).update({
                progressionIndex: nuevoIndex, // Actualiza el índice
                faseActual: 'conocimiento'
            });
        }
    });
}