// public/ui/modal.js

const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeButton = document.getElementById('modal-close');

function closeModal() {
  overlay.style.display = 'none';
}

export function openModal(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content.replace(/\n/g, '<br>');
  overlay.style.display = 'flex';
}

// 閉じるためのイベントリスナー
closeButton.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  // オーバーレイの背景部分をクリックした時だけ閉じる
  if (e.target === overlay) {
    closeModal();
  }
});