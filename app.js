document.addEventListener('DOMContentLoaded', () => {
  // Переключение вкладок в расписании
  const tabButtons = document.querySelectorAll('.tab-btn');
  const scheduleDays = document.querySelectorAll('.schedule-day');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.getAttribute('data-day');
      
      // Активировать кнопку
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Показать соответствующий день
      scheduleDays.forEach(d => d.classList.remove('active'));
      document.getElementById(`schedule-day-${day}`).classList.add('active');
    });
  });
  
  // Загрузка данных с API
  fetchSchedule();
  fetchGames();
  fetchTags();
  
  // Плавная прокрутка для ссылок навигации
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === "#") return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Обработка кнопок регистрации
  const registerButtons = document.querySelectorAll('.pixel-btn.primary:not(.language-switch .pixel-btn)');
  registerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert(document.body.classList.contains('en') 
        ? 'Registration will be available soon!' 
        : 'Регистрация будет доступна в ближайшее время!');
    });
  });
  
  // Обработка кнопки "Подробнее"
  const learnMoreButtons = document.querySelectorAll('.pixel-btn.secondary:not(.tab-btn)');
  learnMoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('about').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
});

// Проверка, запущен ли сайт локально (без сервера)
const isLocalMode = () => {
  // Если URL содержит file:// или запускается напрямую из файловой системы
  return window.location.protocol === 'file:' || 
         !window.location.hostname || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Загрузка расписания
async function fetchSchedule() {
  // Если запуск локальный без сервера, сразу используем локальные данные
  if (isLocalMode() && window.location.protocol === 'file:') {
    console.log('Локальный режим без сервера. Использую встроенные данные для расписания.');
    useLocalScheduleData();
    return;
  }

  try {
    const response = await fetch('/api/schedule');
    if (!response.ok) {
      throw new Error(`Код ответа сервера: ${response.status}`);
    }
    const data = await response.json();
    
    // Отображение расписания
    renderSchedule('schedule-day-1', data.day1);
    renderSchedule('schedule-day-2', data.day2);
    renderSchedule('schedule-day-3', data.day3);
    renderSchedule('schedule-day-4', data.day4);
    renderSchedule('schedule-day-5', data.day5);
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error);
    // Если API недоступен, используем локальные данные
    useLocalScheduleData();
  }
}

// Загрузка игр
async function fetchGames() {
  // Если запуск локальный без сервера, сразу используем локальные данные
  if (isLocalMode() && window.location.protocol === 'file:') {
    console.log('Локальный режим без сервера. Использую встроенные данные для игр.');
    useLocalGamesData();
    return;
  }

  try {
    const response = await fetch('/api/games');
    if (!response.ok) {
      throw new Error(`Код ответа сервера: ${response.status}`);
    }
    const games = await response.json();
    renderGames(games);
  } catch (error) {
    console.error('Ошибка загрузки игр:', error);
    // Если API недоступен, используем локальные данные
    useLocalGamesData();
  }
}

// Загрузка тегов
async function fetchTags() {
  // Если запуск локальный без сервера, сразу используем локальные данные
  if (isLocalMode() && window.location.protocol === 'file:') {
    console.log('Локальный режим без сервера. Использую встроенные данные для тегов.');
    useLocalTagsData();
    return;
  }

  try {
    const response = await fetch('/api/tags');
    if (!response.ok) {
      throw new Error(`Код ответа сервера: ${response.status}`);
    }
    const tags = await response.json();
    renderTags(tags);
  } catch (error) {
    console.error('Ошибка загрузки тегов:', error);
    // Если API недоступен, используем локальные данные
    useLocalTagsData();
  }
}

