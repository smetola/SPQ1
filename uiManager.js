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
    // ... (sin cambios)
    console.log("Mostrando pantalla para unirse...");
    refs.mainMenu.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.joinScreen.style.display = 'flex';
}

export function mostrarLobby(codigoSala) {
    // ... (sin cambios)
    console.log(`Mostrando lobby para la sala: ${codigoSala}`);
    refs.mainMenu.style.display = 'none';
    refs.joinScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'flex';
    refs.lobbyCodigoSala.textContent = codigoSala;
}

export function mostrarPantallaJuego(rondaActual, esAnfitrion) {
    // ... (sin cambios)
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
    // ... (modificado)
    console.log("Volviendo al menú principal...");
    
    refs.joinScreen.style.display = 'none';
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'none';
    refs.modalQuienSoy.style.display = 'none';
    refs.modalAsignarAtributo.style.display = 'none';
    refs.btnQuienSoy.style.display = 'none';
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnHoldToVote.style.display = 'none'; // ¡NUEVO!
    refs.gameTimer.style.display = 'none'; // ¡NUEVO!
    refs.mainMenu.style.display = 'flex';
}

export function actualizarListaLobby(jugadores, jugadorIdActual) {
    // ... (sin cambios)
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
    // ... (sin cambios)
    refs.modalAsignarTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
    refs.modalAtributoTexto.textContent = atributo;
    refs.modalAsignarAtributo.style.display = 'flex';
    
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
    refs.gameRondaInstruccion.textContent = "Desliza y pulsa en un personaje para asignarle tu atributo.";
}

export function mostrarModalQuienSoy(personaje) {
    // ... (sin cambios)
    construirModalPersonaje(personaje);
    refs.modalQuienSoy.style.display = 'flex';
}

export function actualizarCarousel(jugadores) {
    // ... (sin cambios)
    refs.characterCarousel.innerHTML = ''; 
    const personajes = [];
    Object.entries(jugadores).forEach(([id, jugador]) => {
        const personajeConId = { ...jugador.personaje, jugadorId: id };
        personajes.push(personajeConId);
    });
    personajes.forEach(personaje => {
        refs.characterCarousel.appendChild(crearTarjetaPersonaje(personaje, logic.handleCardClick));
    });
}

export function mostrarBotonComenzarDebate(rondaActual) {
    // ... (sin cambios)
    refs.btnComenzarDebate.textContent = `[ COMENZAR DEBATE RONDA ${rondaActual} ]`;
    refs.btnComenzarDebate.style.display = 'block';
}

export function ocultarBotonComenzarDebate() {
    // ... (sin cambios)
    refs.btnComenzarDebate.style.display = 'none';
}

/**
 * ¡MODIFICADO! Ahora muestra el temporizador y el botón de votación (al host).
 */
export function mostrarFaseDebate(rondaActual, esAnfitrion) {
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: DEBATE`;
    refs.gameRondaInstruccion.textContent = "¡Es hora de debatir! Hablad sobre quién debe ser eliminado.";
    
    // Ocultamos botones de fases anteriores
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';

    // ¡Mostramos el temporizador a TODOS!
    refs.gameTimer.style.display = 'block';

    // ¡Mostramos el botón de votación SÓLO AL HOST!
    if (esAnfitrion) {
        refs.btnHoldToVote.style.display = 'block';
    }
}

/**
 * ¡NUEVA FUNCIÓN! Actualiza la UI para la fase de votación.
 */
export function mostrarFaseVotacion(rondaActual) {
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: VOTACIÓN`;
    refs.gameRondaInstruccion.textContent = "¡Hora de votar! Pulsa en el personaje que quieras eliminar.";

    // Ocultamos elementos del debate
    refs.gameTimer.style.display = 'none';
    refs.btnHoldToVote.style.display = 'none';
}


/**
 * ¡NUEVA FUNCIÓN! Gestiona el temporizador.
 */
export function actualizarTimer(segundosRestantes, mostrar = true) {
    if (!mostrar) {
        refs.gameTimer.style.display = 'none';
        return;
    }

    refs.gameTimer.style.display = 'block';
    
    // Formateo MM:SS
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = Math.floor(segundosRestantes % 60);
    
    const minutosStr = minutos < 10 ? '0' + minutos : minutos;
    const segundosStr = segundos < 10 ? '0' + segundos : segundos;
    
    refs.gameTimer.textContent = `${minutosStr}:${segundosStr}`;
}

/**
 * ¡NUEVA FUNCIÓN! Gestiona la animación del botón de mantener pulsado.
 */
export function actualizarBotonHold(estado, duracionMs = 2000) {
    if (estado === 'start') {
        // Añadimos 'holding' para que el CSS inicie la transición de 2s
        refs.btnHoldProgress.style.transition = `width ${duracionMs / 1000}s linear`;
        refs.btnHoldToVote.classList.add('holding');
    } else if (estado === 'cancel') {
        // Quitamos 'holding' y hacemos que la barra se reinicie rápido (0.3s)
        refs.btnHoldProgress.style.transition = 'width 0.3s ease-out';
        refs.btnHoldToVote.classList.remove('holding');
    }
}


// --- FUNCIONES AUXILIARES DE UI (Privadas) ---

function crearTarjetaPersonaje(personaje, clickHandler) {
    // ... (sin cambios)
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
    // ... (sin cambios)
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