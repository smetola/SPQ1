// Generador algorítmico de atributos y nombres
// Se inspira en los atributos originales para crear nuevas combinaciones coherentes con cada nivel

import { LISTAS_ATRIBUTOS, NOMBRES_PERSONAJE } from '../gameData.js';

// Pool de nombres españoles (comunes + antiguos/raros)
const NOMBRES_ESPANOLES = {
    comunes: [
        "Antonio", "María", "José", "Ana", "Francisco", "Carmen", "Manuel", "Dolores",
        "Juan", "Pilar", "Pedro", "Teresa", "Jesús", "Rosa", "Luis", "Josefa",
        "Ángel", "Antonia", "Miguel", "Isabel", "Ramón", "Mercedes", "Rafael", "Concepción",
        "Vicente", "Francisca", "Fernando", "Cristina", "Andrés", "Patricia",
        "Pablo", "Beatriz", "Diego", "Natalia", "Raúl", "Silvia", "Álvaro", "Marta",
        "Adrián", "Sandra", "Ignacio", "Claudia", "Óscar", "Irene", "Víctor", "Nerea"
    ],
    antiguos: [
        "Hermenegildo", "Segismundo", "Rigoberto", "Casimiro", "Eustaquio", "Abundio",
        "Fulgencio", "Gumersindo", "Policarpo", "Pancracio", "Críspulo", "Saturnino",
        "Evaristo", "Remigio", "Nicomedes", "Anastasio", "Telesforo", "Restituto",
        "Eusebio", "Baldomero", "Cesareo", "Demetrio", "Escolástico", "Froilán",
        // Femeninos antiguos
        "Eugenia", "Filomena", "Genoveva", "Herminia", "Leonor", "Perpetua",
        "Clotilde", "Eduvigis", "Felicitas", "Gertrudis", "Hortensia", "Jacinta",
        "Modesta", "Plácida", "Remedios", "Severina", "Visitación", "Aniceta",
        "Basilisa", "Casilda", "Dorotea", "Escolástica", "Faustina", "Gregoria"
    ],
    raros: [
        "Teófilo", "Hilario", "Cándido", "Primitivo", "Blas", "Melchor", "Gaspar", "Baltasar",
        "Ambrosio", "Celestino", "Cipriano", "Emeterio", "Fermín", "Isidro", "Laureano",
        // Femeninos raros
        "Amparo", "Asunción", "Consuelo", "Encarnación", "Milagros", "Purificación",
        "Rosario", "Soledad", "Trinidad", "Angustias", "Dolores", "Pastora",
        "Covadonga", "Begoña", "Montserrat", "Fátima", "Rocío", "Inmaculada"
    ]
};

