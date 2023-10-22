// Define elementos del DOM y variables recurrentes
const terminal = document.querySelector('.terminal');
const bsodTitle = document.querySelector(".bsod-title");
const bsodMessage = document.querySelector(".bsod-message");
const bsod = document.querySelector(".bsod");
const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
const hexRegex = /^#([0-9a-f]{3}){1,2}$/i;

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
	terminal.innerHTML = '<p class="terminal-txt">Pulsa la pantalla para continuar...<span class="terminal-cur"></span></p><br><div class="terminal-warning"><p class="terminal-txt">Para la mejor experiencia, visita esta pagina desde un navegador de escritorio, pueden haber luces parpadeantes o ruidos altos, procede con precaucion</p></div>';
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

// Variables necesarias para la ventana del fondo de pantalla
const bgPreview = document.querySelector('.wallpaper-prev');
const radioBgDef = document.getElementById('radio-bg-def');
const radioBgSolid = document.getElementById('radio-bg-solid');
const radioBgUrl = document.getElementById('radio-bg-url');
const inputBgUrl = document.getElementById('input-bg-url');
const inputBgColor = document.getElementById('input-bg-color');
const applyWall = document.getElementById('apply-wallpaper');
const wallTypesGroup = document.getElementById('radio-walltype');
const wallTypesRadios = wallTypesGroup.querySelectorAll('input[type="radio"]');

