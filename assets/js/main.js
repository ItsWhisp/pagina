const getBrowser = () => { // Definir navegador del usuario
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

    const isFirefox = typeof InstallTrigger !== 'undefined' || 'mozApps' in navigator;
    if (isFirefox) {
        return "Firefox";
    }

    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    if (userAgent.includes('chrome') || isChrome) {
        return "Chrome";
    }

    return "WhispOS";
};

(function () { // Funcion Principal
    if (getBrowser() === "Firefox") {
        const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
        favicon.type = 'image/x-icon';
        favicon.rel = 'icon';
        favicon.href = '/assets/animated.ico';
        document.head.appendChild(favicon);
    }
})();