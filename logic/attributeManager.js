// logic/attributeManager.js - Gestión de atributos (repartir y asignar)

import { state, getDatabase, getModalManager } from './gameState.js';
import * as Data from '../gameData.js';

/**
 * ¡REESCRITO!
 * Reparte atributos basándose en el 'progressionIndex' y el 'progresionTiers'
 * almacenados en Firebase, en lugar de en 'rondaActual'.
 */
export function repartirAtributos() {
    console.log("🎯 repartirAtributos() llamada - Sala:", state.salaActual);
    const database = getDatabase();

    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        if (!partida) return;

        const listas = partida.listasAtributosDisponibles;
        const index = partida.progressionIndex || 0;
        const jugadoresVivos = Object.values(partida.jugadores).filter(j => j.personaje?.estaVivo).length;

        // --- LÓGICA DE PROGRESIÓN DINÁMICA ---
        let tierUsar = 'bronce';

        if (jugadoresVivos <= 2) {
            tierUsar = 'lifeordeath';
        } else if (index === 0) {
            tierUsar = 'bronce';
        } else if (index === 1) {
            tierUsar = 'plata';
        } else if (index === 2) {
            tierUsar = 'oro';
        } else if (index === 3) {
            tierUsar = 'platino';
        } else {
            // Index > 3 (Ronda 5+)
            if (jugadoresVivos <= 4) {
                tierUsar = 'diamante';
            } else {
                tierUsar = 'platino';
            }
        }

        console.log(`Repartiendo atributos. Índice: ${index}. Jugadores vivos: ${jugadoresVivos}. Tier: ${tierUsar}`);

        // --- 2. Función auxiliar para coger atributos y gestionar si se acaban ---
        const tiersOrdenados = ["bronce", "plata", "oro", "platino", "diamante", "lifeordeath"];
        let tierActualIndex = tiersOrdenados.indexOf(tierUsar);

        function getNextAttribute() {
            if (tierActualIndex >= tiersOrdenados.length) {
                tierActualIndex = tiersOrdenados.length - 1;
            }

            let tierActual = tiersOrdenados[tierActualIndex];
            let listaActual = listas[tierActual];

            while (!listaActual || listaActual.length === 0) {
                console.warn(`Tier '${tierActual}' está vacío. Pasando al siguiente.`);
                tierActualIndex++;
                if (tierActualIndex >= tiersOrdenados.length) {
                    console.error("¡Se agotaron todos los atributos! Reiniciando 'lifeordeath'.");
                    listas.lifeordeath = [...Data.LISTAS_ATRIBUTOS.lifeordeath];
                    tierActualIndex = tiersOrdenados.length - 1;
                }
                tierActual = tiersOrdenados[tierActualIndex];
                listaActual = listas[tierActual];
            }

            // Seleccionamos y BORRAMOS (splice) el atributo
            const indice = Math.floor(Math.random() * listaActual.length);
            const atributo = listaActual.splice(indice, 1)[0];
            return atributo;
        }

        // --- 3. Repartir atributos a TODOS los jugadores (vivos o muertos) ---
        const actualizaciones = {};
        const jugadorIDs = Object.keys(partida.jugadores);

        jugadorIDs.forEach((id) => {
            const atributoRepartido = getNextAttribute();
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/atributoParaAsignar`] = atributoRepartido;
        });

        // 4. Actualizar la base de datos con las listas "recortadas"
        actualizaciones[`partidas/${state.salaActual}/listasAtributosDisponibles`] = listas;

        // 5. Cambiar de fase
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'asignacion';

        // ¡NUEVO! Guardar el tier actual para el modo desarrollador
        actualizaciones[`partidas/${state.salaActual}/currentTier`] = tierUsar;

        database.ref().update(actualizaciones)
            .catch((err) => console.error("Error al repartir atributos:", err));
    });
}

// Asignar atributo a un personaje (clic en tarjeta)
// (Esta función no cambia)
export async function asignarAtributoAPersonaje(personajeClickeado) {
    const database = getDatabase();
    const modal = getModalManager();

    database.ref(`partidas/${state.salaActual}/faseActual`).once('value').then(async snap => {
        if (snap.val() !== 'asignacion') return;
        if (!state.miAtributoParaAsignar) {
            await modal.mostrarAlerta("Ya has asignado tu atributo para esta ronda.");
            return;
        }
        if (!personajeClickeado.estaVivo) {
            await modal.mostrarAlerta("No puedes asignar atributos a un personaje muerto.", "PERSONAJE ELIMINADO");
            return;
        }

        const confirmar = await modal.mostrarConfirmacion(
            `¿Estás seguro de que quieres asignar "${state.miAtributoParaAsignar}" a ${personajeClickeado.nombre}?`,
            "CONFIRMAR ASIGNACIÓN"
        );

        if (confirmar) {
            database.ref(`partidas/${state.salaActual}/jugadores/${personajeClickeado.jugadorId}/personaje/atributosAsignados`)
                .push(state.miAtributoParaAsignar);
            database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/atributoParaAsignar`).remove();

            await modal.mostrarAlerta("¡Atributo asignado!", "ÉXITO");
            state.miAtributoParaAsignar = null;
        }
    });
}