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
    "Mentiroso", "Borracho", "Budista", "Cristiano"
];
export const ATRIBUTOS_ORO = [
    "Capitalista extremo", "Comunista extremo", "Sordomudo", "Hetero básico", "Corrupto", 
    "Admin de una cuenta de memes", "Príncipe", "Es azul", "Es famoso", "Taurino", "Vegan@", 
    "En su Spotify Wrapped su canción más escuchada es Baby de Justin Bieber", "Mafioso", 
    "Solo come carne", "Negacionista", "Aun duerme abrazando a su madre\\ osito", "Obesidad", 
    "MENA", "No le gusta que digan la “M palabra”", "Borde de mierda", "Analfabeto", 
    "Hace las mejores torrijas del mundo"
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
    "Tiene superpoderes", "Realiza transfusions de sangre", "Ha probado la carne humana", 
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
        texto: `El año es 2087. La Tierra agoniza. Los gobiernos mundiales han invertido sus últimos recursos en una misión desesperada: enviar una nave colonial hacia Kepler-442b, el único planeta habitable detectado a 1.200 años luz de distancia.\n\nVosotros sois los elegidos. Los supervivientes. La última esperanza de la humanidad.\n\nPero la nave está perdiendo recursos críticos. El sistema de soporte vital falla. Los suministros se agotan. La realidad es brutal: no todos llegaréis al destino.\n\nCada jornada, deberéis decidir quién es prescindible. Quién no merece representar a la humanidad en el nuevo mundo. Las decisiones que toméis definirán el futuro de nuestra especie... o su extinción definitiva.\n\n<em>Solo puede quedar uno.</em>`
    },
    {
        titulo: "EL ÚLTIMO BOTE",
        subtitulo: "Titanic, 15 de abril de 1912",
        texto: `El agua helada del Atlántico Norte inunda los pasillos. Los gritos resuenan en la noche. El Titanic, el barco "insumergible", se hunde irremediablemente hacia el abismo.\n\nQueda un último bote salvavidas. Capacidad: una persona.\n\nVosotros os habéis encontrado en la cubierta superior. Todos tenéis el mismo objetivo: sobrevivir. Pero solo uno podrá subir. Solo uno verá el amanecer.\n\nLas olas golpean con furia. El tiempo se agota. Cada minuto que pasa, el barco se inclina más hacia la oscuridad. Debéis decidir quién merece vivir... y quién debe quedarse atrás para ser tragado por el mar.\n\nLas decisiones difíciles definen quiénes somos realmente.\n\n<em>Solo puede quedar uno.</em>`
    },
    {
        titulo: "LA ISLA DEL HAMBRE",
        subtitulo: "Náufragos sin esperanza",
        texto: `El naufragio fue hace 47 días. La isla parecía un paraíso tropical al principio, pero pronto descubristeis la verdad: no hay comida. Los árboles no dan frutos. El mar está vacío. La tierra es estéril.\n\nEl hambre os devora. Los cuerpos se debilitan. La desesperación se convierte en locura.\n\nY entonces, alguien pronuncia lo impensable: "Si queremos sobrevivir... uno de nosotros debe ser el sacrificio".\n\nLa idea es atroz. Inhumana. Pero el hambre no entiende de moral. Cada día que pasa, la muerte se acerca más. Y vosotros debéis decidir: ¿quién será el primero en caer? ¿Quién será recordado como el mártir... o como la cena?\n\nLa civilización es solo una ilusión que se desvanece cuando el estómago ruge.\n\n<em>Solo puede quedar uno.</em>`
    },
    {
        titulo: "EL HELICÓPTERO DE RESCUE",
        subtitulo: "Centro comercial, día 14 del apocalipsis",
        texto: `Los zombis invadieron la ciudad hace dos semanas. Los gritos cesaron hace días. Ahora solo queda el silencio... y los gruñidos de los muertos vivientes que merodean las calles.\n\nVosotros habéis sobrevivido atrincherados en la azotea del centro comercial. Sin comida. Sin agua potable. Sin esperanza.\n\nHasta que escucháis el sonido de las hélices. Un helicóptero de rescate desciende del cielo. Pero el piloto grita por encima del ruido: "¡Solo puedo llevar a uno! ¡El combustible no alcanza para más peso!"\n\nLa horda ya ha detectado el ruido. Suben por las escaleras. Tenéis segundos para decidir quién subirá al helicóptero... y quién se quedará para enfrentar la muerte más horrible imaginable.\n\nNo hay tiempo para debates. Solo para supervivencia.\n\n<em>Solo puede quedar uno.</em>`
    }
];