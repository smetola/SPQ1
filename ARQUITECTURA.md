# 🏗️ Arquitectura Modular de "Solo puede quedar 1"

## 📂 Estructura de Carpetas

```
SPQ1/
├── index.html
├── style.css
├── app.js                  # Punto de entrada (conecta todo)
├── gameLogic.js            # Re-exporta módulos (interfaz pública)
├── uiManager.js            # Gestión de UI
├── gameData.js             # Datos estáticos
│
└── logic/
    ├── gameState.js        # Estado compartido + inicialización
    ├── lobbyManager.js     # Crear/unirse a partidas
    ├── roundManager.js     # Gestión de rondas
    ├── phaseManager.js     # Transiciones entre fases
    ├── attributeManager.js # Repartir/asignar atributos
    ├── votingManager.js    # Votación y eliminación
    └── firebaseSync.js     # Listeners de Firebase

```

---

## 🧩 Descripción de Cada Módulo

### 📌 **gameState.js** (Estado Compartido)
**Responsabilidad:** Variables globales del juego.

**Contiene:**
- `state`: Objeto con toda la información del jugador actual
- `database`: Referencia a Firebase
- `initDatabase()`: Inicializar Firebase
- `resetState()`: Limpiar todo al salir

**¿Cuándo crece?**
- Cuando añadas más variables de estado (ej. historial de votos, estadísticas...)

---

### 🚪 **lobbyManager.js** (Lobby)
**Responsabilidad:** Crear y unirse a partidas.

**Funciones:**
- `crearNuevaPartida()`
- `unirseAPartida(codigo, nombre)`
- `handleSalir()`

**¿Cuándo crece?**
- Sistema de invitaciones
- Configuración pre-partida (duración del debate, etc.)
- Chat en el lobby

---

### 🔄 **roundManager.js** (Rondas)
**Responsabilidad:** Inicio y fin de rondas.

**Funciones:**
- `empezarPartida()`: Crear personajes
- `avanzarSiguienteRonda()`: Siguiente ronda tras eliminación (⚠️ AÚN NO IMPLEMENTADA)

**¿Cuándo crece?**
- Eventos especiales entre rondas
- Rondas bonus
- Condiciones de victoria alternativas

---

### ⚙️ **phaseManager.js** (Fases)
**Responsabilidad:** Transiciones entre fases.

**Funciones:**
- `comenzarFaseDebate()`
- `comenzarFaseVotacion()`
- `mostrarResultadosVotacion()` (⚠️ AÚN NO IMPLEMENTADA)

**Fases del juego:**
1. `lobby` → Esperando jugadores
2. `conocimiento` → Ver personajes
3. `asignacion` → Asignar atributos
4. `debate` → Debatir (5 min)
5. `votacion` → Votar
6. `resultados` → Ver eliminado (⚠️ NO IMPLEMENTADA)
7. `fin` → Ganador (⚠️ NO IMPLEMENTADA)

**¿Cuándo crece?**
- Nuevas fases (ej. "preparación", "evento especial")
- Lógica de temporizadores más compleja

---

### 🎯 **attributeManager.js** (Atributos)
**Responsabilidad:** Repartir y asignar atributos.

**Funciones:**
- `repartirAtributos()`: Dar un atributo a cada jugador
- `asignarAtributoAPersonaje(personaje)`: Asignar tu atributo a un personaje

**¿Cuándo crece?**
- Atributos especiales (ej. "comodín", "reversible")
- Lógica de atributos acumulativos

---

### 🗳️ **votingManager.js** (Votación)
**Responsabilidad:** Votar y eliminar personajes.

**Funciones:**
- `votarPersonaje(personaje)` (⚠️ NO IMPLEMENTADA COMPLETAMENTE)
- `comprobarYEliminar()` (⚠️ NO IMPLEMENTADA COMPLETAMENTE)

**¿Cuándo crece?**
- Sistema de empates
- Votaciones anónimas vs. públicas
- Historial de votos

---

