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
    primeraCargaJuego: true,
    faseAnterior: null,
    
    // Listeners
    refJugadoresEnLobby: null,
    refEstadoPartida: null,
    refDatosJuego: null,
};

/**
 * Inicializa el módulo de lógica.
 */
export function init(db) {
    database = db;
}

/**
 * Devuelve el personaje secreto para el botón '?'
 */
export function getMiPersonaje() {
    return state.miPersonajeSecreto;
}

// --- FUNCIONES PRINCIPALES (LÓGICA DE FIREBASE) ---

export function crearNuevaPartida() {
    // ... (sin cambios) ...
    console.log("Iniciando creación de partida...");
    const codigoSala = generarCodigoAleatorio(4);
    const datosPartida = { estado: "lobby", creadaEn: Date.now(), jugadores: {}, historia: "Aún no seleccionada", rondaActual: 1, faseActual: 'lobby' };
    
    database.ref('partidas/' + codigoSala).set(datosPartida)
        .then(() => {
            console.log(`¡Partida ${codigoSala} creada con éxito en Firebase!`);
            const nombreAnfitrion = prompt("Introduce tu nombre (Anfitrión):", "Anfitrión");
            const refJugador = database.ref(`partidas/${codigoSala}/jugadores`).push({ nombre: nombreAnfitrion || "Anfitrión", esAnfitrion: true });
            
            state.jugadorIdActual = refJugador.key;
            state.soyAnfitrion = true;
            state.salaActual = codigoSala;

            UI.mostrarLobby(codigoSala);
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        })
        .catch((error) => console.error("Error al crear la partida:", error));
}

export function unirseAPartida(codigo, nombre) {
    // ... (sin cambios) ...
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
            state.salaActual = codigo;
            
            UI.mostrarLobby(codigo);
            escucharJugadoresEnLobby();
            escucharInicioPartida();
        } else { 
            alert("No se encontró ninguna partida con ese código."); 
        }
    }).catch((error) => console.error("Error al comprobar la sala:", error));
}

export function empezarPartida() {
    // ... (sin cambios) ...
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
    // ... (sin cambios) ...
    console.log("Anfitrión ha comenzado la fase de asignación...");
    // Ocultamos el botón para que no se pulse dos veces
    // (La UI se encargará de esto en el cambio de fase)
    
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

/**
 * ¡NUEVA FUNCIÓN! Llamada por el Host para iniciar el debate.
 */
export function comenzarFaseDebate() {
    console.log("Anfitrión ha comenzado la fase de debate...");
    
    // Ocultamos el botón localmente para evitar doble clic
    UI.ocultarBotonComenzarDebate();
    
    // Cambiamos la fase en Firebase
    database.ref(`partidas/${state.salaActual}/faseActual`).set('debate')
        .then(() => console.log("Fase cambiada a 'debate'."))
        .catch((err) => console.error("Error al cambiar a debate:", err));
}


export function handleCardClick(personajeClickeado) {
    // ... (sin cambios) ...
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
        }
    });
}

export function handleSalir() {
    // ... (sin cambios) ...
    console.log("Volviendo al menú principal...");
    
    if (state.salaActual && state.jugadorIdActual) {
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
    if (state.refDatosJuego) state.refDatosJuego.off();

    // Reseteamos variables
    state = {
        salaActual: null, jugadorIdActual: null, miPersonajeSecreto: null,
        miAtributoParaAsignar: null, soyAnfitrion: false, primeraCargaJuego: true,
        faseAnterior: null,
        refJugadoresEnLobby: null, refEstadoPartida: null, refDatosJuego: null
    };
    
    UI.volverAlMenu();
}


// --- VIGILANTES DE FIREBASE ---

function escucharJugadoresEnLobby() {
    // ... (sin cambios) ...
    if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
    
    state.refJugadoresEnLobby = database.ref(`partidas/${state.salaActual}/jugadores`);
    state.refJugadoresEnLobby.on('value', (snapshot) => {
        UI.actualizarListaLobby(snapshot.val(), state.jugadorIdActual);
    });
}

function escucharInicioPartida() {
    // ... (sin cambios) ...
    if (state.refEstadoPartida) state.refEstadoPartida.off();
    
    state.refEstadoPartida = database.ref(`partidas/${state.salaActual}/estado`);
    state.refEstadoPartida.on('value', (snapshot) => {
        const estado = snapshot.val();
        if (estado === 'jugando') {
            console.log("DETECTADO CAMBIO DE ESTADO: 'jugando'");
            
            if (state.refEstadoPartida) state.refEstadoPartida.off();
            state.refEstadoPartida = null;
            
            if (state.refJugadoresEnLobby) state.refJugadoresEnLobby.off();
            state.refJugadoresEnLobby = null;

            escucharDatosJuego();
        }
    });
}

/**
 * ¡MODIFICADO! Ahora también gestiona los botones del Host
 * y el cambio a la fase de 'debate'.
 */
function escucharDatosJuego() {
    if (state.refDatosJuego) state.refDatosJuego.off();
    
    state.refDatosJuego = database.ref(`partidas/${state.salaActual}`);
    
    state.refDatosJuego.on('value', (snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;

        const jugadores = partida.jugadores;
        const faseActual = partida.faseActual;
        const rondaActual = partida.rondaActual;

        // --- 1. Lógica de Primera Carga ---
        if (state.primeraCargaJuego) {
            UI.mostrarPantallaJuego(rondaActual, state.soyAnfitrion);
            state.primeraCargaJuego = false;
        }

        // --- 2. Actualizar Datos Locales y UI ---
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

        // --- 3. Lógica de Botones del Anfitrión (¡NUEVO!) ---
        if (state.soyAnfitrion) {
            if (faseActual === 'asignacion') {
                // Contar cuántos faltan por asignar
                let faltanPorAsignar = 0;
                if (jugadores) {
                    Object.values(jugadores).forEach(j => {
                        if (j.atributoParaAsignar) {
                            faltanPorAsignar++;
                        }
                    });
                }
                
                if (faltanPorAsignar === 0) {
                    UI.mostrarBotonComenzarDebate(rondaActual);
                } else {
                    UI.ocultarBotonComenzarDebate();
                }
            } else {
                // No estamos en asignación, ocultar botones
                UI.ocultarBotonComenzarDebate();
            }
        }

        // --- 4. Reaccionar a Cambios de Fase ---
        if (faseActual !== state.faseAnterior) {
            console.log(`Fase ha cambiado de ${state.faseAnterior} a ${faseActual}`);
            
            if (faseActual === 'asignacion') {
                if (state.miAtributoParaAsignar) {
                    UI.mostrarModalAsignacion(rondaActual, state.miAtributoParaAsignar);
                }
            } 
            else if (faseActual === 'debate') {
                // ¡NUEVO!
                UI.mostrarFaseDebate(rondaActual);
            }
            
            state.faseAnterior = faseActual;
        }
    });
}


// --- FUNCIONES AUXILIARES (HERRAMIENTAS) ---
// ... (sin cambios en generarCodigoAleatorio y seleccionarElementoAleatorio) ...

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