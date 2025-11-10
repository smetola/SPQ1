// firebaseSync.js - Sincronización con Firebase (listeners)

import { state, getDatabase } from './gameState.js';
import * as UI from '../uiManager.js';
import { comenzarFaseVotacion } from './phaseManager.js';

// Escuchar cambios en la lista de jugadores del lobby
export function escucharJugadoresEnLobby() {
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    
    const database = getDatabase();
    state.refJugadoresEnLobby = database.ref(`partidas/${state.salaActual}/jugadores`);
    state.refJugadoresEnLobby.on('value', (snapshot) => {
        UI.actualizarListaLobby(snapshot.val(), state.jugadorIdActual);
    });
}

// Escuchar cuando la partida comienza
export function escucharInicioPartida() {
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    
    const database = getDatabase();
    state.refEstadoPartida = database.ref(`partidas/${state.salaActual}/estado`);
    state.refEstadoPartida.on('value', (snapshot) => {
        if (snapshot.val() === 'jugando') {
            if (state.refEstadoPartida) state.refEstadoPartida.off();
            state.refEstadoPartida = null;
            
            if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
            state.refJugadoresEnLobby = null;

            escucharDatosJuego();
        }
    });
}

// Escuchar todos los cambios durante el juego
export function escucharDatosJuego() {
    if (state.refDatosJuego) state.refDatosJuego.off();
    
    const database = getDatabase();
    state.refDatosJuego = database.ref(`partidas/${state.salaActual}`);
    
    state.refDatosJuego.on('value', (snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;

        const { jugadores, faseActual, rondaActual, debateEndTime } = partida;

        // Primera carga
        if (state.primeraCargaJuego) {
            UI.mostrarPantallaJuego(rondaActual, state.soyAnfitrion);
            state.primeraCargaJuego = false;
        }

        // Actualizar datos locales y UI
        if (jugadores) {
            UI.actualizarCarousel(jugadores);

            if (jugadores[state.jugadorIdActual]) {
                state.miPersonajeSecreto = jugadores[state.jugadorIdActual].personaje;
                state.miAtributoParaAsignar = jugadores[state.jugadorIdActual].atributoParaAsignar || null;
            }

            if (state.faseAnterior === null && state.miPersonajeSecreto) {
                UI.mostrarModalQuienSoy(state.miPersonajeSecreto);
            }
        }

        // Lógica de botones del Anfitrión
        if (state.soyAnfitrion && faseActual === 'asignacion') {
            const faltanPorAsignar = jugadores ? Object.values(jugadores).filter(j => j.atributoParaAsignar).length : 0;
            if (faltanPorAsignar === 0) {
                UI.mostrarBotonComenzarDebate(rondaActual);
            } else {
                UI.ocultarBotonComenzarDebate();
            }
        }
        
        // Temporizador de debate
        if (faseActual === 'debate' && debateEndTime) {
            if (state.timerInterval === null) {
                state.timerInterval = setInterval(() => {
                    const segundosRestantes = (debateEndTime - Date.now()) / 1000;

                    if (segundosRestantes > 0) {
                        UI.actualizarTimer(segundosRestantes, true);
                    } else {
                        UI.actualizarTimer(0, true);
                        clearInterval(state.timerInterval);
                        state.timerInterval = null;
                        
                        if (state.soyAnfitrion) comenzarFaseVotacion();
                    }
                }, 1000);
            }
        } else {
            if (state.timerInterval) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                UI.actualizarTimer(0, false);
            }
        }

        // Reaccionar a cambios de fase
        if (faseActual !== state.faseAnterior) {
            if (faseActual === 'asignacion') {
                UI.ocultarBotonComenzarRonda(); // ¡OCULTAR botón de comenzar ronda para todos!
                
                // Solo mostrar modal de asignación si tengo atributo
                if (state.miAtributoParaAsignar) {
                    UI.mostrarModalAsignacion(rondaActual, state.miAtributoParaAsignar);
                }
            } 
            else if (faseActual === 'debate') {
                UI.mostrarFaseDebate(rondaActual, state.soyAnfitrion);
            }
            else if (faseActual === 'votacion') {
                UI.mostrarFaseVotacion(rondaActual);
            }
            
            state.faseAnterior = faseActual;
        }
    });
}
