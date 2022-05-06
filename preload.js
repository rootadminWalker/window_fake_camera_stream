const { contextBridge, ipcRenderer } = require('electron');
const { writeFile } = require('fs');


async function getScreenSources(opts) {
    return await ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts)
}

async function showSaveDialog(opts) {
    return await ipcRenderer.invoke('SELECT_SAVE_FILE', opts)
}

contextBridge.exposeInMainWorld('api', {
    buildSourcesMenu: async (opts, returnChannel) => {
        const inputSources = await getScreenSources(opts);
        await ipcRenderer.invoke('CREATE_DEVICE_LIST_MENU', inputSources, returnChannel);
    },
    saveVideo: async (recordedChunks) => {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        });
        const buffer = Buffer.from(await blob.arrayBuffer());
        const filePath = await showSaveDialog({
            buttonLabel: 'Save video',
            defaultPath: `video-${Date.now()}.webm`
        });
        console.log(filePath);
        writeFile(filePath, buffer, () => console.log('video saved successfully'));
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
