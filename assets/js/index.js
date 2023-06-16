const terminal = document.querySelector('.terminal');
const bsodTitle = document.querySelector(".bsod-title");
const bsodMessage = document.querySelector(".bsod-message");
const bsod = document.querySelector(".bsod");
document.documentElement.style.cursor = "url(assets/img/cursors/cur_busy.png), wait";

window.onerror = function (message, source, line, column, error) {
	var basePath = window.location.href.replace(window.location.pathname, '');
	var relativeSource = source.replace(basePath, '');
	bsod.style.display = 'flex';
	bsodMessage.textContent = `${message}\nen ${relativeSource}:${line}:${column}`;
};

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

const browserName = getBrowserName();
bsodTitle.textContent = browserName;

document.addEventListener('keydown', function (event) {
	if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
		bsod.style.display = 'none';
		if (window.getComputedStyle(terminal).display !== 'none') {
			desktopInitialization();
		}
	}
});

if (!matchMedia('(pointer:fine)').matches) {
	terminal.innerHTML = '<p class="terminal-txt">Pulsa la pantalla para continuar...<span class="terminal-cur"></span></p>';
	terminal.addEventListener('click', function (event) {
		event.preventDefault();
		desktopInitialization();
	}, { once: true });
}

function handleKeyDown(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		terminal.removeEventListener('keydown', handleKeyDown);
		desktopInitialization();
	}
}

terminal.addEventListener('keydown', handleKeyDown);

terminal.focus();
terminal.addEventListener('keydown', function (e) {
	if (e.key === 'Tab' && window.getComputedStyle(terminal).display !== 'none') {
		e.preventDefault();
	}
});

function desktopInitialization() {
	const terminalContents = terminal.querySelectorAll('*');
	terminalContents.forEach(function (element) {
		element.style.display = 'none';
	});

	setTimeout(function () {
		terminal.style.display = 'none';

		document.documentElement.style.cursor = "url(assets/img/cursors/cur_load.png) 0 4, progress";

		const startupSound = new Howl({
			src: ['assets/media/startup.mp3']
		});

		startupSound.on('end', function () {
			document.documentElement.style.cursor = "url(assets/img/cursors/cur_def.png), auto";
		});

		startupSound.play();

		setTimeout(() => {
			initializeDesktop(document.body);
			const songArtwork = document.getElementById('song-artwork');
			const songTitle = document.getElementById('song-title');
			const songArtist = document.getElementById('song-artist');
			const songLengthPos = document.getElementById('song-length-pos');

			function plazaAPI() {
				fetch("https://api.plaza.one/status")
					.then(response => response.json())
					.then(data => {
						const positionMinutes = Math.floor(data.song.position / 60);
						const positionSeconds = data.song.position % 60;
						const formattedPosition = `${positionMinutes.toString().padStart(2, '0')}:${positionSeconds.toString().padStart(2, '0')}`;
						const lengthMinutes = Math.floor(data.song.length / 60);
						const lengthSeconds = data.song.length % 60;
						const formattedLength = `${lengthMinutes.toString().padStart(2, '0')}:${lengthSeconds.toString().padStart(2, '0')}`;
						const positionLengthText = `${formattedPosition} / ${formattedLength}`;

						songTitle.textContent = data.song.title;
						songArtist.textContent = data.song.artist;
						songLengthPos.textContent = positionLengthText;
						songArtwork.style.backgroundImage = `url('${data.song.artwork_src}'), url('assets/img/track_def.gif')`;
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

			navigator.mediaSession.setActionHandler('pause', () => {
				plazaRadio.pause();
				playButton.textContent = 'Reproducir';
			});

			navigator.mediaSession.setActionHandler('play', () => {
				plazaRadio.play();
				playButton.textContent = 'Detener';
			});

			isPlaying = false;
			playButton.addEventListener('click', () => {
				playButton.disabled = true;
				playButton.textContent = 'Cargando';
				if (isPlaying) {
					plazaRadio.stop();
				} else {
					plazaRadio.play();
				}
			});

			setInterval(() => {
				plazaAPI();
			}, 1000);
		}, 1200);
	}, 400);
}