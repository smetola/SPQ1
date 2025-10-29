/* --- ================================= --- */
/* ---     MÓDULO 4: LÓGICA DEL JUEGO    --- */
/* --- ================================= --- */

// --- 1. REFERENCIAS A ELEMENTOS ---
// ... (referencias existentes) ...
const mainMenu = document.getElementById('mainMenu');
const lobbyScreen = document.getElementById('lobbyScreen');
const joinScreen = document.getElementById('joinScreen');
const gameScreen = document.getElementById('gameScreen');
const btnCrearPartida = document.getElementById('btnCrearPartida');
const btnUnirsePartida = document.getElementById('btnUnirsePartida');
const btnEmpezarPartida = document.getElementById('btnEmpezarPartida');
const btnSalirLobby = document.getElementById('btnSalirLobby');
const lobbyCodigoSala = document.getElementById('lobbyCodigoSala');
const listaJugadoresLobby = document.getElementById('listaJugadoresLobby');
const btnConfirmarUnirse = document.getElementById('btnConfirmarUnirse');
const btnCancelarUnirse = document.getElementById('btnCancelarUnirse');
const inputNombre = document.getElementById('inputNombre');
const inputCodigoSala = document.getElementById('inputCodigoSala');
const gameRondaTitulo = document.getElementById('gameRondaTitulo');
const gameRondaInstruccion = document.getElementById('gameRondaInstruccion');
const characterCarousel = document.getElementById('characterCarousel');
const btnQuienSoy = document.getElementById('btnQuienSoy');
const modalQuienSoy = document.getElementById('modalQuienSoy');
const modalMiPersonaje = document.getElementById('modalMiPersonaje');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const modalAsignarAtributo = document.getElementById('modalAsignarAtributo');
const modalAsignarTitulo = document.getElementById('modalAsignarTitulo');
const modalAtributoTexto = document.getElementById('modalAtributoTexto');
const btnCerrarModalAsignar = document.getElementById('btnCerrarModalAsignar');

// ¡NUEVA REFERENCIA!
const btnComenzarRonda = document.getElementById('btnComenzarRonda');


// --- Variables Globales ---
let salaActual = null;
let jugadorIdActual = null;
let miPersonajeSecreto = null;
let miAtributoParaAsignar = null;
let soyAnfitrion = false; // ¡NUEVO! Para saber si somos el host

// Listeners de Firebase (para poder detenerlos)
let refJugadoresEnLobby = null;
let refEstadoPartida = null;
let refFasePartida = null; // ¡NUEVO! "Vigilante" de Fases


// --- 2. "ESCUCHADORES" DE EVENTOS ---
// ... (Menú, Unirse, Lobby) ...
btnCrearPartida.addEventListener('click', crearNuevaPartida);
btnUnirsePartida.addEventListener('click', mostrarPantallaUnirse);
btnConfirmarUnirse.addEventListener('click', unirseAPartida);
btnCancelarUnirse.addEventListener('click', volverAlMenu);
btnEmpezarPartida.addEventListener('click', empezarPartida); // Llama a la lógica (solo crea personajes)
btnSalirLobby.addEventListener('click', volverAlMenu);

// Modales
btnCerrarModal.addEventListener('click', () => modalQuienSoy.style.display = 'none');
btnQuienSoy.addEventListener('click', () => {
    construirModalPersonaje(miPersonajeSecreto); 
    modalQuienSoy.style.display = 'flex';
});
btnCerrarModalAsignar.addEventListener('click', () => modalAsignarAtributo.style.display = 'none');

// ¡NUEVO ESCUCHADOR!
btnComenzarRonda.addEventListener('click', comenzarFaseAsignacion);


