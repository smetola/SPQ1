// roundManager.js - Gestión de rondas

import { state, getDatabase } from './gameState.js';
import * as Data from '../gameData.js';

// Función auxiliar: selección aleatoria
function seleccionarElementoAleatorio(array, borrar = false) {
    if (array.length === 0) return "Dato Agotado";
    const indice = Math.floor(Math.random() * array.length);
    const elemento = array[indice];
    if (borrar) array.splice(indice, 1);
    return elemento;
}

// Empezar la partida (crear personajes)
export function empezarPartida() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const jugadorIDs = Object.keys(snapshot.val().jugadores);
        
        if (jugadorIDs.length < 2) { 
            alert("Se necesitan al menos 2 jugadores para empezar."); 
            return; 
        }

        const actualizaciones = {};
        let nombresDisponibles = [...Data.NOMBRES_PERSONAJE];
        let atributosBasicosDisponibles = [...Data.ATRIBUTOS_BRONCE];

        // Crear personajes para cada jugador
        jugadorIDs.forEach((id) => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje`] = {
                nombre: seleccionarElementoAleatorio(nombresDisponibles, true),
                edad: Math.floor(Math.random() * 43) + 18,
                atributoBasico: seleccionarElementoAleatorio(atributosBasicosDisponibles, true),
                atributosAsignados: {},
                estaVivo: true
            };
        });

        actualizaciones[`partidas/${state.salaActual}/rondaActual`] = 1;
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'conocimiento';
        actualizaciones[`partidas/${state.salaActual}/estado`] = 'jugando'; 

        database.ref().update(actualizaciones)
            .catch((err) => console.error("Error al actualizar la partida:", err));
    });
}

// Avanzar a la siguiente ronda (después de eliminar a alguien)
// ¡FUNCIÓN PARA EL FUTURO!
export function avanzarSiguienteRonda() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        const nuevaRonda = partida.rondaActual + 1;
        
        // Comprobar si solo queda 1 personaje vivo (condición de victoria)
        const personajesVivos = Object.values(partida.jugadores)
            .filter(j => j.personaje?.estaVivo).length;
        
        if (personajesVivos <= 1) {
            // ¡FIN DEL JUEGO!
            database.ref(`partidas/${state.salaActual}`).update({
                faseActual: 'fin',
                ganador: personajesVivos === 1 ? 
                    Object.values(partida.jugadores).find(j => j.personaje?.estaVivo)?.personaje : null
            });
        } else {
            // Continuar a la siguiente ronda
            database.ref(`partidas/${state.salaActual}`).update({
                rondaActual: nuevaRonda,
                faseActual: 'conocimiento'
            });
        }
    });
}
