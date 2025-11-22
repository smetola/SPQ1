// logic/botManager.js - Gestión de bots para pruebas

import { state, getDatabase } from './gameState.js';
import * as Data from '../gameData.js';

// Almacenar los timeouts de los bots para evitar duplicados
const botTimeouts = new Map();

/**
 * Crea un nuevo bot y lo une a la partida actual.
 */
export function crearBot() {
	const database = getDatabase();
	if (!state.salaActual) {
		console.error("No se puede crear bot: No estás en una sala.");
		return;
	}

	const botId = "BOT_" + Math.random().toString(36).substr(2, 9);
	const nombresBot = ["Bot-ijo", "Ro-Bot", "Bot-ella", "Bot-on", "C3-PO", "R2-D2", "Wall-E", "Terminator"];
	const nombreBot = nombresBot[Math.floor(Math.random() * nombresBot.length)] + " " + Math.floor(Math.random() * 100);

	const botData = {
		nombre: nombreBot,
		esAnfitrion: false,
		isBot: true, // Flag importante para identificarlo
		conectado: true,
		ultimoHeartbeat: Date.now()
	};

	database.ref(`partidas/${state.salaActual}/jugadores/${botId}`).set(botData)
		.then(() => console.log(`🤖 Bot creado: ${nombreBot} (${botId})`))
		.catch(err => console.error("Error al crear bot:", err));
}

/**
 * Función principal que gestiona la IA de los bots.
 * Debe ser llamada por el ANFITRIÓN periódicamente (ej: en firebaseSync).
 */
export function gestionarTurnoBots(partida) {
	if (!partida || !partida.jugadores) return;

	const bots = Object.values(partida.jugadores).filter(j => j.isBot);
	if (bots.length === 0) return;

	const fase = partida.faseActual;

	// --- LÓGICA FASE ASIGNACIÓN ---
	if (fase === 'asignacion') {
		bots.forEach(bot => {
			// Si el bot tiene un atributo para asignar
			if (bot.atributoParaAsignar) {
				const botId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === bot);

				// Verificar si ya tiene un timeout programado
				if (!botTimeouts.has(botId)) {
					// Programar la asignación con delay de 4 segundos
					const timeoutId = setTimeout(() => {
						// Elegir víctima aleatoria (que esté viva preferiblemente)
						const jugadoresVivos = Object.values(partida.jugadores).filter(j => j.personaje && j.personaje.estaVivo);
						const objetivos = jugadoresVivos.length > 0 ? jugadoresVivos : Object.values(partida.jugadores);
						const objetivo = objetivos[Math.floor(Math.random() * objetivos.length)];

						// Realizar la asignación
						asignarAtributoBot(partida, bot, objetivo);

						// Limpiar el timeout del mapa
						botTimeouts.delete(botId);
					}, 4000);

					// Guardar el timeout en el mapa
					botTimeouts.set(botId, timeoutId);
				}
			}
		});
	}

	// --- LÓGICA FASE DEBATE (VOTACIÓN) ---
	if (fase === 'debate') {
		bots.forEach(bot => {
			// Si el bot NO ha confirmado su voto
			if (!bot.votoConfirmado) {
				const botId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === bot);

				// Verificar si ya tiene un timeout programado para votar
				if (!botTimeouts.has(botId + '_vote')) {
					// Programar el voto con delay de 4 segundos
					const timeoutId = setTimeout(() => {
						// Elegir a quién votar (alguien vivo)
						const jugadoresVivos = Object.values(partida.jugadores).filter(j => j.personaje && j.personaje.estaVivo);

						// Simplificación: Random entre vivos
						if (jugadoresVivos.length > 0) {
							const victima = jugadoresVivos[Math.floor(Math.random() * jugadoresVivos.length)];
							votarBot(partida, bot, victima);
						}

						// Limpiar el timeout del mapa
						botTimeouts.delete(botId + '_vote');
					}, 4000);

					// Guardar el timeout en el mapa
					botTimeouts.set(botId + '_vote', timeoutId);
				}
			}
		});
	}
}

// --- FUNCIONES AUXILIARES DE ACCIÓN ---

function asignarAtributoBot(partida, bot, objetivo) {
	const database = getDatabase();
	const botId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === bot);
	const objetivoId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === objetivo);

	if (!botId || !objetivoId) return;

	console.log(`🤖 Bot ${bot.nombre} asignando atributo a ${objetivo.nombre}`);

	const actualizaciones = {};
	// 1. Quitar atributo de la mano del bot
	actualizaciones[`partidas/${state.salaActual}/jugadores/${botId}/atributoParaAsignar`] = null;

	// 2. Poner atributo en el personaje objetivo
	const nuevoIdAtributo = "attr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
	actualizaciones[`partidas/${state.salaActual}/jugadores/${objetivoId}/personaje/atributosAsignados/${nuevoIdAtributo}`] = bot.atributoParaAsignar;

	database.ref().update(actualizaciones)
		.catch(err => console.error("Error bot asignando:", err));
}

function votarBot(partida, bot, victima) {
	const database = getDatabase();
	const botId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === bot);
	const victimaId = Object.keys(partida.jugadores).find(key => partida.jugadores[key] === victima);

	if (!botId || !victimaId) return;

	console.log(`🤖 Bot ${bot.nombre} votando a ${victima.nombre}`);

	const actualizaciones = {};
	actualizaciones[`partidas/${state.salaActual}/jugadores/${botId}/votoSeleccionado`] = victimaId;
	actualizaciones[`partidas/${state.salaActual}/jugadores/${botId}/votoConfirmado`] = true;

	database.ref().update(actualizaciones)
		.catch(err => console.error("Error bot votando:", err));
}
