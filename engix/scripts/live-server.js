const liveServer = require('live-server');
const { spawn } = require('child_process');

// Start live-server
liveServer.start({
    port: 8080,
    root: './dist',
    open: false,
    file: 'index.html'
});

async function main() {
    try {
        const open = (await import('open')).default;
        console.log('Starting browser..');
        await open('http://127.0.0.1:8080', { wait: true });
    } catch (err) {
        console.error('Error importing open module:', err);
    }
}

main();
