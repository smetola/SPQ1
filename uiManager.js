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

    // Limpiar pantallas de juego por si acaso
    ocultarModalResultados();
    ocultarModalFinJuego();
}

export function mostrarPantallaJuego(rondaActual, esAnfitrion) {
    console.log("¡La partida ha empezado! Mostrando pantalla de juego.");
    refs.lobbyScreen.style.display = 'none';
    refs.gameScreen.style.display = 'flex';
    refs.btnQuienSoy.style.display = 'block'; 

    ocultarModalResultados();
    ocultarModalFinJuego();

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
    ocultarModalResultados();
    ocultarModalFinJuego();
    refs.btnQuienSoy.style.display = 'none';
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnConfirmarVoto.style.display = 'none';
    refs.gameTimer.style.display = 'none';
    refs.mainMenu.style.display = 'flex';
}

// --- FUNCIONES DE OCULTAR ---

export function ocultarModalResultados() {
    if (refs.modalResultados) refs.modalResultados.style.display = 'none';
}

export function ocultarModalFinJuego() {
    if (refs.modalFinJuego) refs.modalFinJuego.style.display = 'none';
}


// --- RESTO DE FUNCIONES ---

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

export function mostrarModalQuienSoy(personaje) {
    construirModalPersonaje(personaje);
    refs.modalQuienSoy.style.display = 'flex';
}

export function actualizarCarousel(jugadores, miVotoActual, recuentoVotos) {
    refs.characterCarousel.innerHTML = ''; 
    const personajes = [];
    Object.entries(jugadores).forEach(([id, jugador]) => {
        if (jugador.personaje) {
            const personajeConId = { ...jugador.personaje, jugadorId: id };
            personajes.push(personajeConId);
        }
    });

    personajes.sort((a, b) => (a.estaVivo === b.estaVivo) ? 0 : a.estaVivo ? -1 : 1);

    personajes.forEach(personaje => {
        refs.characterCarousel.appendChild(
            crearTarjetaPersonaje(personaje, logic.handleCardClick, miVotoActual, recuentoVotos)
        );
    });
}

export function mostrarBotonComenzarDebate(rondaActual) {
    refs.btnComenzarDebate.textContent = `[ COMENZAR DEBATE RONDA ${rondaActual} ]`;
    refs.btnComenzarDebate.style.display = 'block';
}

export function ocultarBotonComenzarDebate() {
    refs.btnComenzarDebate.style.display = 'none';
}

export function ocultarBotonComenzarRonda() {
    refs.btnComenzarRonda.style.display = 'none';
}

