// logic/firebaseSync.js - Sincronización con Firebase (listeners)

import { state, getDatabase } from './gameState.js';
import * as UI from '../uiManager.js';
import { comprobarYEliminar } from './votingManager.js';

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
        const estado = snapshot.val();
        
        // Inicio normal
        if (estado === 'jugando') {
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

        const { jugadores, estado, faseActual, rondaActual, debateEndTime, ultimoEliminado, ganador } = partida;

        // ¡NUEVO! Detectar si el anfitrión ha reiniciado la partida
        if (estado === 'lobby' && state.faseAnterior !== null) {
            console.log("Detectado reinicio por el anfitrión. Volviendo al lobby...");
            if (state.refDatosJuego) state.refDatosJuego.off(); // Detener este listener
            
            // Resetear estado local (limpia timers, etc.)
            // Importante: resetState NO limpia salaActual o jugadorIdActual
            // ¡Vamos a necesitar un resetState() más suave!
            // Por ahora, limpiamos manualmente:
            if (state.timerInterval) clearInterval(state.timerInterval);
            state.timerInterval = null;
            state.processingVote = false;
            state.primeraCargaJuego = true;
            state.faseAnterior = null;
            
            // Volver a la pantalla de lobby
            UI.mostrarLobby(state.salaActual);
            
            // Volver a escuchar el lobby y el inicio
            escucharJugadoresEnLobby();
            escucharInicioPartida();
            return; // Detener la ejecución de esta función
        }


        // Primera carga
        if (state.primeraCargaJuego) {
            UI.mostrarPantallaJuego(rondaActual, state.soyAnfitrion);
            state.primeraCargaJuego = false;
        }

        // --- 1. Actualizar datos locales y UI básica ---
        if (jugadores && faseActual !== 'fin') { 
            const recuentoVotos = {};
            Object.values(jugadores).forEach(j => {
                if (j.votoSeleccionado) {
                    recuentoVotos[j.votoSeleccionado] = (recuentoVotos[j.votoSeleccionado] || 0) + 1;
                }
            });

            const miEstado = jugadores[state.jugadorIdActual] || {};
            const miVotoActual = miEstado.votoSeleccionado || null;
            state.heConfirmadoMiVoto = miEstado.votoConfirmado || false;

            UI.actualizarCarousel(jugadores, miVotoActual, recuentoVotos);

            if (miEstado.personaje) {
                state.miPersonajeSecreto = miEstado.personaje;
                state.miAtributoParaAsignar = miEstado.atributoParaAsignar || null;
            }

            if (state.faseAnterior === null && state.miPersonajeSecreto) {
                UI.mostrarModalQuienSoy(state.miPersonajeSecreto);
            }
        }

        // --- 2. Lógica de botones del Anfitrión (Fase Asignación) ---
        if (state.soyAnfitrion && faseActual === 'asignacion') {
            const faltanPorAsignar = jugadores ? Object.values(jugadores).filter(j => j.atributoParaAsignar).length : 0;
            if (faltanPorAsignar === 0) {
                UI.mostrarBotonComenzarDebate(rondaActual);
            } else {
                UI.ocultarBotonComenzarDebate();
            }
        }
        
        // --- 3. Lógica del Temporizador y Fase de Debate ---
        if (faseActual === 'debate') {
            UI.gestionarBotonConfirmar(true, state.heConfirmadoMiVoto, !!(jugadores[state.jugadorIdActual]?.votoSeleccionado));

            if (debateEndTime && state.timerInterval === null) {
                state.timerInterval = setInterval(() => {
                    const segundosRestantes = (debateEndTime - Date.now()) / 1000;

                    if (segundosRestantes > 0) {
                        UI.actualizarTimer(segundosRestantes, true);
                    } else {
                        UI.actualizarTimer(0, true);
                        clearInterval(state.timerInterval);
                        state.timerInterval = null;
                        
                        if (state.soyAnfitrion) comprobarYEliminar();
                    }
                }, 1000);
            }

            if (state.soyAnfitrion && jugadores) {
                const jugadoresVivos = Object.values(jugadores).filter(j => j.personaje?.estaVivo);
                if (jugadoresVivos.length > 0) {
                    const confirmados = jugadoresVivos.filter(j => j.votoConfirmado).length;

                    if (confirmados === jugadoresVivos.length) {
                        if (state.timerInterval) {
                            clearInterval(state.timerInterval);
                            state.timerInterval = null;
                            UI.actualizarTimer(0, false);
                        }
                        comprobarYEliminar();
                    }
                }
            }

        } else { // Si no estamos en debate, limpiar timer y botón
            if (state.timerInterval) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                UI.actualizarTimer(0, false);
            }
            UI.gestionarBotonConfirmar(false);
        }

        // --- 4. Reaccionar a cambios de fase ---
        if (faseActual !== state.faseAnterior) {
            
            if (faseActual !== 'fin') {
                UI.ocultarModalFinJuego();
            }
            if (faseActual !== 'resultados') {
                UI.ocultarModalResultados();
            }

            if (faseActual === 'conocimiento') {
                state.processingVote = false;
                UI.mostrarPantallaJuego(rondaActual, state.soyAnfitrion);
            }
            else if (faseActual === 'asignacion') {
                state.processingVote = false;
                UI.ocultarBotonComenzarRonda();
                if (state.miAtributoParaAsignar) {
                    UI.mostrarModalAsignacion(rondaActual, state.miAtributoParaAsignar);
                }
            } 
            else if (faseActual === 'debate') {
                state.processingVote = false;
                state.heConfirmadoMiVoto = false; 
                UI.mostrarFaseDebate(rondaActual);
            }
            else if (faseActual === 'resultados') {
                state.processingVote = false;
                UI.mostrarModalResultados(ultimoEliminado, state.soyAnfitrion);
            }
            else if (faseActual === 'fin') {
                // ¡LÓGICA CORREGIDA!
                state.processingVote = false;
                UI.mostrarPantallaFinJuego(); // Prepara el tablero de fondo
                UI.mostrarModalFinJuego(ganador, state.soyAnfitrion); // Muestra el modal
            }
            
            state.faseAnterior = faseActual;
        }
    });
}