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

        // --- 1. Actualizar datos locales y UI básica ---
        if (jugadores) {
            // --- 1a. Calcular recuento de votos (¡NUEVO!) ---
            const recuentoVotos = {};
            Object.values(jugadores).forEach(j => {
                if (j.votoSeleccionado) {
                    recuentoVotos[j.votoSeleccionado] = (recuentoVotos[j.votoSeleccionado] || 0) + 1;
                }
            });

            // --- 1b. Extraer mi estado de voto (¡NUEVO!) ---
            const miEstado = jugadores[state.jugadorIdActual] || {};
            const miVotoActual = miEstado.votoSeleccionado || null;
            state.heConfirmadoMiVoto = miEstado.votoConfirmado || false;

            // --- 1c. Actualizar carrusel con datos de votación ---
            UI.actualizarCarousel(jugadores, miVotoActual, recuentoVotos);

            // --- 1d. Actualizar mi personaje y atributo ---
            if (miEstado.personaje) {
                state.miPersonajeSecreto = miEstado.personaje;
                state.miAtributoParaAsignar = miEstado.atributoParaAsignar || null;
            }

            // Mostrar modal "Quién Soy" solo la primera vez
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
            // Gestionar botón de confirmar voto (para TODOS)
            UI.gestionarBotonConfirmar(true, state.heConfirmadoMiVoto, !!(jugadores[state.jugadorIdActual]?.votoSeleccionado));

            // Gestionar temporizador
            if (debateEndTime && state.timerInterval === null) {
                state.timerInterval = setInterval(() => {
                    const segundosRestantes = (debateEndTime - Date.now()) / 1000;

                    if (segundosRestantes > 0) {
                        UI.actualizarTimer(segundosRestantes, true);
                    } else {
                        // ¡TIEMPO AGOTADO!
                        UI.actualizarTimer(0, true);
                        clearInterval(state.timerInterval);
                        state.timerInterval = null;
                        
                        // El anfitrión es responsable de calcular el resultado
                        if (state.soyAnfitrion) comprobarYEliminar();
                    }
                }, 1000);
            }

            // ¡NUEVO! Comprobar si todos han confirmado (Host-only)
            if (state.soyAnfitrion && jugadores) {
                const jugadoresVivos = Object.values(jugadores).filter(j => j.personaje?.estaVivo);
                const confirmados = jugadoresVivos.filter(j => j.votoConfirmado).length;

                if (jugadoresVivos.length > 0 && confirmados === jugadoresVivos.length) {
                    // ¡TODOS HAN CONFIRMADO!
                    if (state.timerInterval) { // Detener el timer si sigue activo
                        clearInterval(state.timerInterval);
                        state.timerInterval = null;
                    }
                    comprobarYEliminar();
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
            
            if (faseActual === 'asignacion') {
                UI.ocultarBotonComenzarRonda();
                if (state.miAtributoParaAsignar) {
                    UI.mostrarModalAsignacion(rondaActual, state.miAtributoParaAsignar);
                }
            } 
            else if (faseActual === 'debate') {
                state.heConfirmadoMiVoto = false; // Resetea al inicio de la fase
                UI.mostrarFaseDebate(rondaActual); // ¡Ya no pasa 'esAnfitrion'!
            }
            // 'votacion' ya no existe como fase separada, se fusiona con 'debate'
            // 'resultados' se gestionará en un futuro
            
            state.faseAnterior = faseActual;
        }
    });
}