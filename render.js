const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
startBtn.onclick = (e) => {
    if (mediaRecorder == null) {
        alert("You must select a source");
        return;
    }

    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = (e) => {
    if (mediaRecorder == null) {
        alert("You haven't start a record yet");
        return;
    }
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

let mediaRecorder;
const recordedChunks = [];


async function getVideoSources() {
    await window.api.buildSourcesMenu({
        types: ['window', 'screen']
    }, 'SELECT_SOURCE')
}

window.api.receive('SELECT_SOURCE', async (source) => {
    videoSelectBtn.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.play();

    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
});

function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

async function handleStop(e) {
    await window.api.saveVideo(recordedChunks);
}