// Inicialización del escritorio
function desktopInitialization() {
	// Ocultar todos los elementos dentro de la terminal
	const terminalContents = terminal.querySelectorAll('*');
	terminalContents.forEach(function (element) {
		element.style.display = 'none';
	});

	// Inicializar el fondo de pantalla
	if (localStorage.getItem('wallType') === 'link') {
		radioBgUrl.checked = true;
		document.body.style.background = `url(${localStorage.getItem('wallURL')}) center/cover no-repeat`;
	} else if (localStorage.getItem('wallType') === 'color') {
		radioBgSolid.checked = true;
		document.body.style.background = `${localStorage.getItem('wallColor')} center/cover no-repeat`;
	} else {
		radioBgDef.checked = true;
		document.body.style.background = '#008080 center/cover no-repeat';
	}

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

			/* ----------------------------- Nightwave Plaza ---------------------------- */

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

						/*
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
						*/

						// Actualizar la información de la canción
						songTitle.textContent = data.song.title;
						songArtist.textContent = data.song.artist;
						// songLengthPos.textContent = positionLengthText;
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

			// Reproductor de Nightwave Plaza
			const playButton = document.getElementById('song-play');
			plazaRadio = new Howl({
				src: ['https://radio.plaza.one/mp3'],
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

			// Manejar eventos de click en el botón de reproducción
			playButton.addEventListener('click', () => {
				playButton.disabled = true;
				playButton.textContent = 'Cargando';
				if (isPlaying) {
					plazaRadio.stop();
				} else {
					plazaRadio.play();
				}
			});

			// Actualizar la información de la canción

			setInterval(() => {
				plazaAPI();
			}, 5000);

			// Reducida la frecuencia con la que se hacen requests
			// La posicion y duracion de la cancion no estaran disponibles en tiempo real

			/* ------------------ Comportamiento del fondo de pantalla ------------------ */

			// Establecer preview inicial
			bgPreview.style.background = getComputedStyle(document.body).background;

			// Actualizar la preview al cambiar el tipo de fondo y
			// Registar event listeners para los inputs
			wallTypesRadios.forEach(radio => {
				radio.addEventListener('change', event => {
					inputBgUrl.removeEventListener('input', handleinputBgUrlChange);
					inputBgColor.removeEventListener('input', handleinputBgColorChange);

					if (radioBgUrl.checked) {
						inputBgUrl.addEventListener('input', handleinputBgUrlChange);
					} else if (radioBgSolid.checked) {
						inputBgColor.addEventListener('input', handleinputBgColorChange);
					}

					updatePreview();
				});
			});

			// Actualizar la vista previa en tiempo real
			function handleinputBgUrlChange(event) {
				// Verificar que sea un link valido
				if (!urlRegex.test(inputBgUrl.value)) {
					return;
				}
				updatePreview();
			}

			// Event listener for inputBgColor
			function handleinputBgColorChange(event) {
				// Verificar que sea un color HEX valido
				if (!hexRegex.test(inputBgColor.value)) {
					return;
				}
				updatePreview();
			}

			// Funcion para actualizar la vista previa
			function updatePreview() {
				if (radioBgUrl.checked) {
					bgPreview.style.background = `url(${inputBgUrl.value}) #008080 center/cover no-repeat`;
				} else if (radioBgSolid.checked) {
					bgPreview.style.background = `${inputBgColor.value} center/cover no-repeat`;
				} else {
					bgPreview.style.background = '#008080 center/cover no-repeat';
				}
			}

			// Establecer valores por defecto si no existen
			if (!localStorage.getItem('wallURL')) {
				localStorage.setItem('wallURL', 'https://gif.plaza.one/74.gif');
			}

			if (!localStorage.getItem('wallColor')) {
				localStorage.setItem('wallColor', '#008080');
			}

			document.getElementById('input-bg-url').value = localStorage.getItem('wallURL');
			document.getElementById('input-bg-color').value = localStorage.getItem('wallColor');

			// Aplicar el fondo de pantalla
			applyWall.addEventListener('click', function () {
				const statusBar = document.querySelector('.wallpaper-win-status');

				// Verificar si los valores son validos
				const urlValue = inputBgUrl.value.trim();
				const colorValue = inputBgColor.value.trim();
				if (urlRegex.test(urlValue)) {
					if (hexRegex.test(colorValue)) {
						localStorage.setItem('wallURL', urlValue);
						localStorage.setItem('wallColor', colorValue);

						// Guardar los valores y actualizar el CSS
						if (radioBgUrl.checked) {
							localStorage.setItem('wallType', 'link');
							document.body.style.background = `url(${localStorage.getItem('wallURL')}) center/cover no-repeat`;
						} else if (radioBgSolid.checked) {
							localStorage.setItem('wallType', 'color');
							document.body.style.background = `${localStorage.getItem('wallColor')} center/cover no-repeat`;
						} else {
							localStorage.setItem('wallType', 'default');
							document.body.style.background = '#008080 center/cover no-repeat';
						}
						statusBar.textContent = 'Aplicado';
					} else {
						statusBar.textContent = 'El color no corresponde a un código HEX válido';
						return;
					}
				} else {
					statusBar.textContent = 'La URL externa no es válida';
					return;
				}
			});

			/* ----------------------------- Boton Chistoso ----------------------------- */

			const funnyButton = document.getElementById("funny-button");

			funnyButton.addEventListener('click', () => {
				bounce();
			});

			/* --------------------------- Ventana de anuncios -------------------------- */

			setTimeout(() => {
				let currentAd = 0;
				const windowBody = document.querySelector(".ads-win-body");
				const windowAd = document.querySelector(".ads-win-img");
				const titleBarText = document.querySelector("#ads-win .title-bar .title-bar-text");
				const adList = [
					{
						title: "Hatsune Miku in YOUR wifi?",
						img: "assets/img/pub/01.png",
						link: "https://www.youtube.com/watch?v=n5n7CSGPzqw"
					},
					{
						title: "Files by Jorge#603",
						img: "assets/img/pub/02.png",
						link: "https://files.jorge603.xyz"
					},
				];

				function clickAd() {
					window.open(adList[currentAd].link, '_blank');
				}

				function changeAd() {
					currentAd = (currentAd + 1) % adList.length;
					windowAd.style.outline = "1.3px solid #000";
					windowAd.src = adList[currentAd].img;
					titleBarText.textContent = `[ANUNCIO] ${adList[currentAd].title}`;
					windowAd.removeEventListener('click', clickAd);
					windowAd.addEventListener('click', clickAd);
				}

				changeAd();
				windowAd.style.cursor = "url(assets/img/cursors/cur_pointer.png) 4 0, auto";
				windowBody.style.cursor = "url(assets/img/cursors/cur_def.png), auto";
				setInterval(changeAd, 5000);
			}, 3000);
		}, 1200);
	}, 400);

	// las ventanas chistosas
	function bounce() {
		// Define las ventanas y el comportamiento
		const windows = Array.from(document.querySelectorAll('.window'));
		let bounceDistance = 10;
		let bounceSpeed = 5;

		// Detiene la reproducción de Nightwave Plaza y cierra su ventana
		plazaRadio.stop();

		// caos
		new Howl({
			src: ['https://files.jorge603.xyz/file/652351.mp3'],
			html5: true,
			loop: true,
			onplayerror: (error) => {
				console.error(error);
			}
		}).play();

		document.body.style.background = `url("assets/img/konata_bg.gif") center/cover no-repeat`;

		randomInterval = Math.floor(Math.random() * 6000);
		setInterval(function () {
			setTimeout(() => {
				console.log(randomInterval);
				randomInterval = Math.floor(Math.random() * 10000) + 1000;
				if (document.body.style.background == `url("assets/img/konata_bg.gif") center center / cover no-repeat`) {
					document.body.style.background = `url("assets/img/flashing.gif") center/cover no-repeat`;
				} else if (document.body.style.background == `url("assets/img/flashing.gif") center center / cover no-repeat`) {
					document.body.style.background = `url("assets/img/konata_bg.gif") center/cover no-repeat`;
				} else {
					document.body.style.background = `url("assets/img/konata_bg.gif") center/cover no-repeat`;
				}
			}, randomInterval);
		}, 1000);

		var custErrors = [
			':p',
			'tbh',
			'blehhh',
			'bsod omgg',
		];

		document.addEventListener("click", function (event) {
			event.stopPropagation();
			const errMsg = custErrors[Math.floor(Math.random() * custErrors.length)];
			throw new Error(errMsg);
		}, true);


		// Tono de la pagina
		let hueRotateValue = 0;

		// Logica para cada ventana
		windows.forEach((windowElement) => {
			let directionX = 1;
			let directionY = 1;

			setInterval(() => {
				const currentLeft = parseFloat(windowElement.style.left);
				const currentTop = parseFloat(windowElement.style.top);

				const newLeft = currentLeft + directionX * bounceDistance;
				const newTop = currentTop + directionY * bounceDistance;

				// Rebota a la dirección contraria si la ventana colisiona con los bordes
				if (newLeft < 0 || newLeft + windowElement.offsetWidth > window.innerWidth) {
					directionX *= -1;
				}

				if (newTop < 0 || newTop + windowElement.offsetHeight > window.innerHeight) {
					directionY *= -1;
				}

				// Actualizar la posición de la ventana
				windowElement.style.left = `${newLeft}px`;
				windowElement.style.top = `${newTop}px`;

				// Actualizar el valor del tono
				hueRotateValue = (hueRotateValue + 1) % 360;

				// Aplica el filtro del tono a toda la pagina
				document.documentElement.style.filter = `hue-rotate(${hueRotateValue}deg)`;
			}, bounceSpeed);
		});
	}

}