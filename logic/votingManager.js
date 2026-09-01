// logic/votingManager.js - Gestión de votación y eliminación

import { state, getDatabase, getModalManager } from './gameState.js';
import { obtenerMuertesVinculadas } from './allianceManager.js';
import { tienePoderActivo } from './powerManager.js';

/**
 * Selecciona un personaje para votar (voto no definitivo).
 * Se llama al hacer clic en una tarjeta durante la fase 'debate'.
 */
export async function seleccionarVoto(personajeClickeado) {
    const database = getDatabase();
    const modal = getModalManager();
    
    if (state.faseAnterior !== 'debate') return;
    if (state.heConfirmadoMiVoto) {
        await modal.mostrarAlerta("Ya has confirmado tu voto, no puedes cambiarlo.");
        return;
    }
    if (!personajeClickeado.estaVivo) {
        await modal.mostrarAlerta("No puedes votar a un personaje muerto.", "PERSONAJE ELIMINADO");
        return;
    }

    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`)
        .set(personajeClickeado.jugadorId);
}

/**
 * Confirma (bloquea) el voto actual.
 * Se llama al pulsar el botón [CONFIRMAR VOTO].
 */
export async function confirmarMiVoto() {
    const database = getDatabase();
    const modal = getModalManager();
    
    database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoSeleccionado`).once('value').then(async snap => {
        if (!snap.exists()) {
            await modal.mostrarAlerta("Debes seleccionar un personaje antes de confirmar tu voto.");
            return;
        }

        state.heConfirmadoMiVoto = true;
        database.ref(`partidas/${state.salaActual}/jugadores/${state.jugadorIdActual}/votoConfirmado`).set(true);
    });
}

/**
 * ¡REESCRITA!
 * Comprueba si todos han votado y elimina al más votado.
 * Esta función SOLO debe ser llamada por el Anfitrión.
 */
