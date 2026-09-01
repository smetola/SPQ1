// Contenido para: gameData.js

export const NOMBRES_PERSONAJE = [
    "Alex", "Carmen", "David", "Elena", "Javier", "Laura", "Marcos", "Sofía", 
    "Rubén", "Lucía", "Miguel", "Paula", "Sergio", "Ana", "Carlos", "Isabel"
];
export const ATRIBUTOS_BRONCE = [
    "Domador de leones", "Cazador", "Infeliz", "Negro", "Calva", "Es feliz", "Policía", 
    "Alcalde", "Scout", "Apicultor", "Bombero", "Amable", "Obediente", "Maestro", "Frutero"
];
export const ATRIBUTOS_PLATA = [
    "Aspirante a presidente de gobierno", "Cura", "Ateo", "Trauma infantil", "Diabetes", 
    "Patriótico", "Anormal", "Sintecho", "Tiene Tinder Gold", "Situación familiar jodida", 
    "Mentiroso", "Borracho", "Budista", "Cristiano", "Hispanchista"
];
export const ATRIBUTOS_ORO = [
    "Capitalista extremo", "Comunista extremo", "Sordomudo", "Hetero básico", "Corrupto", 
    "Admin de una cuenta de memes", "Príncipe", "Es azul", "Es famoso", "Taurino", "Vegan@", 
    "En su Spotify Wrapped su canción más escuchada es Baby de Justin Bieber", "Mafioso", 
    "Solo come carne", "Negacionista", "Aun duerme abrazando a su madre\\ osito", "Obesidad", 
    "MENA", "No le gusta que digan la “M palabra”", "Borde de mierda", "Analfabeto", 
    "Hace las mejores torrijas del mundo", "Sionista"
];
export const ATRIBUTOS_PLATINO = [
    "Demencia senil", "Depresión severa", "Su mejor amigo es Enrique VIII", "Xenófobo", 
    "Necrófilo", "Violador ciego", "Miss mundo/ mister mundo", "Exconvicto", 
    "Fanático religioso", "Racista", "Violador de verduras (solo sí es sí)", 
    "En sus redes sociales ha puesto que es Sagitario ♋", "Le dan miedo los Capricornio 😰🤬🥵", 
    "Cocainómano", "Pederasta", "Moro", "Covid 19", "Embarazado", "Siamés", "Vota a PACMA", 
    "Sólo se folla a las que se llaman como su madre"
];
export const ATRIBUTOS_DIAMANTE = [
    "Le faltan 3 dedos del pie porque se los comio ayer", "Se la chupa a los gatos callejeros", 
    "Cree que es el Mesías", "Es extraterrestre", "Robot", "Bruja", "Le falta calle", 
    "Tiene superpoderes", "Realiza transfusiones de sangre", "Ha probado la carne humana", 
    "Oye hablar a las plantas y a los animales", "Esquizofrénico", "Representante de una secta", 
    "Descubrió el Bosón de Higgs", "Ve a los muertos", "Cree que fue abducido por extraterrestres", 
    "Cancer de planta del pie", "Nació en Chernobyl y tiene los ojos en la nuca", 
    "Se sabe todas las fórmulas matemáticas", "Ofreció su alma al demonio", 
    "Crea arte de la nada (no se refiere a magia)", 
    "Necesita meterle el dedo en el culo a alguien, al menos una vez por día."
];
export const ATRIBUTOS_LIFEORDEATH = [
    "Pertenece al ISIS", "Cáncer terminal", "Colaborador en el 11M", "Ha ido a la luna", 
    "Tiene un coeficiente intelectual muy alto (200IQ)", "Premio Nobel de la paz", 
    "Dio un riñón a quien lo necesitaba", "Tiene todo el conocimiento del mundo, sabe todo.", 
    "Quiere ganar en kills a Mao Zedong", "Tiene muy mala hORTOgráfia.", "Sólo compra jabón alemán de 1945"
];
export const LISTAS_ATRIBUTOS = {
    "bronce": ATRIBUTOS_BRONCE,
    "plata": ATRIBUTOS_PLATA,
    "oro": ATRIBUTOS_ORO,
    "platino": ATRIBUTOS_PLATINO,
    "diamante": ATRIBUTOS_DIAMANTE,
    "lifeordeath": ATRIBUTOS_LIFEORDEATH
};

