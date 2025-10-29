// Contenido para: gameLogic.js

import * as Data from './gameData.js';
import * as UI from './uiManager.js';

// Almacén para módulos y variables de estado
let database = null;
let state = {
    salaActual: null,
    jugadorIdActual: null,
    miPersonajeSecreto: null,
    miAtributoParaAsignar: null,
    soyAnfitrion: false,
    refJugadoresEnLobby: null,
    refEstadoPartida: null,
    refFasePartida: null,
};

/**
 * Inicializa el módulo de lógica.
 * app.js llamará a esto.
 */
export function init(db) {
    database = db;
}

// --- FUNCIONES PRINCIPALES (LÓGICA DE FIREBASE) ---

export function crearNuevaPartida() {
    console.log("Iniciando creación de partida...");
    const codigoSala = generarCodigoAleatorio(4);
    const datosPartida = { estado: "lobby", creadaEn: Date.now(), jugadores: {}, historia: "Aún no seleccionada", rondaActual: 1 };
    
    database.ref('partidas/' + codigoSala).set(datosPartida)
        .then(() => {
            console.log(`¡Partida ${codigoSala} creada con éxito en Firebase!`);
            const nombreAnfitrion = prompt("Introduce tu nombre (Anfitrión):", "Anfitrión");
            const refJugador = database.ref(`partidas/${codigoSala}/jugadores`).push({ nombre: nombreAnfitrion || "Anfitrión", esAnfitrion: true });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = true; // El creador es anfitrión
            
            // Llamamos a la UI
            UI.mostrarLobby(codigoSala);
            
            // Iniciamos los "vigilantes"
            state.salaActual = codigoSala;
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        })
        .catch((error) => console.error("Error al crear la partida:", error));
}

export function unirseAPartida(codigo, nombre) {
    if (!codigo || !nombre) {
        alert("Debes introducir un nombre y un código de sala.");
        return;
    }
    
    const refSala = database.ref(`partidas/${codigo}`);
    refSala.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            if (snapshot.val().estado !== 'lobby') { 
                alert("Esta partida ya ha comenzado. No puedes unirte."); 
                return; 
            }
            const refJugador = refSala.child('jugadores').push({ nombre: nombre, esAnfitrion: false });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = false;
            
            // Llamamos a la UI
            UI.mostrarLobby(codigo);
            
            // Iniciamos los "vigilantes"
            state.salaActual = codigo;
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        } else { 
            alert("No se encontró ninguna partida con ese código."); 
        }
    }).catch((error) => console.error("Error al comprobar la sala:", error));
}

export function empezarPartida() {
    console.log(`Intentando empezar la partida ${state.salaActual}...`);
    
    const refPartida = database.ref(`partidas/${state.salaActual}`);
    refPartida.once('value').then((snapshot) => {
        const partida = snapshot.val(); 
        const jugadores = partida.jugadores; 
        const jugadorIDs = Object.keys(jugadores);
        
        if (jugadorIDs.length < 2) { 
            alert("Se necesitan al menos 2 jugadores para empezar."); 
            return; 
        }

        const actualizaciones = {};
        let nombresDisponibles = [...Data.NOMBRES_PERSONAJE];
        let atributosBasicosDisponibles = [...Data.ATRIBUTOS_BRONCE];

        jugadorIDs.forEach((id) => {
            const personaje = {
                nombre: seleccionarElementoAleatorio(nombresDisponibles, true),
                edad: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
                atributoBasico: seleccionarElementoAleatorio(atributosBasicosDisponibles, true),
                atributosAsignados: {},
                estaVivo: true
            };
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje`] = personaje;
        });

        actualizaciones[`partidas/${state.salaActual}/rondaActual`] = 1;
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'conocimiento';
        actualizaciones[`partidas/${state.salaActual}/estado`] = 'jugando'; 

        database.ref().update(actualizaciones)
            .then(() => console.log("¡Partida empezada! Personajes creados. Fase: Conocimiento."))
            .catch((err) => console.error("Error al actualizar la partida:", err));
    });
}

export function comenzarFaseAsignacion() {
    console.log("Anfitrión ha comenzado la fase de asignación...");
    
    const refPartida = database.ref(`partidas/${state.salaActual}`);
    refPartida.once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;
        
        const jugadores = partida.jugadores;
        const jugadorIDs = Object.keys(jugadores);
        const rondaActual = partida.rondaActual;
        
        const listaAtributosRonda = Data.LISTAS_ATRIBUTOS[rondaActual] || Data.ATRIBUTOS_LIFEORDEATH;
        let atributosDisponiblesRonda = [...listaAtributosRonda]; 
        
        console.log(`Repartiendo atributos de Ronda ${rondaActual}`);
        const actualizaciones = {};

        jugadorIDs.forEach((id) => {
            let atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            if (atributoRepartido === "Dato Agotado") {
                atributosDisponiblesRonda = [...listaAtributosRonda];
                atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            }
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/atributoParaAsignar`] = atributoRepartido;
        });
        
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'asignacion';
        
        database.ref().update(actualizaciones)
            .then(() => console.log("Atributos repartidos. Fase cambiada a 'asignacion'."))
            .catch((err) => console.error("Error al repartir atributos:", err));
    });
}