// Plantillas y componentes por nivel (inspirados en los originales)
const GENERADOR_CONFIG = {
    bronce: {
        tono: "profesiones comunes, características básicas, estados anímicos simples",
        profesiones: ["Panadero", "Cartero", "Profesor", "Mecánico", "Jardinero", "Cocinero", "Electricista", "Fontanero", "Taxista", "Bibliotecario"],
        caracteristicas: ["Rubio", "Pelirrojo", "Alto", "Bajo", "Delgado", "Fuerte", "Moreno", "Canoso"],
        estados: ["Optimista", "Pesimista", "Tranquilo", "Nervioso", "Tímido", "Extrovertido", "Serio", "Risueño"],
        adjetivos: ["Honrado", "Trabajador", "Vago", "Generoso", "Tacaño", "Paciente", "Impaciente", "Calmado"]
    },
    
    plata: {
        tono: "situaciones complejas, creencias, condiciones médicas/sociales",
        situaciones: ["Divorciado", "Viudo", "Desempleado", "En bancarrota", "Con deudas", "Adicto al trabajo"],
        creencias: ["Agnóstico", "Musulmán", "Judío", "Hinduista", "Testigo de Jehová", "Mormón"],
        condiciones: ["Insomnio crónico", "Alergia severa", "Claustrofobia", "Agorafobia", "Depresión leve", "Ansiedad"],
        sociales: ["Tiene OnlyFans", "Influencer fracasado", "Streamer sin viewers", "YouTuber cancelado", "Tiene Match.com Premium"],
        aspectos: ["Familia millonaria", "Familia tóxica", "Padre ausente", "Madre sobreprotectora", "Hermano en prisión"]
    },
    
    oro: {
        tono: "ideologías extremas, rarezas llamativas, contradicciones absurdas",
        ideologias: ["Anarquista extremo", "Monárquico extremo", "Ecologista radical", "Libertario extremo", "Nihilista", "Posadista"],
        rarezas: ["Colecciona uñas", "Solo viste de morado", "Es transparente", "Huele a vainilla", "Es cuadrado", "Brilla en la oscuridad"],
        contradicciones: ["Vegano que caza", "Pacifista violento", "Ateo que reza", "Minimalista con 50 pares de zapatos", "Ecologista con 3 coches"],
        culturales: ["Su artista favorito es Pitbull", "Solo ve películas de Steven Seagal", "Fanático de Eurovisión", "Coleccionista de vinilos de Bisbal"],
        oficios: ["Rey", "Duquesa", "Conde", "Baron", "Caballero", "Plebeyo con ínfulas"]
    },
    
    platino: {
        tono: "tabúes sociales fuertes, comportamientos perturbadores, humor negro extremo",
        perturbadores: ["Pirómano", "Cleptómano", "Ludópata", "Mitómano", "Narcisista extremo", "Psicópata diagnosticado"],
        extremos: ["Fetichista de pies", "Fetichista de manos", "Solo se excita con uniformes", "Adicto al sexo", "Asexual militante"],
        sociales: ["Supremacista blanco", "Misógino", "Misándrico", "Homófobo", "Transfóbobico", "Especista"],
        condiciones: ["Esquizofrenia", "Trastorno bipolar", "Psicosis", "Demencia temprana", "Alzheimer inicial", "Parkinson"],
        absurdos: ["Solo se relaciona con gente de su signo zodiacal", "Cree que es de la realeza", "Piensa que es inmortal", "Cree que todos le aman"],
        tabues: ["Incestuoso", "Zoófilo", "Sádico", "Masoquista extremo", "Exhibicionista", "Voyeurista"]
    },
    
    diamante: {
        tono: "locura total, ciencia ficción, realidades alternativas, delirios absolutos",
        poderes: ["Telépata", "Puede volar", "Invisible a veces", "Controla el fuego", "Lee mentes", "Teletransportación fallida"],
        delirios: ["Es Napoleón reencarnado", "Viene del futuro", "Es un viajero temporal", "Cree ser un dios", "Piensa que todos son NPCs"],
        cienciaFiccion: ["Cyborg", "Clon", "Mutante", "IA consciente", "Humano genéticamente modificado", "Híbrido humano-animal"],
        locuras: ["Come solo cosas azules", "Duerme parado", "Habla al revés", "Solo camina hacia atrás", "No usa pronombres", "Se comunica cantando"],
        bizarro: ["Sus órganos están al revés", "Tiene dos corazones", "No tiene ombligo", "Sus huesos son de goma", "Sangre verde"],
        sobrenaturales: ["Vampiro vegano", "Hombre lobo alérgico a la luna", "Fantasma vivo", "Ángel caído", "Demonio arrepentido", "Medium fracasado"]
    },
    
    lifeordeath: {
        tono: "extremos absolutos de bien y mal, paradojas morales, game-changers totales",
        heroes: ["Salvó a 100 personas de un incendio", "Donó todos sus órganos en vida", "Inventó la cura del cáncer", "Evitó una guerra mundial", "Salvó a niños de trata"],
        villanos: ["Asesino en serie", "Terrorista internacional", "Genocida", "Dictador depuesto", "Traficante de personas"],
        paradojas: ["Conoce la fecha exacta de tu muerte", "Puede resucitar a una persona", "Controla el clima", "Puede borrar memorias"],
        cosmicos: ["Es Jesucristo reencarnado", "Es el Anticristo", "Es Buda", "Es Mahoma", "Es un ángel de la muerte"],
        absurdosSupremos: ["Colecciona dictadores de Lego", "Su hobby es entrenar hormigas", "Escribió la Biblia 2", "Inventó un nuevo color"]
    }
};

/**
 * Genera un atributo aleatorio para un nivel específico
 * @param {string} nivel - bronce, plata, oro, platino, diamante, lifeordeath
 * @returns {string} Atributo generado
 */
