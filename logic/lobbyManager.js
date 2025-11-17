// logic/lobbyManager.js - Gestión del lobby (crear/unirse a partidas)

import { state, getDatabase, resetState, getModalManager } from './gameState.js';
import * as UI from '../uiManager.js';
import { escucharJugadoresEnLobby, escucharInicioPartida } from './firebaseSync.js';
import * as Data from '../gameData.js';

// Generar código aleatorio de sala
function generarCodigoAleatorio(longitud) {
    let resultado = '';
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < longitud; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

// Crear nueva partida
export function crearNuevaPartida() {
    const database = getDatabase();
    const codigoSala = generarCodigoAleatorio(4);
    const datosPartida = { 
        estado: "lobby", 
        creadaEn: Date.now(), 
        jugadores: {}, 
        // 'rondaActual' ya no se usa
        faseActual: 'lobby' 
    };
    
    const refPartida = database.ref('partidas/' + codigoSala);

    refPartida.set(datosPartida)
        .then(async () => {
            const modal = getModalManager();
            const nombreAnfitrion = await modal.mostrarPrompt(
                "Introduce tu nombre para crear la partida:",
                "Anfitrión",
                "CREAR PARTIDA"
            );
            
            if (!nombreAnfitrion) return; // Cancelado
            
            const refJugador = database.ref(`partidas/${codigoSala}/jugadores`).push({ 
                nombre: nombreAnfitrion, 
                esAnfitrion: true 
            });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = true;
            state.salaActual = codigoSala;

            refPartida.onDisconnect().remove();

            UI.mostrarLobby(codigoSala);
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        })
        .catch((error) => console.error("Error al crear la partida:", error));
}

// Unirse a partida existente
export async function unirseAPartida(codigo, nombre) {
    const modal = getModalManager();
    
    if (!codigo || !nombre) {
        await modal.mostrarAlerta("Debes introducir un nombre y un código de sala.");
        return;
    }
    
    const database = getDatabase();
    database.ref(`partidas/${codigo}`).once('value').then(async (snapshot) => {
        if (!snapshot.exists()) {
            await modal.mostrarAlerta("No se encontró ninguna partida con ese código.", "ERROR");
            return;
        }
        if (snapshot.val().estado !== 'lobby') { 
            await modal.mostrarAlerta("Esta partida ya ha comenzado. No puedes unirte.", "PARTIDA INICIADA"); 
            return; 
        }
        
        const refJugador = database.ref(`partidas/${codigo}/jugadores`).push({ 
            nombre: nombre, 
            esAnfitrion: false 
        });
        
        state.jugadorIdActual = refJugador.key;
        state.soyAnfitrion = false;
        state.salaActual = codigo;
        
        UI.mostrarLobby(codigo);
        escucharJugadoresEnLobby();
        escucharInicioPartida();
    }).catch((error) => console.error("Error al comprobar la sala:", error));
}

// Salir de la partida
export function handleSalir() {
    const database = getDatabase();
    
    if (state.salaActual && state.jugadorIdActual) {
        const refPartida = database.ref(`partidas/${state.salaActual}`);
        
        if (state.soyAnfitrion) {
            refPartida.onDisconnect().cancel(); 
            refPartida.remove();
        } else {
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).remove();
        }
    }
    
    resetState();
    UI.volverAlMenu();
}

/**
 * ¡MODIFICADO!
 * Reinicia la partida al Lobby y resetea la progresión de tiers.
 */
export function reiniciarPartida() {
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value', (snap) => {
        const partida = snap.val();
        if (!partida) return;

        const jugadores = partida.jugadores;
        const actualizaciones = {};
        
        // ¡NUEVO! Recalcular la progresión de tiers para el lobby
        const numJugadores = Object.keys(jugadores).length;
        let progresionTiers = [];
        const baseProgression = ["bronce", "plata", "oro"];
        const finProgression = ["lifeordeath", "lifeordeath", "lifeordeath"];

        if (numJugadores <= 4) {
            progresionTiers = [...baseProgression, "platino", "diamante", ...finProgression];
        } else if (numJugadores === 5) {
            progresionTiers = [...baseProgression, "platino", "diamante", "diamante", ...finProgression];
        } else {
            progresionTiers = [...baseProgression, "platino", "platino", "diamante", "diamante", ...finProgression];
        }

        // 1. Limpiar datos de juego de cada jugador
        Object.keys(jugadores).forEach(id => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/atributoParaAsignar`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoConfirmado`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoSeleccionado`] = null;
        });

        // 2. Resetear estado de la partida
        actualizaciones[`partidas/${state.salaActual}/estado`] = 'lobby';
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'lobby';
        actualizaciones[`partidas/${state.salaActual}/ganador`] = null;
        actualizaciones[`partidas/${state.salaActual}/ultimoEliminado`] = null;
        actualizaciones[`partidas/${state.salaActual}/debateEndTime`] = null;
        
        // ¡NUEVO! Resetea las listas y la progresión
        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = JSON.parse(JSON.stringify(Data.LISTAS_ATRIBUTOS));
        actualizaciones[`partidas/${state.salaActual}/progresionTiers`] = progresionTiers;
        actualizaciones[`partidas/${state.salaActual}/progressionIndex`] = 0;

        // 3. Aplicar cambios
        database.ref().update(actualizaciones);
    });
}