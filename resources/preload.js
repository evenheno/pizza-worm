document.addEventListener('DOMContentLoaded', () => {
  let instance;
  const container = document.getElementById('container');
  const loader = document.getElementById('loader');

  container.addEventListener('dblclick', () => {
    if (instance && instance.fullScreen) {
      instance.fullScreen();
      return;
    }

    if (container.requestFullscreen) container.requestFullscreen();
  });

  function setStatusMessage(statusMessage) {
    console.log(`Status: ${statusMessage}`);
    loader.textContent = statusMessage;
  }

  function setLoader(active) {
    loader.style.display = active ? 'flex' : 'none';
  }

  function setLoaderAnim(active) {
    loader.style.animation = active ? 'flicker' : undefined;
  }

  async function run() {
    try {
      setStatusMessage('Initializing..');
      const application = new PizzaWorm(container);
      setStatusMessage('Starting application..');
      await application.start({ fullScreen: false });
      setLoader(false);
      return application;
    } catch (error) {
      setLoaderAnim(false);
      setStatusMessage(`FATAL ERROR: ${error}`);
    }
  }

  document.addEventListener('click', async () => {
    if (instance) return;
    else instance = true;
    if (container.requestFullscreen) {
      container.requestFullscreen().catch((error) => {
        console.warn(`Failed to set full-screen: ${error}`);
      });
    }
    instance = await run();
  });

  setStatusMessage('Click To Start');
});