export function handleCardClick(personajeClickeado) {
    database.ref(`partidas/${state.salaActual}/faseActual`).once('value').then(snap => {
        if (snap.val() !== 'asignacion') {
            console.log("No estamos en fase de asignación. Clic ignorado.");
            return; 
        }
        if (!state.miAtributoParaAsignar) {
            alert("Ya has asignado tu atributo para esta ronda.");
            return;
        }
        if (!personajeClickeado.estaVivo) {
            alert("No puedes asignar atributos a un personaje muerto.");
            return;
        }
        const confirmar = confirm(`¿Estás seguro de que quieres asignar "${state.miAtributoParaAsignar}" a ${personajeClickeado.nombre}?`);
        if (confirmar) {
            console.log(`Asignando "${state.miAtributoParaAsignar}" a ${personajeClickeado.nombre} (ID: ${personajeClickeado.jugadorId})`);
            
            const refAtributosAsignados = database.ref(`partidas/${state.salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/atributosAsignados`);
            refAtributosAsignados.push(state.miAtributoParaAsignar);
            
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/atributoParaAsignar`).remove();

            alert("¡Atributo asignado!");
            state.miAtributoParaAsignar = null;
            // No es necesario ocultar el modal aquí, la UI lo hará
        }
    });
}

export function handleSalir() {
    console.log("Volviendo al menú principal...");
    
    if (state.salaActual && state.jugadorIdActual) {
        // Lógica de borrado (la tenías en volverAlMenu)
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).once('value', (snapshot) => {
            if (snapshot.val() && snapshot.val().esAnfitrion) {
                database.ref(`partidas/${state.salaActual}`).remove();
            } else {
                database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).remove();
            }
        });
    }
    
    // Detener TODOS los listeners
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    if (state.refFasePartida) state.refFasePartida.off();

    // Reseteamos variables
    state.salaActual = null;
    state.jugadorIdActual = null;
    state.miPersonajeSecreto = null;
    state.miAtributoParaAsignar = null;
    state.soyAnfitrion = false;
    state.refJugadoresEnLobby = null;
    state.refEstadoPartida = null;
    state.refFasePartida = null;
    
    UI.volverAlMenu();
}


// --- VIGILANTES DE FIREBASE ---

function escucharJugadoresEnLobby() {
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    
    state.refJugadoresEnLobby = database.ref(`partidas/${state.salaActual}/jugadores`);
    state.refJugadoresEnLobby.on('value', (snapshot) => {
        UI.actualizarListaLobby(snapshot.val(), state.jugadorIdActual);
    });
}

function escucharInicioPartida() {
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    
    state.refEstadoPartida = database.ref(`partidas/${state.salaActual}/estado`);
    state.refEstadoPartida.on('value', (snapshot) => {
        const estado = snapshot.val();
        if (estado === 'jugando') {
            console.log("DETECTADO CAMBIO DE ESTADO: 'jugando'");
            
            // Detenemos este listener, ya no es necesario
            if (state.refEstadoPartida) state.refEstadoPartida.off();
            state.refEstadoPartida = null;
            
            // Detenemos el listener del lobby
            if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
            state.refJugadoresEnLobby = null;

            // Mostramos la pantalla de juego y empezamos a escuchar la FASE
            database.ref(`partidas/${state.salaActual}`).once('value').then(partidaSnap => {
                state.miPersonajeSecreto = UI.mostrarPantallaJuego(partidaSnap.val(), state.jugadorIdActual);
                escucharFasePartida(); // Empezamos a escuchar la fase DESPUÉS de cargar la pantalla
            });
        }
    });
}

function escucharFasePartida() {
    if (state.refFasePartida) state.refFasePartida.off();
    
    state.refFasePartida = database.ref(`partidas/${state.salaActual}/faseActual`);
    state.refFasePartida.on('value', (snapshot) => {
        const fase = snapshot.val();
        console.log(`NUEVA FASE DETECTADA: ${fase}`);
        
        if (fase === 'asignacion') {
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}`).once('value').then(snap => {
                state.miAtributoParaAsignar = snap.val().atributoParaAsignar;
                
                if (state.miAtributoParaAsignar) {
                    database.ref(`partidas/${state.salaActual}/rondaActual`).once('value').then(rondaSnap => {
                        UI.mostrarModalAsignacion(rondaSnap.val(), state.miAtributoParaAsignar);
                    });
                }
            });
        }
        // Aquí irán los 'else if' para 'debate' y 'votacion'
    });
}

// --- FUNCIONES AUXILIARES (HERRAMIENTAS) ---

function generarCodigoAleatorio(longitud) {
    let resultado = ''; const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < longitud; i++) { resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length)); }
    return resultado;
}

function seleccionarElementoAleatorio(array, borrar = false) {
    if (array.length === 0) return "Dato Agotado";
    const indice = Math.floor(Math.random() * array.length); 
    const elemento = array[indice];
    if (borrar) array.splice(indice, 1);
    return elemento;
}