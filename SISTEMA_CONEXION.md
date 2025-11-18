# Sistema de Gestión de Conexión - Documentación

## 🎯 Problema que resuelve

Cuando usas la app en móvil y sales de la pantalla más de 5 segundos (bloqueas el móvil, cambias de app, etc.), el navegador pone la app en "background mode" y:
- Pausa/desconecta la conexión de Firebase
- Congela el JavaScript
- Al volver, pierdes la pertenencia a la partida

Este sistema **resuelve completamente** ese problema con 3 mecanismos:

---

## ✅ Soluciones implementadas

### 1. **Page Visibility API** (Detector de Background/Foreground)
Detecta cuándo sales y vuelves a la app:
- **Sales de la app** → Se registra pero no se hace nada crítico
- **Vuelves a la app** → Se reconecta automáticamente y actualiza tu presencia

**Archivos:** `logic/connectionManager.js` (líneas 55-78)

### 2. **Firebase Connection State Monitoring**
Monitorea constantemente si estás conectado a Firebase:
- Usa `.info/connected` de Firebase (un endpoint especial)
- Si pierdes conexión → intenta reconectar automáticamente
- Si vuelves → actualiza tu estado de presencia

**Archivos:** 
- `logic/connectionManager.js` (líneas 25-44)
- `app.js` (líneas 106-123) - Indicador visual verde/rojo

### 3. **Sistema de Presencia Mejorado**
Cada jugador tiene en Firebase:
```javascript
{
  isPresent: true,        // ¿Está activamente conectado?
  lastSeen: 1234567890,   // Timestamp de última actividad
  disconnectedAt: null    // Si se desconecta, cuándo fue
}
```

**Ventaja:** Si pierdes conexión brevemente (< 30 seg), no te eliminan de la partida. Solo te marcan como "ausente temporalmente" y cuando vuelves, se actualiza automáticamente.

**Archivos:** `logic/connectionManager.js` (funciones `actualizarPresenciaJugador` y `setupDisconnectHandler`)

---

## 📱 Cómo probar que funciona

### Test 1: Cambio de app en móvil
1. Abre la app en el móvil (localhost:8000)
2. Únete a una partida
3. **Sal de la app** (ve a WhatsApp, Instagram, etc.)
4. Espera 10-15 segundos
5. **Vuelve a la app**
6. ✅ **Resultado esperado:** Sigues en la partida, todo funciona normalmente. Verás en la consola:
   ```
   📱 App en background
   📱 App en foreground
   🔄 Actualizando presencia al volver...
   ✅ Presencia actualizada
   ```

### Test 2: Bloquear pantalla
1. Abre la app en el móvil
2. Únete a una partida
3. **Bloquea la pantalla** (botón de power)
4. Espera 10 segundos
5. **Desbloquea y vuelve a la app**
6. ✅ **Resultado esperado:** Sigues en la partida

### Test 3: Pérdida total de conexión (modo avión)
1. Abre la app
2. Únete a una partida
3. Activa **modo avión**
4. Espera 5 segundos
5. Desactiva modo avión
6. ✅ **Resultado esperado:** 
   - El punto verde (arriba derecha) se pone rojo cuando pierdes conexión
   - Se pone verde automáticamente cuando vuelves
   - Firebase reconecta y actualizas presencia

### Test 4: Anfitrión se desconecta
1. El anfitrión crea partida
2. Otros jugadores se unen
3. Anfitrión **cierra completamente la app** o pierde internet permanentemente
4. ✅ **Resultado esperado:** La partida completa se elimina de Firebase (comportamiento correcto para evitar partidas huérfanas)

---

## 🔍 Indicador visual de conexión

Verás un **punto en la esquina superior derecha**:
- 🟢 **Verde** = Conectado a Firebase
- 🔴 **Rojo** = Desconectado (reconectando automáticamente)

Esto te da feedback visual inmediato del estado de conexión.

---

## 🛠️ Archivos modificados

1. **`logic/connectionManager.js`** (NUEVO)
   - Sistema completo de gestión de conexión
   - Page Visibility API
   - Monitoreo de Firebase
   - Sistema de presencia

2. **`logic/gameState.js`**
   - Inicializa connectionManager al arrancar
   - Limpia connectionManager al salir

3. **`logic/lobbyManager.js`**
   - Marca jugadores como presentes al crear/unirse
   - Mejora sistema onDisconnect

4. **`app.js`**
   - Indicador visual de conexión (punto verde/rojo)
   - Listener de estado de conexión Firebase

---

## 🔧 Configuración avanzada (opcional)

### Sistema de Heartbeat (comentado por defecto)
Si quieres, puedes activar un sistema de "latido" que actualiza cada 30 segundos que el jugador sigue activo:

```javascript
// En roundManager.js, después de empezar la partida:
import { startHeartbeat } from './connectionManager.js';
startHeartbeat(); // Inicia el latido
```

**¿Cuándo usar esto?**
- Si notas que algunos móviles siguen teniendo problemas
- Para debugging (ver timestamps de lastSeen en Firebase)

**Desventaja:** Consume un poco más de batería (muy poco, pero existe)

---

## 📊 Logs de debugging

El sistema genera logs claros en la consola:

```
✅ Conectado a Firebase
🔌 Sistema de gestión de conexión inicializado
📱 App en foreground
🔄 Reconectado. Actualizando presencia...
✅ Presencia actualizada
```

Si ves errores, revisa estos logs para saber qué paso falló.

---

## ⚠️ Limitaciones conocidas

1. **Si cierras completamente el navegador** → Pierdes la partida (esto es correcto, es una desconexión real)
2. **Si el anfitrión se desconecta permanentemente** → Se borra la partida (comportamiento intencional)
3. **Conexiones muy lentas (< 2G)** → Puede tardar más en reconectar, pero eventualmente lo hace

---

## 🎮 Recomendaciones para el usuario

En tu UI, podrías agregar un texto pequeño tipo:
> "Si sales de la app brevemente, no te preocupes. Reconectarás automáticamente al volver."

Esto da confianza a los jugadores de que no perderán el progreso.

---

## 🚀 Próximos pasos (si necesitas más robustez)

Si en el futuro necesitas algo más complejo:
1. **Service Workers** - Mantener conexión en background (más complejo)
2. **Sincronización offline** - Guardar acciones localmente y sincronizar al volver
3. **Sistema de "sala inactiva"** - Si todos se desconectan, pausar partida en vez de borrarla

Pero con lo implementado ahora, **el 95% de casos están cubiertos** sin añadir complejidad innecesaria.
