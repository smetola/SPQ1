// attributeManager.js - Gestión de atributos (repartir y asignar)

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

// Repartir atributos al inicio de cada ronda
export function repartirAtributos() {
    console.log("🎯 repartirAtributos() llamada - Sala:", state.salaActual);
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;
        
        const jugadorIDs = Object.keys(partida.jugadores);
        const listaAtributosRonda = Data.LISTAS_ATRIBUTOS[partida.rondaActual] || Data.ATRIBUTOS_LIFEORDEATH;
        let atributosDisponiblesRonda = [...listaAtributosRonda]; 
        
        const actualizaciones = {};

        jugadorIDs.forEach((id) => {
            let atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            if (atributoRepartido === "Dato Agotado") {
                atributosDisponiblesRonda = [...listaAtributosRonda];
                atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            }
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/atributoParaAsignar`] = atributoRepartido;
        });
        
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'asignacion';
        
        database.ref().update(actualizaciones)
            .catch((err) => console.error("Error al repartir atributos:", err));
    });
}

// Asignar atributo a un personaje (clic en tarjeta)
export function asignarAtributoAPersonaje(personajeClickeado) {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}/faseActual`).once('value').then(snap => {
        if (snap.val() !== 'asignacion') return;
        if (!state.miAtributoParaAsignar) {
            alert("Ya has asignado tu atributo para esta ronda.");
            return;
        }
        if (!personajeClickeado.estaVivo) {
            alert("No puedes asignar atributos a un personaje muerto.");
            return;
        }
        
        if (confirm(`¿Estás seguro de que quieres asignar "${state.miAtributoParaAsignar}" a ${personajeClickeado.nombre}?`)) {
            database.ref(`partidas/${state.salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/atributosAsignados`)
                .push(state.miAtributoParaAsignar);
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/atributoParaAsignar`).remove();

            alert("¡Atributo asignado!");
            state.miAtributoParaAsignar = null;
        }
    });
}