### 🔄 **firebaseSync.js** (Sincronización)
**Responsabilidad:** Escuchar cambios en Firebase y reaccionar.

**Funciones:**
- `escucharJugadoresEnLobby()`
- `escucharInicioPartida()`
- `escucharDatosJuego()`: El "cerebro" que actualiza todo en tiempo real

**¿Cuándo crece?**
- Más listeners específicos (ej. escuchar chat, escuchar eventos)

---

## 🔗 Flujo de Datos

```
app.js
  └─> gameLogic.js (interfaz pública)
        └─> logic/
              ├─> gameState.js (estado compartido)
              ├─> lobbyManager.js
              ├─> roundManager.js
              ├─> phaseManager.js
              ├─> attributeManager.js
              ├─> votingManager.js
              └─> firebaseSync.js
```

**Todos los módulos importan `gameState.js`** para acceder al estado compartido.

---

## 🎯 ¿Qué Falta por Implementar?

### ⚠️ Fase de Votación (PRÓXIMA)
1. **votingManager.js:**
   - Completar `votarPersonaje()`
   - Implementar `comprobarYEliminar()`

2. **uiManager.js:**
   - Crear `mostrarResultadosEliminacion(personaje)`
   - Animación de "muerte" del personaje

3. **firebaseSync.js:**
   - Detectar fase `resultados` y mostrar eliminado

### ⚠️ Fin del Juego
1. **roundManager.js:**
   - Completar `avanzarSiguienteRonda()` con lógica de victoria

2. **uiManager.js:**
   - Pantalla de "¡GANADOR!"

---

## 💡 Ventajas de esta Arquitectura

✅ **Modularidad:** Cada archivo tiene una responsabilidad clara
✅ **Escalabilidad:** Fácil añadir nuevas funcionalidades sin romper lo existente
✅ **Mantenibilidad:** Si algo falla, sabes exactamente dónde buscar
✅ **Reutilización:** Las funciones son independientes (ej. `votarPersonaje()` se puede llamar desde donde sea)

---

## 🔧 Cómo Añadir Nuevas Funcionalidades

### Ejemplo: Añadir Sistema de Chat

1. **Crear `logic/chatManager.js`:**
```javascript
import { state, getDatabase } from './gameState.js';

export function enviarMensaje(texto) {
    const database = getDatabase();
    database.ref(`partidas/${state.salaActual}/chat`).push({
        jugadorId: state.jugadorIdActual,
        texto: texto,
        timestamp: Date.now()
    });
}
```

2. **Exportar desde `gameLogic.js`:**
```javascript
import { enviarMensaje } from './logic/chatManager.js';
export { enviarMensaje };
```

3. **Conectar en `app.js`:**
```javascript
import * as GameLogic from './gameLogic.js';
btnEnviarChat.onclick = () => GameLogic.enviarMensaje(inputChat.value);
```

---

## 📝 Reglas de Oro

1. **NUNCA modifiques `state` fuera de `gameState.js` directamente**
   - ✅ Correcto: `state.miPersonajeSecreto = personaje;`
   - ❌ Incorrecto: `state = { nuevo: "objeto" };` (usa `resetState()`)

2. **Cada módulo debe tener UNA responsabilidad clara**
   - Si un archivo hace "muchas cosas", divídelo

3. **Usa `firebaseSync.js` para ESCUCHAR cambios**
   - No pongas listeners en otros módulos

4. **`gameLogic.js` es la INTERFAZ PÚBLICA**
   - `app.js` SOLO importa de `gameLogic.js`, nunca de `logic/`

---

## 🚀 Próximos Pasos

1. ✅ Implementar votación completa
2. ✅ Implementar pantalla de resultados
3. ✅ Implementar siguiente ronda
4. ✅ Implementar pantalla de victoria
5. ⏳ Sistema de historias (narrativa dinámica)
6. ⏳ Efectos de sonido y música
7. ⏳ Animaciones visuales

---

**Última actualización:** 8 de noviembre de 2025
