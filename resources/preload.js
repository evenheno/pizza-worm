document.addEventListener('DOMContentLoaded', () => {
  let instance;
  const container = document.getElementById('container');
  const loader = document.getElementById('loader');

  container.addEventListener('dblclick', () => {
    instance.fullScreen();
  });

  function setStatus(status) {
    loader.innerHTML = status;
  }

  async function run() {
    try {
      console.log('Initializing..');
      setStatus('Initializing..');
      const pizzaWorm = new PizzaWorm(container);

      console.log('Loading..');
      setStatus('Loading..');
      await pizzaWorm.start();

      loader.style.display = 'none';
      return pizzaWorm;
    } catch (error) {
      console.error(`Failed to start pizza worm: ${error}`);
    }
  }

  document.addEventListener('click', async () => {
    if (instance) return;
    else instance = true;
    instance = await run();
  });

  setStatus('Click To Start');
});