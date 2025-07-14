// Główna logika gry
document.addEventListener('DOMContentLoaded', function() {
    // Sprawdź, czy użytkownik jest zalogowany
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('game.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    if (!currentUser) return;
    
    // Wczytaj dane użytkownika
    const users = JSON.parse(localStorage.getItem('users'));
    const userData = users[currentUser].gameData;
    
    // Aktualizuj interfejs użytkownika
    document.getElementById('playerName').textContent = currentUser;
    document.getElementById('playerRank').textContent = userData.rank;
    
    // Aktualizuj zasoby
    updateResourcesDisplay(userData.resources);
    
    // Ustaw zegar
    updateGameClock();
    setInterval(updateGameClock, 1000);
    
    // Aktualizuj zasoby co minutę (w uproszczeniu)
    setInterval(() => {
        // Produkcja zasobów
        userData.resources.food += 10;
        userData.resources.water += 8;
        userData.resources.energy += 5;
        userData.resources.scrap += 3;
        userData.resources.tech += 1;
        
        // Zapisz dane
        users[currentUser].gameData = userData;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Aktualizuj UI
        updateResourcesDisplay(userData.resources);
    }, 60000);
    
    // Renderuj domyślną sekcję (schron)
    renderShelter(userData);
    
    // Obsługa nawigacji
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section') + 'Section';
            
            // Usuń aktywną klasę
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.game-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Dodaj aktywną klasę
            this.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
            
            // Renderuj zawartość sekcji
            switch(this.getAttribute('data-section')) {
                case 'shelter':
                    renderShelter(userData);
                    break;
                case 'buildings':
                    renderBuildings(userData);
                    break;
                case 'production':
                    renderProduction(userData);
                    break;
                case 'research':
                    renderResearch(userData);
                    break;
                case 'map':
                    if (typeof initMap === 'function') {
                        initMap(userData.position);
                    }
                    break;
            }
        });
    });
    
    // Funkcja aktualizująca wyświetlanie zasobów
    function updateResourcesDisplay(resources) {
        document.getElementById('foodCount').textContent = resources.food;
        document.getElementById('waterCount').textContent = resources.water;
        document.getElementById('energyCount').textContent = resources.energy;
        document.getElementById('scrapCount').textContent = resources.scrap;
        document.getElementById('techCount').textContent = resources.tech;
    }
    
    // Funkcja aktualizująca zegar gry
    function updateGameClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pl-PL');
        document.getElementById('currentTime').textContent = timeString;
        
        // Aktualizuj datę gry (liczba dni po apokalipsie)
        document.getElementById('gameDate').textContent = `${userData.daysSurvived} dzień po Apokalipsie`;
    }
    
    // Funkcje renderujące
    function renderShelter(userData) {
        const content = document.getElementById('shelterContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Schron Główny</h2>
                    <div class="card-badge">Poziom ${userData.level}</div>
                </div>
                <div class="card-content">
                    <div class="base-info">
                        <div class="base-icon">
                            <i class="fas fa-igloo"></i>
                        </div>
                        <div>
                            <h3>Twierdza Ocalałych</h3>
                            <p>Pozycja: Sektor 7-G</p>
                        </div>
                    </div>
                    
                    <div class="base-stats">
                        <div class="stat">
                            <div>Pojemność schronu</div>
                            <div class="stat-value">${500 + userData.level * 300}/${1000 + userData.level * 200}</div>
                        </div>
                        <div class="stat">
                            <div>Obrona</div>
                            <div class="stat-value">${userData.buildings.defenseTower.level * 10}%</div>
                        </div>
                        <div class="stat">
                            <div>Zadowolenie</div>
                            <div class="stat-value">${userData.buildings.hydroponics.level * 15}%</div>
                        </div>
                        <div class="stat">
                            <div>Energia</div>
                            <div class="stat-value">+${userData.buildings.solarPanels.level * 10}/h</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Infrastruktura</h2>
                </div>
                <div class="card-content">
                    <div class="buildings-list">
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-tint"></i>
                                </div>
                                <div>
                                    <div class="building-name">Ujęcie wody</div>
                                    <div class="building-level">Poziom ${userData.buildings.waterIntake.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.waterIntake.level * 25} wody/h</div>
                                <div>Zużycie energii: ${userData.buildings.waterIntake.level * 5}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="waterIntake">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-seedling"></i>
                                </div>
                                <div>
                                    <div class="building-name">Hydroponika</div>
                                    <div class="building-level">Poziom ${userData.buildings.hydroponics.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.hydroponics.level * 30} żywności/h</div>
                                <div>Zużycie wody: ${userData.buildings.hydroponics.level * 10}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="hydroponics">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-solar-panel"></i>
                                </div>
                                <div>
                                    <div class="building-name">Panele słoneczne</div>
                                    <div class="building-level">Poziom ${userData.buildings.solarPanels.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>+${userData.buildings.solarPanels.level * 50} energii/h</div>
                                <div>Wymaga światła</div>
                            </div>
                            <button class="upgrade-btn" data-building="solarPanels">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                                <div>
                                    <div class="building-name">Wieża obronna</div>
                                    <div class="building-level">Poziom ${userData.buildings.defenseTower.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Siła obrony: ${userData.buildings.defenseTower.level * 120}</div>
                                <div>Zużycie energii: ${userData.buildings.defenseTower.level * 15}/h</div>
                            </div>
                            <button class="upgrade-btn" data-building="defenseTower">Ulepsz</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Twoje siły</h2>
                </div>
                <div class="card-content">
                    <div class="units-grid">
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="unit-name">Zwiadowcy</div>
                            <div class="unit-count">${userData.units.scouts}</div>
                            <button class="upgrade-btn" data-unit="scouts">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-fist-raised"></i>
                            </div>
                            <div class="unit-name">Łowcy</div>
                            <div class="unit-count">${userData.units.hunters}</div>
                            <button class="upgrade-btn" data-unit="hunters">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="unit-name">Strażnicy</div>
                            <div class="unit-count">${userData.units.guards}</div>
                            <button class="upgrade-btn" data-unit="guards">Rekrutuj</button>
                        </div>
                        
                        <div class="unit-card">
                            <div class="unit-icon">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="unit-name">Transportery</div>
                            <div class="unit-count">${userData.units.transporters}</div>
                            <button class="upgrade-btn" data-unit="transporters">Buduj</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Działania</h2>
                </div>
                <div class="card-content">
                    <div class="events-list" id="eventsList">
                        <div class="event">
                            <i class="fas fa-sync-alt"></i>
                            <div>Rozpocznij rozbudowę infrastruktury</div>
                        </div>
                        <div class="event success">
                            <i class="fas fa-check-circle"></i>
                            <div>Schron gotowy do działania!</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Dodaj obsługę przycisków
        attachBuildingButtons();
    }
    
    function renderBuildings(userData) {
        const content = document.getElementById('buildingsContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Rozbudowa Schronu</h2>
                </div>
                <div class="card-content">
                    <p>Wybierz budynek do rozbudowy:</p>
                    
                    <div class="buildings-list">
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-tint"></i>
                                </div>
                                <div>
                                    <div class="building-name">Ujęcie wody</div>
                                    <div class="building-level">Poziom ${userData.buildings.waterIntake.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję wody</div>
                                <div>Koszt ulepszenia: ${100 * (userData.buildings.waterIntake.level + 1)} złomu</div>
                            </div>
                            <button class="upgrade-btn" data-building="waterIntake">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-seedling"></i>
                                </div>
                                <div>
                                    <div class="building-name">Hydroponika</div>
                                    <div class="building-level">Poziom ${userData.buildings.hydroponics.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję żywności</div>
                                <div>Koszt ulepszenia: ${120 * (userData.buildings.hydroponics.level + 1)} złomu</div>
                            </div>
                            <button class="upgrade-btn" data-building="hydroponics">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-solar-panel"></i>
                                </div>
                                <div>
                                    <div class="building-name">Panele słoneczne</div>
                                    <div class="building-level">Poziom ${userData.buildings.solarPanels.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa produkcję energii</div>
                                <div>Koszt ulepszenia: ${150 * (userData.buildings.solarPanels.level + 1)} złomu</div>
                            </div>
                            <button class="upgrade-btn" data-building="solarPanels">Ulepsz</button>
                        </div>
                        
                        <div class="building">
                            <div class="building-header">
                                <div class="building-icon">
                                    <i class="fas fa-shield-alt"></i>
                                </div>
                                <div>
                                    <div class="building-name">Wieża obronna</div>
                                    <div class="building-level">Poziom ${userData.buildings.defenseTower.level}</div>
                                </div>
                            </div>
                            <div class="building-stats">
                                <div>Zwiększa obronę schronu</div>
                                <div>Koszt ulepszenia: ${200 * (userData.buildings.defenseTower.level + 1)} złomu</div>
                            </div>
                            <button class="upgrade-btn" data-building="defenseTower">Ulepsz</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        attachBuildingButtons();
    }
    
    function renderProduction(userData) {
        const content = document.getElementById('productionContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Produkcja</h2>
                </div>
                <div class="card-content">
                    <div class="empty-section">
                        <i class="fas fa-tools"></i>
                        <h3>Produkcja jednostek i zasobów</h3>
                        <p>Tutaj możesz zarządzać produkcją jednostek i przydzielać mieszkańców do pracy.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderResearch(userData) {
        const content = document.getElementById('researchContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Badania</h2>
                </div>
                <div class="card-content">
                    <div class="empty-section">
                        <i class="fas fa-flask"></i>
                        <h3>Badania technologiczne</h3>
                        <p>Rozwijaj technologie, aby uzyskać przewagę nad przeciwnikami.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    function attachBuildingButtons() {
        // Obsługa przycisków budynków
        document.querySelectorAll('.upgrade-btn[data-building]').forEach(button => {
            button.addEventListener('click', function() {
                const building = this.dataset.building;
                upgradeBuilding(building, currentUser);
            });
        });
        
        // Obsługa przycisków jednostek
        document.querySelectorAll('.upgrade-btn[data-unit]').forEach(button => {
            button.addEventListener('click', function() {
                const unit = this.dataset.unit;
                recruitUnit(unit, currentUser);
            });
        });
    }
    
    function upgradeBuilding(building, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Koszt ulepszenia
        const cost = 100 * (userData.buildings[building].level + 1);
        
        if (userData.resources.scrap >= cost) {
            userData.resources.scrap -= cost;
            userData.buildings[building].level++;
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            renderShelter(userData);
            renderBuildings(userData);
            
            alert(`Ulepszono ${building} do poziomu ${userData.buildings[building].level}!`);
        } else {
            alert('Nie masz wystarczająco złomu!');
        }
    }
    
    function recruitUnit(unit, username) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userData = users[username].gameData;
        
        // Koszt rekrutacji
        const costs = {
            scouts: { food: 50, scrap: 20 },
            hunters: { food: 80, scrap: 40 },
            guards: { food: 60, scrap: 60 },
            transporters: { food: 100, scrap: 150 }
        };
        
        if (userData.resources.food >= costs[unit].food && 
            userData.resources.scrap >= costs[unit].scrap) {
            userData.resources.food -= costs[unit].food;
            userData.resources.scrap -= costs[unit].scrap;
            userData.units[unit]++;
            
            // Zapisz zmiany
            users[username].gameData = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Odśwież UI
            renderShelter(userData);
            
            alert(`Zrekrutowano 1 ${unit}!`);
        } else {
            alert('Nie masz wystarczających zasobów!');
        }
    }
});