export function generarAtributo(nivel) {
    const config = GENERADOR_CONFIG[nivel];
    if (!config) return "Error: nivel desconocido";
    
    // Seleccionar categoría aleatoria del nivel
    const categorias = Object.keys(config).filter(key => key !== 'tono');
    const categoriaAleatoria = categorias[Math.floor(Math.random() * categorias.length)];
    const lista = config[categoriaAleatoria];
    
    // Seleccionar elemento aleatorio
    return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Genera múltiples atributos únicos para un nivel
 * @param {string} nivel - bronce, plata, oro, platino, diamante, lifeordeath
 * @param {number} cantidad - Número de atributos a generar
 * @returns {string[]} Array de atributos generados
 */
export function generarAtributos(nivel, cantidad) {
    const generados = new Set();
    const maxIntentos = cantidad * 10; // Evitar bucle infinito
    let intentos = 0;
    
    while (generados.size < cantidad && intentos < maxIntentos) {
        generados.add(generarAtributo(nivel));
        intentos++;
    }
    
    return Array.from(generados);
}

/**
 * Obtiene pool completo de atributos: originales + generados
 * @param {string} nivel - bronce, plata, oro, platino, diamante, lifeordeath
 * @param {number} cantidadGenerados - Número de atributos a generar (por defecto 10)
 * @returns {string[]} Pool combinado de atributos
 */
export function obtenerPoolAtributos(nivel, cantidadGenerados = 10) {
    const originales = LISTAS_ATRIBUTOS[nivel] || [];
    const generados = generarAtributos(nivel, cantidadGenerados);
    
    // Combinar y mezclar
    const pool = [...originales, ...generados];
    return mezclarArray(pool);
}

/**
 * Mezcla un array usando el algoritmo Fisher-Yates
 */
function mezclarArray(array) {
    const resultado = [...array];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
}

/**
 * Genera un lote de prueba para visualización
 * @param {string} nivel
 * @param {number} cantidad
 * @returns {Object} { originales, generados, tono }
 */
export function generarLotePrueba(nivel, cantidad = 15) {
    const config = GENERADOR_CONFIG[nivel];
    const originales = (LISTAS_ATRIBUTOS[nivel] || []).slice(0, 5); // Primeros 5 originales
    const generados = generarAtributos(nivel, cantidad);
    
    return {
        nivel,
        tono: config ? config.tono : "desconocido",
        originales,
        generados
    };
}

// --- FUNCIONES PARA GENERADOR DE NOMBRES ---

/**
 * Genera un nombre aleatorio español
 * @param {string} tipo - 'comun', 'antiguo', 'raro', 'mixto' (por defecto 'mixto')
 * @returns {string} Nombre generado
 */
export function generarNombre(tipo = 'mixto') {
    if (tipo === 'mixto') {
        // Mezcla: 50% comunes, 30% antiguos, 20% raros
        const rand = Math.random();
        if (rand < 0.5) {
            tipo = 'comunes';
        } else if (rand < 0.8) {
            tipo = 'antiguos';
        } else {
            tipo = 'raros';
        }
    }
    
    const lista = NOMBRES_ESPANOLES[tipo] || NOMBRES_ESPANOLES.comunes;
    return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Obtiene pool completo de nombres: originales + generados
 * @param {number} cantidadGenerados - Número de nombres a generar (por defecto 20)
 * @returns {string[]} Pool combinado de nombres únicos
 */
export function obtenerPoolNombres(cantidadGenerados = 30) {
    const originales = [...NOMBRES_PERSONAJE];
    const generados = new Set();
    const maxIntentos = cantidadGenerados * 10;
    let intentos = 0;
    
    // Generar nombres únicos que no estén en originales
    while (generados.size < cantidadGenerados && intentos < maxIntentos) {
        const nombre = generarNombre('mixto');
        if (!originales.includes(nombre)) {
            generados.add(nombre);
        }
        intentos++;
    }
    
    // Combinar y mezclar
    const pool = [...originales, ...Array.from(generados)];
    return mezclarArray(pool);
}

/**
 * Genera un lote de prueba de nombres para visualización
 * @param {number} cantidadPorTipo - Cantidad de nombres por cada tipo
 * @returns {Object} { originales, comunes, antiguos, raros }
 */
export function generarLotePruebaNombres(cantidadPorTipo = 10) {
    const originales = NOMBRES_PERSONAJE.slice(0, 8); // Muestra de originales
    
    // Generar nombres únicos por tipo
    const comunes = new Set();
    const antiguos = new Set();
    const raros = new Set();
    
    while (comunes.size < cantidadPorTipo) {
        comunes.add(generarNombre('comunes'));
    }
    
    while (antiguos.size < cantidadPorTipo) {
        antiguos.add(generarNombre('antiguos'));
    }
    
    while (raros.size < cantidadPorTipo) {
        raros.add(generarNombre('raros'));
    }
    
    return {
        originales,
        comunes: Array.from(comunes),
        antiguos: Array.from(antiguos),
        raros: Array.from(raros)
    };
}
