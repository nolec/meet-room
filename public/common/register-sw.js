(() => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // Optional: console.debug('Service worker registered');
      })
      .catch(() => {
        // Optional: console.warn('Service worker registration failed', err);
      });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
})();

