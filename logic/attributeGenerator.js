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

// =============================================================================
// OPCIÓN A: EXPANSIÓN DE PLANTILLAS
// Más opciones por nivel, se fusionan con GENERADOR_CONFIG al cargar.
// Los originales de gameData.js NO se tocan; esto solo amplía las plantillas
// del generador (las que están arriba en GENERADOR_CONFIG).
// =============================================================================
const EXPANSION_CONFIG = {
    bronce: {
        profesiones: [
            "Veterinario", "Dentista", "Barbero", "Barrendero", "Carpintero",
            "Pescador", "Albañil", "Peluquero", "Sastre", "Zapatero",
            "Camarero", "Conserje", "Portero", "Repartidor", "Granjero",
            "Tendero", "Pintor de brocha gorda", "Ferretero", "Carnicero", "Farmacéutico"
        ],
        caracteristicas: [
            "Pecoso", "Con gafas", "Con bigote", "Con barba", "Zurdo",
            "Miope", "Con lunares", "Atlético", "Rellenito", "Daltónico",
            "Con canas prematuras", "Con la nariz grande", "Cejas gruesas", "Con aparato dental"
        ],
        estados: [
            "Contento", "Nostálgico", "Melancólico", "Animado", "Aburrido",
            "Curioso", "Cauteloso", "Despreocupado", "Orgulloso", "Humilde",
            "Soñador", "Despistado"
        ],
        adjetivos: [
            "Puntual", "Ordenado", "Desordenado", "Educado", "Maleducado",
            "Leal", "Cabezota", "Terco", "Respetuoso", "Ingenuo",
            "Cotilla", "Buen cocinero", "Buen bailarín", "Madrugador", "Dormilón"
        ]
    },
    plata: {
        situaciones: [
            "Arruinado", "Becario eterno", "En crisis de los 40", "Emigrante",
            "Recién separado", "Padre soltero", "En custodia compartida",
            "Heredó una granja de caracoles", "Vive con sus padres con 40 años", "En libertad condicional"
        ],
        creencias: [
            "Evangélico", "Cienciólogo", "Taoísta", "Pastafari", "Satanista de LaVey",
            "Rastafari", "Cree en el horóscopo", "Seguidor de un gurú de YouTube",
            "Cree en la quiromancia", "Cree en los OVNIs"
        ],
        condiciones: [
            "Migraña crónica", "Fobia social", "Sonámbulo", "Narcoléptico", "Hipocondríaco",
            "TOC", "TDAH severo", "Amnesia selectiva", "Alergia al sol",
            "Vértigo", "Tartamudo", "Tics nerviosos"
        ],
        sociales: [
            "Admin de grupo de WhatsApp", "Bloqueado en Twitter", "Baneado de Tinder",
            "Tiktoker de cocina", "Gamer profesional en paro", "Tiene LinkedIn Premium",
            "Revisor de Google Maps", "Moderador de Reddit", "Vendedor de Wallapop",
            "Escribe reseñas en TripAdvisor", "Tiene un blog que nadie lee"
        ],
        aspectos: [
            "Hijo adoptado", "Familia de circo", "Abuela que era espía",
            "Tío famoso por accidente", "Primo segundo del alcalde",
            "Su familia tiene un secreto", "Es el favorito de su abuela",
            "Su perro es más famoso que él"
        ]
    },
    oro: {
        ideologias: [
            "Ludita militante", "Terraplanista convencido", "Feudalista moderno",
            "Primitivista", "Anti-vacunas", "Anti-wifi",
            "Cree que los pájaros son drones", "Conspiranoico profesional"
        ],
        rarezas: [
            "Solo come a las 3:33 AM", "Duerme con los ojos abiertos", "No parpadea nunca",
            "Puede lamer su propio codo", "Siempre lleva guantes",
            "Habla en tercera persona", "Siempre susurra", "Solo bebe agua caliente",
            "Tiene un olor magnético", "No tiene sombra"
        ],
        contradicciones: [
            "Nudista pudoroso", "Escritor analfabeto", "Médico anticiencia",
            "Chef que no come", "Profesor que no sabe sumar", "Bombero pirómano",
            "Policía que roba caramelos", "Conductor sin carnet", "Nadador que teme al agua"
        ],
        culturales: [
            "Su canción del verano es de Beret", "Solo lee Paulo Coelho",
            "Fan de las telenovelas turcas", "Llora con los anuncios de Navidad",
            "Sigue viendo Art Attack", "Va al cine solo por las palomitas",
            "Su película favorita es Sharknado", "Su serie favorita es Pasión de Gavilanes"
        ],
        oficios: [
            "Marqués sin marquesado", "Sultán autoproclamado", "Faraón de fin de semana",
            "Embajador de un país inventado", "Presidente de su comunidad de vecinos",
            "Papa de una religión con 2 seguidores"
        ]
    },
    platino: {
        perturbadores: [
            "Sociópata funcional", "Acumulador compulsivo", "Toxicómano recuperado (o no)",
            "Adicto a oler gasolina", "Se arranca las pestañas cuando se aburre",
            "Ríe en los funerales", "Llora de felicidad en los divorcios"
        ],
        extremos: [
            "Le atraen los maniquís", "Colecciona pelo de desconocidos",
            "Tiene un altar a su ex", "Huele la ropa de los demás",
            "Lame las farolas cuando llueve", "Su fantasía es vivir en IKEA"
        ],
        sociales: [
            "Elitista extremo", "Clasista de manual", "Odia a los niños",
            "Odia a los ancianos", "Anti-mascotas", "Odia las bodas",
            "Cree que es superior a todos", "Desprecia la música moderna"
        ],
        condiciones: [
            "Personalidad múltiple", "Trastorno explosivo intermitente",
            "Fobia a los espejos", "Síndrome de Cotard",
            "Síndrome de Capgras", "Insomnio familiar fatal"
        ],
        absurdos: [
            "Convencido de que es un personaje de videojuego", "Solo habla en refranes",
            "Cree que su gato le controla la mente", "Piensa que su reflejo es otra persona",
            "Convencido de que la luna le habla", "Cree que el wifi le lee los pensamientos"
        ],
        tabues: [
            "Caníbal gastronómico", "Ladrón de tumbas",
            "Se baña en leche de burra robada", "Roba wifi a los hospitales",
            "Colecciona dientes ajenos", "Ha vendido la casa de su abuela sin decírselo"
        ]
    },
    diamante: {
        poderes: [
            "Puede detener el tiempo 3 segundos", "Controla las hormigas",
            "Fotosíntesis", "Echolocalización", "Puede ver los olores",
            "Levita cuando estornuda", "Magnetismo involuntario", "Habla con las WiFi"
        ],
        delirios: [
            "Cree que es un Pokémon", "Está convencido de que vive en una simulación",
            "Piensa que es el último humano real", "Cree que los semáforos le envían mensajes",
            "Dice que inventó Internet", "Cree haber descubierto Atlántida en su bañera",
            "Afirma ser de una dimensión paralela"
        ],
        cienciaFiccion: [
            "Alien infiltrado", "Humano mejorado con nanobots", "Viajero entre dimensiones",
            "Cerebro transplantado", "Último superviviente de la Atlántida",
            "Criogenizado y descongelado", "Producto de un experimento militar"
        ],
        locuras: [
            "Solo respira por la boca", "Parpadea una vez por hora", "Mastica piedras",
            "Se ducha con ropa", "Duerme con zapatos", "Come con las manos atadas",
            "Solo gira a la izquierda", "Cuenta todo en voz alta", "Anda de puntillas siempre"
        ],
        bizarro: [
            "Tiene tres filas de dientes", "Sus uñas crecen al revés",
            "Su pelo cambia de color con su humor", "Tiene un ojo que ve en infrarrojo",
            "Su sudor huele a canela", "No tiene huellas dactilares", "Su piel es ligeramente azul"
        ],
        sobrenaturales: [
            "Zombie consciente", "Sirena con piernas", "Minotauro vegetariano",
            "Hada gótica", "Gnomo de jardín que cobró vida", "Duende sindicalizado",
            "Espantapájaros con sentimientos"
        ]
    },
    lifeordeath: {
        heroes: [
            "Descubrió cómo limpiar los océanos", "Detuvo un asteroide con las manos",
            "Inventó la energía infinita", "Resolvió el hambre mundial con una receta",
            "Salvó a una especie de la extinción"
        ],
        villanos: [
            "Arruinó la economía de un país por diversión", "Creó un virus que borró Wikipedia",
            "Robó la reserva de oro de un banco central", "Fue líder de un cártel 20 años",
            "Vendió secretos de estado por un kebab"
        ],
        paradojas: [
            "Si muere, todos mueren", "Si vive, alguien más morirá",
            "Conoce un secreto que destruiría a todos", "Puede ver todos los futuros posibles",
            "Sabe quién miente pero no puede decirlo"
        ],
        cosmicos: [
            "Es la reencarnación de Cleopatra", "Es el avatar de Gaia",
            "Es el último profeta", "Es un emisario de otra galaxia",
            "Es la personificación de la muerte"
        ],
        absurdosSupremos: [
            "Tiene un ejército de palomas amaestradas", "Hizo llorar a Chuck Norris",
            "Ganó un juicio contra Dios", "Tiene la receta secreta de la Coca-Cola",
            "Fue rechazado por la mafia por ser demasiado peligroso"
        ]
    }
};

