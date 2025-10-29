// Contenido para: uiManager.js

// Almacén para las referencias del DOM
let refs = {};
let logic = {}; // Almacén para la lógica (para el clic de la tarjeta)

/**
 * Inicializa el manager de UI con las referencias del DOM y la lógica.
 * app.js llamará a esto.
 */
export function init(elementRefs, logicHandlers) {
    refs = elementRefs;
    logic = logicHandlers;
}

// --- FUNCIONES DE NAVEGACIÓN ---

export function mostrarPantallaUnirse() {
    console.log("Mostrando pantalla para unirse...");
    refs.mainMenu.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.joinScreen.style.display = 'flex';
}

export function mostrarLobby(codigoSala) {
    console.log(`Mostrando lobby para la sala: ${codigoSala}`);
    
    refs.mainMenu.style.display = 'none';
    refs.joinScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'flex';
    
    refs.lobbyCodigoSala.textContent = codigoSala;
}

export function mostrarPantallaJuego(partida, jugadorId) {
    console.log("¡La partida ha empezado! Mostrando pantalla de juego.");
    
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'flex';
    refs.btnQuienSoy.style.display = 'block'; 
    
    const jugadores = partida.jugadores;
    refs.characterCarousel.innerHTML = ''; 
    
    let miPersonajeSecreto = null;
    let soyAnfitrion = false;
    const personajes = [];

    Object.entries(jugadores).forEach(([id, jugador]) => {
        if (id === jugadorId) {
            miPersonajeSecreto = jugador.personaje;
            soyAnfitrion = jugador.esAnfitrion;
        }
        const personajeConId = { ...jugador.personaje, jugadorId: id };
        personajes.push(personajeConId);
    });
    
    personajes.sort(() => Math.random() - 0.5); // Barajamos
    
    personajes.forEach(personaje => {
        // Pasamos la función 'handleCardClick' al creador de tarjetas
        refs.characterCarousel.appendChild(crearTarjetaPersonaje(personaje, logic.handleCardClick));
    });
    
    if (miPersonajeSecreto) {
        construirModalPersonaje(miPersonajeSecreto);
        refs.modalQuienSoy.style.display = 'flex';
    }

    if (soyAnfitrion) {
        refs.btnComenzarRonda.textContent = `[ COMENZAR RONDA ${partida.rondaActual} ]`;
        refs.btnComenzarRonda.style.display = 'block';
    }
    
    refs.gameRondaTitulo.textContent = `RONDA ${partida.rondaActual}: FASE DE CONOCIMIENTO`;
    refs.gameRondaInstruccion.textContent = "Desliza para ver a todos los supervivientes.";

    return miPersonajeSecreto; // Devolvemos el personaje para guardarlo
}

export function volverAlMenu() {
    console.log("Volviendo al menú principal...");
    
    refs.joinScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.modalQuienSoy.style.display = 'none';
    refs.modalAsignarAtributo.style.display = 'none';
    refs.btnQuienSoy.style.display = 'none';
    refs.btnComenzarRonda.style.display = 'none';
    refs.mainMenu.style.display = 'flex';
}

export function actualizarListaLobby(jugadores, jugadorIdActual) {
    refs.listaJugadoresLobby.innerHTML = '';
    if (jugadores) {
        let esAnfitrionEsteJugador = false;
        Object.entries(jugadores).forEach(([id, jugador]) => {
            const li = document.createElement('li'); 
            li.textContent = jugador.nombre;
            if (jugador.esAnfitrion) { 
                li.textContent += " (Anfitrión 👑)"; 
                if (id === jugadorIdActual) esAnfitrionEsteJugador = true; 
            }
            refs.listaJugadoresLobby.appendChild(li);
        });
        refs.btnEmpezarPartida.style.display = esAnfitrionEsteJugador ? 'block' : 'none';
    }
}

export function mostrarModalAsignacion(rondaActual, atributo) {
    refs.modalAsignarTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
    refs.modalAtributoTexto.textContent = atributo;
    refs.modalAsignarAtributo.style.display = 'flex';
    
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
    refs.gameRondaInstruccion.textContent = "Desliza y pulsa en un personaje para asignarle tu atributo.";
}

// --- FUNCIONES AUXILIARES DE UI ---

function crearTarjetaPersonaje(personaje, clickHandler) {
    const card = document.createElement('div');
    card.className = 'character-card';
    if (!personaje.estaVivo) { card.classList.add('muerto'); }
    
    const atributosObj = personaje.atributosAsignados || {};
    const atributosHTML = Object.values(atributosObj);
    
    card.innerHTML = `
        <h4>${personaje.nombre.toUpperCase()}</h4>
        <span>Edad: ${personaje.edad}</span>
        <ul>
            <li>${personaje.atributoBasico}</li>
            ${atributosHTML.map(attr => `<li>${attr}</li>`).join('')}
        </ul>
    `;
    // Aquí conectamos el handler
    card.addEventListener('click', () => clickHandler(personaje));
    return card;
}

function construirModalPersonaje(personaje) {
    const atributosObj = personaje.atributosAsignados || {};
    const atributosHTML = Object.values(atributosObj);
    
    refs.modalMiPersonaje.innerHTML = `
        <h4>${personaje.nombre.toUpperCase()}</h4>
        <span>Edad: ${personaje.edad}</span>
        <ul>
            <li>${personaje.atributoBasico}</li>
            ${atributosHTML.map(attr => `<li>${attr}</li>`).join('')}
        </ul>
    `;
}