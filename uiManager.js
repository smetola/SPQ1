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
    refs.btnComenzarDebate.style.display = 'none';
    refs.btnConfirmarVoto.style.display = 'none'; // ¡NUEVO!
    refs.gameTimer.style.display = 'none';
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

export function mostrarModalQuienSoy(personaje) {
    construirModalPersonaje(personaje);
    refs.modalQuienSoy.style.display = 'flex';
}

/**
 * ¡MODIFICADO! Ahora acepta el estado de votación para renderizar contadores y selecciones.
 */
export function actualizarCarousel(jugadores, miVotoActual, recuentoVotos) {
    refs.characterCarousel.innerHTML = ''; 
    const personajes = [];
    Object.entries(jugadores).forEach(([id, jugador]) => {
        if (jugador.personaje) { // Asegurarse de que el personaje existe
            const personajeConId = { ...jugador.personaje, jugadorId: id };
            personajes.push(personajeConId);
        }
    });

    // Ordenar: Vivos primero, muertos después
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

/**
 * ¡MODIFICADO! Ahora es DEBATE + VOTACIÓN.
 */
export function mostrarFaseDebate(rondaActual) {
    refs.gameRondaTitulo.textContent = `RONDA ${rondaActual}: DEBATE Y VOTACIÓN`;
    refs.gameRondaInstruccion.textContent = "¡Hora de debatir! Selecciona a quién eliminar y confirma tu voto.";
    
    // Ocultamos botones de fases anteriores
    refs.btnComenzarRonda.style.display = 'none';
    refs.btnComenzarDebate.style.display = 'none';

    // Mostramos el temporizador a TODOS
    refs.gameTimer.style.display = 'block';

    // El botón de confirmar voto se gestiona en 'gestionarBotonConfirmar'
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
 * ¡NUEVA FUNCIÓN! Gestiona el estado del botón [CONFIRMAR VOTO].
 */
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
        btn.classList.add('locked'); // Añade clase para estilo "bloqueado"
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

/**
 * ¡FUNCIÓN OBSOLETA! (El botón Hold ya no existe)
 * La mantenemos por si acaso, pero la vaciamos.
 */
export function actualizarBotonHold(estado, duracionMs = 2000) {
    // Ya no hace nada
}


// --- FUNCIONES AUXILIARES DE UI (Privadas) ---

/**
 * ¡MODIFICADO! Acepta estado de votación para renderizar UI.
 */
function crearTarjetaPersonaje(personaje, clickHandler, miVotoActual, recuentoVotos) {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    // Marcar si está muerto
    if (!personaje.estaVivo) { 
        card.classList.add('muerto'); 
    }

    // Marcar si es mi selección actual (¡NUEVO!)
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

    // Añadir contador de votos (¡NUEVO!)
    const numVotos = recuentoVotos[personaje.jugadorId] || 0;
    const voteCounter = document.createElement('div');
    voteCounter.className = 'vote-counter';
    if (numVotos === 0) {
        voteCounter.classList.add('hidden');
    }
    voteCounter.textContent = numVotos;
    card.appendChild(voteCounter);

    // Añadir listener
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