// Fusionar la expansión con la config base (sin tocar los originales de gameData.js)
Object.keys(EXPANSION_CONFIG).forEach(nivel => {
    const expansion = EXPANSION_CONFIG[nivel];
    const base = GENERADOR_CONFIG[nivel];
    if (base) {
        Object.keys(expansion).forEach(categoria => {
            if (base[categoria]) {
                base[categoria].push(...expansion[categoria]);
            }
        });
    }
});

// =============================================================================
// OPCIÓN B: SISTEMA COMBINATORIO
// Genera atributos ÚNICOS combinando fragmentos con plantillas.
// Ejemplo: "{profesion} jubilado" + slot profesion=["panadero",...] → "Panadero jubilado"
// Esto produce MILES de combinaciones posibles a partir de pocas piezas.
// =============================================================================
const COMBINACIONES_CONFIG = {
    bronce: {
        plantillas: [
            "{profesion} jubilado",
            "Ex-{profesion}",
            "{profesion} de pueblo",
            "{profesion} en prácticas",
            "{profesion} a media jornada",
            "Aprendiz de {profesion}",
            "{caracteristica} y {estado}",
            "{profesion} que quería ser {sueno}",
            "{adjetivo} desde pequeño"
        ],
        slots: {
            profesion: [
                "panadero", "cartero", "profesor", "mecánico", "jardinero", "cocinero",
                "electricista", "fontanero", "taxista", "carpintero", "pescador",
                "albañil", "peluquero", "sastre", "camarero", "granjero",
                "pintor", "herrero", "carnicero", "farmacéutico"
            ],
            sueno: [
                "astronauta", "famoso", "cantante", "actor", "futbolista",
                "influencer", "piloto", "chef estrella Michelin", "torero", "rockero"
            ],
            caracteristica: [
                "Alto", "Bajo", "Rubio", "Moreno", "Fuerte", "Delgado",
                "Pecoso", "Con gafas", "Con bigote", "Zurdo", "Miope", "Rellenito"
            ],
            estado: [
                "optimista", "pesimista", "tranquilo", "nervioso", "tímido",
                "serio", "despistado", "soñador", "aburrido", "nostálgico"
            ],
            adjetivo: [
                "Honrado", "Trabajador", "Vago", "Generoso", "Tacaño",
                "Puntual", "Desordenado", "Cabezota", "Cotilla", "Dormilón"
            ]
        }
    },
    plata: {
        plantillas: [
            "Adicto a {adiccion}",
            "Tiene miedo de {miedo}",
            "Convencido de que {conviccion}",
            "En lista de espera para {espera}",
            "{situacion} desde los {edad} años",
            "Le han echado de {lugar}",
            "Se gastó todos sus ahorros en {compra}",
            "Su ex es {expareja}"
        ],
        slots: {
            adiccion: [
                "los rasca y gana", "las compras online", "los podcast de crímenes",
                "el café con leche", "los reality shows", "las galletas Oreo",
                "los documentales de Netflix", "el bingo online", "los crucigramas",
                "los memes", "TikTok", "las subastas por internet"
            ],
            miedo: [
                "los payasos", "las palomas", "los espejos", "los gatos negros",
                "los puentes", "las mariposas", "los ascensores", "los globos",
                "las escaleras mecánicas", "los maniquís", "los calcetines mojados"
            ],
            conviccion: [
                "es adoptado", "fue famoso en otra vida", "le vigilan",
                "le deben dinero", "es de la realeza", "tiene un gemelo secreto",
                "su vecino es un espía", "las plantas le escuchan"
            ],
            espera: [
                "un trasplante de pelo", "un juicio", "un exorcismo", "una herencia",
                "un visado", "un reality show", "que le llamen de un casting",
                "que le toque la lotería"
            ],
            situacion: [
                "En depresión", "En terapia", "En paro", "Endeudado",
                "En una secta", "En negación", "En busca y captura por multas",
                "En rehabilitación"
            ],
            edad: ["12", "15", "18", "25", "30", "40", "55"],
            lugar: [
                "3 trabajos", "su casa", "el gimnasio", "2 bares", "un grupo de WhatsApp",
                "una secta", "el coro de la iglesia", "el equipo de fútbol del barrio"
            ],
            compra: [
                "criptomonedas", "un timeshare", "cursos de coaching", "piedras energéticas",
                "un caballo", "una autocaravana", "NFTs", "un castillo en ruinas"
            ],
            expareja: [
                "famoso/a", "su primo/a", "su jefe/a", "su terapeuta",
                "un/a influencer", "un cura", "su profesor/a del colegio"
            ]
        }
    },
    oro: {
        plantillas: [
            "{ideologia} pero {contradiccion}",
            "Solo {accion_rara}",
            "Colecciona {coleccion}",
            "Fanático de {fanatismo}",
            "Se cree {delirio}",
            "Dice que es {titulo} de {lugar}",
            "{rareza} desde un accidente en {accidente}"
        ],
        slots: {
            ideologia: [
                "comunista", "capitalista", "anarquista", "monárquico", "ecologista",
                "terraplanista", "ludita", "nudista", "nihilista"
            ],
            contradiccion: [
                "tiene acciones en Inditex", "compra en Amazon", "trabaja en un banco",
                "es dueño de una fábrica", "tiene 5 coches", "vive en un palacio",
                "paga todo en negro", "idolatra a Elon Musk"
            ],
            accion_rara: [
                "come de noche", "habla en latín los martes", "se ducha con salsa de tomate",
                "se viste de rojo", "camina descalzo", "bebe leche con hielo",
                "cocina con los ojos cerrados", "duerme con música gregoriana"
            ],
            coleccion: [
                "granos de arena de cada playa", "servilletas usadas de famosos",
                "tickets de parking", "envases de champú de hoteles",
                "fotos de buzones", "calcetines desparejados", "pelos de barba"
            ],
            fanatismo: [
                "los caracoles de competición", "el curling extremo",
                "el ajedrez boxeo", "el mundial de piedra, papel o tijera",
                "las carreras de cucarachas", "el lanzamiento de teléfono móvil"
            ],
            delirio: [
                "descendiente de Julio César", "inventor del WiFi",
                "el mejor bailarín del mundo", "un genio incomprendido",
                "el elegido", "un noble desterrado"
            ],
            titulo: ["Duque", "Marqués", "Conde", "Rey", "Emperador", "Sultán", "Gran Visir"],
            lugar: [
                "un país inventado", "su barrio", "un reino submarino",
                "la Antártida", "su finca", "la comunidad de vecinos"
            ],
            rareza: [
                "Habla con acento francés", "Tiene la piel verde", "Le brilla la calva",
                "Levita ligeramente", "Predice el tiempo", "Ve en blanco y negro"
            ],
            accidente: [
                "una feria", "un microondas", "un láser", "un karaoke",
                "una barbacoa", "una montaña rusa", "un escape room"
            ]
        }
    },
    platino: {
        plantillas: [
            "Le excita {excitacion}",
            "Fue {delito} y huyó a {pais}",
            "{trastorno} no diagnosticado",
            "Fue expulsado de {lugar_p} por {razon}",
            "Tiene un altar dedicado a {altar}",
            "Solo se siente vivo cuando {actividad}"
        ],
        slots: {
            excitacion: [
                "el olor a gasolina", "el sonido de la impresora", "la voz del GPS",
                "oler libros viejos", "ver a gente enfadada", "las alarmas de coche",
                "el ruido de las obras", "el olor a hospital"
            ],
            delito: [
                "buscado por estafa", "condenado por robo de queso", "acusado de hackear un semáforo",
                "deportado por bailar en sitios prohibidos", "multado por insultar a una estatua"
            ],
            pais: ["Mónaco", "Andorra", "Liechtenstein", "el Vaticano", "Luxemburgo", "un país que ya no existe"],
            trastorno: [
                "Megalomanía", "Mitomanía extrema", "Síndrome de Diógenes",
                "Complejo de mesías", "Personalidad múltiple",
                "Síndrome del impostor extremo"
            ],
            lugar_p: [
                "un convento", "el ejército", "un circo", "Alcohólicos Anónimos",
                "un crucero", "una ONG", "un monasterio", "la academia de policía"
            ],
            razon: [
                "morder a alguien", "robar el postre", "hacer un ritual raro",
                "hablar con las paredes", "intentar bautizar al perro",
                "predicar el nudismo", "montar un casino ilegal"
            ],
            altar: [
                "sí mismo", "su ex", "un político", "un personaje de anime",
                "una marca de cereales", "su dentista", "un futbolista retirado"
            ],
            actividad: [
                "roba señales de tráfico", "se pelea con gaviotas",
                "grita en el metro", "come cosas del suelo",
                "se mete en fuentes públicas", "persigue a los carteros"
            ]
        }
    },
    diamante: {
        plantillas: [
            "Tiene el poder de {poder} pero {limitacion}",
            "Es un {ser} disfrazado de humano",
            "Afirma haber {hazana}",
            "En su dimensión original era {dimension}",
            "Su cuerpo {anomalia}",
            "Puede {habilidad} pero solo {condicion}"
        ],
        slots: {
            poder: [
                "volar", "leer mentes", "ver el futuro", "controlar el fuego",
                "hacerse invisible", "detener el tiempo", "hablar con los muertos",
                "controlar las plantas", "alterar la gravedad"
            ],
            limitacion: [
                "solo funciona los jueves", "le sangra la nariz cada vez",
                "se queda dormido después", "solo dura 3 segundos",
                "le hace estornudar sin parar", "pierde un recuerdo cada vez",
                "solo funciona si canta", "le sale urticaria"
            ],
            ser: [
                "extraterrestre", "robot del futuro", "ángel castigado", "demonio en prácticas",
                "fantasma corporizado", "dios menor olvidado", "elfo desterrado",
                "dragón polimórfico", "IA con cuerpo de carne"
            ],
            hazana: [
                "viajado a otra galaxia", "vivido 800 años", "derrotado a un dragón",
                "hablado con Dios", "creado un universo paralelo en su sótano",
                "encontrado el Santo Grial en un Mercadona", "domesticado un agujero negro"
            ],
            dimension: [
                "rey de los gusanos", "poeta laureado de Marte", "general de un ejército de sombras",
                "campeón intergaláctico de parchís", "embajador ante los fantasmas"
            ],
            anomalia: [
                "emite una luz tenue", "no produce sombra", "pesa lo mismo que una pluma",
                "es ligeramente translúcido", "cambia de temperatura aleatoriamente",
                "regenera las uñas en segundos", "suena como una radio vieja por las noches"
            ],
            habilidad: [
                "curar enfermedades", "teletransportarse", "cambiar de forma",
                "duplicarse", "predecir terremotos", "hablar todos los idiomas"
            ],
            condicion: [
                "cuando llueve", "si lleva sombrero", "en luna llena",
                "cuando alguien le insulta", "si no ha comido gluten",
                "entre las 3 y las 4 de la madrugada"
            ]
        }
    },
    lifeordeath: {
        plantillas: [
            "Tiene en su poder {poder_cosmico}",
            "{accion_extrema} y salió en las noticias de {pais_lod}",
            "Es la única persona que sabe {secreto}",
            "Si muere, {consecuencia}"
        ],
        slots: {
            poder_cosmico: [
                "los códigos nucleares", "la cura de todas las enfermedades",
                "la fórmula de la inmortalidad", "un botón que destruye Internet",
                "la ubicación del Arca de la Alianza", "la contraseña del WiFi de la CIA"
            ],
            accion_extrema: [
                "Detuvo un atentado terrorista", "Robó un avión militar",
                "Hackeó la NASA por aburrimiento", "Sobrevivió 3 meses solo en el Ártico",
                "Desactivó una bomba nuclear con un clip"
            ],
            pais_lod: ["Japón", "Rusia", "EE.UU.", "todo el mundo", "la Luna", "un país clasificado"],
            secreto: [
                "dónde está el cuerpo", "la verdad sobre el Área 51",
                "qué pasó realmente en Roswell", "la receta original de la Coca-Cola",
                "quién mató realmente a Kennedy", "por qué los gatos ronronean"
            ],
            consecuencia: [
                "se activa un virus que destruye todo", "se libera un secreto que destruye 3 gobiernos",
                "nadie podrá salir de esta situación", "mueren 10.000 personas",
                "se abre un portal a otra dimensión", "todos pierden la memoria"
            ]
        }
    }
};

