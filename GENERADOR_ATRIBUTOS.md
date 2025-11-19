# 🧪 Generador Algorítmico de Atributos y Nombres

## ¿Qué hace?

El generador algorítmico **expande** los atributos y nombres del juego manteniendo el tono único de cada nivel. Los **atributos y nombres originales se conservan** como base, y el sistema genera nuevos inspirándose en ellos.

---

## Características

✅ **Conserva los originales**: Todos los atributos y nombres que creaste manualmente se mantienen intactos  
✅ **Genera nuevos coherentes**: Crea atributos y nombres nuevos que respetan el tono de cada nivel  
✅ **Nombres españoles**: Incluye nombres comunes, antiguos (Hermenegildo, Segismundo, Eugenia) y raros  
✅ **Panel de testing con pestañas**: Previsualiza atributos y nombres por separado  
✅ **100% offline y gratis**: Sin APIs externas ni dependencias  

---

## Nombres Españoles

### 📊 Distribución
- **50% Comunes**: Antonio, María, José, Carmen, Manuel, Pedro, etc.
- **30% Antiguos**: Hermenegildo, Segismundo, Eugenia, Filomena, Genoveva, Clotilde, etc.
- **20% Raros**: Teófilo, Hilario, Primitivo, Amparo, Asunción, Milagros, etc.

### 🏛️ Ejemplos de nombres antiguos
**Masculinos**: Hermenegildo, Segismundo, Rigoberto, Casimiro, Eustaquio, Fulgencio, Gumersindo, Policarpo, Pancracio, Saturnino, Evaristo, Nicomedes

**Femeninos**: Eugenia, Filomena, Genoveva, Herminia, Perpetua, Clotilde, Eduvigis, Felicitas, Gertrudis, Hortensia, Jacinta, Modesta

### ✨ Ejemplos de nombres raros
**Masculinos**: Teófilo, Hilario, Cándido, Primitivo, Blas, Melchor, Gaspar, Baltasar, Ambrosio, Celestino

**Femeninos**: Amparo, Asunción, Consuelo, Encarnación, Milagros, Purificación, Rosario, Soledad, Trinidad, Angustias

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
3. Verás dos pestañas: **ATRIBUTOS** y **NOMBRES**

#### Pestaña ATRIBUTOS:
- Selecciona un nivel (Bronce, Plata, Oro...)
- Verás:
  - **ORIGINALES**: Muestra de tus atributos originales
  - **GENERADOS**: 15 atributos nuevos creados por el algoritmo
- Haz clic en **"🔄 REGENERAR"** para ver nuevas combinaciones

#### Pestaña NOMBRES:
- Verás 4 columnas:
  - **ORIGINALES**: Tus nombres originales (Alex, Carmen, David...)
  - **COMUNES**: Nombres españoles modernos (Antonio, María, José...)
  - **ANTIGUOS**: Nombres clásicos españoles (Hermenegildo, Eugenia, Segismundo...)
  - **RAROS**: Nombres poco comunes (Teófilo, Amparo, Primitivo...)
- Haz clic en **"🔄 REGENERAR NOMBRES"** para ver nuevas combinaciones

### En partida (Automático)
- El sistema **combina automáticamente** atributos y nombres originales + generados
- Por defecto, se añaden:
  - **20 atributos generados** por nivel (excepto Life or Death que añade 15)
  - **30 nombres generados** (mezcla de comunes, antiguos y raros)
- El pool total se mezcla aleatoriamente cada partida

---

## Configuración técnica

### Archivo: `logic/attributeGenerator.js`

**Funciones principales:**

**Para atributos:**
```javascript
obtenerPoolAtributos(nivel, cantidadGenerados)
```
- `nivel`: 'bronce', 'plata', 'oro', 'platino', 'diamante', 'lifeordeath'
- `cantidadGenerados`: Número de atributos a generar (por defecto 10)
- **Retorna**: Array mezclado de atributos (originales + generados)

**Para nombres:**
```javascript
obtenerPoolNombres(cantidadGenerados)
```
- `cantidadGenerados`: Número de nombres a generar (por defecto 30)
- **Retorna**: Array mezclado de nombres únicos (originales + generados)
- **Distribución**: 50% comunes, 30% antiguos, 20% raros

---

## Cómo ajustar la cantidad

### Ajustar atributos generados

Edita `logic/lobbyManager.js` y `logic/roundManager.js` (líneas ~10-18):

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

### Ajustar nombres generados

Edita `logic/roundManager.js` (línea ~72):

```javascript
let nombresDisponibles = obtenerPoolNombres(30); // ← Cambia este número
```

**Recomendación**: 
- Mantén al menos 15-20 atributos generados para buena variedad
- Mantén al menos 30 nombres para tener suficiente pool

---

## Cómo añadir más nombres

Si quieres **más nombres españoles**, edita `logic/attributeGenerator.js`:

### Ejemplo: Añadir más nombres antiguos
```javascript
antiguos: [
    "Hermenegildo", "Segismundo", "Rigoberto", 
    // ... (nombres existentes)
    // ← AÑADE AQUÍ MÁS NOMBRES ANTIGUOS
    "Adalberto", "Sigfrido", "Wenceslao",
    // Femeninos
    "Adelaida", "Cunegunda", "Rosalinda"
]
```

### Nombres disponibles para añadir:
- **Antiguos masculinos**: Adalberto, Sigfrido, Wenceslao, Teobaldo, Atanasio
- **Antiguos femeninos**: Adelaida, Cunegunda, Rosalinda, Eufemia, Serafina
- **Raros**: Epifanio, Anacleto, Crescencio, Pánfilo, Desiderio

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