export function comprobarYEliminar() {
    // ¡NUEVO! Semáforo para evitar que la función se llame varias veces
    // mientras se procesa la votación.
    if (state.processingVote) return;
    state.processingVote = true;
    
    const database = getDatabase();
    
    database.ref(`partidas/${state.salaActual}`).once('value').then((snapshot) => {
        const partida = snapshot.val();
        
        // Si la partida no existe o YA NO ESTÁ en debate (porque otro timer la cambió),
        // liberamos el semáforo y salimos.
        if (!partida || partida.faseActual !== 'debate') {
            state.processingVote = false;
            return;
        }

        const jugadores = partida.jugadores;
        const jugadoresVivos = Object.entries(jugadores).filter(([id, j]) => j.personaje?.estaVivo);
        const esRondaFinal = jugadoresVivos.length === 2;

        // --- MODO MALDICIÓN: Leer efectos de eventos ---
        const eventoEspecial = partida.modoConfig?.maldicion?.eventoEspecial || null;
        const inmune = partida.modoConfig?.maldicion?.inmune || null;
        const muertosVotanEvento = eventoEspecial === 'muertosVotan';
        
        // --- 1. Recuento de votos ---
        const recuentoVotos = {};
        
        // Si es la ronda final (2 vivos) O evento "muertosVotan" está activo,
        // contar TODOS los votos (vivos + muertos)
        const jugadoresQueVotan = (esRondaFinal || muertosVotanEvento)
            ? Object.entries(jugadores) 
            : jugadoresVivos;
        
        jugadoresQueVotan.forEach(([id, jugador]) => {
            const voto = jugador.votoSeleccionado;
            if (voto) {
                // MODO PODERES: Voto Doble
                const peso = tienePoderActivo(id, 'votoDoble', partida) ? 2 : 1;
                recuentoVotos[voto] = (recuentoVotos[voto] || 0) + peso;
            }
        });

        // --- 2. Encontrar al más votado ---
        let maxVotos = 0;
        let idsEmpatados = [];

        Object.keys(recuentoVotos).forEach((jugadorId) => {
            const votos = recuentoVotos[jugadorId];
            if (votos > maxVotos) {
                maxVotos = votos;
                idsEmpatados = [jugadorId];
            } else if (votos > 0 && votos === maxVotos) {
                idsEmpatados.push(jugadorId);
            }
        });

        // --- 3. Aplicar eliminación ---
        const actualizaciones = {};
        let personajeEliminado = null;

        if (idsEmpatados.length === 1 && maxVotos > 0) {
            const idEliminado = idsEmpatados[0];

            // MODO MALDICIÓN: Comprobar inmunidad
            if (inmune && idEliminado === inmune) {
                console.log('🛡️ ¡El personaje más votado es inmune por evento paranormal!');
                personajeEliminado = "NADIE (PROTEGIDO POR LA MANSIÓN)";
            // MODO PODERES: Comprobar Escudo
            } else if (tienePoderActivo(idEliminado, 'escudo', partida)) {
                console.log('🛡️ ¡El personaje más votado tiene Escudo activado!');
                personajeEliminado = jugadores[idEliminado].personaje.nombre + " (ESCUDO ACTIVADO — SALVADO)";
            } else {
                personajeEliminado = jugadores[idEliminado].personaje.nombre;
                actualizaciones[`partidas/${state.salaActual}/jugadores/${idEliminado}/personaje/estaVivo`] = false;
            }
        } else if (idsEmpatados.length > 1 && eventoEspecial === 'relojDeArena') {
            // MODO MALDICIÓN: Reloj de Arena — en empate, TODOS los empatados mueren
            console.log('⏳ ¡Reloj de Arena! Empate = todos mueren.');
            const nombres = [];
            idsEmpatados.forEach(id => {
                // No matar a inmunes
                if (inmune && id === inmune) return;
                actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/personaje/estaVivo`] = false;
                nombres.push(jugadores[id].personaje.nombre);
            });
            personajeEliminado = nombres.length > 0 
                ? nombres.join(' y ') + " (RELOJ DE ARENA)" 
                : "NADIE (TODOS PROTEGIDOS)";
        } else {
            personajeEliminado = "NADIE (EMPATE)";
        }

        // --- 4. Limpiar para la siguiente ronda ---
        Object.keys(jugadores).forEach(id => {
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoSeleccionado`] = null;
            actualizaciones[`partidas/${state.salaActual}/jugadores/${id}/votoConfirmado`] = null;
        });

        // --- 5. MODO ALIANZAS: Muertes vinculadas ---
        // Comprobar si alguno de los eliminados tiene aliados que deben morir
        const idsEliminados = Object.keys(actualizaciones)
            .filter(k => k.endsWith('/personaje/estaVivo') && actualizaciones[k] === false)
            .map(k => k.split('/')[2]); // Extraer jugadorId del path

        const muertosVinculados = [];
        idsEliminados.forEach(idElim => {
            const vinculados = obtenerMuertesVinculadas(idElim, partida);
            vinculados.forEach(idVinc => {
                // No matar duplicados ni a ya muertos
                if (!idsEliminados.includes(idVinc) && !muertosVinculados.includes(idVinc)) {
                    const jVinc = jugadores[idVinc];
                    if (jVinc?.personaje?.estaVivo) {
                        muertosVinculados.push(idVinc);
                        actualizaciones[`partidas/${state.salaActual}/jugadores/${idVinc}/personaje/estaVivo`] = false;
                    }
                }
            });
        });

        // Añadir los nombres de los muertos vinculados al resultado
        if (muertosVinculados.length > 0 && personajeEliminado !== null && !personajeEliminado.startsWith('NADIE')) {
            const nombresVinculados = muertosVinculados.map(id => jugadores[id]?.personaje?.nombre || '???');
            personajeEliminado += ' + ' + nombresVinculados.join(' y ') + ' (PACTO ROTO)';
        }

        // --- 5. Transicionar a 'resultados' ---
        actualizaciones[`partidas/${state.salaActual}/faseActual`] = 'resultados';
        actualizaciones[`partidas/${state.salaActual}/ultimoEliminado`] = personajeEliminado;
        actualizaciones[`partidas/${state.salaActual}/debateEndTime`] = null;

        // --- 6. MODO MALDICIÓN: Limpiar estado del evento ---
        actualizaciones[`partidas/${state.salaActual}/modoConfig/maldicion/eventoActual`] = null;
        actualizaciones[`partidas/${state.salaActual}/modoConfig/maldicion/eventoEspecial`] = null;
        actualizaciones[`partidas/${state.salaActual}/modoConfig/maldicion/inmune`] = null;
        actualizaciones[`partidas/${state.salaActual}/modoConfig/maldicion/inmuneTipo`] = null;
        
        // Aplicar la actualización única.
        database.ref().update(actualizaciones);
    });
}