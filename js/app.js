class HangmanGame {
    constructor() {
        this.words = {
            animales: ['perro', 'gato', 'elefante', 'jirafa', 'leon', 'tigre', 'delfin', 'ballena'],
            paises: ['españa', 'francia', 'italia', 'alemania', 'portugal', 'brasil', 'argentina'],
            frutas: ['manzana', 'platano', 'naranja', 'pera', 'melocoton', 'fresa', 'sandia']
        };
        
        this.currentCategory = 'paises';
        this.currentWord = '';
        this.normalizedWord = ''; 
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.score = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startNewGame();
    }

    normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    initializeElements() {
        // Canvas
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Display elements
        this.wordDisplay = document.getElementById('wordDisplay');
        this.categoryDisplay = document.getElementById('category');
        this.attemptsDisplay = document.getElementById('attempts');
        this.usedLettersDisplay = document.getElementById('usedLetters');
        this.scoreDisplay = document.getElementById('score');
        this.keyboard = document.getElementById('keyboard');

        // Modal elements
        this.modal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('gameOverTitle');
        this.modalMessage = document.getElementById('gameOverMessage');
        this.correctWordDisplay = document.getElementById('correctWord');

        // Buttons
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.changeCategoryBtn = document.getElementById('changeCategory');

        // Initialize keyboard
        this.createKeyboard();
    }

    setupEventListeners() {
        // Botones principales
        this.playAgainBtn.addEventListener('click', () => {
            this.startNewGame();
            this.hideModal();
        });
        
        this.newGameBtn.addEventListener('click', () => {
            this.startNewGame();
        });
        
        this.changeCategoryBtn.addEventListener('click', () => {
            this.changeCategory();
        });
        
        // Eventos del teclado físico
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (/^[a-z]$/.test(key)) {
                this.handleGuess(key);
            }
        });

        // Eventos del teclado virtual
        this.keyboard.addEventListener('click', (e) => {
            const key = e.target.closest('.key');
            if (key && !key.classList.contains('used')) {
                const letter = key.dataset.letter;
                this.handleGuess(letter);
            }
        });
    }

    createKeyboard() {
        const letters = 'abcdefghijklmnñopqrstuvwxyz';
        this.keyboard.innerHTML = letters.split('').map(letter => `
            <button class="key" data-letter="${letter}">${letter}</button>
        `).join('');
    }

    startNewGame() {
        this.currentWord = this.getRandomWord();
        this.normalizedWord = this.normalizeText(this.currentWord);
        console.log('Palabra actual:', this.currentWord);
        console.log('Palabra normalizada:', this.normalizedWord);
        this.guessedLetters.clear();
        this.remainingAttempts = 6;
        
        // Actualizar la interfaz
        this.updateDisplay();
        this.hideModal();
        this.resetCanvas();
        this.resetKeyboard();
        this.drawGallows();
        
        // Actualizar la categoría
        this.categoryDisplay.querySelector('span').textContent = this.currentCategory;
    }

    getRandomWord() {
        const words = this.words[this.currentCategory];
        return words[Math.floor(Math.random() * words.length)];
    }

    handleGuess(letter) {
        if (this.remainingAttempts <= 0 || this.hasWon()) return;
        if (this.guessedLetters.has(letter)) return;

        console.log('Letra intentada:', letter);
        this.guessedLetters.add(letter);
        
        // Encontrar y actualizar el botón del teclado
        const key = this.keyboard.querySelector(`[data-letter="${letter}"]`);
        
        // Verificar si la letra está en la palabra normalizada
        if (!this.normalizedWord.includes(letter)) {
            this.remainingAttempts--;
            if (key) {
                key.classList.add('wrong');
                key.classList.add('used');
            }
            this.drawHangman();
        } else {
            if (key) {
                key.classList.add('correct');
                key.classList.add('used');
            }
        }

        this.updateDisplay();
        this.checkGameEnd();
    }

    updateDisplay() {
        // Actualizar el display de la palabra
        this.wordDisplay.innerHTML = this.currentWord
            .split('')
            .map(letter => {
                const normalizedLetter = this.normalizeText(letter);
                return `
                    <div class="letter-box">
                        ${this.guessedLetters.has(normalizedLetter) ? letter : ''}
                    </div>
                `;
            })
            .join('');

        // Actualizar intentos y letras usadas
        this.attemptsDisplay.textContent = this.remainingAttempts;
        this.usedLettersDisplay.textContent = Array.from(this.guessedLetters)
            .sort()
            .join(', ');

        // Actualizar puntuación
        this.scoreDisplay.textContent = this.score;
    }

    hasWon() {
        return this.normalizedWord
            .split('')
            .every(letter => this.guessedLetters.has(letter));
    }

    checkGameEnd() {
        if (this.hasWon()) {
            this.score += 100;
            this.scoreDisplay.textContent = this.score;
            this.showModal('¡Felicidades!', '¡Has ganado! ');
        } else if (this.remainingAttempts <= 0) {
            this.showModal('¡Game Over!', '¡Has perdido! ');
        }
    }

    showModal(title, message) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.correctWordDisplay.textContent = this.currentWord;
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    changeCategory() {
        const categories = Object.keys(this.words);
        const currentIndex = categories.indexOf(this.currentCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        this.currentCategory = categories[nextIndex];
        this.startNewGame();
    }

    resetKeyboard() {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('used', 'correct', 'wrong');
        });
    }

    resetCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGallows();
    }

    drawGallows() {
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 4;
        
        // Base
        this.ctx.beginPath();
        this.ctx.moveTo(50, 250);
        this.ctx.lineTo(250, 250);
        this.ctx.stroke();
        
        // Poste vertical
        this.ctx.beginPath();
        this.ctx.moveTo(100, 250);
        this.ctx.lineTo(100, 50);
        this.ctx.stroke();
        
        // Poste horizontal
        this.ctx.beginPath();
        this.ctx.moveTo(100, 50);
        this.ctx.lineTo(200, 50);
        this.ctx.stroke();
        
        // Cuerda
        this.ctx.beginPath();
        this.ctx.moveTo(200, 50);
        this.ctx.lineTo(200, 80);
        this.ctx.stroke();
    }

    drawHangman() {
        const parts = [
            this.drawHead,
            this.drawBody,
            this.drawLeftArm,
            this.drawRightArm,
            this.drawLeftLeg,
            this.drawRightLeg
        ];

        const attemptsUsed = 6 - this.remainingAttempts;
        if (attemptsUsed > 0 && attemptsUsed <= parts.length) {
            parts[attemptsUsed - 1].call(this);
        }
    }

    drawHead() {
        this.ctx.beginPath();
        this.ctx.arc(200, 100, 20, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawBody() {
        this.ctx.beginPath();
        this.ctx.moveTo(200, 120);
        this.ctx.lineTo(200, 180);
        this.ctx.stroke();
    }

    drawLeftArm() {
        this.ctx.beginPath();
        this.ctx.moveTo(200, 140);
        this.ctx.lineTo(160, 160);
        this.ctx.stroke();
    }

    drawRightArm() {
        this.ctx.beginPath();
        this.ctx.moveTo(200, 140);
        this.ctx.lineTo(240, 160);
        this.ctx.stroke();
    }

    drawLeftLeg() {
        this.ctx.beginPath();
        this.ctx.moveTo(200, 180);
        this.ctx.lineTo(160, 220);
        this.ctx.stroke();
    }

    drawRightLeg() {
        this.ctx.beginPath();
        this.ctx.moveTo(200, 180);
        this.ctx.lineTo(240, 220);
        this.ctx.stroke();
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangmanGame();
});
