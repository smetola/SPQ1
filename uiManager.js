// Contenido para: uiManager.js

// Almacén para las referencias del DOM
let refs = {};
let logic = {}; // Almacén para la lógica (para el clic de la tarjeta)

/**
 * Inicializa el manager de UI con las referencias del DOM y la lógica.
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

/**
 * ¡MODIFICADA! Ahora solo prepara la pantalla. El carrusel se carga por separado.
 */
export function mostrarPantallaJuego(rondaActual, esAnfitrion) {
    console.log("¡La partida ha empezado! Mostrando pantalla de juego.");
    
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'flex';
    refs.btnQuienSoy.style.display = 'block'; 

    if (esAnfitrion) {
        refs.btnComenzarRonda.textContent = `[ COMENZAR RONDA ${rondaActual} ]`;
        refs.btnComenzarRonda.style.display = 'block';
    }
    
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: FASE DE CONOCIMIENTO`;
    refs.gameRondaInstruccion.textContent = "Desliza para ver a todos los supervivientes.";
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

/**
 * ¡NUEVA! Muestra el modal "Quién Soy".
 */
export function mostrarModalQuienSoy(personaje) {
    construirModalPersonaje(personaje);
    refs.modalQuienSoy.style.display = 'flex';
}

/**
 * ¡NUEVA! Esta función redibuja el carrusel CADA VEZ que hay un cambio.
 */
export function actualizarCarousel(jugadores) {
    refs.characterCarousel.innerHTML = ''; 
    
    const personajes = [];
    Object.entries(jugadores).forEach(([id, jugador]) => {
        const personajeConId = { ...jugador.personaje, jugadorId: id };
        personajes.push(personajeConId);
    });
    
    // NOTA: No barajamos el carrusel en cada actualización
    // para que las tarjetas no cambien de sitio solas.
    // (Puedes añadir .sort() si prefieres que se barajen)
    
    personajes.forEach(personaje => {
        refs.characterCarousel.appendChild(crearTarjetaPersonaje(personaje, logic.handleCardClick));
    });
}


// --- FUNCIONES AUXILIARES DE UI (Privadas) ---

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