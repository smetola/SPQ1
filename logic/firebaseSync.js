// logic/firebaseSync.js - Sincronización con Firebase (listeners)

import { state, getDatabase, getModalManager } from './gameState.js';
import * as UI from '../uiManager.js';
import { comprobarYEliminar } from './votingManager.js';

// Escuchar cambios en la lista de jugadores del lobby
export function escucharJugadoresEnLobby() {
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    
    const database = getDatabase();
    state.refJugadoresEnLobby = database.ref(`partidas/${state.salaActual}/jugadores`);
    
    console.log('👂 Listener de jugadores en lobby activado');
    
    state.refJugadoresEnLobby.on('value', (snapshot) => {
        const jugadores = snapshot.val();
        
        // Actualizar la lista visual del lobby
        UI.actualizarListaLobby(jugadores, state.jugadorIdActual);
        
        // NUEVO: Detectar si nos han transferido el rol de anfitrión
        if (jugadores && state.jugadorIdActual && jugadores[state.jugadorIdActual]) {
            const esAnfitrionAhora = jugadores[state.jugadorIdActual].esAnfitrion === true;
            
            if (esAnfitrionAhora && !state.soyAnfitrion) {
                console.log('🎖️ ¡Has recibido el rol de anfitrión!');
                state.soyAnfitrion = true;
                
                // Configurar onDisconnect para proteger la partida
                const refPartida = database.ref(`partidas/${state.salaActual}`);
                refPartida.onDisconnect().remove();
                console.log('🔒 Configurado onDisconnect como nuevo anfitrión');
                
                // Mostrar notificación al nuevo anfitrión
                const modal = getModalManager();
                if (modal) {
                    modal.mostrarAlerta(
                        "El anfitrión anterior ha transferido su rol. Ahora tú controlas la partida.",
                        "🎖️ ERES EL NUEVO ANFITRIÓN"
                    ).then(() => {
                        // Después de cerrar el modal, actualizar la UI
                        UI.actualizarListaLobby(jugadores, state.jugadorIdActual);
                    });
                } else {
                    // Si no hay modal manager, actualizar directamente
                    UI.actualizarListaLobby(jugadores, state.jugadorIdActual);
                }
            } else if (!esAnfitrionAhora && state.soyAnfitrion) {
                console.log('📤 Has perdido el rol de anfitrión');
                state.soyAnfitrion = false;
                
                // Cancelar onDisconnect de partida (ya no eres responsable)
                const refPartida = database.ref(`partidas/${state.salaActual}`);
                refPartida.onDisconnect().cancel();
                
                UI.actualizarListaLobby(jugadores, state.jugadorIdActual);
            }
        }
    }, (error) => {
        console.error('❌ Error en listener de lobby:', error);
    });
}

