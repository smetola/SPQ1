// logic/lobbyManager.js - Gestión del lobby (crear/unirse a partidas)

import { state, getDatabase, resetState, getModalManager } from './gameState.js';
import * as UI from '../uiManager.js';
import { escucharJugadoresEnLobby, escucharInicioPartida } from './firebaseSync.js';
import * as Data from '../gameData.js';
import { obtenerPoolAtributos } from './attributeGenerator.js';
import { marcarJugadorPresente } from './connectionManager.js';

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
        modosActivos: [], // Sistema de modos de juego
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
                esAnfitrion: true,
                isPresent: true,
                lastSeen: Date.now()
            });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = true;
            state.salaActual = codigoSala;

            // Configurar comportamiento de desconexión
            refPartida.onDisconnect().remove();
            
            // Marcar jugador como presente y configurar sistema de reconexión
            marcarJugadorPresente();

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
            esAnfitrion: false,
            isPresent: true,
            lastSeen: Date.now()
        });
        
        state.jugadorIdActual = refJugador.key;
        state.soyAnfitrion = false;
        state.salaActual = codigo;
        
        // Marcar jugador como presente y configurar sistema de reconexión
        marcarJugadorPresente();
        
        UI.mostrarLobby(codigo);
        escucharJugadoresEnLobby();
        escucharInicioPartida();
    }).catch((error) => console.error("Error al comprobar la sala:", error));
}

/**
 * Transfiere el rol de anfitrión a otro jugador
 * @param {string} nuevoAnfitrionId - ID del jugador que será el nuevo anfitrión
 */
export async function transferirAnfitrion(nuevoAnfitrionId) {
    const database = getDatabase();
    const modal = getModalManager();
    
    if (!state.salaActual || !state.jugadorIdActual) return;
    
    try {
        const refPartida = database.ref(`partidas/${state.salaActual}`);
        const refJugadorActual = database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`);
        const refNuevoAnfitrion = database.ref(`partidas/${state.salaActual}/jugadores/${nuevoAnfitrionId}`);
        
        // 1. Cancelar el onDisconnect del anfitrión anterior (para que no borre la partida)
        await refPartida.onDisconnect().cancel();
        
        // 2. Actualizar los roles en Firebase
        await database.ref().update({
            [`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/esAnfitrion`]: false,
            [`partidas/${state.salaActual}/jugadores/${nuevoAnfitrionId}/esAnfitrion`]: true
        });
        
        // 3. Configurar onDisconnect del nuevo anfitrión
        // IMPORTANTE: Esto se ejecutará en el cliente del nuevo anfitrión cuando detecte el cambio
        // Por ahora, configuramos que si el nuevo anfitrión se desconecta, borre la partida
        await refPartida.onDisconnect().remove();
        
        // 4. Actualizar estado local
        state.soyAnfitrion = false;
        
        // 5. Mostrar mensaje de confirmación
        await modal.mostrarAlerta(
            "Has transferido el rol de anfitrión. El jugador seleccionado ahora tiene el control.",
            "TRANSFERENCIA COMPLETADA"
        );
        
        // 6. Proceder con la salida normal (ya no eres anfitrión)
        refJugadorActual.onDisconnect().cancel();
        await refJugadorActual.remove();
        
        resetState();
        UI.volverAlMenu();
        
    } catch (error) {
        console.error("Error al transferir anfitrión:", error);
        await modal.mostrarAlerta("Error al transferir el rol de anfitrión.", "ERROR");
    }
}

/**
 * Salir de la partida
 * Si eres anfitrión, muestra el modal de transferencia primero
 */
export async function handleSalir() {
    const database = getDatabase();
    const modal = getModalManager();
    
    if (!state.salaActual || !state.jugadorIdActual) {
        resetState();
        UI.volverAlMenu();
        return;
    }
    
    // Si eres anfitrión, mostrar modal de transferencia
    if (state.soyAnfitrion) {
        // Obtener lista de otros jugadores
        const snapshot = await database.ref(`partidas/${state.salaActual}/jugadores`).once('value');
        const jugadores = snapshot.val();
        
        if (!jugadores) {
            // No hay jugadores (caso raro), salir directamente
            const refPartida = database.ref(`partidas/${state.salaActual}`);
            refPartida.onDisconnect().cancel();
            refPartida.remove();
            resetState();
            UI.volverAlMenu();
            return;
        }
        
        // Filtrar jugadores (excluir al anfitrión actual)
        const otrosJugadores = Object.entries(jugadores)
            .filter(([id, _]) => id !== state.jugadorIdActual)
            .map(([id, datos]) => ({ id, nombre: datos.nombre }));
        
        if (otrosJugadores.length === 0) {
            // No hay otros jugadores, solo cerrar partida
            const confirmar = await modal.mostrarConfirmacion(
                "Eres el único jugador en la partida. ¿Quieres cerrar la partida?",
                "CERRAR PARTIDA"
            );
            
            if (confirmar) {
                const refPartida = database.ref(`partidas/${state.salaActual}`);
                refPartida.onDisconnect().cancel();
                refPartida.remove();
                resetState();
                UI.volverAlMenu();
            }
            return;
        }
        
        // Mostrar modal de transferencia
        const resultado = await modal.mostrarTransferenciaAnfitrion(otrosJugadores);
        
        if (resultado.accion === 'transferir' && resultado.jugadorId) {
            // Transferir anfitrión y salir
            await transferirAnfitrion(resultado.jugadorId);
        } else if (resultado.accion === 'cerrar') {
            // Cerrar partida para todos
            const refPartida = database.ref(`partidas/${state.salaActual}`);
            refPartida.onDisconnect().cancel();
            refPartida.remove();
            resetState();
            UI.volverAlMenu();
        }
        // Si accion === 'cancelar', no hacer nada (quedarse en la partida)
        
    } else {
        // No eres anfitrión: salida normal
        const refJugador = database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`);
        refJugador.onDisconnect().cancel();
        refJugador.remove();
        
        resetState();
        UI.volverAlMenu();
    }
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
        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = generarPoolsExpandidos();
        actualizaciones[`partidas/${state.salaActual}/progresionTiers`] = progresionTiers;
        actualizaciones[`partidas/${state.salaActual}/progressionIndex`] = 0;

        // 3. Aplicar cambios
        database.ref().update(actualizaciones);
    });
}