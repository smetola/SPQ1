// Contenido para: modalManager.js
// Gestor de modales personalizados para reemplazar alert(), confirm() y prompt()

let modalRefs = {};

/**
 * Inicializa las referencias del modal genérico
 */
export function init(refs) {
    modalRefs = refs;
}

/**
 * Muestra un mensaje simple (reemplazo de alert)
 * @param {string} mensaje - El texto a mostrar
 * @param {string} titulo - Título del modal (opcional)
 * @returns {Promise<void>}
 */
export function mostrarAlerta(mensaje, titulo = "ATENCIÓN") {
    return new Promise((resolve) => {
        modalRefs.modalGenericoTitulo.textContent = titulo;
        modalRefs.modalGenericoTexto.textContent = mensaje;
        modalRefs.modalGenericoInput.style.display = 'none';
        modalRefs.btnModalGenericoConfirmar.textContent = '[ ACEPTAR ]';
        modalRefs.btnModalGenericoCancelar.style.display = 'none';
        modalRefs.modalGenerico.style.display = 'flex';

        const handleConfirmar = () => {
            modalRefs.modalGenerico.style.display = 'none';
            modalRefs.btnModalGenericoConfirmar.removeEventListener('click', handleConfirmar);
            resolve();
        };

        modalRefs.btnModalGenericoConfirmar.addEventListener('click', handleConfirmar);
    });
}

/**
 * Muestra un diálogo de confirmación (reemplazo de confirm)
 * @param {string} mensaje - El texto a mostrar
 * @param {string} titulo - Título del modal (opcional)
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
export function mostrarConfirmacion(mensaje, titulo = "CONFIRMAR") {
    return new Promise((resolve) => {
        modalRefs.modalGenericoTitulo.textContent = titulo;
        modalRefs.modalGenericoTexto.textContent = mensaje;
        modalRefs.modalGenericoInput.style.display = 'none';
        modalRefs.btnModalGenericoConfirmar.textContent = '[ SÍ ]';
        modalRefs.btnModalGenericoCancelar.textContent = '[ NO ]';
        modalRefs.btnModalGenericoCancelar.style.display = 'block';
        modalRefs.modalGenerico.style.display = 'flex';

        const handleConfirmar = () => {
            modalRefs.modalGenerico.style.display = 'none';
            cleanup();
            resolve(true);
        };

        const handleCancelar = () => {
            modalRefs.modalGenerico.style.display = 'none';
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modalRefs.btnModalGenericoConfirmar.removeEventListener('click', handleConfirmar);
            modalRefs.btnModalGenericoCancelar.removeEventListener('click', handleCancelar);
        };

        modalRefs.btnModalGenericoConfirmar.addEventListener('click', handleConfirmar);
        modalRefs.btnModalGenericoCancelar.addEventListener('click', handleCancelar);
    });
}

/**
 * Muestra un diálogo para introducir texto (reemplazo de prompt)
 * @param {string} mensaje - El texto a mostrar
 * @param {string} valorPorDefecto - Valor por defecto del input
 * @param {string} titulo - Título del modal (opcional)
 * @returns {Promise<string|null>} - El texto introducido o null si cancela
 */
export function mostrarPrompt(mensaje, valorPorDefecto = "", titulo = "INTRODUCE TU NOMBRE") {
    return new Promise((resolve) => {
        modalRefs.modalGenericoTitulo.textContent = titulo;
        modalRefs.modalGenericoTexto.textContent = mensaje;
        modalRefs.modalGenericoInput.style.display = 'block';
        modalRefs.modalGenericoInput.value = valorPorDefecto;
        modalRefs.btnModalGenericoConfirmar.textContent = '[ CONFIRMAR ]';
        modalRefs.btnModalGenericoCancelar.textContent = '[ CANCELAR ]';
        modalRefs.btnModalGenericoCancelar.style.display = 'block';
        modalRefs.modalGenerico.style.display = 'flex';
        
        // Focus en el input
        setTimeout(() => modalRefs.modalGenericoInput.focus(), 100);

        const handleConfirmar = () => {
            const valor = modalRefs.modalGenericoInput.value.trim();
            if (valor) {
                modalRefs.modalGenerico.style.display = 'none';
                cleanup();
                resolve(valor);
            }
        };

        const handleCancelar = () => {
            modalRefs.modalGenerico.style.display = 'none';
            cleanup();
            resolve(null);
        };

        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                handleConfirmar();
            }
        };

        const cleanup = () => {
            modalRefs.btnModalGenericoConfirmar.removeEventListener('click', handleConfirmar);
            modalRefs.btnModalGenericoCancelar.removeEventListener('click', handleCancelar);
            modalRefs.modalGenericoInput.removeEventListener('keypress', handleEnter);
        };

        modalRefs.btnModalGenericoConfirmar.addEventListener('click', handleConfirmar);
        modalRefs.btnModalGenericoCancelar.addEventListener('click', handleCancelar);
        modalRefs.modalGenericoInput.addEventListener('keypress', handleEnter);
    });
}

/**
 * Muestra el modal de transferencia de anfitrión
 * @param {Array} jugadores - Array de objetos {id, nombre} de jugadores disponibles
 * @returns {Promise<{accion: 'transferir'|'cerrar'|'cancelar', jugadorId?: string}>}
 */
export function mostrarTransferenciaAnfitrion(jugadores) {
    return new Promise((resolve) => {
        // Construir la lista de jugadores
        modalRefs.listaJugadoresTransferencia.innerHTML = '';
        
        jugadores.forEach(jugador => {
            const item = document.createElement('div');
            item.className = 'jugador-transferencia-item';
            item.innerHTML = `
                <span class="jugador-transferencia-nombre">${jugador.nombre}</span>
                <span class="jugador-transferencia-flecha">→</span>
            `;
            
            item.addEventListener('click', () => {
                modalRefs.modalTransferenciaAnfitrion.style.display = 'none';
                cleanup();
                resolve({ accion: 'transferir', jugadorId: jugador.id });
            });
            
            modalRefs.listaJugadoresTransferencia.appendChild(item);
        });
        
        // Mostrar el modal
        modalRefs.modalTransferenciaAnfitrion.style.display = 'flex';
        
        const handleCerrar = () => {
            modalRefs.modalTransferenciaAnfitrion.style.display = 'none';
            cleanup();
            resolve({ accion: 'cerrar' });
        };
        
        const handleCancelar = () => {
            modalRefs.modalTransferenciaAnfitrion.style.display = 'none';
            cleanup();
            resolve({ accion: 'cancelar' });
        };
        
        const cleanup = () => {
            modalRefs.btnCerrarPartidaDefinitivo.removeEventListener('click', handleCerrar);
            modalRefs.btnCancelarSalida.removeEventListener('click', handleCancelar);
        };
        
        modalRefs.btnCerrarPartidaDefinitivo.addEventListener('click', handleCerrar);
        modalRefs.btnCancelarSalida.addEventListener('click', handleCancelar);
    });
}