// --- DATOS DE JUEGO (ATRIBUTOS) ---
// ... (Todas tus listas de atributos: ATRIBUTOS_BRONCE, PLATA, ORO, etc.) ...
const NOMBRES_PERSONAJE = [
    "Alex", "Carmen", "David", "Elena", "Javier", "Laura", "Marcos", "Sofía", 
    "Rubén", "Lucía", "Miguel", "Paula", "Sergio", "Ana", "Carlos", "Isabel"
];
const ATRIBUTOS_BRONCE = [
    "Domador de leones", "Cazador", "Infeliz", "Negro", "Calva", "Es feliz", "Policía", 
    "Alcalde", "Scout", "Apicultor", "Bombero", "Amable", "Obediente", "Maestro", "Frutero"
];
const ATRIBUTOS_PLATA = [
    "Aspirante a presidente de gobierno", "Cura", "Ateo", "Trauma infantil", "Diabetes", 
    "Patriótico", "Anormal", "Sintecho", "Tiene Tinder Gold", "Situación familiar jodida", 
    "Mentiroso", "Borracho", "Budista", "Cristiano"
];
const ATRIBUTOS_ORO = [
    "Capitalista extremo", "Comunista extremo", "Sordomudo", "Hetero básico", "Corrupto", 
    "Admin de una cuenta de memes", "Príncipe", "Es azul", "Es famoso", "Taurino", "Vegan@", 
    "En su Spotify Wrapped su canción más escuchada es Baby de Justin Bieber", "Mafioso", 
    "Solo come carne", "Negacionista", "Aun duerme abrazando a su madre\\ osito", "Obesidad", 
    "MENA", "No le gusta que digan la “M palabra”", "Borde de mierda", "Analfabeto", 
    "Hace las mejores torrijas del mundo"
];
const ATRIBUTOS_PLATINO = [
    "Demencia senil", "Depresión severa", "Su mejor amigo es Enrique VIII", "Xenófobo", 
    "Necrófilo", "Violador ciego", "Miss mundo/ mister mundo", "Exconvicto", 
    "Fanático religioso", "Racista", "Violador de verduras (solo sí es sí)", 
    "En sus redes sociales ha puesto que es Sagitario ♋", "Le dan miedo los Capricornio 😰🤬🥵", 
    "Cocainómano", "Pederasta", "Moro", "Covid 19", "Embarazado", "Siamés", "Vota a PACMA", 
    "Sólo se folla a las que se llaman como su madre"
];
const ATRIBUTOS_DIAMANTE = [
    "Le faltan 3 dedos del pie porque se los comio ayer", "Se la chupa a los gatos callejeros", 
    "Cree que es el Mesías", "Es extraterrestre", "Robot", "Bruja", "Le falta calle", 
    "Tiene superpoderes", "Realiza transfusions de sangre", "Ha probado la carne humana", 
    "Oye hablar a las plantas y a los animales", "Esquizofrénico", "Representante de una secta", 
    "Descubrió el Bosón de Higgs", "Ve a los muertos", "Cree que fue abducido por extraterrestres", 
    "Cancer de planta del pie", "Nació en Chernobyl y tiene los ojos en la nuca", 
    "Se sabe todas las fórmulas matemáticas", "Ofreció su alma al demonio", 
    "Crea arte de la nada (no se refiere a magia)", 
    "Necesita meterle el dedo en el culo a alguien, al menos una vez por día."
];
const ATRIBUTOS_LIFEORDEATH = [
    "Pertenece al ISIS", "Cáncer terminal", "Colaborador en el 11M", "Ha ido a la luna", 
    "Tiene un coeficiente intelectual muy alto (200IQ)", "Premio Nobel de la paz", 
    "Dio un riñón a quien lo necesitaba", "Tiene todo el conocimiento del mundo, sabe todo.", 
    "Quiere ganar en kills a Mao Zedong", "Tiene muy mala hORTOgráfia.", "Sólo compra jabón alemán de 1945"
];
const LISTAS_ATRIBUTOS = {
    1: ATRIBUTOS_BRONCE, 2: ATRIBUTOS_PLATA, 3: ATRIBUTOS_ORO,
    4: ATRIBUTOS_PLATINO, 5: ATRIBUTOS_DIAMANTE, 6: ATRIBUTOS_LIFEORDEATH 
};


// --- 3. FUNCIONES DE NAVEGACIÓN ---

