# 🧪 Generador Algorítmico de Atributos

## ¿Qué hace?

El generador algorítmico **expande** los atributos del juego manteniendo el tono único de cada nivel. Los **atributos originales se conservan** como base, y el sistema genera nuevos atributos inspirándose en ellos.

---

## Características

✅ **Conserva los originales**: Todos los atributos que creaste manualmente se mantienen intactos  
✅ **Genera nuevos coherentes**: Crea atributos nuevos que respetan el tono de cada nivel  
✅ **Inspirado en los originales**: Analiza patrones de tus atributos originales  
✅ **Panel de testing**: Previsualiza generaciones sin entrar en partida  
✅ **100% offline y gratis**: Sin APIs externas ni dependencias  

---

## Tono de cada nivel

### 🥉 BRONCE
- **Tono**: Profesiones comunes, características básicas, estados anímicos simples
- **Ejemplos generados**: "Panadero", "Alto", "Optimista", "Taxista"

### 🥈 PLATA
- **Tono**: Situaciones complejas, creencias, condiciones médicas/sociales
- **Ejemplos generados**: "Divorciado", "Musulmán", "Insomnio crónico", "Influencer fracasado"

### 🥇 ORO
- **Tono**: Ideologías extremas, rarezas llamativas, contradicciones absurdas
- **Ejemplos generados**: "Anarquista extremo", "Solo viste de morado", "Vegano que caza"

### 💎 PLATINO
- **Tono**: Tabúes sociales fuertes, comportamientos perturbadores, humor negro extremo
- **Ejemplos generados**: "Pirómano", "Supremacista blanco", "Fetichista de pies"

### 💠 DIAMANTE
- **Tono**: Locura total, ciencia ficción, realidades alternativas, delirios absolutos
- **Ejemplos generados**: "Telépata", "Viene del futuro", "Cyborg", "Come solo cosas azules"

### ⚡ LIFE OR DEATH
- **Tono**: Extremos absolutos de bien y mal, paradojas morales, game-changers totales
- **Ejemplos generados**: "Salvó a 100 personas de un incendio", "Asesino en serie", "Controla el clima"

---

## ¿Cómo se usa?

### En el lobby (Testing)
1. Crea o únete a una partida
2. En el lobby, haz clic en **"🧪 VER GENERADOR DE ATRIBUTOS"**
3. Selecciona un nivel (Bronce, Plata, Oro...)
4. Verás:
   - **ORIGINALES**: Muestra de tus atributos originales
   - **GENERADOS**: 15 atributos nuevos creados por el algoritmo
5. Haz clic en **"🔄 REGENERAR"** para ver nuevas combinaciones

### En partida (Automático)
- El sistema **combina automáticamente** atributos originales + generados
- Por defecto, se añaden **20 atributos generados** por nivel (excepto Life or Death que añade 15)
- El pool total se mezcla aleatoriamente cada partida

---

## Configuración técnica

### Archivo: `logic/attributeGenerator.js`

**Función principal:**
```javascript
obtenerPoolAtributos(nivel, cantidadGenerados)
```

**Parámetros:**
- `nivel`: 'bronce', 'plata', 'oro', 'platino', 'diamante', 'lifeordeath'
- `cantidadGenerados`: Número de atributos a generar (por defecto 10)

**Retorna:**
- Array mezclado de atributos (originales + generados)

---

## Cómo ajustar la cantidad

Si quieres **más o menos atributos generados**, edita estos archivos:

### `logic/lobbyManager.js` (líneas ~10-18)
```javascript
function generarPoolsExpandidos() {
    return {
        bronce: obtenerPoolAtributos('bronce', 20),    // ← Cambia este número
        plata: obtenerPoolAtributos('plata', 20),      // ← Cambia este número
        oro: obtenerPoolAtributos('oro', 20),          // ← Cambia este número
        platino: obtenerPoolAtributos('platino', 20),  // ← Cambia este número
        diamante: obtenerPoolAtributos('diamante', 20),// ← Cambia este número
        lifeordeath: obtenerPoolAtributos('lifeordeath', 15) // ← Cambia este número
    };
}
```

### `logic/roundManager.js` (líneas ~8-16)
```javascript
// Mismo código, mismos números
```

**Recomendación**: Mantén al menos 15-20 generados para buena variedad.

---

## Cómo añadir más plantillas

Si quieres que el generador tenga **más opciones**, edita `logic/attributeGenerator.js`:

### Ejemplo: Añadir más profesiones a BRONCE
```javascript
bronce: {
    tono: "profesiones comunes, características básicas, estados anímicos simples",
    profesiones: [
        "Panadero", "Cartero", "Profesor", 
        "Mecánico", "Jardinero", "Cocinero",
        // ← AÑADE AQUÍ MÁS PROFESIONES
        "Veterinario", "Dentista", "Músico callejero"
    ],
    // ... resto del código
}
```

---

## Testing recomendado

**Antes de jugar:**
1. Abre el modal de testing (`🧪 VER GENERADOR DE ATRIBUTOS`)
2. Revisa cada nivel y regenera varias veces
3. Asegúrate de que el tono es coherente
4. Si ves algo que no te gusta, edita las plantillas en `attributeGenerator.js`

**Durante la partida:**
- Los atributos se mezclan automáticamente
- No verás diferencia entre originales y generados (están integrados)
- La variedad aumenta significativamente

---

## Arquitectura del sistema

```
gameData.js
    ↓ (atributos originales)
logic/attributeGenerator.js
    ↓ (genera nuevos + combina)
logic/roundManager.js + lobbyManager.js
    ↓ (crea pools expandidos)
logic/attributeManager.js
    ↓ (asigna en rondas)
Firebase
    ↓ (sincroniza entre jugadores)
```

---

¡Y listo! El sistema está **funcionando y listo para usar**. 🎉
