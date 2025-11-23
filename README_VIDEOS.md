# Videos de fondo dinámicos

He implementado un sistema de videos de fondo dinámicos que cambian según la historia seleccionada.

## Cómo funciona

1. **Cuando empieza una partida**: Al mostrar la pantalla de historia, el fondo estático se oculta y se muestra un video correspondiente a la historia seleccionada.

2. **Cuando vuelves al menú**: El video se oculta y vuelve a aparecer el fondo estático original.

## Archivos de video necesarios

Necesitas crear una carpeta `videos/` en la raíz del proyecto (`c:\Users\misup\Documents\AntiGravity\SPQ1\videos\`) y colocar los siguientes archivos MP4:

- `space.mp4` - Para "LA NAVE DE LA ESPERANZA" (video espacial, estrellas, nave)
- `titanic.mp4` - Para "EL ÚLTIMO BOTE" (océano, barco, agua)
- `island.mp4` - Para "LA ISLA DEL HAMBRE" (isla tropical, playa, selva)
- `zombie.mp4` - Para "EL HELICÓPTERO DE RESCUE" (ciudad apocalíptica, zombies)

## Archivos modificados

1. **`videoManager.js`** (NUEVO): Gestiona el cambio de videos
2. **`uiManager.js`**: Ahora importa y usa videoManager para cambiar videos
3. **`style.css`**: Añadidos estilos para `.bg-video`

## Recomendaciones para los videos

- Formato: MP4 (H.264)
- Resolución: 1920x1080 o superior
- Duración: 10-30 segundos (se reproducirá en bucle)
- Peso: Menos de 10MB cada uno para mejor rendimiento web
- Contenido: Debe ser loop-able (que el final conecte bien con el inicio)

## Donde conseguir videos

Puedes buscar videos gratuitos en:
- Pexels Videos (pexels.com/videos)
- Pixabay (pixabay.com/videos)
- Videezy (videezy.com)

Busca términos como:
- "space stars" o "spacecraft"
- "ocean waves" o "sinking ship"
- "tropical island" o "beach"
- "zombie apocalypse" o "ruined city"