function mostrarPantallaUnirse() {
    // ... (sin cambios)
    mainMenu.style.display = 'none'; lobbyScreen.style.display = 'none'; gameScreen.style.display = 'none'; joinScreen.style.display = 'flex';
}

function mostrarLobby(codigoSala) {
    // ... (sin cambios)
    salaActual = codigoSala;
    mainMenu.style.display = 'none'; joinScreen.style.display = 'none'; gameScreen.style.display = 'none'; lobbyScreen.style.display = 'flex';
    lobbyCodigoSala.textContent = codigoSala;
    
    // Empezamos a escuchar quién se une Y si la partida empieza
    escucharJugadoresEnLobby(codigoSala);
    escucharInicioPartida(codigoSala); 
}

/**
 * ¡MODIFICADA! Ahora se encarga de la Fase de "Conocimiento".
 */
function mostrarPantallaJuego() {
    console.log("¡La partida ha empezado! Mostrando pantalla de juego.");
    
    lobbyScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    btnQuienSoy.style.display = 'block'; 
    
    if (refJugadoresEnLobby) refJugadoresEnLobby.off(); // Dejamos de escuchar quién se une
    
    // ¡NUEVO! Empezamos a escuchar los cambios de FASE (asignacion, debate, etc.)
    escucharFasePartida(salaActual);
    
    const refPartida = database.ref(`partidas/${salaActual}`);
    
    refPartida.once('value').then((snapshot) => {
        const datosPartida = snapshot.val();
        if (!datosPartida) return;
        
        const jugadores = datosPartida.jugadores;
        characterCarousel.innerHTML = ''; 
        
        const personajes = [];
        Object.entries(jugadores).forEach(([id, jugador]) => {
            if (id === jugadorIdActual) {
                miPersonajeSecreto = jugador.personaje;
                soyAnfitrion = jugador.esAnfitrion; // Guardamos si somos el host
            }
            const personajeConId = { ...jugador.personaje, jugadorId: id };
            personajes.push(personajeConId);
        });
        
        personajes.sort(() => Math.random() - 0.5); // Barajamos
        
        personajes.forEach(personaje => {
            characterCarousel.appendChild(crearTarjetaPersonaje(personaje));
        });
        
        // 1. Mostramos el Pop-up "Quién Soy"
        if (miPersonajeSecreto) {
            construirModalPersonaje(miPersonajeSecreto);
            modalQuienSoy.style.display = 'flex';
        }

        // 2. Mostramos el botón "Comenzar Ronda" SÓLO al Anfitrión
        if (soyAnfitrion) {
            btnComenzarRonda.textContent = `[ COMENZAR RONDA ${datosPartida.rondaActual} ]`;
            btnComenzarRonda.style.display = 'block';
        }
        
        // 3. NO mostramos el pop-up de asignar atributo todavía
        gameRondaTitulo.textContent = `RONDA ${datosPartida.rondaActual}: FASE DE CONOCIMIENTO`;
        gameRondaInstruccion.textContent = "Desliza para ver a todos los supervivientes.";
    });
}

function volverAlMenu() {
    // ... (sin cambios, pero añadimos los nuevos listeners a detener)
    console.log("Volviendo al menú principal...");
    if (salaActual && jugadorIdActual) {
        // ... (lógica de borrado)
    }
    
    // ¡NUEVO! Detener TODOS los listeners
    if (refJugadoresEnLobby) refJugadoresEnLobby.off();
    if (refEstadoPartida) refEstadoPartida.off();
    if (refFasePartida) refFasePartida.off(); // Detener listener de fase

    // Reseteamos variables
    salaActual = null;
    jugadorIdActual = null;
    miPersonajeSecreto = null;
    miAtributoParaAsignar = null;
    soyAnfitrion = false;
    refJugadoresEnLobby = null;
    refEstadoPartida = null;
    refFasePartida = null;
    
    // Ocultar todas las pantallas
    joinScreen.style.display = 'none';
    lobbyScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    modalQuienSoy.style.display = 'none';
    modalAsignarAtributo.style.display = 'none';
    btnQuienSoy.style.display = 'none';
    btnComenzarRonda.style.display = 'none'; // Ocultar botón de host
    
    mainMenu.style.display = 'flex';
}