// Historias narrativas para la introducción del juego
export const HISTORIAS = [
    {
        titulo: "LA NAVE DE LA ESPERANZA",
        subtitulo: "Un viaje sin retorno",
        texto: `El año es 2087. La Tierra agoniza. Los gobiernos mundiales han invertido sus últimos recursos en una misión desesperada: enviar una nave colonial hacia Kepler-442b, el único planeta habitable detectado a 1.200 años luz de distancia.\n\nVosotros sois los elegidos. Los supervivientes. La última esperanza de la humanidad.\n\nPero la nave está perdiendo recursos críticos. El sistema de soporte vital falla. Los suministros se agotan. La realidad es brutal: no todos llegaréis al destino.\n\nCada jornada, deberéis decidir quién es prescindible. Quién no merece representar a la humanidad en el nuevo mundo. Las decisiones que toméis definirán el futuro de nuestra especie... o su extinción definitiva.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "No puedes votar desde el espacio exterior.",
            "Estás fuera de la nave... literalmente.",
            "Tu voto se perdió en el vacío del espacio.",
            "Flotas en el abismo, sin voz ni voto.",
            "Tu cuerpo flota entre las estrellas.",
            "El vacío espacial no transmite votos.",
            "Fuiste expulsado al vacío. Ya no decides.",
            "Tu oxígeno se agotó. Tu voz también.",
            "Los muertos no viajan a Kepler-442b.",
            "La nave continuará... sin ti.",
            "Tu destino quedó en el espacio infinito.",
            "Solo los que respiran pueden decidir."
        ]
    },
    {
        titulo: "EL ÚLTIMO BOTE",
        subtitulo: "Titanic, 15 de abril de 1912",
        texto: `El agua helada del Atlántico Norte inunda los pasillos. Los gritos resuenan en la noche. El Titanic, el barco "insumergible", se hunde irremediablemente hacia el abismo.\n\nQueda un último bote salvavidas. Capacidad: una persona.\n\nVosotros os habéis encontrado en la cubierta superior. Todos tenéis el mismo objetivo: sobrevivir. Pero solo uno podrá subir. Solo uno verá el amanecer.\n\nLas olas golpean con furia. El tiempo se agota. Cada minuto que pasa, el barco se inclina más hacia la oscuridad. Debéis decidir quién merece vivir... y quién debe quedarse atrás para ser tragado por el mar.\n\nLas decisiones difíciles definen quiénes somos realmente.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "El mar se tragó tu voz.",
            "Las aguas heladas silenciaron tu opinión.",
            "Tu cuerpo descansa en el fondo del Atlántico.",
            "Los ahogados no votan.",
            "El océano es tu tumba. No tu tribuna.",
            "Tu grito se apagó bajo las olas.",
            "Solo los que flotan deciden.",
            "El agua fría congeló tu última palabra.",
            "Tu destino se hundió con el Titanic.",
            "Los náufragos perdidos no tienen voz.",
            "El abismo marino te reclama.",
            "Las corrientes arrastraron tu voto."
        ]
    },
    {
        titulo: "LA ISLA DEL HAMBRE",
        subtitulo: "Náufragos sin esperanza",
        texto: `El naufragio fue hace 47 días. La isla parecía un paraíso tropical al principio, pero pronto descubristeis la verdad: no hay comida. Los árboles no dan frutos. El mar está vacío. La tierra es estéril.\n\nEl hambre os devora. Los cuerpos se debilitan. La desesperación se convierte en locura.\n\nY entonces, alguien pronuncia lo impensable: "Si queremos sobrevivir... uno de nosotros debe ser el sacrificio".\n\nLa idea es atroz. Inhumana. Pero el hambre no entiende de moral. Cada día que pasa, la muerte se acerca más. Y vosotros debéis decidir: ¿quién será el primero en caer? ¿Quién será recordado como el mártir... o como la cena?\n\nLa civilización es solo una ilusión que se desvanece cuando el estómago ruge.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "Los devorados no votan.",
            "Tu carne ya alimentó a otros.",
            "Los muertos no tienen hambre... ni voto.",
            "Fuiste el sacrificio. Ahora solo observas.",
            "Tu destino fue sellado. Y consumido.",
            "Los huesos no hablan.",
            "Ya no eres náufrago. Eres alimento.",
            "Tu última contribución fue nutricional.",
            "Los caníbales no escuchan a sus cenas.",
            "Tu voz quedó enterrada en la arena.",
            "La isla te reclama. Silenciosamente.",
            "Solo los hambrientos deciden quién sigue."
        ]
    },
    {
        titulo: "EL HELICÓPTERO DE RESCUE",
        subtitulo: "Centro comercial, día 14 del apocalipsis",
        texto: `Los zombis invadieron la ciudad hace dos semanas. Los gritos cesaron hace días. Ahora solo queda el silencio... y los gruñidos de los muertos vivientes que merodean las calles.\n\nVosotros habéis sobrevivido atrincherados en la azotea del centro comercial. Sin comida. Sin agua potable. Sin esperanza.\n\nHasta que escucháis el sonido de las hélices. Un helicóptero de rescate desciende del cielo. Pero el piloto grita por encima del ruido: "¡Solo puedo llevar a uno! ¡El combustible no alcanza para más peso!"\n\nLa horda ya ha detectado el ruido. Suben por las escaleras. Tenéis segundos para decidir quién subirá al helicóptero... y quién se quedará para enfrentar la muerte más horrible imaginable.\n\nNo hay tiempo para debates. Solo para supervivencia.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "Los zombis no votan.",
            "Ya eres uno de ellos. Solo gruñes.",
            "Los muertos vivientes no deciden.",
            "Tu cerebro está en el menú. No en el debate.",
            "Solo buscas carne fresca ahora.",
            "Los infectados no tienen voz.",
            "Tu humanidad se fue con el primer mordisco.",
            "Gruñir no cuenta como voto.",
            "Los vivos te temen. No te escuchan.",
            "Tu opinión murió con tu conciencia.",
            "La horda te reclama. Olvida el resto.",
            "Los que cayeron solo observan... hambrientos.",
            "BraiiiiiiinnnzzzZ...",
            "CereeeebroooooosS..."
        ]
    },
    {
        titulo: "LA MANSIÓN DE LOS ESPEJOS",
        subtitulo: "Una cena que nunca termina",
        modoVinculado: "maldicion", // Solo aparece si el modo Maldición está activo
        texto: `Año 1923. Habéis sido invitados a la mansión del Conde Vladislav para una cena de gala. La invitación llegó en un sobre negro, sellado con cera carmesí. Ninguno de vosotros recuerda exactamente cómo llegasteis aquí.\n\nAl entrar, las puertas se sellan a vuestras espaldas. Los espejos muestran reflejos que no son los vuestros. Las velas se encienden solas. Y en la mesa del comedor, una nota escrita con tinta roja:\n\n"La mansión necesita un alma. Solo una. Elegid quién se queda... o la casa elegirá por vosotros."\n\nCada noche, la mansión despierta. Eventos inexplicables alteran la realidad. Alguien resucita. Alguien muere sin razón. Las reglas cambian cuando la casa quiere.\n\nLa única forma de escapar es que solo quede uno. La mansión solo necesita un alma... y liberará al resto.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "La mansión te ha reclamado.",
            "Los espejos ya no muestran tu reflejo.",
            "Tu alma vaga por los pasillos... sin voz.",
            "Las paredes susurran tu nombre. Pero nadie te oye.",
            "La casa te devoró. Ya no decides.",
            "Eres parte de la mansión ahora.",
            "Las sombras te abrazaron. No hay vuelta.",
            "Los candelabros se apagaron para ti.",
            "Tu lugar está entre los cuadros de la pared.",
            "La cena terminó para ti. Eres el postre.",
            "Los fantasmas no votan. Solo observan.",
            "La mansión tiene tu alma. Y no la devuelve."
        ]
    },
    {
        titulo: "EL BÚNKER ALFA-7",
        subtitulo: "Confía en alguien. O muere solo.",
        modoVinculado: "alianzas",
        texto: `Año 2087. La superficie es inhabitable. Radiación, tormentas magnéticas, y algo más... algo que se mueve entre las ruinas.\n\nHabéis encontrado refugio en el Búnker Alfa-7, un complejo militar abandonado con suministros para sobrevivir tres meses. Pero hay un problema: sois demasiados. Los recursos no dan para todos.\n\nUna voz metálica resuena por los altavoces: "PROTOCOLO DE SUPERVIVENCIA ACTIVADO. Los vínculos serán vuestra salvación... o vuestra condena. Elegid sabiamente a quién proteger."\n\nEn este búnker, nadie sobrevive solo. Pero confiar en la persona equivocada puede ser peor que la radiación.\n\nFormad alianzas. Proteged a vuestro aliado. Porque si cae... caéis con él.\n\n<em>Solo puede quedar uno... o quizás dos.</em>`,
        mensajesMuertos: [
            "La radiación te alcanzó. Descansa.",
            "El búnker te expulsó.",
            "Tus aliados no pudieron salvarte.",
            "Las puertas se cerraron sin ti.",
            "Tu ración fue la última.",
            "La superficie te reclama.",
            "Nadie escucha tus golpes en la puerta.",
            "El protocolo te eliminó.",
            "Tu aliado cayó... y tú con él.",
            "Los suministros se acabaron para ti.",
            "La radiación no perdona.",
            "El búnker tiene memoria. Y te olvidó."
        ]
    },
    {
        titulo: "EL LABORATORIO DEL DR. KESSLER",
        subtitulo: "El poder tiene un precio",
        modoVinculado: "poderes",
        texto: `Despertáis en camillas metálicas, conectados a máquinas que zumban. No recordáis cómo llegasteis aquí. Lo último que recordáis es una bebida, una sonrisa amable, y después... oscuridad.\n\nUna pantalla parpadea: "PROYECTO KESSLER — FASE 3: POTENCIACIÓN". El Dr. Kessler os seleccionó por una razón. Cada uno de vosotros ha sido modificado. Mejorado. Tenéis habilidades que antes no teníais.\n\nPero hay un problema: el laboratorio se está autodestruyendo. Las puertas solo se abren para uno. Y las habilidades que os dio... también pueden usarse los unos contra los otros.\n\nUsad vuestros poderes con astucia. Gastad vuestra energía sabiamente. Porque en este laboratorio, la inteligencia supera a la fuerza.\n\n<em>Solo puede quedar uno.</em>`,
        mensajesMuertos: [
            "El experimento terminó para ti.",
            "Tu energía se agotó.",
            "El Dr. Kessler te descartó.",
            "Las máquinas te apagaron.",
            "Tu potenciación fue... insuficiente.",
            "El laboratorio te clasificó como prescindible.",
            "Error en el sujeto. Eliminando...",
            "Tu poder no fue suficiente.",
            "Fase 3 completada. Sujeto descartado.",
            "Las puertas no se abrirán para ti.",
            "Tu modificación fue un fracaso.",
            "El Dr. Kessler ya no te necesita."
        ]
    }
];

// Función auxiliar para obtener mensajes de muertos según la historia actual
export function obtenerMensajeMuertoAleatorio(tituloHistoria) {
    const historia = HISTORIAS.find(h => h.titulo === tituloHistoria);
    
    if (historia && historia.mensajesMuertos && historia.mensajesMuertos.length > 0) {
        const mensajes = historia.mensajesMuertos;
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }
    
    // Mensaje genérico por si no se encuentra la historia
    return "Los muertos no tienen voz en esta decisión.";
}