/**
 * Genera un atributo usando el sistema combinatorio (Opción B).
 * Rellena una plantilla con fragmentos aleatorios para crear atributos únicos.
 * Ej: "{profesion} jubilado" → "Carpintero jubilado"
 * @param {string} nivel
 * @returns {string|null} Atributo generado o null si no hay config para ese nivel
 */
function generarAtributoCombinatorio(nivel) {
    const config = COMBINACIONES_CONFIG[nivel];
    if (!config || !config.plantillas || config.plantillas.length === 0) return null;

    // Elegir plantilla aleatoria
    const plantilla = config.plantillas[Math.floor(Math.random() * config.plantillas.length)];

    // Rellenar cada {placeholder} con un valor aleatorio de su slot correspondiente
    return plantilla.replace(/\{(\w+)\}/g, (match, nombreSlot) => {
        const opciones = config.slots[nombreSlot];
        if (!opciones || opciones.length === 0) return match;
        return opciones[Math.floor(Math.random() * opciones.length)];
    });
}

/**
 * Genera un atributo aleatorio para un nivel específico.
 * Usa dos sistemas: 50% listas estáticas expandidas (A), 50% combinatorio (B).
 * @param {string} nivel - bronce, plata, oro, platino, diamante, lifeordeath
 * @returns {string} Atributo generado
 */
export function generarAtributo(nivel) {
    // 50% combinatorio (Opción B), 50% lista estática expandida (Opción A)
    if (Math.random() < 0.5) {
        const resultado = generarAtributoCombinatorio(nivel);
        if (resultado) return resultado;
    }

    // Sistema estático (listas expandidas) — también sirve de fallback
    const config = GENERADOR_CONFIG[nivel];
    if (!config) return "Error: nivel desconocido";

    const categorias = Object.keys(config).filter(key => key !== 'tono');
    const categoriaAleatoria = categorias[Math.floor(Math.random() * categorias.length)];
    const lista = config[categoriaAleatoria];

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