// --- 4. FUNCIONES PRINCIPALES (LÓGICA DE FIREBASE) ---

function crearNuevaPartida() {
    // ... (sin cambios)
    console.log("Iniciando creación de partida...");
    const codigoSala = generarCodigoAleatorio(4);
    const datosPartida = { estado: "lobby", creadaEn: Date.now(), jugadores: {}, historia: "Aún no seleccionada", rondaActual: 1 };
    database.ref('partidas/' + codigoSala).set(datosPartida)
        .then(() => {
            console.log(`¡Partida ${codigoSala} creada con éxito en Firebase!`);
            const nombreAnfitrion = prompt("Introduce tu nombre (Anfitrión):", "Anfitrión");
            const refJugador = database.ref(`partidas/${codigoSala}/jugadores`).push({ nombre: nombreAnfitrion || "Anfitrión", esAnfitrion: true });
            jugadorIdActual = refJugador.key;
            mostrarLobby(codigoSala);
        }).catch((error) => console.error("Error al crear la partida:", error));
}

function unirseAPartida() {
    // ... (sin cambios)
    const codigo = inputCodigoSala.value.toUpperCase(); const nombre = inputNombre.value;
    if (!codigo || !nombre) { alert("Debes introducir un nombre y un código de sala."); return; }
    const refSala = database.ref(`partidas/${codigo}`);
    refSala.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            if (snapshot.val().estado !== 'lobby') { alert("Esta partida ya ha comenzado. No puedes unirte."); return; }
            const refJugador = refSala.child('jugadores').push({ nombre: nombre, esAnfitrion: false });
            jugadorIdActual = refJugador.key;
            mostrarLobby(codigo);
        } else { alert("No se encontró ninguna partida con ese código."); }
    }).catch((error) => console.error("Error al comprobar la sala:", error));
}

/**
 * ¡MODIFICADA! Ahora solo crea personajes y cambia el estado.
 * Ya NO reparte atributos.
 */
function empezarPartida() {
    console.log(`Intentando empezar la partida ${salaActual}...`);
    
    const refPartida = database.ref(`partidas/${salaActual}`);

    refPartida.once('value')
        .then((snapshot) => {
            const partida = snapshot.val(); const jugadores = partida.jugadores; const jugadorIDs = Object.keys(jugadores);
            if (jugadorIDs.length < 2) { alert("Se necesitan al menos 2 jugadores para empezar."); return; }

            const actualizaciones = {};
            let nombresDisponibles = [...NOMBRES_PERSONAJE];
            let atributosBasicosDisponibles = [...ATRIBUTOS_BRONCE]; // Usamos BRONCE para los básicos

            jugadorIDs.forEach((id) => {
                // 1. Asignamos el Personaje Secreto
                const personaje = {
                    nombre: seleccionarElementoAleatorio(nombresDisponibles, true),
                    edad: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
                    atributoBasico: seleccionarElementoAleatorio(atributosBasicosDisponibles, true),
                    atributosAsignados: {},
                    estaVivo: true
                };
                actualizaciones[`partidas/${salaActual}/jugadores/${id}/personaje`] = personaje;
                
                // ¡YA NO REPARTIMOS ATRIBUTOS AQUÍ!
            });

            // 2. Preparamos el estado de la partida
            actualizaciones[`partidas/${salaActual}/rondaActual`] = 1;
            actualizaciones[`partidas/${salaActual}/faseActual`] = 'conocimiento'; // ¡NUEVA FASE!
            
            // 3. ¡EL TRIGGER! Esto inicia la partida para todos
            actualizaciones[`partidas/${salaActual}/estado`] = 'jugando'; 

            // 4. Enviamos todas las actualizaciones a Firebase
            database.ref().update(actualizaciones)
                .then(() => console.log("¡Partida empezada! Personajes creados. Fase: Conocimiento."))
                .catch((err) => console.error("Error al actualizar la partida:", err));

        }).catch((err) => console.error("Error al obtener jugadores:", err));
}

/**
 * ¡NUEVA FUNCIÓN! Llamada por el Host para repartir atributos.
 */