// Отображение расписания
function renderSchedule(dayId, items) {
  const container = document.getElementById(dayId);
  container.innerHTML = '';
  
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="ru">Нет событий для этого дня</p><p class="en">No events for this day</p>';
    return;
  }
  
  // Сортировка событий по времени
  items.sort((a, b) => {
    const timeA = parseInt(a.time.replace(':', ''));
    const timeB = parseInt(b.time.replace(':', ''));
    return timeA - timeB;
  });
  
  items.forEach(item => {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = `schedule-item ${item.type}`;
    
    scheduleItem.innerHTML = `
      <div class="schedule-time">${item.time}</div>
      <div class="schedule-details">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;
    
    container.appendChild(scheduleItem);
  });
}

// Отображение игр
function renderGames(games) {
  const container = document.getElementById('games-grid');
  container.innerHTML = '';
  
  if (!games || games.length === 0) {
    container.innerHTML = '<p class="ru">Игры пока не добавлены</p><p class="en">No games added yet</p>';
    return;
  }
  
  // Сортировка игр по количеству голосов (по убыванию)
  games.sort((a, b) => b.votes - a.votes);
  
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    // Добавление тегов
    let tagsHTML = '';
    if (game.tags && game.tags.length > 0) {
      tagsHTML = `
        <div class="game-tags">
          ${game.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('')}
        </div>
      `;
    }
    
    gameCard.innerHTML = `
      <img src="${game.imageUrl}" alt="${game.title}" class="game-image">
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        <p class="game-author">${game.author}</p>
        <p>${game.description.length > 100 ? game.description.substring(0, 100) + '...' : game.description}</p>
        ${tagsHTML}
      </div>
    `;
    
    // Добавляем обработчик клика для перехода на страницу игры
    gameCard.addEventListener('click', () => {
      window.open(game.link, '_blank');
    });
    
    container.appendChild(gameCard);
  });
}

// Отображение тегов
function renderTags(tags) {
  const ruContainer = document.getElementById('tags-container-ru');
  const enContainer = document.getElementById('tags-container-en');
  
  if (!tags || tags.length === 0) {
    ruContainer.innerHTML = '<p>Нет доступных тегов</p>';
    enContainer.innerHTML = '<p>No tags available</p>';
    return;
  }
  
  ruContainer.innerHTML = '';
  enContainer.innerHTML = '';
  
  tags.forEach(tag => {
    const ruTag = document.createElement('div');
    ruTag.className = 'tag';
    ruTag.textContent = tag;
    ruTag.addEventListener('click', () => toggleTagFilter(ruTag, tag));
    ruContainer.appendChild(ruTag);
    
    const enTag = document.createElement('div');
    enTag.className = 'tag';
    enTag.textContent = tag;
    enTag.addEventListener('click', () => toggleTagFilter(enTag, tag));
    enContainer.appendChild(enTag);
  });
}

// Переключение фильтра по тегам
function toggleTagFilter(tagElement, tagName) {
  tagElement.classList.toggle('active');
  
  // Получаем все активные теги
  const activeTags = Array.from(document.querySelectorAll('.tag.active')).map(el => el.textContent);
  
  // Фильтруем игры по тегам
  filterGamesByTags(activeTags);
}

// Фильтрация игр по тегам
async function filterGamesByTags(activeTags) {
  // Если запуск локальный без сервера, используем локальные данные
  if (isLocalMode() && window.location.protocol === 'file:') {
    console.log('Локальный режим без сервера. Использую встроенные данные для фильтрации игр.');
    const gamesData = [
      {
        id: 1,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-15",
        votes: 245,
        tags: ["roguelike", "dungeon", "pixel-art"]
      },
      {
        id: 2,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23B4A0E5'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-14",
        votes: 189,
        tags: ["puzzle", "relaxing", "pixel-art"]
      },
      {
        id: 3,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-13",
        votes: 310,
        tags: ["arcade", "space", "animals"]
      }
    ];
    
    // Если есть активные теги, фильтруем локальные данные
    let filteredGames = gamesData;
    if (activeTags.length > 0) {
      filteredGames = gamesData.filter(game => {
        if (!game.tags) return false;
        return activeTags.some(tag => game.tags.includes(tag));
      });
    }
    
    renderGames(filteredGames);
    return;
  }

  try {
    const response = await fetch('/api/games');
    if (!response.ok) {
      throw new Error(`Код ответа сервера: ${response.status}`);
    }
    let games = await response.json();
    
    // Если есть активные теги, фильтруем игры
    if (activeTags.length > 0) {
      games = games.filter(game => {
        // Если у игры нет тегов, считаем что она не подходит под фильтр
        if (!game.tags) return false;
        
        // Проверяем, содержит ли игра хотя бы один из активных тегов
        return activeTags.some(tag => game.tags.includes(tag));
      });
    }
    
    renderGames(games);
  } catch (error) {
    console.error('Ошибка фильтрации игр:', error);
    // Если не получилось получить игры с сервера, используем локальные
    const gamesData = [
      {
        id: 1,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-15",
        votes: 245,
        tags: ["roguelike", "dungeon", "pixel-art"]
      },
      {
        id: 2,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23B4A0E5'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-14",
        votes: 189,
        tags: ["puzzle", "relaxing", "pixel-art"]
      },
      {
        id: 3,
        title: "Ваша игра!",
        description: "-",
        imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
        author: "Команда",
        link: "#",
        submissionDate: "2023-05-13",
        votes: 310,
        tags: ["arcade", "space", "animals"]
      }
    ];
    
    // Фильтруем локальные данные при наличии тегов
    let filteredGames = gamesData;
    if (activeTags.length > 0) {
      filteredGames = gamesData.filter(game => {
        if (!game.tags) return false;
        return activeTags.some(tag => game.tags.includes(tag));
      });
    }
    
    renderGames(filteredGames);
  }
}

// Локальные данные на случай, если API недоступен
function useLocalScheduleData() {
  const scheduleData = {
    day1: [
      {
        id: 1,
        title: "Открытие",
        description: "Приветствие, объявление правил и темы геймджема",
        time: "12:00",
        day: 1,
        type: "event"
      },
      {
        id: 2,
        title: "Начало разработки",
        description: "Старт работы над игровыми проектами",
        time: "12:30",
        day: 1,
        type: "announcement"
      },
      {
        id: 4,
        title: "Техническая консультация",
        description: "Ответы на вопросы по инструментам и технологиям",
        time: "18:00",
        day: 1,
        type: "workshop"
      }
    ],
    day2: [
      {
        id: 5,
        title: "Марафон разработки",
        description: "Основная фаза разработки проектов",
        time: "00:00",
        day: 2,
        type: "event"
      },
      {
        id: 6,
        title: "Чекпоинт",
        description: "Промежуточный контроль прогресса команд",
        time: "12:00",
        day: 2,
        type: "workshop"
      }
    ],
    day3: [
      {
        id: 7,
        title: "Финальный день",
        description: "Последний день для завершения проектов",
        time: "00:00",
        day: 3,
        type: "announcement"
      },
      {
        id: 8,
        title: "Дедлайн сдачи проектов",
        description: "Все игры должны быть отправлены до этого времени",
        time: "22:00",
        day: 3,
        type: "deadline"
      }
    ],
    day4: [
      {
        id: 9,
        title: "Начало оценки",
        description: "Оценка проектов экспертным жюри",
        time: "00:00",
        day: 4,
        type: "announcement"
      },
      {
        id: 10,
        title: "Дедлайн сдачи презентаций",
        description: "Все презентации должны быть отправлены до этого времени",
        time: "18:00",
        day: 4,
        type: "deadline"
      }
    ],
    day5: [
      {
        id: 11,
        title: "Публикация результатов и награждение. ",
        description: "Торжественное награждение победителей",
        time: "16:00",
        day: 5,
        type: "event"
      }
    ]
  };
  
  renderSchedule('schedule-day-1', scheduleData.day1);
  renderSchedule('schedule-day-2', scheduleData.day2);
  renderSchedule('schedule-day-3', scheduleData.day3);
  renderSchedule('schedule-day-4', scheduleData.day4);
  renderSchedule('schedule-day-5', scheduleData.day5);
}

function useLocalGamesData() {
  const gamesData = [
    {
      id: 1,
      title: "Ваша игра!",
      description: "-",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
      author: "Команда",
      link: "#",
      submissionDate: "2023-05-15",
      votes: 245,
      tags: ["roguelike", "dungeon", "pixel-art"]
    },
    {
      id: 2,
      title: "Ваша игра!",
      description: "-",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23B4A0E5'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
      author: "Команда",
      link: "#",
      submissionDate: "2023-05-14",
      votes: 189,
      tags: ["puzzle", "relaxing", "pixel-art"]
    },
    {
      id: 3,
      title: "Ваша игра!",
      description: "-",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%239D8EC7'/><text x='150' y='100' font-family='monospace' font-size='20' fill='white' text-anchor='middle'>Ваша игра</text></svg>",
      author: "Команда",
      link: "#",
      submissionDate: "2023-05-13",
      votes: 310,
      tags: ["arcade", "space", "animals"]
    }
  ];
  
  renderGames(gamesData);
}

function useLocalTagsData() {
  const tagsData = ["roguelike", "dungeon", "pixel-art", "puzzle", "relaxing", "arcade", "space", "animals"];
  renderTags(tagsData);
}