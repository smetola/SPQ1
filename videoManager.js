// videoManager.js - Gestiona el cambio de fondo de video según la historia

// Mapa de historias a archivos de video
const VIDEO_MAP = {
    "LA NAVE DE LA ESPERANZA": "videos/space.mp4",
    "EL ÚLTIMO BOTE": "videos/titanic.mp4",
    "LA ISLA DEL HAMBRE": "videos/island.mp4",
    "EL HELICÓPTERO DE RESCUE": "videos/zombie.mp4",
    
    // Historias de los Modos de Juego
    "LA MANSIÓN DE LOS ESPEJOS": "videos/zombie.mp4",
    "EL BÚNKER ALFA-7": "videos/island.mp4",
    "EL LABORATORIO DEL DR. KESSLER": "videos/space.mp4"
};

let videoElement = null;
let videoSource = null;
let bgFixed = null;

export function init() {
    // Crear el elemento de video dinámicamente
    videoElement = document.createElement('video');
    videoElement.id = 'bgVideo';
    videoElement.className = 'bg-video';
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.display = 'none';

    videoSource = document.createElement('source');
    videoSource.id = 'bgVideoSource';
    videoSource.type = 'video/mp4';

    videoElement.appendChild(videoSource);
    document.body.insertBefore(videoElement, document.body.firstChild);

    bgFixed = document.querySelector('.bg-fixed');

    console.log('📹 Video Manager initialized');
}

function logToScreen(msg) {
    let devOverlay = document.getElementById('debugOverlay');
    if (!devOverlay) {
        devOverlay = document.createElement('div');
        devOverlay.id = 'debugOverlay';
        devOverlay.style.position = 'fixed';
        devOverlay.style.top = '10px';
        devOverlay.style.left = '10px';
        devOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        devOverlay.style.color = 'lime';
        devOverlay.style.padding = '10px';
        devOverlay.style.zIndex = '9999';
        devOverlay.style.fontSize = '12px';
        devOverlay.style.pointerEvents = 'none';
        devOverlay.style.maxWidth = '300px';
        document.body.appendChild(devOverlay);
    }
    const line = document.createElement('div');
    line.textContent = new Date().toLocaleTimeString() + ": " + msg;
    devOverlay.appendChild(line);
}

/**
 * Cambia el video de fondo según el título de la historia
 * @param {string} storyTitle - Título de la historia
 */
export function setStoryVideo(storyTitle) {
    if (!videoElement || !videoSource || !bgFixed) {
        console.warn('Video Manager not initialized');
        logToScreen("ERROR: Video Manager not initialized");
        return;
    }

    const videoPath = VIDEO_MAP[storyTitle];

    if (videoPath) {
        console.log(`📹 Setting video for story: ${storyTitle} -> ${videoPath}`);
        logToScreen(`setStoryVideo called with: ${storyTitle}`);

        // Cambiar el src del video
        videoSource.src = videoPath;
        videoElement.load();

        // Mostrar el video y ocultar el fondo estático
        videoElement.style.display = 'block';
        if (bgFixed) {
            bgFixed.style.display = 'none';
            logToScreen("bgFixed is now NONE");
        } else {
            logToScreen("bgFixed NOT FOUND!");
        }

        // Intentar reproducir (necesario en algunos navegadores)
        videoElement.play().catch(err => {
            console.warn('Autoplay blocked:', err);
            logToScreen("Autoplay blocked: " + err);
        });
    } else {
        console.warn(`No video found for story: ${storyTitle}`);
        logToScreen("NO VIDEO FOUND FOR: " + storyTitle);
        hideVideo();
    }
}

/**
 * Oculta el video y muestra el fondo estático
 */
export function hideVideo() {
    logToScreen("hideVideo CALLED");
    
    // Imprimir stack trace para ver QUIEN llama a hideVideo
    const err = new Error();
    const stack = err.stack ? err.stack.split('\n')[2] : 'unknown';
    logToScreen("Called by: " + stack);

    if (videoElement) {
        videoElement.style.display = 'none';
        videoElement.pause();
    }
    if (bgFixed) {
        bgFixed.style.display = 'block';
        logToScreen("bgFixed is now BLOCK");
    }
}