function comenzarFaseAsignacion() {
    console.log("Anfitrión ha comenzado la fase de asignación...");
    
    // Ocultamos el botón para que no se pulse dos veces
    btnComenzarRonda.style.display = 'none';
    
    const refPartida = database.ref(`partidas/${salaActual}`);
    
    refPartida.once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;
        
        const jugadores = partida.jugadores;
        const jugadorIDs = Object.keys(jugadores);
        const rondaActual = partida.rondaActual;
        
        // Seleccionamos la lista de atributos correcta
        const listaAtributosRonda = LISTAS_ATRIBUTOS[rondaActual] || ATRIBUTOS_LIFEORDEATH; // Si no hay más, usamos la última
        let atributosDisponiblesRonda = [...listaAtributosRonda]; 
        
        console.log(`Repartiendo atributos de Ronda ${rondaActual}`);
        const actualizaciones = {};

        jugadorIDs.forEach((id) => {
            // Repartimos el Atributo para Asignar
            let atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            if (atributoRepartido === "Dato Agotado") { // Reutilizamos si se acaban
                atributosDisponiblesRonda = [...listaAtributosRonda];
                atributoRepartido = seleccionarElementoAleatorio(atributosDisponiblesRonda, true);
            }
            actualizaciones[`partidas/${salaActual}/jugadores/${id}/atributoParaAsignar`] = atributoRepartido;
        });
        
        // ¡EL TRIGGER! Cambiamos la fase
        actualizaciones[`partidas/${salaActual}/faseActual`] = 'asignacion';
        
        database.ref().update(actualizaciones)
            .then(() => console.log("Atributos repartidos. Fase cambiada a 'asignacion'."))
            .catch((err) => console.error("Error al repartir atributos:", err));
    });
}


function escucharJugadoresEnLobby(codigoSala) {
    // ... (sin cambios)
    if (refJugadoresEnLobby) refJugadoresEnLobby.off();
    refJugadoresEnLobby = database.ref(`partidas/${codigoSala}/jugadores`);
    refJugadoresEnLobby.on('value', (snapshot) => {
        const jugadores = snapshot.val(); listaJugadoresLobby.innerHTML = '';
        if (jugadores) {
            let esAnfitrionEsteJugador = false;
            Object.entries(jugadores).forEach(([id, jugador]) => {
                const li = document.createElement('li'); li.textContent = jugador.nombre;
                if (jugador.esAnfitrion) { li.textContent += " (Anfitrión 👑)"; if (id === jugadorIdActual) esAnfitrionEsteJugador = true; }
                listaJugadoresLobby.appendChild(li);
            });
            btnEmpezarPartida.style.display = esAnfitrionEsteJugador ? 'block' : 'none';
        }
    });
}

function escucharInicioPartida(codigoSala) {
    // ... (sin cambios)
    if (refEstadoPartida) refEstadoPartida.off();
    refEstadoPartida = database.ref(`partidas/${codigoSala}/estado`);
    refEstadoPartida.on('value', (snapshot) => {
        const estado = snapshot.val();
        if (estado === 'jugando') {
            console.log("DETECTADO CAMBIO DE ESTADO: 'jugando'");
            mostrarPantallaJuego();
            if (refEstadoPartida) refEstadoPartida.off(); refEstadoPartida = null;
        }
    });
}

/**
 * ¡NUEVO "VIGILANTE"! Escucha los cambios de FASE.
 */