// Escuchar cuando la partida comienza
export function escucharInicioPartida() {
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    
    const database = getDatabase();
    state.refEstadoPartida = database.ref(`partidas/${state.salaActual}/estado`);
    state.refEstadoPartida.on('value', (snapshot) => {
        const estado = snapshot.val();
        
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
    
    console.log('👂 Listener de datos del juego activado para sala:', state.salaActual);
    
    state.refDatosJuego.on('value', (snapshot) => {
        const partida = snapshot.val();
        
        // CRÍTICO: Si la partida desaparece, puede ser desconexión temporal
        if (!partida) {
            console.warn('⚠️ Partida no encontrada. Esperando reconexión...');
            return;
        }

        // NUEVO: Validar que la partida tenga datos completos
        if (!partida.estado || !partida.faseActual) {
            console.warn('⚠️ Datos de partida incompletos (anfitrión desconectado). Esperando reconexión...', partida);
            // No hacer nada, mantener la UI como está
            return;
        }

        console.log('🔄 Datos de partida actualizados:', { 
            estado: partida.estado, 
            fase: partida.faseActual,
            jugadores: Object.keys(partida.jugadores || {}).length
        });

        // ¡MODIFICADO! 'rondaActual' ya no se usa
        const { jugadores, estado, faseActual, debateEndTime, ultimoEliminado, ganador } = partida;

        // ¡NUEVO! Detectar reinicio por el anfitrión
        if (estado === 'lobby' && state.faseAnterior !== null) {
            console.log("Detectado reinicio por el anfitrión. Volviendo al lobby...");
            if (state.refDatosJuego) state.refDatosJuego.off();
            
            if (state.timerInterval) clearInterval(state.timerInterval);
            state.timerInterval = null;
            state.processingVote = false;
            state.primeraCargaJuego = true;
            state.faseAnterior = null;
            
            UI.mostrarLobby(state.salaActual);
            
            escucharJugadoresEnLobby();
            escucharInicioPartida();
            return;
        }


        // Primera carga
        if (state.primeraCargaJuego) {
            UI.mostrarPantallaJuego(state.soyAnfitrion);
            state.primeraCargaJuego = false;
        }

        // NUEVO: Detectar transferencia de anfitrión durante el juego
        // IMPORTANTE: Hacer esto ANTES de procesar la lógica de botones
        if (jugadores && state.jugadorIdActual && jugadores[state.jugadorIdActual]) {
            const esAnfitrionAhora = jugadores[state.jugadorIdActual].esAnfitrion === true;
            
            if (esAnfitrionAhora && !state.soyAnfitrion) {
                console.log('🎖️ ¡Has recibido el rol de anfitrión durante el juego!');
                state.soyAnfitrion = true;
                
                // Configurar onDisconnect para proteger la partida
                const refPartida = database.ref(`partidas/${state.salaActual}`);
                refPartida.onDisconnect().remove();
                console.log('🔒 Configurado onDisconnect como nuevo anfitrión (durante juego)');
                
                // Actualizar la UI según la fase actual
                if (faseActual === 'conocimiento') {
                    UI.mostrarPantallaJuego(true); // Mostrar con botón de anfitrión
                    UI.ocultarMensajeEspera();
                }
                
                // Mostrar notificación al nuevo anfitrión (sin bloquear el flujo)
                const modal = getModalManager();
                if (modal) {
                    // No await aquí - dejar que el modal se muestre pero continuar el procesamiento
                    setTimeout(() => {
                        modal.mostrarAlerta(
                            "El anfitrión anterior ha transferido su rol. Ahora tú controlas la partida.",
                            "🎖️ ERES EL NUEVO ANFITRIÓN"
                        );
                    }, 100);
                }
                
                // La UI se actualizará automáticamente en este mismo ciclo (más abajo)
            } else if (!esAnfitrionAhora && state.soyAnfitrion) {
                console.log('📤 Has perdido el rol de anfitrión durante el juego');
                state.soyAnfitrion = false;
                
                // Cancelar onDisconnect de partida (ya no eres responsable)
                const refPartida = database.ref(`partidas/${state.salaActual}`);
                refPartida.onDisconnect().cancel();
                
                // Ocultar botones de anfitrión
                if (faseActual === 'conocimiento') {
                    UI.ocultarBotonComenzarRonda();
                    UI.mostrarMensajeEspera("Esperando a que el anfitrión comience la ronda...");
                }
            }
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
            // Ocultar mensajes de espera (ahora controlas tú)
            UI.ocultarMensajeEspera();
            
            // Solo contar jugadores VIVOS que faltan por asignar
            const jugadoresVivos = jugadores ? Object.values(jugadores).filter(j => j.personaje?.estaVivo) : [];
            const faltanPorAsignar = jugadoresVivos.filter(j => j.atributoParaAsignar).length;
            
            if (faltanPorAsignar === 0) {
                UI.mostrarBotonComenzarDebate();
            } else {
                UI.ocultarBotonComenzarDebate();
            }
        }
        
        // --- 2.5. Mensajes de espera en Fase de Asignación (para no anfitriones) ---
        else if (!state.soyAnfitrion && faseActual === 'asignacion') {
            const miEstadoEnAsignacion = jugadores[state.jugadorIdActual] || {};
            const heAsignadoYa = !miEstadoEnAsignacion.atributoParaAsignar; // Si NO tiene atributo, ya lo asignó
            const estoyVivo = miEstadoEnAsignacion.personaje?.estaVivo ?? true;
            
            if (heAsignadoYa) {
                // Ya asignó su atributo (o está muerto), esperar a que otros terminen
                const jugadoresVivos = Object.values(jugadores).filter(j => j.personaje?.estaVivo);
                const faltanPorAsignar = jugadoresVivos.filter(j => j.atributoParaAsignar).length;
                
                if (faltanPorAsignar > 0) {
                    UI.mostrarMensajeEspera(`Esperando a que ${faltanPorAsignar} superviviente${faltanPorAsignar > 1 ? 's' : ''} coloque${faltanPorAsignar > 1 ? 'n' : ''} su${faltanPorAsignar > 1 ? 's' : ''} atributo${faltanPorAsignar > 1 ? 's' : ''}...`);
                } else {
                    // Todos los vivos asignaron, esperar a que el anfitrión comience el debate
                    UI.mostrarMensajeEspera("Esperando a que el anfitrión comience el debate...");
                }
            } else {
                // Aún no ha asignado, ocultar mensaje para que vea el modal
                UI.ocultarMensajeEspera();
            }
        }
        
        // --- 3. Lógica del Temporizador y Fase de Debate ---
        if (faseActual === 'debate') {
            const jugadoresVivos = Object.values(jugadores).filter(j => j.personaje?.estaVivo);
            const esRondaFinal = jugadoresVivos.length === 2;
            const estoyVivo = jugadores[state.jugadorIdActual]?.personaje?.estaVivo ?? true;
            const historiaActual = partida.historiaActual || null;
            UI.gestionarBotonConfirmar(true, state.heConfirmadoMiVoto, !!(jugadores[state.jugadorIdActual]?.votoSeleccionado), estoyVivo, historiaActual, esRondaFinal);

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
                const esRondaFinal = jugadoresVivos.length === 2;
                
                if (jugadoresVivos.length > 0) {
                    // Si es ronda final, esperar a que TODOS voten (vivos + muertos)
                    // Si no, solo esperar a los vivos
                    const todosLosJugadores = Object.values(jugadores);
                    const jugadoresQueDebenVotar = esRondaFinal ? todosLosJugadores : jugadoresVivos;
                    const confirmados = jugadoresQueDebenVotar.filter(j => j.votoConfirmado).length;

                    if (confirmados === jugadoresQueDebenVotar.length) {
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

            if (faseActual === 'historia') {
                // Nueva fase: Mostrar pantalla de historia
                const historiaActual = partida.historiaActual;
                if (historiaActual) {
                    UI.mostrarPantallaHistoria(historiaActual, state.soyAnfitrion);
                }
                UI.ocultarMensajeEspera();
            }
            else if (faseActual === 'conocimiento') {
                state.processingVote = false;
                UI.ocultarPantallaHistoria();
                UI.mostrarPantallaJuego(state.soyAnfitrion);
                // Si NO soy anfitrión, mostrar mensaje de espera
                if (!state.soyAnfitrion) {
                    UI.mostrarMensajeEspera("Esperando a que el anfitrión comience la ronda...");
                } else {
                    UI.ocultarMensajeEspera();
                }
            }
            else if (faseActual === 'asignacion') {
                state.processingVote = false;
                UI.ocultarBotonComenzarRonda();
                if (state.miAtributoParaAsignar) {
                    const estoyVivo = jugadores[state.jugadorIdActual]?.personaje?.estaVivo ?? true;
                    UI.mostrarModalAsignacion(state.miAtributoParaAsignar, estoyVivo);
                }
                UI.ocultarMensajeEspera(); // Se oculta en el modal
            } 
            else if (faseActual === 'debate') {
                state.processingVote = false;
                state.heConfirmadoMiVoto = false;
                const jugadoresVivos = Object.values(jugadores).filter(j => j.personaje?.estaVivo);
                const estoyVivo = jugadores[state.jugadorIdActual]?.personaje?.estaVivo ?? true;
                UI.mostrarFaseDebate(jugadoresVivos, estoyVivo);
                UI.ocultarMensajeEspera();
            }
            else if (faseActual === 'resultados') {
                state.processingVote = false;
                UI.mostrarModalResultados(ultimoEliminado, state.soyAnfitrion);
                // Si NO soy anfitrión, mostrar mensaje de espera
                if (!state.soyAnfitrion) {
                    UI.mostrarMensajeEspera("Esperando al anfitrión para continuar...");
                } else {
                    UI.ocultarMensajeEspera();
                }
            }
            else if (faseActual === 'fin') {
                state.processingVote = false;
                UI.mostrarPantallaFinJuego();
                UI.mostrarModalFinJuego(ganador, state.soyAnbitrion); // Corrección: soyAnfitrion
                UI.ocultarMensajeEspera();
            }
            
            state.faseAnterior = faseActual;
        }
        
        // --- 5. Mostrar mensaje de espera en votación (si NO soy anfitrión y aún no he votado) ---
        if (faseActual === 'votacion' && !state.soyAnfitrion && !state.heConfirmadoMiVoto) {
            UI.mostrarMensajeEspera("Esperando a que todos los jugadores voten...");
        }
        
        // --- 6. Mostrar mensaje de espera cuando todos han votado (si NO soy anfitrión) ---
        if (faseActual === 'votacion' && !state.soyAnfitrion && state.heConfirmadoMiVoto) {
            UI.mostrarMensajeEspera("Esperando a que los demás jugadores terminen de votar...");
        }
    });
}