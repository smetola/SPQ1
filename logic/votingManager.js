// votingManager.js - Gestión de votación y eliminación

import { state, getDatabase } from './gameState.js';

// Votar a un personaje para eliminarlo
// ¡FUNCIÓN PARA IMPLEMENTAR EN EL FUTURO!
export function votarPersonaje(personajeClickeado) {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}/faseActual`).once('value').then(snap => {
        if (snap.val() !== 'votacion') {
            alert("No estamos en fase de votación.");
            return;
        }
        if (!personajeClickeado.estaVivo) {
            alert("No puedes votar a un personaje muerto.");
            return;
        }
        
        // Comprobar si ya hemos votado
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoActual`).once('value').then(votoSnap => {
            if (votoSnap.exists()) {
                alert("Ya has votado en esta ronda.");
                return;
            }
            
            if (confirm(`¿Estás seguro de que quieres votar a ${personajeClickeado.nombre}?`)) {
                // Registrar el voto
                const actualizaciones = {};
                actualizaciones[`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoActual`] = personajeClickeado.jugadorId;
                
                // Incrementar contador de votos del personaje
                database.ref(`partidas/${state.salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/votosRecibidos`).once('value').then(votosSnap => {
                    const votosActuales = votosSnap.val() || 0;
                    actualizaciones[`partidas/${state.salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/votosRecibidos`] = votosActuales + 1;
                    
                    database.ref().update(actualizaciones);
                    alert("¡Voto registrado!");
                });
            }
        });
    });
}

// Comprobar si todos han votado y calcular eliminado
// ¡FUNCIÓN PARA IMPLEMENTAR EN EL FUTURO! (El anfitrión la ejecuta)
export function comprobarYEliminar() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        const jugadores = partida.jugadores;
        const jugadorIDs = Object.keys(jugadores);
        
        // Contar cuántos han votado
        const votosEmitidos = jugadorIDs.filter(id => jugadores[id].votoActual).length;
        
        if (votosEmitidos < jugadorIDs.length) {
            alert(`Faltan ${jugadorIDs.length - votosEmitidos} votos.`);
            return;
        }
        
        // Calcular quién tiene más votos
        let maxVotos = 0;
        let personajeEliminado = null;
        
        jugadorIDs.forEach(id => {
            const personaje = jugadores[id].personaje;
            if (personaje?.estaVivo) {
                const votos = personaje.votosRecibidos || 0;
                if (votos > maxVotos) {
                    maxVotos = votos;
                    personajeEliminado = { jugadorId: id, ...personaje };
                }
            }
        });
        
        if (personajeEliminado) {
            // Marcar como muerto
            const actualizaciones = {};
            actualizaciones[`partidas/${state.salaActual}/jugadores/${personajeEliminado.jugadorId}/personaje/estaVivo`] = false;
            
            // Limpiar votos
            jugadorIDs.forEach(id => {
                actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoActual`] = null;
                actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje/votosRecibidos`] = 0;
            });
            
            // Cambiar a fase de resultados
            actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'resultados';
            actualizaciones[`partidas/${state.salaActual}/ultimoEliminado`] = personajeEliminado.nombre;
            
            database.ref().update(actualizaciones);
        }
    });
}
