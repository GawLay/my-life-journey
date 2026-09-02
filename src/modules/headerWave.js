export function setWaveText(element, label = element?.textContent.trim()) {
  if (!element || !label) return;

  element.dataset.waveReady = 'true';
  element.classList.add('wave-text');
  element.setAttribute('aria-label', element.getAttribute('aria-label') || label);
  element.textContent = '';

  label.split(/\s+/).forEach((word, wordIndex, words) => {
    const wordElement = document.createElement('span');
    wordElement.className = 'wave-word';
    wordElement.setAttribute('aria-hidden', 'true');
    wordElement.style.setProperty('--word-index', wordIndex);

    [...word].forEach((letter, letterIndex) => {
      const letterElement = document.createElement('span');
      letterElement.className = 'wave-letter';
      letterElement.style.setProperty('--letter-index', letterIndex);
      letterElement.textContent = letter;
      wordElement.appendChild(letterElement);
    });

    element.appendChild(wordElement);
    if (wordIndex < words.length - 1) element.appendChild(document.createTextNode(' '));
  });
}

export function initHeaderWave(root = document) {
  root.querySelectorAll('[data-wave]').forEach((element) => {
    if (element.dataset.waveReady === 'true') return;
    setWaveText(element);
  });
}
