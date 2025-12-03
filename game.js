class PuzzleGame {
    constructor() {
        this.rows = 3;
        this.cols = 4;
        this.pieces = [];
        this.image = null;
        this.pieceWidth = 0;
        this.pieceHeight = 0;
        this.boardElement = document.getElementById('puzzleBoard');
        this.panelElement = document.getElementById('piecesPanel');
        this.draggedPiece = null;
        
        this.init();
    }

    init() {
        document.getElementById('imageUpload').addEventListener('change', (e) => this.loadImage(e));
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('difficulty').addEventListener('change', (e) => this.changeDifficulty(e));
        document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
        document.getElementById('secretBtn').addEventListener('click', () => this.showCheatModal());
        
        // Добавляем обработчик для возврата кусочков на панель
        this.panelElement.addEventListener('dragover', (e) => e.preventDefault());
        this.panelElement.addEventListener('drop', (e) => this.onDropToPanel(e));
        
        // Разрешаем скролл панели на мобильных
        this.panelElement.addEventListener('touchstart', (e) => {
            // Разрешаем скролл если касание не на кусочке
            if (!e.target.closest('.piece-thumbnail')) {
                e.stopPropagation();
            }
        }, { passive: true });
        
        this.loadDefaultImage();
    }

    showCheatModal() {
        const overlay = document.createElement('div');
        overlay.className = 'cheat-overlay';
        overlay.innerHTML = `
            <div class="cheat-modal">
                <h3>🎮 Чит-код</h3>
                <input type="text" class="cheat-input" id="cheatInput" placeholder="Введите код..." autocomplete="off">
                <div class="cheat-buttons">
                    <button class="cheat-btn submit" id="cheatSubmit">Применить</button>
                    <button class="cheat-btn cancel" id="cheatCancel">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('show'), 10);

        const input = document.getElementById('cheatInput');
        input.focus();

        document.getElementById('cheatSubmit').addEventListener('click', () => {
            this.checkCheatCode(input.value.toLowerCase().trim());
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        });

        document.getElementById('cheatCancel').addEventListener('click', () => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkCheatCode(input.value.toLowerCase().trim());
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            }
        });
    }

    checkCheatCode(code) {
        if (code === 'лабумба') {
            this.loadDogImage();
        }
    }

    loadDogImage() {
        // Загружаем изображение собаки
        const img = new Image();
        img.onload = () => {
            this.image = img;
            this.startNewGame();
        };
        img.onerror = () => {
            alert('Не удалось загрузить dog.jpg. Запустите start.bat для локального сервера!');
        };
        img.src = 'dog.jpg';
    }

    showPreview() {
        if (!this.image) return;

        // Создаем оверлей поверх игрового поля
        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'preview-overlay';
        
        const previewImg = document.createElement('img');
        previewImg.src = this.image.src;
        previewImg.className = 'preview-image';
        
        previewOverlay.appendChild(previewImg);
        
        // Добавляем поверх игрового поля
        this.boardElement.style.position = 'relative';
        this.boardElement.appendChild(previewOverlay);

        // Анимация появления
        setTimeout(() => {
            previewOverlay.classList.add('show');
        }, 10);

        // Удаляем через 1 секунду
        setTimeout(() => {
            previewOverlay.classList.remove('show');
            setTimeout(() => {
                previewOverlay.remove();
            }, 300);
        }, 1000);
    }

    onDropToPanel(event) {
        event.preventDefault();
        
        if (!this.draggedPiece) return;
        
        // Если кусочек был на доске, удаляем его оттуда
        const parentCell = this.draggedPiece.element.closest('.grid-cell');
        if (parentCell) {
            parentCell.classList.remove('filled');
            parentCell.classList.remove('correct');
            
            // Удаляем кусочек с доски
            this.draggedPiece.element.remove();
        }
        
        // Создаем новый кусочек для панели
        const returnedPiece = document.createElement('div');
        returnedPiece.className = 'piece-thumbnail';
        returnedPiece.draggable = true;
        
        // Устанавливаем соотношение сторон
        const aspectRatio = this.pieceWidth / this.pieceHeight;
        returnedPiece.style.aspectRatio = aspectRatio;
        
        const img = this.draggedPiece.element.querySelector('img').cloneNode(true);
        returnedPiece.appendChild(img);
        
        this.makePieceDraggable(returnedPiece, this.draggedPiece.row, this.draggedPiece.col);
        
        this.panelElement.appendChild(returnedPiece);
        this.draggedPiece = null;
    }

    changeDifficulty(event) {
        const value = event.target.value;
        const [rows, cols] = value.split('x').map(Number);
        this.rows = rows;
        this.cols = cols;
        if (this.image) {
            this.startNewGame();
        }
    }

    loadDefaultImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 800, Math.random() * 600, Math.random() * 100 + 20, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Релакс Пазлы', 400, 280);
        ctx.font = '24px Arial';
        ctx.fillText('Перетащите кусочки на доску', 400, 340);
        
        const img = new Image();
        img.onload = () => {
            this.image = img;
            this.startNewGame();
        };
        img.src = canvas.toDataURL();
    }

    loadImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.startNewGame();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    startNewGame() {
        if (!this.image) return;

        this.boardElement.innerHTML = '';
        
        // Сохраняем контейнер с кнопками если он есть
        const wrapper = this.panelElement.parentElement;
        const container = wrapper.querySelector('.pieces-panel-container');
        
        this.panelElement.innerHTML = '';
        this.pieces = [];

        // Масштабируем изображение под максимальный размер доски
        // Адаптивный размер в зависимости от экрана
        const isMobile = window.innerWidth <= 768;
        const maxWidth = isMobile ? window.innerWidth - 10 : 900;
        const maxHeight = isMobile ? window.innerHeight - 180 : 650;
        
        let scaledWidth = this.image.width;
        let scaledHeight = this.image.height;
        
        // Проверяем нужно ли масштабировать
        if (scaledWidth > maxWidth || scaledHeight > maxHeight) {
            const widthRatio = maxWidth / scaledWidth;
            const heightRatio = maxHeight / scaledHeight;
            const scale = Math.min(widthRatio, heightRatio);
            
            scaledWidth = Math.floor(scaledWidth * scale);
            scaledHeight = Math.floor(scaledHeight * scale);
        }

        this.pieceWidth = Math.floor(scaledWidth / this.cols);
        this.pieceHeight = Math.floor(scaledHeight / this.rows);

        this.boardElement.style.width = (this.pieceWidth * this.cols) + 'px';
        this.boardElement.style.height = (this.pieceHeight * this.rows) + 'px';

        // Создаем сетку на доске
        this.createGrid();

        // Создаем кусочки
        const allPieces = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.createPiece(row, col);
                allPieces.push(piece);
            }
        }

        // Перемешиваем
        this.shuffle(allPieces);

        // Добавляем на панель
        allPieces.forEach(piece => {
            this.panelElement.appendChild(piece.element);
        });
        
        // Инициализируем навигацию для мобильных
        this.initMobileNavigation();
    }

    initMobileNavigation() {
        if (window.innerWidth > 768) return;
        
        const wrapper = this.panelElement.parentElement;
        
        // Создаем контейнер для панели если его нет
        let container = wrapper.querySelector('.pieces-panel-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'pieces-panel-container';
            
            // Переносим панель в контейнер
            const panel = this.panelElement;
            wrapper.appendChild(container);
            container.appendChild(panel);
        }
        
        // Удаляем старые кнопки
        const oldButtons = container.querySelectorAll('.nav-button');
        oldButtons.forEach(btn => btn.remove());
        
        // Создаем кнопки навигации
        const prevBtn = document.createElement('div');
        prevBtn.className = 'nav-button prev';
        prevBtn.innerHTML = '◀';
        
        const nextBtn = document.createElement('div');
        nextBtn.className = 'nav-button next';
        nextBtn.innerHTML = '▶';
        
        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
        
        let currentIndex = 0;
        const pieceWidth = 80 + 6; // ширина кусочка + gap
        const visibleWidth = window.innerWidth - 80; // минус кнопки
        const visibleCount = Math.floor(visibleWidth / pieceWidth);
        const totalPieces = this.panelElement.children.length;
        const maxIndex = Math.max(0, totalPieces - visibleCount);
        
        const updateButtons = () => {
            prevBtn.classList.toggle('disabled', currentIndex === 0);
            nextBtn.classList.toggle('disabled', currentIndex >= maxIndex);
        };
        
        const updatePosition = () => {
            const offset = -currentIndex * pieceWidth;
            this.panelElement.style.transform = `translateX(${offset}px)`;
            updateButtons();
        };
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updatePosition();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updatePosition();
            }
        });
        
        updateButtons();
    }

    createGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.left = (col * this.pieceWidth) + 'px';
                cell.style.top = (row * this.pieceHeight) + 'px';
                cell.style.width = this.pieceWidth + 'px';
                cell.style.height = this.pieceHeight + 'px';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('dragover', (e) => e.preventDefault());
                cell.addEventListener('drop', (e) => this.onDrop(e, cell));
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    createPiece(row, col) {
        const canvas = document.createElement('canvas');
        canvas.width = this.pieceWidth;
        canvas.height = this.pieceHeight;
        const ctx = canvas.getContext('2d');

        // Вычисляем координаты на оригинальном изображении
        const sourceWidth = this.image.width / this.cols;
        const sourceHeight = this.image.height / this.rows;

        ctx.drawImage(
            this.image,
            col * sourceWidth,
            row * sourceHeight,
            sourceWidth,
            sourceHeight,
            0, 0,
            this.pieceWidth,
            this.pieceHeight
        );

        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece-thumbnail';
        pieceElement.draggable = true;
        
        // Устанавливаем соотношение сторон
        const aspectRatio = this.pieceWidth / this.pieceHeight;
        pieceElement.style.aspectRatio = aspectRatio;
        
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.objectFit = 'cover';
        img.draggable = false;
        pieceElement.appendChild(img);

        this.makePieceDraggable(pieceElement, row, col);

        return { element: pieceElement, row, col };
    }

    makePieceDraggable(pieceElement, row, col) {
        // Desktop drag events
        pieceElement.addEventListener('dragstart', () => {
            const parentCell = pieceElement.closest('.grid-cell');
            if (parentCell) {
                parentCell.classList.remove('filled');
            }
            
            const fromBoard = !!parentCell;
            this.draggedPiece = { element: pieceElement, row, col, fromBoard };
            pieceElement.classList.add('dragging');
        });

        pieceElement.addEventListener('dragend', () => {
            pieceElement.classList.remove('dragging');
            
            if (this.draggedPiece && this.draggedPiece.element === pieceElement) {
                const parentCell = pieceElement.closest('.grid-cell');
                if (parentCell) {
                    parentCell.classList.add('filled');
                }
            }
        });

        // Mobile touch events
        let clone = null;
        let isDragging = false;

        pieceElement.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = pieceElement.getBoundingClientRect();
            
            // Проверяем что касание именно на кусочке
            if (touch.clientX < rect.left || touch.clientX > rect.right ||
                touch.clientY < rect.top || touch.clientY > rect.bottom) {
                return;
            }
            
            isDragging = true;
            e.preventDefault();
            
            const parentCell = pieceElement.closest('.grid-cell');
            if (parentCell) {
                parentCell.classList.remove('filled');
            }
            
            const fromBoard = !!parentCell;
            this.draggedPiece = { element: pieceElement, row, col, fromBoard };
            
            // Создаем клон сразу под пальцем
            clone = pieceElement.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.zIndex = '10000';
            clone.style.opacity = '0.9';
            clone.style.pointerEvents = 'none';
            clone.style.width = pieceElement.offsetWidth + 'px';
            clone.style.height = pieceElement.offsetHeight + 'px';
            clone.style.left = (touch.clientX - pieceElement.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - pieceElement.offsetHeight / 2) + 'px';
            clone.style.transform = 'scale(1.1)';
            clone.style.transition = 'none';
            document.body.appendChild(clone);
            
            pieceElement.style.opacity = '0.3';
        }, { passive: false });

        pieceElement.addEventListener('touchmove', (e) => {
            if (!isDragging || !clone) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - clone.offsetHeight / 2) + 'px';
        }, { passive: false });

        pieceElement.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            e.preventDefault();
            
            if (clone) {
                const touch = e.changedTouches[0];
                const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
                const targetCell = targetElement?.closest('.grid-cell');
                
                if (targetCell) {
                    this.onDrop(e, targetCell);
                } else {
                    const parentCell = pieceElement.closest('.grid-cell');
                    if (parentCell) {
                        parentCell.classList.add('filled');
                    }
                }
                
                clone.remove();
                clone = null;
            }
            
            pieceElement.style.opacity = '1';
            this.draggedPiece = null;
        }, { passive: false });
    }

    onDrop(event, cell) {
        event.preventDefault();
        
        if (!this.draggedPiece) return;
        
        // Проверяем, заблокирована ли ячейка
        if (cell.classList.contains('locked')) {
            // Ячейка заблокирована - возвращаем кусочек на панель
            this.returnPieceToPanel(this.draggedPiece.row, this.draggedPiece.col);
            this.draggedPiece.element.remove();
            this.draggedPiece = null;
            return;
        }
        
        // Проверяем, есть ли уже кусочек в ячейке
        const existingPiece = cell.querySelector('.placed-piece');
        if (existingPiece) {
            // Возвращаем существующий кусочек на панель только если новый пришел не с доски
            // или если это разные кусочки
            const oldRow = parseInt(existingPiece.dataset.row);
            const oldCol = parseInt(existingPiece.dataset.col);
            
            // Проверяем что это не тот же самый кусочек
            if (oldRow !== this.draggedPiece.row || oldCol !== this.draggedPiece.col) {
                this.returnPieceToPanel(oldRow, oldCol);
            }
            
            existingPiece.remove();
            cell.classList.remove('filled');
            cell.classList.remove('correct');
        }
        
        const targetRow = parseInt(cell.dataset.row);
        const targetCol = parseInt(cell.dataset.col);
        
        // Проверяем правильность
        const isCorrect = this.draggedPiece.row === targetRow && this.draggedPiece.col === targetCol;
        
        // Создаем новый кусочек для размещения
        const piece = document.createElement('div');
        piece.className = 'placed-piece';
        piece.style.width = this.pieceWidth + 'px';
        piece.style.height = this.pieceHeight + 'px';
        piece.dataset.row = this.draggedPiece.row;
        piece.dataset.col = this.draggedPiece.col;
        
        // Копируем изображение
        const img = this.draggedPiece.element.querySelector('img').cloneNode(true);
        piece.appendChild(img);
        
        if (isCorrect) {
            // Правильно! Фиксируем
            piece.draggable = false;
            cell.classList.add('locked');
            cell.classList.add('correct');
        } else {
            // Неправильно - делаем перетаскиваемым
            piece.draggable = true;
            this.makePieceDraggable(piece, this.draggedPiece.row, this.draggedPiece.col);
        }
        
        cell.appendChild(piece);
        cell.classList.add('filled');
        
        if (isCorrect) {
            this.checkWin();
        }
        
        // Убираем из панели
        this.draggedPiece.element.remove();
        this.draggedPiece = null;
    }

    returnPieceToPanel(row, col) {
        const returnedPiece = document.createElement('div');
        returnedPiece.className = 'piece-thumbnail';
        returnedPiece.draggable = true;
        
        // Устанавливаем соотношение сторон
        const aspectRatio = this.pieceWidth / this.pieceHeight;
        returnedPiece.style.aspectRatio = aspectRatio;
        
        // Создаем изображение кусочка
        const canvas = document.createElement('canvas');
        canvas.width = this.pieceWidth;
        canvas.height = this.pieceHeight;
        const ctx = canvas.getContext('2d');
        
        const sourceWidth = this.image.width / this.cols;
        const sourceHeight = this.image.height / this.rows;
        
        ctx.drawImage(
            this.image,
            col * sourceWidth,
            row * sourceHeight,
            sourceWidth,
            sourceHeight,
            0, 0,
            this.pieceWidth,
            this.pieceHeight
        );
        
        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.objectFit = 'cover';
        img.draggable = false;
        returnedPiece.appendChild(img);
        
        this.makePieceDraggable(returnedPiece, row, col);
        
        this.panelElement.appendChild(returnedPiece);
    }

    checkWin() {
        const locked = this.boardElement.querySelectorAll('.grid-cell.locked').length;
        if (locked === this.rows * this.cols) {
            setTimeout(() => {
                this.showWinAnimation();
            }, 300);
        }
    }

    showWinAnimation() {
        // Убираем границы между кусочками
        const cells = this.boardElement.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.style.border = 'none';
        });

        // Добавляем класс для анимации
        this.boardElement.classList.add('puzzle-complete');

        // Создаем оверлей с поздравлением
        const overlay = document.createElement('div');
        overlay.className = 'win-overlay';
        overlay.innerHTML = `
            <div class="win-message">
                <div class="win-icon">🎉</div>
                <h2>Поздравляем!</h2>
                <p>Вы собрали пазл!</p>
                <button class="win-button" onclick="document.querySelector('.win-overlay').remove(); document.getElementById('newGame').click();">
                    Новая игра
                </button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Анимация появления оверлея
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

window.addEventListener('load', () => {
    new PuzzleGame();
});
