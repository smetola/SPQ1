// lobbyManager.js - Gestión del lobby (crear/unirse a partidas)

import { state, getDatabase, resetState } from './gameState.js';
import * as UI from '../uiManager.js';
import { escucharJugadoresEnLobby, escucharInicioPartida } from './firebaseSync.js';

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
        rondaActual: 1, 
        faseActual: 'lobby' 
    };
    
    database.ref('partidas/' + codigoSala).set(datosPartida)
        .then(() => {
            const nombreAnfitrion = prompt("Introduce tu nombre (Anfitrión):", "Anfitrión");
            const refJugador = database.ref(`partidas/${codigoSala}/jugadores`).push({ 
                nombre: nombreAnfitrion || "Anfitrión", 
                esAnfitrion: true 
            });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = true;
            state.salaActual = codigoSala;

            UI.mostrarLobby(codigoSala);
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        })
        .catch((error) => console.error("Error al crear la partida:", error));
}

// Unirse a partida existente
export function unirseAPartida(codigo, nombre) {
    if (!codigo || !nombre) {
        alert("Debes introducir un nombre y un código de sala.");
        return;
    }
    
    const database = getDatabase();
    database.ref(`partidas/${codigo}`).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            alert("No se encontró ninguna partida con ese código.");
            return;
        }
        if (snapshot.val().estado !== 'lobby') { 
            alert("Esta partida ya ha comenzado. No puedes unirte."); 
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
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).once('value', (snapshot) => {
            if (snapshot.val()?.esAnfitrion) {
                database.ref(`partidas/${state.salaActual}`).remove();
            } else {
                database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).remove();
            }
        });
    }
    
    resetState();
    UI.volverAlMenu();
}
