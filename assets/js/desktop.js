function initializeDesktop(desktop) {
	const windows = Array.from(document.querySelectorAll('.window'));
	const selectionBox = document.querySelector('.selection-box');
	const touchHoldDelay = 500;
	let highestZIndex = windows.length;
	let holdTimeoutId = null;
	let isSelecting = false;
	let startX, startY;

	window.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			window.getSelection().removeAllRanges();
		}
	});

	function desktopResize() {
		windows.forEach((windowElement) => {
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;
			const windowWidth = windowElement.offsetWidth;
			const windowHeight = windowElement.offsetHeight;
			const currentLeft = parseFloat(windowElement.style.left);
			const currentTop = parseFloat(windowElement.style.top);

			let newLeft = Math.min(screenWidth - windowWidth, Math.max(0, currentLeft));
			let newTop = Math.min(screenHeight - windowHeight, Math.max(0, currentTop));

			windowElement.style.left = `${newLeft}px`;
			windowElement.style.top = `${newTop}px`;
		});
	}

	desktop.addEventListener('mousedown', e => {
		if (e.target === desktop) {
			isSelecting = true;
			startX = e.clientX;
			startY = e.clientY;
			selectionBox.style.display = 'block';
			selectionBox.style.left = startX + 'px';
			selectionBox.style.top = startY + 'px';
			desktop.style.userSelect = 'none';
		}
		windows.forEach((windowElement) => {
			const titleBar = windowElement.querySelector(".title-bar");
			if (!windowElement.contains(e.target)) {
				titleBar.classList.add("inactive");
			} else {
				titleBar.classList.remove("inactive");
			}
		});
	});

	desktop.addEventListener('mousemove', e => {
		if (isSelecting) {
			const currentX = e.clientX;
			const currentY = e.clientY;
			const left = Math.min(startX, currentX);
			const top = Math.min(startY, currentY);
			const width = Math.abs(currentX - startX);
			const height = Math.abs(currentY - startY);
			selectionBox.style.left = left + 'px';
			selectionBox.style.top = top + 'px';
			selectionBox.style.width = width + 'px';
			selectionBox.style.height = height + 'px';
		}
	});

	desktop.addEventListener('mouseup', e => {
		isSelecting = false;
		selectionBox.style.display = 'none';
		selectionBox.style.width = '0';
		selectionBox.style.height = '0';
		desktop.style.userSelect = '';
	});

	desktop.addEventListener("touchstart", (e) => {
		if (e.target === desktop) {
			holdTimeoutId = setTimeout(() => {
				navigator.vibrate(100);
				isSelecting = true;
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
				selectionBox.style.display = "block";
				selectionBox.style.left = startX + "px";
				selectionBox.style.top = startY + "px";
				desktop.style.userSelect = "none";
			}, touchHoldDelay);
		}
		windows.forEach((windowElement) => {
			const titleBar = windowElement.querySelector(".title-bar");
			if (!windowElement.contains(e.target)) {
				titleBar.classList.add("inactive");
			} else {
				titleBar.classList.remove("inactive");
			}
		});
	});

	desktop.addEventListener("touchmove", (e) => {
		if (isSelecting) {
			const currentX = e.touches[0].clientX;
			const currentY = e.touches[0].clientY;
			const left = Math.min(startX, currentX);
			const top = Math.min(startY, currentY);
			const width = Math.abs(currentX - startX);
			const height = Math.abs(currentY - startY);
			selectionBox.style.left = left + "px";
			selectionBox.style.top = top + "px";
			selectionBox.style.width = width + "px";
			selectionBox.style.height = height + "px";
		}
	});

	desktop.addEventListener("touchend", (e) => {
		isSelecting = false;
		clearTimeout(holdTimeoutId);
		selectionBox.style.display = "none";
		selectionBox.style.width = "0";
		selectionBox.style.height = "0";
		desktop.style.userSelect = "";
	});

	window.addEventListener('resize', desktopResize);
	windows.forEach((windowElement) => {
		initializeWindow(windowElement);
	});

	function initializeWindow(windowElement) {
		let isDragging = false;
		let startX, startY, offsetX, offsetY;
		const titleBar = windowElement.querySelector(".title-bar");
		const minimizeButton = titleBar.querySelector('[aria-label="Minimize"]');
		const maximizeButton = titleBar.querySelector('[aria-label="Maximize"]');
		const restoreButton = titleBar.querySelector('[aria-label="Restore"]');
		const closeButton = titleBar.querySelector('[aria-label="Close"]');

		closeButton.addEventListener("click", () => {
			windowElement.style.display = "none";
			const visibleWindows = Array.from(document.querySelectorAll('.window')).reduce((count, window) => {
				return window.style.display !== "none" ? count + 1 : count;
			}, 0);

			if (visibleWindows === 0) {
				document.documentElement.style.cursor = "url(assets/img/cursors/cur_busy.png), wait";
				location.reload();
			}
		});

		function winDrag(event) {
			if (
				event.target.classList.contains("title-bar-controls") ||
				event.target.closest(".title-bar-controls")
			) {
				return;
			}

			isDragging = true;
			window.getSelection().removeAllRanges();
			startX = event.clientX || event.touches[0].clientX;
			startY = event.clientY || event.touches[0].clientY;
			const rect = windowElement.getBoundingClientRect();
			offsetX = startX - rect.left;
			offsetY = startY - rect.top;
		}

		function winMove(event) {
			if (!isDragging) {
				return;
			}

			if (typeof event.clientX !== 'undefined') {
				newX = event.clientX;
				newY = event.clientY;
			} else if (typeof event.touches !== 'undefined' && event.touches.length > 0) {
				newX = event.touches[0].clientX;
				newY = event.touches[0].clientY;
			} else {
				return;
			}

			const container = windowElement.parentNode;
			const containerRect = container.getBoundingClientRect();

			let newLeft = newX - offsetX;
			let newTop = newY - offsetY;

			newLeft = Math.max(containerRect.left, newLeft);
			newTop = Math.max(containerRect.top, newTop);
			newLeft = Math.min(
				containerRect.right - windowElement.offsetWidth,
				newLeft
			);
			newTop = Math.min(
				containerRect.bottom - windowElement.offsetHeight,
				newTop
			);

			windowElement.style.left = `${newLeft}px`;
			windowElement.style.top = `${newTop}px`;
		}

		function winDragEnd() {
			isDragging = false;
		}

		windows.forEach((windowElement, index) => {
			const zIndex = index + 1;
			const titleBar = windowElement.querySelector('.title-bar');
			const windowZIndex = parseInt(windowElement.style.zIndex);
			windowElement.style.zIndex = zIndex;

			if (windowZIndex !== highestZIndex) {
				titleBar.classList.add("inactive");
			} else {
				titleBar.classList.remove("inactive");
			}

			windowElement.addEventListener('mousedown', function () {
				windowElement.style.zIndex = highestZIndex + 1;
				titleBar.classList.remove('inactive');
				highestZIndex = parseInt(windowElement.style.zIndex);
			});

			windowElement.addEventListener('touchstart', function () {
				windowElement.style.zIndex = highestZIndex + 1;
				titleBar.classList.remove('inactive');
				highestZIndex = parseInt(windowElement.style.zIndex);
			});
		});

		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;
		const windowWidth = windowElement.offsetWidth;
		const windowHeight = windowElement.offsetHeight;
		const centerX = screenWidth / 2 - windowWidth / 2;
		const centerY = screenHeight / 2 - windowHeight / 2;
		// const windowZIndex = parseInt(windowElement.style.zIndex);
		windowElement.style.minHeight = `${windowElement.offsetHeight}px`;
		windowElement.style.visibility = "visible";
		windowElement.style.left = `${centerX}px`;
		windowElement.style.top = `${centerY}px`;

		titleBar.addEventListener("mousedown", winDrag);
		titleBar.addEventListener("touchstart", (event) => {
			event.preventDefault();
			winDrag(event);
		});

		document.addEventListener("mousemove", winMove);
		document.addEventListener("touchmove", winMove);
		document.addEventListener("mouseup", winDragEnd);
		document.addEventListener("touchend", winDragEnd);
	}
}