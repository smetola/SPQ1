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
                console.log('🔄 Reconectado después de desconexión. Sala:', state.salaActual);
                actualizarPresenciaJugador();
                
                // NUEVO: También reactivar listeners aquí
                setTimeout(() => {
                    reactivarListeners();
                }, 500);
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
    
    // Intentar recuperar sala de localStorage si se perdió
    if (!state.salaActual && localStorage.getItem('spq1_salaActual')) {
        console.log('🔄 Recuperando sala de localStorage...');
        state.salaActual = localStorage.getItem('spq1_salaActual');
        state.jugadorIdActual = localStorage.getItem('spq1_jugadorId');
        state.soyAnfitrion = localStorage.getItem('spq1_esAnfitrion') === 'true';
    }
    
    // Si hay partida activa, actualizar presencia Y reactivar listeners
    if (state.salaActual && state.jugadorIdActual) {
        console.log('🔄 Reconectando a la partida:', state.salaActual);
        
        // Esperar un poco para que Firebase reconecte
        setTimeout(() => {
            actualizarPresenciaJugador();
            reactivarListeners();
        }, 500);
    }
}

/**
 * Reactiva los listeners de Firebase según el estado actual de la partida
 */
function reactivarListeners() {
    const database = getDatabase();
    
    // Verificar en qué estado está la partida
    database.ref(`partidas/${state.salaActual}`).once('value', (snapshot) => {
        const partida = snapshot.val();
        
        if (!partida) {
            console.log('⚠️ La partida ya no existe');
            return;
        }
        
        const { estado, faseActual } = partida;
        
        console.log(`🔄 Reactivando listeners. Estado: ${estado}, Fase: ${faseActual}`);
        
        // Importar dinámicamente para evitar dependencias circulares
        import('./firebaseSync.js').then(({ escucharJugadoresEnLobby, escucharInicioPartida, escucharDatosJuego }) => {
            if (estado === 'lobby') {
                // Estamos en el lobby
                escucharJugadoresEnLobby();
                escucharInicioPartida();
            } else if (estado === 'jugando') {
                // Estamos en plena partida
                escucharDatosJuego();
            }
            
            console.log('✅ Listeners reactivados');
        });
    }).catch((error) => {
        console.error('❌ Error al verificar estado de partida:', error);
    });
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
        
        // NUEVO: Si eres anfitrión, asegurarte de que los datos de la partida están intactos
        if (state.soyAnfitrion) {
            verificarIntegridadPartida();
        }
        
        // Re-establecer el onDisconnect para cuando realmente se desconecte
        setupDisconnectHandler(jugadorRef);
    }).catch((error) => {
        console.error('❌ Error al actualizar presencia:', error);
    });
}

/**
 * Verifica que la partida tenga todos los datos necesarios (solo anfitrión)
 */
function verificarIntegridadPartida() {
    const database = getDatabase();
    const partidaRef = database.ref(`partidas/${state.salaActual}`);
    
    partidaRef.once('value', (snapshot) => {
        const partida = snapshot.val();
        
        if (!partida) return;
        
        // Si faltan campos críticos, no intentar repararlos aquí
        // (pueden haberse perdido legítimamente)
        if (!partida.estado || !partida.faseActual) {
            console.warn('⚠️ Datos de partida incompletos detectados. Pueden restaurarse automáticamente.');
        }
    });
}

/**
 * Configura qué hacer cuando el usuario realmente se desconecta
 * (cierra app, pierde internet totalmente, etc.)
 */
function setupDisconnectHandler(jugadorRef) {
    // CAMBIO CRÍTICO: NO usar onDisconnect durante partidas activas
    // Solo lo usamos para limpieza cuando sales manualmente
    
    // Cancelar cualquier onDisconnect anterior
    jugadorRef.onDisconnect().cancel();
    
    // NO hacer nada más. Si el jugador se desconecta, simplemente
    // su lastSeen dejará de actualizarse y otros jugadores pueden verlo
    // Cuando vuelva, se reactivará automáticamente
    
    console.log('🔌 onDisconnect cancelado (persistencia activa)');
}

/**
 * Marca explícitamente al jugador como presente al unirse/crear partida
 */
export function marcarJugadorPresente() {
    if (!state.salaActual || !state.jugadorIdActual) return;
    
    // Guardar en localStorage para recuperar después de reconexión
    try {
        localStorage.setItem('spq1_salaActual', state.salaActual);
        localStorage.setItem('spq1_jugadorId', state.jugadorIdActual);
        localStorage.setItem('spq1_esAnfitrion', state.soyAnfitrion.toString());
    } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
    }
    
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
    
    // Limpiar localStorage
    try {
        localStorage.removeItem('spq1_salaActual');
        localStorage.removeItem('spq1_jugadorId');
        localStorage.removeItem('spq1_esAnfitrion');
    } catch (e) {
        console.warn('No se pudo limpiar localStorage:', e);
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
