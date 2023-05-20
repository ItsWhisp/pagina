const terminal = $('.terminal');
if (!matchMedia('(pointer:fine)').matches) {
	terminal.html('<p class="terminal-txt">Pulsa la pantalla para continuar...<span class="terminal-cur"></span></p>');
	terminal.on('click', function (event) {
		event.preventDefault();
		const terminalContents = terminal.find('*');
		terminalContents.each(function () {
			$(this).css('display', 'none');
		});

		setTimeout(function () {
			terminal.css('display', 'none');
			var audio = new Audio('assets/media/startup.mp3');
			audio.play();
			audio.addEventListener('canplaythrough', function () {
				setTimeout(() => {
					document.documentElement.style.cursor = "url(assets/img/cursors/cur_load.png) 0 4, progress";
					initializeDesktop(document.body);
				}, 1000);
			});
			audio.addEventListener('ended', function () {
				document.documentElement.style.cursor = "url(assets/img/cursors/cur_def.png), auto";
			});
		}, 400);
	});
}

document.documentElement.style.cursor = "url(assets/img/cursors/cur_busy.png), wait";
terminal.on('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		const terminalContents = terminal.find('*');
		terminalContents.each(function () {
			$(this).css('display', 'none');
		});

		setTimeout(function () {
			terminal.css('display', 'none');
			var audio = new Audio('assets/media/startup.mp3');
			audio.play();
			audio.addEventListener('canplaythrough', function () {
				setTimeout(() => {
					document.documentElement.style.cursor = "url(assets/img/cursors/cur_load.png) 0 4, progress";
					initializeDesktop(document.body);
				}, 1000);
			});
			audio.addEventListener('ended', function () {
				document.documentElement.style.cursor = "url(assets/img/cursors/cur_def.png), auto";
			});
		}, 400);
	}
});

terminal.focus();
terminal.on('keydown', function (e) {
	if (e.key === 'Tab' && terminal.css('display') !== 'none') {
		e.preventDefault();
	}
});