export function mostrarFaseDebate(rondaActual) {
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: DEBATE Y VOTACIÓN`;
    refs.gameRondaInstruccion.textContent = "¡Hora de debatir! Selecciona a quién eliminar y confirma tu voto.";
    
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.gameTimer.style.display = 'block';
}

/**
 * ¡NUEVA FUNCIÓN! Actualiza la pantalla de juego al estado final.
 */
export function mostrarPantallaFinJuego() {
    refs.gameRondaTitulo.textContent = "PARTIDA TERMINADA";
    refs.gameRondaInstruccion.textContent = "Este es el tablero final. ¡Solo puede quedar 1!";
    
    // Ocultar todos los botones de acción de ronda
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnConfirmarVoto.style.display = 'none';
    refs.gameTimer.style.display = 'none';

    // Dejamos el botón '?' visible para que puedan ver quiénes eran
}


export function actualizarTimer(segundosRestantes, mostrar = true) {
    if (!mostrar) {
        refs.gameTimer.style.display = 'none';
        return;
    }

    refs.gameTimer.style.display = 'block';
    
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = Math.floor(segundosRestantes % 60);
    
    const minutosStr = minutos < 10 ? '0' + minutos : minutos;
    const segundosStr = segundos < 10 ? '0' + segundos : segundos;
    
    refs.gameTimer.textContent = `${minutosStr}:${segundosStr}`;
}

export function gestionarBotonConfirmar(mostrar, confirmado, seleccionado) {
    const btn = refs.btnConfirmarVoto;
    if (!btn) return;

    if (!mostrar) {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = 'block';

    if (confirmado) {
        btn.disabled = true;
        btn.textContent = "[ VOTO CONFIRMADO ]";
        btn.classList.add('locked');
    } else if (seleccionado) {
        btn.disabled = false;
        btn.textContent = "[ CONFIRMAR VOTO ]";
        btn.classList.remove('locked');
    } else {
        btn.disabled = true;
        btn.textContent = "[ SELECCIONA UN PERSONAJE ]";
        btn.classList.remove('locked');
    }
}

export function actualizarBotonHold(estado, duracionMs = 2000) {
    // Obsoleto
}

export function mostrarModalResultados(nombreEliminado, esAnfitrion) {
    if (!refs.modalResultados) return;

    if (nombreEliminado === "NADIE (EMPATE)") {
        refs.modalResultadosTitulo.textContent = "¡EMPATE!";
        refs.modalResultadosTexto.innerHTML = `Hubo un empate en la votación.
            <strong>NADIE</strong>
            ...ha sido eliminado. La tensión aumenta...`;
    } else {
        refs.modalResultadosTitulo.textContent = "RESULTADOS DE LA VOTACIÓN";
        refs.modalResultadosTexto.innerHTML = `Tras el debate, el grupo ha decidido que...
            <strong>${nombreEliminado.toUpperCase()}</strong>
            ...ha sido eliminado.`;
    }

    if (esAnfitrion) {
        refs.btnSiguienteRonda.style.display = 'block';
        refs.btnCerrarModalResultados.style.display = 'none';
    } else {
        refs.btnSiguienteRonda.style.display = 'none';
        refs.btnCerrarModalResultados.style.display = 'block';
    }

    refs.modalResultados.style.display = 'flex';
}

/**
 * ¡MODIFICADO! Muestra el modal de Fin de Partida y los botones correctos.
 */
export function mostrarModalFinJuego(ganador, esAnfitrion) {
    if (!refs.modalFinJuego) return;

    ocultarModalResultados();
    
    if (ganador) {
        refs.modalGanadorTexto.innerHTML = `
            <span>El único superviviente es...</span>
            <strong>${ganador.nombrePersonaje.toUpperCase()}</strong>
            <span>controlado por...</span>
            <strong>${ganador.nombreJugador.toUpperCase()}</strong>
        `;
    } else {
        refs.modalGanadorTexto.innerHTML = `
            <span>¡Nadie ha sobrevivido!</span>
            <strong>EMPATE FINAL</strong>
        `;
    }

    // Botón común
    refs.btnVerTablero.style.display = 'block';

    // Botones específicos
    if (esAnfitrion) {
        refs.btnReiniciarLobby.style.display = 'block';
        refs.btnSalirAlMenu.style.display = 'none';
    } else {
        refs.btnReiniciarLobby.style.display = 'none';
        refs.btnSalirAlMenu.style.display = 'block';
    }
    
    refs.modalFinJuego.style.display = 'flex';
}


// --- FUNCIONES AUXILIARES DE UI (Privadas) ---

function crearTarjetaPersonaje(personaje, clickHandler, miVotoActual, recuentoVotos) {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    if (!personaje.estaVivo) { 
        card.classList.add('muerto'); 
    }

    if (personaje.jugadorId === miVotoActual) {
        card.classList.add('selected');
    }

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

    const numVotos = recuentoVotos[personaje.jugadorId] || 0;
    const voteCounter = document.createElement('div');
    voteCounter.className = 'vote-counter';
    if (numVotos === 0) {
        voteCounter.classList.add('hidden');
    }
    voteCounter.textContent = numVotos;
    card.appendChild(voteCounter);

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