const videoElement = document.getElementById('preview');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sourcesDiv = document.getElementById('sources');

let mediaRecorder;
let recordedChunks = [];

// 获取屏幕源并显示缩略图
async function loadSources() {
  const sources = await window.electronAPI.getSources();
  sourcesDiv.innerHTML = '';
  sources.forEach(source => {
    const img = document.createElement('img');
    img.src = source.thumbnail;
    img.title = source.name;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.margin = '10px';
    img.onclick = () => selectSource(source.id);
    sourcesDiv.appendChild(img);
  });
}

let selectedSourceId;

// 用户选择屏幕源
async function selectSource(sourceId) {
  selectedSourceId = sourceId;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;

  // 配置 MediaRecorder
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;

  startBtn.disabled = false;
}

// 处理录制数据
function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

// 停止录制时保存视频
function handleStop() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'recording.webm';
  document.body.appendChild(a);
  a.click();
  a.remove();

  recordedChunks = [];
}

// 开始录制
startBtn.onclick = () => {
  if (!selectedSourceId) {
    alert('Please select a screen source first.');
    return;
  }
  recordedChunks = [];
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// 停止录制
stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

// 初始化
loadSources();