function escucharFasePartida(codigoSala) {
    if (refFasePartida) refFasePartida.off();
    
    refFasePartida = database.ref(`partidas/${codigoSala}/faseActual`);
    
    refFasePartida.on('value', (snapshot) => {
        const fase = snapshot.val();
        console.log(`NUEVA FASE DETECTADA: ${fase}`);
        
        if (fase === 'asignacion') {
            // ¡La fase de asignación ha comenzado!
            // Mostramos el pop-up con el atributo
            
            // Necesitamos re-consultar nuestros datos para obtener el atributo
            database.ref(`partidas/${salaActual}/jugadores/${jugadorIdActual}`).once('value').then(snap => {
                miAtributoParaAsignar = snap.val().atributoParaAsignar;
                
                if (miAtributoParaAsignar) {
                    database.ref(`partidas/${salaActual}/rondaActual`).once('value').then(rondaSnap => {
                        const rondaActual = rondaSnap.val();
                        modalAsignarTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
                        modalAtributoTexto.textContent = miAtributoParaAsignar;
                        modalAsignarAtributo.style.display = 'flex';
                        
                        // Actualizamos UI
                        gameRondaTitulo.textContent = `RONDA ${rondaActual}: ASIGNACIÓN`;
                        gameRondaInstruccion.textContent = "Desliza y pulsa en un personaje para asignarle tu atributo.";
                    });
                }
            });
            
        } else if (fase === 'debate') {
            // (Lógica futura)
            gameRondaTitulo.textContent = `RONDA 1: DEBATE`;
            gameRondaInstruccion.textContent = "Debatid sobre quién debe ser eliminado.";
            
        } else if (fase === 'votacion') {
            // (Lógica futura)
            gameRondaTitulo.textContent = `RONDA 1: VOTACIÓN`;
            gameRondaInstruccion.textContent = "Pulsa en un personaje para votar su eliminación.";
        }
    });
}


/**
 * ¡MODIFICADA! Se dispara al hacer clic en una tarjeta de personaje.
 */
function handleCardClick(personajeClickeado) {
    // Comprobamos si estamos en la fase correcta para asignar
    database.ref(`partidas/${salaActual}/faseActual`).once('value').then(snap => {
        if (snap.val() !== 'asignacion') {
            console.log("No estamos en fase de asignación. Clic ignorado.");
            return; 
        }

        // --- Resto de la lógica (como antes) ---
        if (!miAtributoParaAsignar) {
            alert("Ya has asignado tu atributo para esta ronda.");
            return;
        }
        if (!personajeClickeado.estaVivo) {
            alert("No puedes asignar atributos a un personaje muerto.");
            return;
        }
        const confirmar = confirm(`¿Estás seguro de que quieres asignar "${miAtributoParaAsignar}" a ${personajeClickeado.nombre}?`);
        if (confirmar) {
            console.log(`Asignando "${miAtributoParaAsignar}" a ${personajeClickeado.nombre} (ID: ${personajeClickeado.jugadorId})`);
            const refAtributosAsignados = database.ref(`partidas/${salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/atributosAsignados`);
            refAtributosAsignados.push(miAtributoParaAsignar);
            database.ref(`partidas/${salaActual}/jugadores/${jugadorIdActual}/atributoParaAsignar`).remove();

            alert("¡Atributo asignado!");
            miAtributoParaAsignar = null;
            modalAsignarAtributo.style.display = 'none';
        }
    });
}


// --- 5. FUNCIONES AUXILIARES (HERRAMIENTAS) ---
// ... (sin cambios en generarCodigoAleatorio, seleccionarElementoAleatorio, crearTarjetaPersonaje, construirModalPersonaje)
function generarCodigoAleatorio(longitud) {
    let resultado = ''; const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < longitud; i++) { resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length)); }
    return resultado;
}
function seleccionarElementoAleatorio(array, borrar = false) {
    if (array.length === 0) return "Dato Agotado";
    const indice = Math.floor(Math.random() * array.length); const elemento = array[indice];
    if (borrar) array.splice(indice, 1);
    return elemento;
}
function crearTarjetaPersonaje(personaje) {
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
    card.addEventListener('click', () => handleCardClick(personaje));
    return card;
}
function construirModalPersonaje(personaje) {
    const atributosObj = personaje.atributosAsignados || {};
    const atributosHTML = Object.values(atributosObj);
    modalMiPersonaje.innerHTML = `
        <h4>${personaje.nombre.toUpperCase()}</h4>
        <span>Edad: ${personaje.edad}</span>
        <ul>
            <li>${personaje.atributoBasico}</li>
            ${atributosHTML.map(attr => `<li>${attr}</li>`).join('')}
        </ul>
    `;
}