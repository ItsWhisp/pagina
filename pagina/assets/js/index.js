const terminal = $('.terminal');
document.documentElement.style.cursor = "url(assets/img/cursors/cur_busy.png), wait";
var egg = new Egg("b,s,o,d", function () {
}).listen();
if (!matchMedia('(pointer:fine)').matches) {
	terminal.html('<p class="terminal-txt">Pulsa la pantalla para continuar...<span class="terminal-cur"></span></p>');
	terminal.one('click', function (event) {
		event.preventDefault();
		desktopInitialization();
	});
}

terminal.on('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		desktopInitialization();
	}
});

terminal.focus();
terminal.on('keydown', function (e) {
	if (e.key === 'Tab' && terminal.css('display') !== 'none') {
		e.preventDefault();
	}
});

function desktopInitialization() {
	const terminalContents = terminal.find('*');
	terminalContents.each(function () {
		$(this).css('display', 'none');
	});

	setTimeout(function () {
		terminal.css('display', 'none');

		const audioContext = new AudioContext();
		fetch('assets/media/startup.mp3')
			.then(response => response.arrayBuffer())
			.then(buffer => {
				audioContext.decodeAudioData(buffer, function (decodedData) {
					const startupSource = audioContext.createBufferSource();
					startupSource.buffer = decodedData;

					const gainNode = audioContext.createGain();
					gainNode.gain.value = 1;

					startupSource.connect(gainNode).connect(audioContext.destination);

					document.documentElement.style.cursor = "url(assets/img/cursors/cur_load.png) 0 4, progress";

					setTimeout(() => {
						initializeDesktop(document.body);
						const songArtwork = document.getElementById('song-artwork');
						const songTitle = document.getElementById('song-title');
						const songArtist = document.getElementById('song-artist');

						function plazaAPI() {
							fetch("https://api.plaza.one/status")
								.then(response => response.json())
								.then(data => {
									songTitle.textContent = data.song.title;
									songArtist.textContent = data.song.artist;
									songArtwork.style.backgroundImage = `url('${data.song.artwork_src}'), url('assets/img/track_def.gif')`;
								})
								.catch(err => console.error(err));
						}

						const playButton = document.getElementById('song-play');
						const plazaRadio = new Audio('https://stream.plaza.one/mp3');
						let isPlaying = false;

						playButton.addEventListener('click', () => {
							if (isPlaying) {
								plazaRadio.pause();
								gainNode.gain.value = 1;
							} else {
								audioContext.suspend();
								gainNode.gain.value = 0;
								plazaRadio.play().catch(err => {
									console.error(err);
								});
							}
						});

						plazaRadio.addEventListener('play', () => {
							isPlaying = true;
							playButton.textContent = 'Pausar';
						});

						plazaRadio.addEventListener('pause', () => {
							isPlaying = false;
							playButton.textContent = 'Reproducir';
						});

						plazaAPI();
						setInterval(() => {
							plazaAPI();
						}, 5000);
					}, 1200);

					startupSource.start();
				});
			})
			.catch(err => console.error(err));
	}, 400);
}