// logic/connectionManager.js - Gestión de conexión y reconexión automática

import { state, getDatabase } from './gameState.js';

let isConnected = false;
let visibilityChangeHandler = null;
let connectionRef = null;
let connectionListener = null;

/**
 * Inicializa el sistema de gestión de conexión:
 * - Monitorea el estado de conexión de Firebase
 * - Detecta cuando la app va a background/foreground (Page Visibility API)
 * - Reconecta automáticamente cuando vuelves
 */
export function initConnectionManager() {
    const database = getDatabase();
    
    // 1. Monitorear estado de conexión de Firebase
    connectionRef = database.ref('.info/connected');
    
    connectionListener = connectionRef.on('value', (snapshot) => {
        const wasConnected = isConnected;
        isConnected = snapshot.val() === true;
        
        if (isConnected) {
            console.log('✅ Conectado a Firebase');
            
            // Si volvemos de una desconexión y hay una partida activa, actualizar presencia
            if (!wasConnected && state.salaActual && state.jugadorIdActual) {
                console.log('🔄 Reconectado. Actualizando presencia...');
                actualizarPresenciaJugador();
            }
        } else {
            console.log('❌ Desconectado de Firebase');
        }
    });
    
    // 2. Page Visibility API - Detectar cuando la app va a background/foreground
    setupVisibilityListener();
    
    console.log('🔌 Sistema de gestión de conexión inicializado');
}

/**
 * Configura el listener para detectar cuando el usuario sale/vuelve a la app
 */
function setupVisibilityListener() {
    // Detectar el nombre correcto del evento según el navegador
    let hidden, visibilityChange;
    
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    
    if (typeof document[hidden] === "undefined") {
        console.warn('⚠️ Page Visibility API no soportada en este navegador');
        return;
    }
    
    visibilityChangeHandler = () => {
        if (document[hidden]) {
            console.log('📱 App en background');
            onAppGoesToBackground();
        } else {
            console.log('📱 App en foreground');
            onAppReturnsToForeground();
        }
    };
    
    document.addEventListener(visibilityChange, visibilityChangeHandler, false);
}

/**
 * Cuando la app va a background (usuario cambia de app o bloquea pantalla)
 */
function onAppGoesToBackground() {
    // No hacemos nada especial aquí, solo logging
    // Firebase mantendrá la conexión brevemente
}

/**
 * Cuando la app vuelve a foreground (usuario regresa)
 * CRÍTICO: Aquí reconectamos y actualizamos presencia
 */
function onAppReturnsToForeground() {
    const database = getDatabase();
    
    // Forzar reconexión de Firebase si es necesario
    database.goOnline();
    
    // Si hay partida activa, actualizar presencia
    if (state.salaActual && state.jugadorIdActual) {
        console.log('🔄 Actualizando presencia al volver...');
        actualizarPresenciaJugador();
    }
}

/**
 * Actualiza la presencia del jugador en Firebase
 * Esto "reactiva" al jugador que podría haberse marcado como ausente
 */
function actualizarPresenciaJugador() {
    const database = getDatabase();
    const jugadorRef = database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`);
    
    // Actualizar timestamp de última actividad
    jugadorRef.update({
        lastSeen: Date.now(),
        isPresent: true
    }).then(() => {
        console.log('✅ Presencia actualizada');
        
        // Re-establecer el onDisconnect para cuando realmente se desconecte
        setupDisconnectHandler(jugadorRef);
    }).catch((error) => {
        console.error('❌ Error al actualizar presencia:', error);
    });
}

/**
 * Configura qué hacer cuando el usuario realmente se desconecta
 * (cierra app, pierde internet totalmente, etc.)
 */
function setupDisconnectHandler(jugadorRef) {
    // Si el anfitrión se desconecta, borramos la partida completa
    if (state.soyAnfitrion) {
        const partidaRef = getDatabase().ref(`partidas/${state.salaActual}`);
        partidaRef.onDisconnect().remove();
    } else {
        // Si es jugador normal, solo marcarlo como ausente (no eliminarlo)
        // Esto permite que vuelva si reconecta rápido
        jugadorRef.onDisconnect().update({
            isPresent: false,
            disconnectedAt: Date.now()
        });
    }
}

/**
 * Marca explícitamente al jugador como presente al unirse/crear partida
 */
export function marcarJugadorPresente() {
    if (!state.salaActual || !state.jugadorIdActual) return;
    
    const database = getDatabase();
    const jugadorRef = database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`);
    
    jugadorRef.update({
        isPresent: true,
        lastSeen: Date.now()
    }).then(() => {
        setupDisconnectHandler(jugadorRef);
    });
}

/**
 * Limpia listeners cuando salimos de la partida
 */
export function cleanupConnectionManager() {
    if (connectionRef && connectionListener) {
        connectionRef.off('value', connectionListener);
        connectionRef = null;
        connectionListener = null;
    }
    
    if (visibilityChangeHandler) {
        let visibilityChange = "visibilitychange";
        if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
        }
        document.removeEventListener(visibilityChange, visibilityChangeHandler);
        visibilityChangeHandler = null;
    }
    
    console.log('🔌 Sistema de conexión limpiado');
}

/**
 * Getter para saber si estamos conectados
 */
export function getConnectionStatus() {
    return isConnected;
}

/**
 * Sistema de heartbeat opcional (latido) - para debugging
 * Actualiza periódicamente que el jugador sigue activo
 * Solo se usa durante la partida, no en el lobby
 */
let heartbeatInterval = null;

export function startHeartbeat() {
    if (heartbeatInterval) return; // Ya está corriendo
    
    // Actualizar cada 30 segundos que seguimos activos
    heartbeatInterval = setInterval(() => {
        if (state.salaActual && state.jugadorIdActual && isConnected) {
            const database = getDatabase();
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/lastSeen`)
                .set(Date.now());
        }
    }, 30000); // 30 segundos
    
    console.log('💓 Heartbeat iniciado');
}

export function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        console.log('💓 Heartbeat detenido');
    }
}
