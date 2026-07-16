const overlay       = document.getElementById('uploadOverlay');
const btnAttach     = document.getElementById('btn-add-document');
const uploadClose   = document.getElementById('uploadClose');
const uploadCancel  = document.getElementById('uploadCancel');
const uploadSend    = document.getElementById('uploadSend');
const fileInput     = document.getElementById('input-add-document');
const dropZone      = document.getElementById('dropZone');
const uploadPreview = document.getElementById('uploadPreview');
const previewName   = document.getElementById('previewName');
const previewSize   = document.getElementById('previewSize');
const previewIcon   = document.getElementById('previewIcon');
const previewRemove = document.getElementById('previewRemove');
const fileChip      = document.getElementById('file-chip');
const fileChipName  = document.getElementById('file-chip-name');
const chipRemove    = document.getElementById('file-chip-remove');

let selectedFile = null;

const openUpload  = () => overlay.classList.add('is-open');
const closeUpload = () => overlay.classList.remove('is-open');

btnAttach.addEventListener('click', openUpload);
uploadClose.addEventListener('click', closeUpload);
uploadCancel.addEventListener('click', closeUpload);
overlay.addEventListener('click', e => { if (e.target === overlay) closeUpload(); });

// Apenas PDF e imagens
function iconForFile(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = { pdf: 'ri-file-pdf-line', png: 'ri-image-line', jpg: 'ri-image-line', jpeg: 'ri-image-line' };
  return map[ext] || 'ri-file-line';
}

// Bloqueia tipos não permitidos
function isAllowed(name) {
  const ext = name.split('.').pop().toLowerCase();
  return ['pdf', 'png', 'jpg', 'jpeg'].includes(ext);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function setFile(file) {
  if (!isAllowed(file.name)) {
    alert('Tipo não permitido. Use apenas PDF, PNG ou JPG.');
    return;
  }
  selectedFile = file;
  previewName.textContent = file.name;
  previewSize.textContent = formatBytes(file.size);
  previewIcon.className   = iconForFile(file.name);
  uploadPreview.classList.add('visible');
  uploadSend.classList.add('ready');
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  uploadPreview.classList.remove('visible');
  uploadSend.classList.remove('ready');
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) setFile(fileInput.files[0]); });
previewRemove.addEventListener('click', clearFile);

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

uploadSend.addEventListener('click', () => {
  if (!selectedFile) return;

  const empty = document.querySelector('.chat-empty');
  if (empty) empty.remove();

  const wrapper = document.createElement('div');
  wrapper.classList.add('msg', 'sent');

  const avatar = document.createElement('div');
  avatar.classList.add('msg-avatar');
  avatar.textContent = nomeUser.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const col    = document.createElement('div');
  col.classList.add('msg-col');

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');
  bubble.innerHTML = `<i class="${iconForFile(selectedFile.name)}" style="margin-right:6px;"></i>${selectedFile.name}`;

  const time = document.createElement('span');
  time.classList.add('msg-time');
  time.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  col.appendChild(bubble);
  col.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(col);
  msgArea.appendChild(wrapper);
  msgArea.scrollTop = msgArea.scrollHeight;

  fileChipName.textContent = selectedFile.name;
  fileChip.classList.add('visible');

  clearFile();
  closeUpload();
});

chipRemove.addEventListener('click', () => fileChip.classList.remove('visible'));