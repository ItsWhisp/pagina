function initializeWindow(windowElement) {
	let isDragging = false;
	let startX, startY, offsetX, offsetY;

	const titleBar = windowElement.querySelector(".title-bar");
	const minimizeButton = titleBar.querySelector('[aria-label="Minimize"]');
	const maximizeButton = titleBar.querySelector('[aria-label="Maximize"]');
	const restoreButton = titleBar.querySelector('[aria-label="Restore"]');
	const closeButton = titleBar.querySelector('[aria-label="Close"]');

	closeButton.addEventListener("click", () => {
		windowElement.parentNode.removeChild(windowElement);
		if (document.querySelectorAll('.window').length === 0) {
			location.reload();
		}
	});

	titleBar.addEventListener("mousedown", (event) => {
		if (event.target.classList.contains("title-bar-controls") ||
			event.target.closest(".title-bar-controls")) {
			return;
		}

		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		const rect = windowElement.getBoundingClientRect();
		offsetX = startX - rect.left;
		offsetY = startY - rect.top;
	});

	function onMouseMove(event) {
		if (!isDragging) {
			return;
		}

		const newX = event.clientX;
		const newY = event.clientY;

		const container = windowElement.parentNode;
		const containerRect = container.getBoundingClientRect();

		let newLeft = newX - offsetX;
		let newTop = newY - offsetY;

		newLeft = Math.max(containerRect.left, newLeft);
		newTop = Math.max(containerRect.top, newTop);
		newLeft = Math.min(containerRect.right - windowElement.offsetWidth, newLeft);
		newTop = Math.min(containerRect.bottom - windowElement.offsetHeight, newTop);

		windowElement.style.left = `${newLeft}px`;
		windowElement.style.top = `${newTop}px`;
	}

	function onMouseUp(event) {
		isDragging = false;
	}

	titleBar.addEventListener("touchstart", (event) => {
		event.preventDefault();

		if (
			event.target.classList.contains("title-bar-controls") ||
			event.target.closest(".title-bar-controls")
		) {
			return;
		}

		isDragging = true;
		startX = event.touches[0].clientX;
		startY = event.touches[0].clientY;
		const rect = windowElement.getBoundingClientRect();
		offsetX = startX - rect.left;
		offsetY = startY - rect.top;
	});

	function onTouchMove(event) {
		if (!isDragging) {
			return;
		}

		const newX = event.touches[0].clientX;
		const newY = event.touches[0].clientY;

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

	function onTouchEnd(event) {
		isDragging = false;
	}

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
	document.addEventListener("touchmove", onTouchMove);
	document.addEventListener("touchend", onTouchEnd);

	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const windowWidth = windowElement.offsetWidth;
	const windowHeight = windowElement.offsetHeight;
	const centerX = screenWidth / 2 - windowWidth / 2;
	const centerY = screenHeight / 2 - windowHeight / 2;

	windowElement.style.visibility = "visible";
	windowElement.style.left = `${centerX}px`;
	windowElement.style.top = `${centerY}px`;
}

function onWindowResize() {
	windows.forEach((windowElement) => {
		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;
		const windowWidth = windowElement.offsetWidth;
		const windowHeight = windowElement.offsetHeight;
		const currentLeft = parseFloat(windowElement.style.left);
		const currentTop = parseFloat(windowElement.style.top);

		// Calculate new position within the viewport boundaries
		let newLeft = Math.min(screenWidth - windowWidth, Math.max(0, currentLeft));
		let newTop = Math.min(screenHeight - windowHeight, Math.max(0, currentTop));

		windowElement.style.left = `${newLeft}px`;
		windowElement.style.top = `${newTop}px`;
	});
}

// Attach the resize event listener to adjust window position
window.addEventListener('resize', onWindowResize);

const windows = document.querySelectorAll('.window');
windows.forEach((windowElement) => {
	initializeWindow(windowElement);
});

const desktop = document.body;
const selectionBox = document.querySelector('.selection-box');
let isSelecting = false;
let startX, startY;

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
		if (!windowElement.contains(event.target)) {
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

let holdTimeoutId = null;
const HOLD_THRESHOLD = 500;

desktop.addEventListener("touchstart", (e) => {
	if (e.target === desktop) {
		holdTimeoutId = setTimeout(() => {
			navigator.vibrate(30);
			isSelecting = true;
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			selectionBox.style.display = "block";
			selectionBox.style.left = startX + "px";
			selectionBox.style.top = startY + "px";
			desktop.style.userSelect = "none";
		}, HOLD_THRESHOLD);
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

windows.forEach((windowElement) => {
	windowElement.style.minHeight = `${windowElement.offsetHeight}px`;
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		window.getSelection().removeAllRanges();
	}
});