// Seleccionar elementos del DOM
const terminal = document.querySelector('.terminal');
const bsodTitle = document.querySelector(".bsod-title");
const bsodMessage = document.querySelector(".bsod-message");
const bsod = document.querySelector(".bsod");

// Cambiar el cursor del documento
document.documentElement.style.cursor = "url(assets/img/cursors/cur_busy.png), wait";

// Manejar errores globales
window.onerror = function (message, source, line, column, error) {
	// Obtener la ruta base del sitio web
	var basePath = window.location.href.replace(window.location.pathname, '');
	// Obtener la ruta relativa del archivo fuente
	var relativeSource = source.replace(basePath, '');
	// Mostrar BSOD (Pantallazo Azul)
	bsod.style.display = 'flex';
	bsodMessage.textContent = `${message}\nen ${relativeSource}:${line}:${column}`;
};

// Obtener el nombre del navegador
function getBrowserName() {
	const userAgent = navigator.userAgent.toLowerCase();

	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	if (isSafari) {
		return "Safari";
	}

	const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	if (isOpera) {
		return "Opera";
	}

	const isEdge = navigator.userAgent.indexOf("Edg") !== -1;
	if (isEdge) {
		return "Microsoft Edge";
	}

	const isIE = !!document.documentMode;
	if (isIE) {
		return "Internet Explorer";
	}

	const isFirefox = typeof InstallTrigger !== 'undefined';
	if (isFirefox) {
		return "Firefox";
	}

	const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
	if (userAgent.indexOf('chrome') > -1 || isChrome) {
		return "Chrome";
	}

	return "Whisp95";
}

// Usarlo en el BSOD
const browserName = getBrowserName();
bsodTitle.textContent = browserName;

// Escuchar los eventos del tecladoo
document.addEventListener('keydown', function (event) {
	// Atajo Ctrl + Shift + Q
	if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
		// Descartar cualquier BSOD presente
		bsod.style.display = 'none';

		// Verificar si la terminal es visible, de ser asi descartarla
		// La terminal no puede ser descartada de forma manual en caso de BSOD
		if (window.getComputedStyle(terminal).display !== 'none') {
			desktopInitialization();
		}
	}
});

// Comprobar pantalla tactil
if (!matchMedia('(pointer:fine)').matches) {
	// Modificar el texto de la terminal para dispositivos tactiles
	terminal.innerHTML = '<p class="terminal-txt">Pulsa la pantalla para continuar...<span class="terminal-cur"></span></p>';
	terminal.addEventListener('click', function (event) {
		event.preventDefault();
		desktopInitialization();
	}, { once: true });
}

// Manejar enter en la terminal
function handleKeyDown(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		terminal.removeEventListener('keydown', handleKeyDown);
		desktopInitialization();
	}
}

// Escuchar los eventos del teclado en la terminal y enfocarla
terminal.addEventListener('keydown', handleKeyDown);
terminal.focus();

// Evitar el comportamiento de tabulación en la terminal
terminal.addEventListener('keydown', function (e) {
	if (e.key === 'Tab' && window.getComputedStyle(terminal).display !== 'none') {
		e.preventDefault();
	}
});

// Inicialización del escritorio
function desktopInitialization() {
	// Ocultar todos los elementos dentro de la terminal
	const terminalContents = terminal.querySelectorAll('*');
	terminalContents.forEach(function (element) {
		element.style.display = 'none';
	});

	// Ocultar la terminal después de un retraso
	setTimeout(function () {
		terminal.style.display = 'none';

		// Cambiar el cursor del documento durante la carga
		document.documentElement.style.cursor = "url(assets/img/cursors/cur_load.png) 0 4, progress";

		// Reproducir sonido de inicio
		const startupSound = new Howl({
			src: ['assets/media/startup.mp3']
		});

		// Reproducir sonido de inicio
		startupSound.play();

		// Restaurar el cursor del documento después de que termine el sonido de inicio
		startupSound.on('end', function () {
			document.documentElement.style.cursor = "url(assets/img/cursors/cur_def.png), auto";
		});

		setTimeout(() => {
			// Inicializar el comportamiento del escritorio
			initializeDesktop(document.body);

			// Obtener elementos del reproductor de Nightwave Plaza
			const songArtwork = document.getElementById('song-artwork');
			const songTitle = document.getElementById('song-title');
			const songArtist = document.getElementById('song-artist');
			const songLengthPos = document.getElementById('song-length-pos');

			// Obtener información de la API de Nightwave Plaza
			function plazaAPI() {
				fetch("https://api.plaza.one/status")
					.then(response => response.json())
					.then(data => {
						// Formatear el tiempo de reproducción actual
						const positionMinutes = Math.floor(data.song.position / 60);
						const positionSeconds = data.song.position % 60;
						const formattedPosition = `${positionMinutes.toString().padStart(2, '0')}:${positionSeconds.toString().padStart(2, '0')}`;

						// Formatear la duración de la canción
						const lengthMinutes = Math.floor(data.song.length / 60);
						const lengthSeconds = data.song.length % 60;
						const formattedLength = `${lengthMinutes.toString().padStart(2, '0')}:${lengthSeconds.toString().padStart(2, '0')}`;

						// Variable para el texto de tiempo de reproducción / duración
						const positionLengthText = `${formattedPosition} / ${formattedLength}`;

						// Actualizar la información de la canción
						songTitle.textContent = data.song.title;
						songArtist.textContent = data.song.artist;
						songLengthPos.textContent = positionLengthText;
						songArtwork.style.backgroundImage = `url('${data.song.artwork_src}'), url('assets/img/track_def.gif')`;

						// Configurar metadatos de la sesión multimedia si se está reproduciendo
						// (Mostrar informacion de la cancion en donde deberia estar presente)

						if (isPlaying) {
							navigator.mediaSession.metadata = new MediaMetadata({
								title: data.song.title,
								artist: data.song.artist,
								album: data.song.album,
								artwork: [{ src: data.song.artwork_src }]
							});
						}
					})
					.catch(err => console.error(err));
			}

			// Logica para el reproductor de Nightwave Plaza
			const playButton = document.getElementById('song-play');
			const plazaRadio = new Howl({
				src: ['https://stream.plaza.one/mp3'],
				html5: true,
				preload: true,
				onplay: () => {
					isPlaying = true;
					playButton.disabled = false;
					playButton.textContent = 'Detener';
				},
				onstop: () => {
					isPlaying = false;
					playButton.disabled = false;
					playButton.textContent = 'Reproducir';
				},
				onpause: () => {
					isPlaying = false;
					playButton.disabled = false;
					playButton.textContent = 'Reproducir';
				},
				onplayerror: (error) => {
					console.error(error);
					playButton.disabled = false;
				}
			});

			// Manejar eventos de pausa y reproducción del sistema
			navigator.mediaSession.setActionHandler('pause', () => {
				plazaRadio.pause();
				playButton.textContent = 'Reproducir';
			});

			navigator.mediaSession.setActionHandler('play', () => {
				plazaRadio.play();
				playButton.textContent = 'Detener';
			});

			// Estado de reproducción actual
			isPlaying = false;

			// Manejar eventos de clic en el botón de reproducción
			playButton.addEventListener('click', () => {
				playButton.disabled = true;
				playButton.textContent = 'Cargando';
				if (isPlaying) {
					plazaRadio.stop();
				} else {
					plazaRadio.play();
				}
			});

			// Actualizar la información de la canción cada segundo
			// Si ponen limites a la API probablemente sea el responsable lol

			setInterval(() => {
				plazaAPI();
			}, 1000);
		}, 1200);
	}, 400);
}