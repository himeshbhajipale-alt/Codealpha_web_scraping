// Web Scraping & Data Analytics Studio Frontend Controller

document.addEventListener("DOMContentLoaded", () => {
    // Application State
    let state = {
        activePortal: "generic",
        presets: [],
        rawHeaders: [],
        rawRows: [],
        headers: [],
        rows: [],
        totalScrapedRows: 0,
        sorting: {
            columnIdx: null,
            direction: "asc" // asc or desc
        },
        chartInstance: null,
        amazonChartInstance: null,
        imdbChartInstance: null,
        
        // Multi-portal state persistence
        portalsData: {
            generic: null,
            amazon: null,
            amazon_tracker: {
                products: [],
                selectedUrl: null
            },
            imdb: null
        }
    };

    // DOM Elements - Switcher
    const portalSelect = document.getElementById("portal-select");
    const appContainer = document.querySelector(".app-container");
    
    // Portal Sidebars
    const genericScraperConfig = document.getElementById("generic-scraper-config");
    const amazonScraperConfig = document.getElementById("amazon-scraper-config");
    const amazonTrackerConfig = document.getElementById("amazon-tracker-config");
    const amazonTrackerProductsSidebar = document.getElementById("amazon-tracker-products-sidebar-section");
    const imdbCreatorConfig = document.getElementById("imdb-creator-config");
    const cleaningSandbox = document.getElementById("cleaning-sandbox");

    // Portal Analytics layouts
    const analyticsViewGeneric = document.querySelector(".analytics-view-generic");
    const analyticsViewAmazon = document.querySelector(".analytics-view-amazon");
    const analyticsViewAmazonTracker = document.querySelector(".analytics-view-amazon-tracker");
    const analyticsViewImdb = document.querySelector(".analytics-view-imdb");

    // Generic Scraper DOM
    const presetSelect = document.getElementById("preset-select");
    const urlInput = document.getElementById("url-input");
    const extractionRadios = document.querySelectorAll('input[name="extraction-mode"]');
    const tableParams = document.getElementById("table-params");
    const selectorParams = document.getElementById("selector-params");
    const tableIndexInput = document.getElementById("table-index-input");
    const selectorInput = document.getElementById("selector-input");
    const runScraperBtn = document.getElementById("run-scraper-btn");
    
    // Amazon Reviews DOM
    const amazonUrlInput = document.getElementById("amazon-url-input");
    const amazonLimitInput = document.getElementById("amazon-limit-input");
    const runAmazonBtn = document.getElementById("run-amazon-btn");
    const amazonWordCloud = document.getElementById("amazon-word-cloud");
    const clearWordFilterBtn = document.getElementById("clear-word-filter-btn");
    
    // Amazon Tracker DOM
    const amazonTrackerUrlInput = document.getElementById("amazon-tracker-url-input");
    const amazonTrackerTargetPrice = document.getElementById("amazon-tracker-target-price");
    const amazonTrackerEmail = document.getElementById("amazon-tracker-email");
    const amazonTrackerTelegram = document.getElementById("amazon-tracker-telegram");
    const addAmazonTrackerBtn = document.getElementById("add-amazon-tracker-btn");
    const amazonTrackedProductsList = document.getElementById("amazon-tracked-products-list");
    const amazonTrackerSelectProduct = document.getElementById("amazon-tracker-select-product");
    const amazonTrackerDetailsPanel = document.getElementById("amazon-tracker-details-panel");
    const triggerAmazonDropSimulationBtn = document.getElementById("trigger-amazon-drop-simulation-btn");
    const btnDeleteTrackerAlert = document.getElementById("btn-delete-tracker-alert");
    const amazonTrackerConsoleTerminal = document.getElementById("amazon-tracker-console-terminal");

    // SMTP & Telegram Collapsible Settings
    const configToggle = document.getElementById("config-toggle");
    const configFields = document.getElementById("config-fields");
    const saveSmtpBtn = document.getElementById("save-smtp-btn");
    const saveTeleBtn = document.getElementById("save-tele-btn");
    const smtpHost = document.getElementById("smtp-host");
    const smtpPort = document.getElementById("smtp-port");
    const smtpUser = document.getElementById("smtp-user");
    const smtpPass = document.getElementById("smtp-pass");
    const teleToken = document.getElementById("tele-token");

    // IMDb Creator DOM
    const imdbLimitInput = document.getElementById("imdb-limit-input");
    const runImdbBtn = document.getElementById("run-imdb-btn");
    const imdbRecommendationsList = document.getElementById("imdb-recommendations-list");
    const predGenre = document.getElementById("pred-genre");
    const predDirector = document.getElementById("pred-director");
    const predYear = document.getElementById("pred-year");
    const predictRatingBtn = document.getElementById("predict-rating-btn");
    const predictionResultCard = document.getElementById("prediction-result-card");
    const predScoreText = document.getElementById("pred-score-text");
    const predExplanationText = document.getElementById("pred-explanation-text");

    // Cleaning Sandbox DOM
    const columnCheckboxes = document.getElementById("column-checkboxes");
    const filterTextInput = document.getElementById("filter-text-input");
    const dropEmptySwitch = document.getElementById("drop-empty-switch");
    const renameColsArea = document.getElementById("rename-cols-area");
    const applyCleanBtn = document.getElementById("apply-clean-btn");
    const resetCleanBtn = document.getElementById("reset-clean-btn");
    
    // Status Bar & Metrics DOM
    const activeDatasetName = document.getElementById("active-dataset-name");
    const statusBadge = document.getElementById("status-badge");
    const statusBadgeText = document.getElementById("status-badge-text");
    const statTotalRows = document.getElementById("stat-total-rows");
    const statTotalCols = document.getElementById("stat-total-cols");
    const statDataSource = document.getElementById("stat-data-source");
    
    // Overlay
    const loadingOverlay = document.getElementById("loading-overlay");
    const errorBanner = document.getElementById("error-banner");
    const errorBannerText = document.getElementById("error-banner-text");
    
    // Navigation Tabs DOM
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const gridMetaText = document.getElementById("grid-meta-text");
    const outputDataTable = document.getElementById("output-data-table");
    const sortResetBtn = document.getElementById("sort-reset-btn");
    
    // Generic Analytics DOM
    const chartColSelect = document.getElementById("chart-col-select");
    const chartValueSelect = document.getElementById("chart-value-select");
    const chartTypeBtns = document.querySelectorAll(".chart-type-btn");
    const statsSummaryContainer = document.getElementById("stats-summary-table-container");
    
    // Automation & Export DOM
    const pythonCodeBox = document.getElementById("python-code-box");
    const copyCodeBtn = document.getElementById("copy-code-btn");
    const downloadCsvBtn = document.getElementById("download-csv-btn");
    const downloadExcelBtn = document.getElementById("download-excel-btn");
    const downloadJsonBtn = document.getElementById("download-json-btn");
    const downloadDbBtn = document.getElementById("download-db-btn");

    // ==========================================
    // COLLAPSIBLE SETTINGS CONTROLLER
    // ==========================================
    configToggle.addEventListener("click", () => {
        configFields.classList.toggle("hidden");
        const arrow = configToggle.querySelector(".toggle-arrow");
        arrow.classList.toggle("fa-chevron-down");
        arrow.classList.toggle("fa-chevron-up");
    });

    saveSmtpBtn.addEventListener("click", async () => {
        const payload = {
            server: smtpHost.value.trim(),
            port: parseInt(smtpPort.value) || 587,
            user: smtpUser.value.trim(),
            password: smtpPass.value.trim()
        };
        try {
            const res = await fetch("/api/settings/smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchTrackerLogs();
            }
        } catch (err) {
            console.error("Failed to save SMTP settings", err);
        }
    });

    saveTeleBtn.addEventListener("click", async () => {
        const payload = {
            bot_token: teleToken.value.trim()
        };
        try {
            const res = await fetch("/api/settings/telegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchTrackerLogs();
            }
        } catch (err) {
            console.error("Failed to save Telegram settings", err);
        }
    });

    // ==========================================
    // INITIALIZATION & PORTAL MANAGER
    // ==========================================
    async function loadPresets() {
        try {
            const res = await fetch("/api/presets");
            if (res.ok) {
                state.presets = await res.json();
                state.presets.forEach(p => {
                    const opt = document.createElement("option");
                    opt.value = p.id;
                    opt.textContent = p.name;
                    presetSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error("Failed to load presets: ", err);
        }
    }
    loadPresets();

    extractionRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const mode = e.target.value;
            if (mode === "table") {
                tableParams.classList.remove("hidden");
                selectorParams.classList.add("hidden");
            } else if (mode === "selector") {
                tableParams.classList.add("hidden");
                selectorParams.classList.remove("hidden");
            } else {
                tableParams.classList.add("hidden");
                selectorParams.classList.add("hidden");
            }
        });
    });

    presetSelect.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const preset = state.presets.find(p => p.id === selectedId);
        if (preset) {
            urlInput.value = preset.url;
            extractionRadios.forEach(radio => {
                if (radio.value === preset.mode) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event("change"));
                }
            });

            if (preset.id === "gdp_wiki") {
                tableIndexInput.value = "2";
            } else if (preset.id === "tech_stocks") {
                tableIndexInput.value = "0";
            } else if (preset.id === "retail_catalog") {
                selectorInput.value = "div.product-card";
            } else if (preset.id === "amazon_reviews") {
                selectorInput.value = "div.review";
            } else if (preset.id === "imdb_movies") {
                tableIndexInput.value = "0";
            }
        }
    });

    portalSelect.addEventListener("change", (e) => {
        switchPortal(e.target.value);
    });

    function switchPortal(portal) {
        state.activePortal = portal;
        appContainer.className = "app-container portal-active-" + portal;

        const sidebarConfigs = [genericScraperConfig, amazonScraperConfig, amazonTrackerConfig, amazonTrackerProductsSidebar, imdbCreatorConfig, cleaningSandbox];
        const analyticsLayouts = [analyticsViewGeneric, analyticsViewAmazon, analyticsViewAmazonTracker, analyticsViewImdb];
        
        sidebarConfigs.forEach(el => el.classList.add("hidden"));
        analyticsLayouts.forEach(el => el.classList.add("hidden"));
        
        // Hide/Show next refresh card
        const scanCard = document.getElementById("scan-countdown-card");
        if (portal === "amazon_tracker") {
            scanCard.style.display = "flex";
        } else {
            scanCard.style.display = "none";
        }

        if (portal === "generic") {
            genericScraperConfig.classList.remove("hidden");
            analyticsViewGeneric.classList.remove("hidden");
            cleaningSandbox.classList.remove("hidden");
        } else if (portal === "amazon") {
            amazonScraperConfig.classList.remove("hidden");
            analyticsViewAmazon.classList.remove("hidden");
            cleaningSandbox.classList.remove("hidden");
        } else if (portal === "amazon_tracker") {
            amazonTrackerConfig.classList.remove("hidden");
            amazonTrackerProductsSidebar.classList.remove("hidden");
            analyticsViewAmazonTracker.classList.remove("hidden");
            fetchTrackedAmazonProducts();
            fetchTrackerLogs();
        } else if (portal === "imdb") {
            imdbCreatorConfig.classList.remove("hidden");
            analyticsViewImdb.classList.remove("hidden");
            cleaningSandbox.classList.remove("hidden");
        }

        // Restore portal-specific dataset if loaded previously
        const activeData = state.portalsData[portal];
        if (activeData && portal !== "amazon_tracker") {
            state.rawHeaders = activeData.rawHeaders;
            state.rawRows = activeData.rawRows;
            state.headers = activeData.headers;
            state.rows = activeData.rows;
            state.totalScrapedRows = activeData.totalScrapedRows;
            pythonCodeBox.textContent = activeData.codeSnippet;
            activeDatasetName.textContent = activeData.title;
            statDataSource.textContent = activeData.dataSource;
            
            if (portal === "amazon") {
                document.getElementById("amazon-product-name-title").textContent = activeData.title;
            }
            
            initializeCleaningOptions();
            applyDataPipeline();
            updateStatus("Dataset Restored", "green");
        } else if (portal === "amazon_tracker") {
            activeDatasetName.textContent = "Amazon Multi-Product Price Tracker";
            statDataSource.textContent = "SQLite database Engine";
            updateStatus("Price Alert Engine Operational", "green");
            syncAmazonStateToDataGrid();
        } else {
            // Reset to empty state
            state.rawHeaders = [];
            state.rawRows = [];
            state.headers = [];
            state.rows = [];
            state.totalScrapedRows = 0;
            activeDatasetName.textContent = "No active dataset loaded.";
            statDataSource.textContent = "None";
            pythonCodeBox.textContent = "# Code will populate here once a scrape operation is completed.";
            renderGrid();
            updateMetrics();
            updateStatus("Idle", "grey");
        }
    }

    // ==========================================
    // API CALLS - SCAPERS
    // ==========================================
    runScraperBtn.addEventListener("click", async () => {
        const url = urlInput.value.trim();
        if (!url) {
            showError("Please enter a valid target URL.");
            return;
        }

        const mode = document.querySelector('input[name="extraction-mode"]:checked').value;
        const selector = selectorInput.value.trim();
        const tableIndex = tableIndexInput.value || 0;
        const presetId = presetSelect.value;

        errorBanner.classList.add("hidden");
        loadingOverlay.classList.remove("hidden");
        updateStatus("Scraping...", "blue");

        try {
            const response = await fetch("/api/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, mode, selector, tableIndex, presetId })
            });
            const result = await response.json();
            
            if (result.success) {
                state.rawHeaders = result.headers;
                state.rawRows = result.rows;
                state.totalScrapedRows = result.total_rows;
                state.headers = [...result.headers];
                state.rows = JSON.parse(JSON.stringify(result.rows));
                
                state.sorting = { columnIdx: null, direction: "asc" };
                sortResetBtn.classList.add("hidden");

                state.portalsData.generic = {
                    rawHeaders: state.rawHeaders,
                    rawRows: state.rawRows,
                    headers: state.headers,
                    rows: state.rows,
                    totalScrapedRows: state.totalScrapedRows,
                    title: result.title,
                    dataSource: result.is_fallback ? "Local Offline Cache" : "Live Target Server",
                    codeSnippet: result.code_snippet
                };

                activeDatasetName.textContent = result.title;
                statDataSource.textContent = result.is_fallback ? "Local Offline Cache" : "Live Target Server";
                pythonCodeBox.textContent = result.code_snippet;

                initializeCleaningOptions();
                applyDataPipeline();
                updateStatus("Dataset Ready", "green");
            } else {
                showError(result.error || "Failed to extract data.");
                updateStatus("Failed", "red");
            }
        } catch (err) {
            showError(`Network connection failed: ${err.message}`);
            updateStatus("Connection Error", "red");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    runAmazonBtn.addEventListener("click", async () => {
        const url = amazonUrlInput.value.trim();
        const limit = amazonLimitInput.value || 10;
        if (!url) {
            showError("Please enter an Amazon reviews URL.");
            return;
        }

        errorBanner.classList.add("hidden");
        loadingOverlay.classList.remove("hidden");
        updateStatus("Scraping Reviews...", "blue");

        try {
            const response = await fetch("/api/amazon/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, limit })
            });
            const result = await response.json();

            if (result.success) {
                state.rawHeaders = result.headers;
                state.rawRows = result.rows;
                state.totalScrapedRows = result.total_rows;
                state.headers = [...result.headers];
                state.rows = JSON.parse(JSON.stringify(result.rows));
                
                state.sorting = { columnIdx: null, direction: "asc" };
                sortResetBtn.classList.add("hidden");

                state.portalsData.amazon = {
                    rawHeaders: state.rawHeaders,
                    rawRows: state.rawRows,
                    headers: state.headers,
                    rows: state.rows,
                    totalScrapedRows: state.totalScrapedRows,
                    title: result.title,
                    dataSource: "Reviews Scraper Parser",
                    codeSnippet: result.code_snippet,
                    wordCloud: result.word_cloud,
                    metrics: result.metrics
                };

                activeDatasetName.textContent = result.title;
                pythonCodeBox.textContent = result.code_snippet;

                initializeCleaningOptions();
                applyDataPipeline();

                document.getElementById("amazon-product-name-title").textContent = result.title;
                document.getElementById("amazon-avg-rating").textContent = result.metrics.avg_rating;
                document.getElementById("amazon-pos-ratio").textContent = result.metrics.pos_percent + "%";
                document.getElementById("amazon-pos-count").textContent = result.metrics.pos_count;
                document.getElementById("amazon-neu-count").textContent = result.metrics.neu_count;
                document.getElementById("amazon-neg-count").textContent = result.metrics.neg_count;

                renderWordCloud(result.word_cloud);
                drawAmazonChart(result.metrics);
                renderAmazonReviewsTable(result.headers, result.rows);

                updateStatus("Reviews Scraped", "green");
            } else {
                showError(result.error || "Failed to analyze reviews.");
                updateStatus("Failed", "red");
            }
        } catch (err) {
            showError(`Analyzer request failed: ${err.message}`);
            updateStatus("Error", "red");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    function renderWordCloud(frequencies) {
        amazonWordCloud.innerHTML = "";
        if (!frequencies || frequencies.length === 0) {
            amazonWordCloud.innerHTML = `<p class="light-text">No words found.</p>`;
            return;
        }
        const max = Math.max(...frequencies.map(w => w[1]));
        frequencies.forEach(([word, count]) => {
            const span = document.createElement("span");
            span.className = "cloud-word";
            span.textContent = word;
            const weight = max > 1 ? (count / max) : 0.5;
            span.style.fontSize = (11 + Math.round(weight * 20)) + "px";
            span.style.color = `hsl(${190 + Math.round(weight * 55)}, 85%, 65%)`;
            span.title = `Count: ${count}`;

            span.addEventListener("click", () => {
                filterTextInput.value = word;
                clearWordFilterBtn.classList.remove("hidden");
                applyDataPipeline();
            });
            amazonWordCloud.appendChild(span);
        });
    }

    clearWordFilterBtn.addEventListener("click", () => {
        filterTextInput.value = "";
        clearWordFilterBtn.classList.add("hidden");
        applyDataPipeline();
    });

    function drawAmazonChart(metrics) {
        if (state.amazonChartInstance) {
            state.amazonChartInstance.destroy();
            state.amazonChartInstance = null;
        }
        const ctx = document.getElementById("amazon-sentiment-chart").getContext("2d");
        state.amazonChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["Positive", "Neutral", "Negative"],
                datasets: [{
                    data: [metrics.pos_count, metrics.neu_count, metrics.neg_count],
                    backgroundColor: ['rgba(57, 185, 93, 0.85)', 'rgba(56, 139, 253, 0.85)', 'rgba(248, 81, 73, 0.85)'],
                    borderColor: 'transparent'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#8b949e', font: { family: 'Outfit', weight: 'bold' } }
                    }
                }
            }
        });
    }

    function renderAmazonReviewsTable(headers, rows) {
        const thead = document.getElementById('amazon-reviews-headers');
        const tbody = document.getElementById('amazon-reviews-rows');
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            tr.appendChild(th);
        });
        thead.appendChild(tr);

        rows.forEach(row => {
            const trData = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                trData.appendChild(td);
            });
            tbody.appendChild(trData);
        });
    }

    // ==========================================
    // SQLITE AMAZON PRICE TRACKER CONTROLLERS
    // ==========================================
    async function fetchTrackedAmazonProducts() {
        try {
            const response = await fetch("/api/products");
            const result = await response.json();
            if (result.success) {
                state.portalsData.amazon_tracker.products = result.products;
                renderTrackedAmazonProductsList(result.products);
                updateTrackerSelectDropdown(result.products);
                
                // Auto-select first product if none is selected
                if (result.products.length > 0) {
                    let selectedUrl = state.portalsData.amazon_tracker.selectedUrl;
                    let selectedId = null;
                    if (selectedUrl) {
                        const active = result.products.find(p => p.url === selectedUrl);
                        if (active) selectedId = active.id;
                    }
                    if (!selectedId) {
                        state.portalsData.amazon_tracker.selectedUrl = result.products[0].url;
                        selectedId = result.products[0].id;
                    }
                    
                    // Highlight the active card in the sidebar
                    setTimeout(() => {
                        const cards = amazonTrackedProductsList.querySelectorAll(".tracked-item-card");
                        cards.forEach((card, idx) => {
                            if (result.products[idx].id === selectedId) {
                                card.classList.add("active-card");
                            } else {
                                card.classList.remove("active-card");
                            }
                        });
                    }, 50);
                    
                    showAmazonProductDetails(selectedId);
                } else {
                    syncAmazonStateToDataGrid();
                }
            }
        } catch (err) {
            console.error("Failed to load tracked products list", err);
        }
    }

    function renderTrackedAmazonProductsList(products) {
        amazonTrackedProductsList.innerHTML = "";
        if (products.length === 0) {
            amazonTrackedProductsList.innerHTML = `<p class="light-text text-center" style="padding: 12px;">No products tracked yet.</p>`;
            return;
        }
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "tracked-item-card";
            if (state.portalsData.amazon_tracker.selectedUrl === p.url) {
                card.classList.add("active-card");
            }
            const statusClass = p.alert_sent === 1 ? "triggered" : "active";
            const statusLabel = p.alert_sent === 1 ? "🚨 TRIGGERED" : "🔔 ACTIVE";
            const symbol = p.currency || "$";
            
            const currPriceVal = p.current_price !== null && p.current_price !== undefined ? p.current_price.toLocaleString() : "N/A";
            const targetPriceVal = p.target_price !== null && p.target_price !== undefined ? p.target_price.toLocaleString() : "N/A";
            const discPercent = (p.original_price > 0 && p.current_price !== null && p.current_price !== undefined) ? Math.round((p.original_price - p.current_price) / p.original_price * 100) : 0;

            card.innerHTML = `
                <h4>${p.name}</h4>
                <div class="tracked-item-prices">
                    <span>Curr: <strong>${symbol}${currPriceVal}</strong></span>
                    <span>Target: <strong>${symbol}${targetPriceVal}</strong></span>
                </div>
                <div class="tracked-item-status">
                    <span class="badge-status ${statusClass}">${statusLabel}</span>
                    <span class="light-text">${discPercent}% Off</span>
                </div>
            `;
            card.addEventListener("click", () => {
                state.portalsData.amazon_tracker.selectedUrl = p.url;
                amazonTrackerProductsSidebar.querySelectorAll(".tracked-item-card").forEach(el => el.classList.remove("active-card"));
                card.classList.add("active-card");
                amazonTrackerSelectProduct.value = p.id;
                showAmazonProductDetails(p.id);
            });
            amazonTrackedProductsList.appendChild(card);
        });
    }

    function updateTrackerSelectDropdown(products) {
        amazonTrackerSelectProduct.innerHTML = '<option value="">-- Select Tracked Product to Plot --</option>';
        products.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            const priceText = p.current_price !== null && p.current_price !== undefined ? p.current_price : 'N/A';
            opt.textContent = `${p.name} (${p.currency}${priceText})`;
            amazonTrackerSelectProduct.appendChild(opt);
        });
        if (state.portalsData.amazon_tracker.selectedUrl) {
            const active = state.portalsData.amazon_tracker.products.find(p => p.url === state.portalsData.amazon_tracker.selectedUrl);
            if (active) amazonTrackerSelectProduct.value = active.id;
        }
    }

    amazonTrackerSelectProduct.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
            const prod = state.portalsData.amazon_tracker.products.find(p => p.id == val);
            if (prod) {
                state.portalsData.amazon_tracker.selectedUrl = prod.url;
                showAmazonProductDetails(prod.id);
                fetchTrackedAmazonProducts();
            }
        } else {
            amazonTrackerDetailsPanel.classList.add("hidden");
        }
    });

    async function showAmazonProductDetails(productId) {
        amazonTrackerDetailsPanel.classList.remove("hidden");
        try {
            const res = await fetch(`/api/product/${productId}`);
            const result = await res.json();
            if (result.success) {
                const product = result.product;
                document.getElementById("ap-detail-img").src = product.image_url || "https://via.placeholder.com/150";
                document.getElementById("ap-detail-name").textContent = product.name;
                const symbol = product.currency || "$";
                
                const currPriceVal = product.current_price !== null && product.current_price !== undefined ? product.current_price.toLocaleString() : "N/A";
                const targetPriceVal = product.target_price !== null && product.target_price !== undefined ? product.target_price.toLocaleString() : "N/A";
                const originalPriceVal = product.original_price !== null && product.original_price !== undefined ? product.original_price.toLocaleString() : "N/A";
                
                document.getElementById("ap-detail-curr").textContent = `${symbol}${currPriceVal}`;
                document.getElementById("ap-detail-thresh").textContent = `${symbol}${targetPriceVal}`;
                document.getElementById("ap-detail-orig").textContent = `${symbol}${originalPriceVal}`;
                
                const discPercent = (product.original_price > 0 && product.current_price !== null && product.current_price !== undefined) ? Math.round((product.original_price - product.current_price) / product.original_price * 100) : 0;
                document.getElementById("ap-detail-disc").textContent = `${discPercent}% OFF`;
                
                const statusBadge = document.getElementById("ap-detail-status-badge");
                if (product.alert_sent === 1) {
                    statusBadge.textContent = "🚨 TRIGGERED";
                    statusBadge.className = "text-error";
                } else {
                    statusBadge.textContent = "🔔 ACTIVE";
                    statusBadge.className = "text-success";
                }

                // Render history list table
                const historyBody = document.getElementById("tracker-history-body");
                historyBody.innerHTML = "";
                result.history.forEach(h => {
                    const tr = document.createElement("tr");
                    const priceVal = h.price !== null && h.price !== undefined ? h.price.toLocaleString() : "N/A";
                    tr.innerHTML = `<td>${h.timestamp}</td><td><strong>${symbol}${priceVal}</strong></td>`;
                    historyBody.appendChild(tr);
                });

                // Plot Plotly Graph
                if (result.graph_json) {
                    const graphData = JSON.parse(result.graph_json);
                    Plotly.newPlot('plotly-price-chart', graphData.data, graphData.layout, {responsive: true, displayModeBar: false});
                }
                
                syncAmazonStateToDataGrid(product, result.history);
            }
        } catch (err) {
            console.error("Failed to load details", err);
        }
    }

    addAmazonTrackerBtn.addEventListener("click", async () => {
        const url = amazonTrackerUrlInput.value.trim();
        const target_price = parseFloat(amazonTrackerTargetPrice.value);
        const email = amazonTrackerEmail.value.trim();
        const telegram_id = amazonTrackerTelegram.value.trim();

        if (!url || isNaN(target_price)) {
            showError("Product Link URL and Target Price are required.");
            return;
        }

        errorBanner.classList.add("hidden");
        updateStatus("Tracking...", "blue");

        try {
            const res = await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, target_price, email, telegram_id })
            });
            const result = await res.json();
            if (result.success) {
                amazonTrackerUrlInput.value = "";
                amazonTrackerTargetPrice.value = "";
                amazonTrackerEmail.value = "";
                amazonTrackerTelegram.value = "";
                
                state.portalsData.amazon_tracker.selectedUrl = url;
                await fetchTrackedAmazonProducts();
                showAmazonProductDetails(result.product_id);
                fetchTrackerLogs();
                updateStatus("Product Tracked", "green");
            } else {
                showError(result.error || "Failed to setup tracker.");
                updateStatus("Failed", "red");
            }
        } catch (err) {
            showError("Failed to issue request to server.");
            updateStatus("Error", "red");
        }
    });

    triggerAmazonDropSimulationBtn.addEventListener("click", async () => {
        const selectedId = amazonTrackerSelectProduct.value;
        if (!selectedId) return;
        updateStatus("Simulating drop...", "blue");
        try {
            const res = await fetch(`/api/product/${selectedId}/simulate_drop`, { method: "POST" });
            const result = await res.json();
            if (result.success) {
                await fetchTrackedAmazonProducts();
                await showAmazonProductDetails(selectedId);
                fetchTrackerLogs();
                updateStatus("Alerts Dispatched", "green");
            }
        } catch (err) {
            showError("Simulation request failed.");
        }
    });

    btnDeleteTrackerAlert.addEventListener("click", async () => {
        const selectedId = amazonTrackerSelectProduct.value;
        if (!selectedId) return;
        if (!confirm("Stop tracking this product?")) return;
        try {
            const res = await fetch(`/api/product/${selectedId}`, { method: "DELETE" });
            if (res.ok) {
                state.portalsData.amazon_tracker.selectedUrl = null;
                amazonTrackerDetailsPanel.classList.add("hidden");
                await fetchTrackedAmazonProducts();
                fetchTrackerLogs();
                updateStatus("Tracker Removed", "green");
            }
        } catch (err) {
            showError("Failed to delete product tracker.");
        }
    });

    async function fetchTrackerLogs() {
        try {
            const res = await fetch("/api/logs");
            const result = await res.json();
            if (result.success) {
                amazonTrackerConsoleTerminal.innerHTML = "";
                result.logs.forEach(log => {
                    const div = document.createElement("div");
                    div.className = "terminal-line";
                    if (log.includes("EMAIL")) div.classList.add("email");
                    else if (log.includes("TELEGRAM")) div.classList.add("telegram");
                    else div.classList.add("system");
                    div.textContent = log;
                    amazonTrackerConsoleTerminal.appendChild(div);
                });
                amazonTrackerConsoleTerminal.scrollTop = amazonTrackerConsoleTerminal.scrollHeight;
            }
        } catch (err) {
            console.error("Failed to load logs", err);
        }
    }

    function syncAmazonStateToDataGrid(product, history) {
        if (product && history) {
            state.rawHeaders = ["Date & Time", "Price", "Product Name", "Alert Threshold", "Email Notification", "Telegram Chat ID"];
            state.rawRows = history.map(h => {
                const priceStr = h.price !== null && h.price !== undefined ? h.price.toString() : "N/A";
                const targetPriceStr = product.target_price !== null && product.target_price !== undefined ? product.target_price.toString() : "N/A";
                return [
                    h.timestamp,
                    product.currency + priceStr,
                    product.name,
                    product.currency + targetPriceStr,
                    product.email || "N/A",
                    product.telegram_chat_id || "N/A"
                ];
            });
        } else {
            const selectedUrl = state.portalsData.amazon_tracker.selectedUrl;
            const activeProd = state.portalsData.amazon_tracker.products.find(p => p.url === selectedUrl);
            
            if (activeProd) {
                const currPriceStr = activeProd.current_price !== null && activeProd.current_price !== undefined ? activeProd.current_price.toString() : "N/A";
                const targetPriceStr = activeProd.target_price !== null && activeProd.target_price !== undefined ? activeProd.target_price.toString() : "N/A";
                state.rawHeaders = ["Product Name", "Current Price", "Alert Target", "Email Alert", "Status"];
                state.rawRows = [[
                    activeProd.name, currPriceStr, targetPriceStr, activeProd.email || "N/A", activeProd.alert_sent === 1 ? "Triggered" : "Active"
                ]];
            } else {
                state.rawHeaders = ["Product Name", "Current Price", "Alert Target", "Email Alert", "Status"];
                state.rawRows = state.portalsData.amazon_tracker.products.map(p => {
                    const currPriceStr = p.current_price !== null && p.current_price !== undefined ? p.current_price.toString() : "N/A";
                    const targetPriceStr = p.target_price !== null && p.target_price !== undefined ? p.target_price.toString() : "N/A";
                    return [
                        p.name, currPriceStr, targetPriceStr, p.email || "N/A", p.alert_sent === 1 ? "Triggered" : "Active"
                    ];
                });
            }
        }
        state.headers = [...state.rawHeaders];
        state.rows = JSON.parse(JSON.stringify(state.rawRows));
        state.totalScrapedRows = state.rawRows.length;
        
        initializeCleaningOptions();
        applyDataPipeline();
    }

    // ==========================================
    // IMDb PORTAL CONTROLLER
    // ==========================================
    runImdbBtn.addEventListener("click", async () => {
        const limit = imdbLimitInput.value || 15;
        errorBanner.classList.add("hidden");
        loadingOverlay.classList.remove("hidden");
        updateStatus("Scraping IMDb...", "blue");

        try {
            const response = await fetch("/api/imdb/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ limit })
            });
            const result = await response.json();

            if (result.success) {
                state.rawHeaders = result.headers;
                state.rawRows = result.rows;
                state.totalScrapedRows = result.total_rows;
                state.headers = [...result.headers];
                state.rows = JSON.parse(JSON.stringify(result.rows));
                
                state.sorting = { columnIdx: null, direction: "asc" };
                sortResetBtn.classList.add("hidden");

                state.portalsData.imdb = {
                    rawHeaders: state.rawHeaders,
                    rawRows: state.rawRows,
                    headers: state.headers,
                    rows: state.rows,
                    totalScrapedRows: state.totalScrapedRows,
                    title: result.title,
                    dataSource: "IMDb Crawler",
                    codeSnippet: result.code_snippet
                };

                activeDatasetName.textContent = result.title;
                pythonCodeBox.textContent = result.code_snippet;

                initializeCleaningOptions();
                applyDataPipeline();

                drawImdbGenreChart(result.rows);
                updateStatus("IMDb Chart Scraped", "green");
            } else {
                showError(result.error || "Failed to load IMDb.");
                updateStatus("Failed", "red");
            }
        } catch (err) {
            showError(`IMDb requests failed: ${err.message}`);
            updateStatus("Error", "red");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    function drawImdbGenreChart(rows) {
        if (state.imdbChartInstance) {
            state.imdbChartInstance.destroy();
            state.imdbChartInstance = null;
        }
        // Group and count genres
        const genreCounts = {};
        rows.forEach(r => {
            const genres = r[7].split(",");
            genres.forEach(g => {
                const name = g.strip ? g.strip() : g.trim();
                genreCounts[name] = (genreCounts[name] || 0) + 1;
            });
        });

        const labels = Object.keys(genreCounts);
        const counts = Object.values(genreCounts);

        const ctx = document.getElementById("imdb-genre-chart").getContext("2d");
        state.imdbChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Movie Count",
                    data: counts,
                    backgroundColor: 'rgba(255, 153, 0, 0.7)',
                    borderColor: '#ff9900',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#8b949e' } }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e' } },
                    x: { grid: { display: false }, ticks: { color: '#8b949e' } }
                }
            }
        });
    }

    predictRatingBtn.addEventListener("click", async () => {
        const genre = predGenre.value;
        const director = predDirector.value.trim();
        const year = predYear.value;

        if (!director) {
            alert("Director name required.");
            return;
        }
        try {
            const res = await fetch("/api/imdb/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ genre, director, year })
            });
            const result = await res.json();
            if (result.success) {
                predictionResultCard.classList.remove("hidden");
                predScoreText.textContent = result.predicted_rating;
                predExplanationText.textContent = result.explanation;
            }
        } catch (err) {
            console.error("Failed model prediction request", err);
        }
    });

    function triggerImdbRecommendations(movieRow) {
        const title = movieRow[1];
        fetch("/api/imdb/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movie_title: title })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                imdbRecommendationsList.innerHTML = "";
                result.recommendations.forEach(r => {
                    const card = document.createElement("div");
                    card.className = "recommendation-item-card";
                    card.innerHTML = `
                        <div class="rec-title-info">
                            <h5>${r.title}</h5>
                            <span>${r.year} | Rating: ${r.rating} | Dir: ${r.director}</span>
                        </div>
                        <div class="rec-score-badge">${r.score}% Match</div>
                    `;
                    imdbRecommendationsList.appendChild(card);
                });
            } else {
                imdbRecommendationsList.innerHTML = `<p class="light-text">${result.error}</p>`;
            }
        })
        .catch(err => console.error("Similarity matching error", err));
    }

    // ==========================================
    // SANDBOX PIPELINE & GRID RENDERER
    // ==========================================
    function updateStatus(text, colorClass) {
        statusBadgeText.textContent = text;
        const dot = statusBadge.querySelector(".pulse-dot");
        dot.className = `pulse-dot ${colorClass}`;
    }

    function showError(msg) {
        errorBannerText.textContent = msg;
        errorBanner.classList.remove("hidden");
        errorBanner.scrollIntoView({ behavior: "smooth" });
    }

    function initializeCleaningOptions() {
        columnCheckboxes.innerHTML = "";
        state.rawHeaders.forEach((h, idx) => {
            const label = document.createElement("label");
            label.className = "checkbox-item";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = true;
            input.value = h;
            input.dataset.index = idx;
            label.appendChild(input);
            label.appendChild(document.createTextNode(h));
            columnCheckboxes.appendChild(label);
        });
        filterTextInput.value = "";
        dropEmptySwitch.checked = false;
        renameColsArea.value = "";
    }

    function applyDataPipeline() {
        if (state.rawHeaders.length === 0) return;

        const activeCbs = columnCheckboxes.querySelectorAll("input:checked");
        const keepIdx = Array.from(activeCbs).map(cb => parseInt(cb.dataset.index));
        
        let workingHeaders = keepIdx.map(idx => state.rawHeaders[idx]);
        let workingRows = state.rawRows.map(row => keepIdx.map(idx => row[idx] || ""));

        // Rename columns OLD=NEW
        const renameText = renameColsArea.value.trim();
        if (renameText) {
            const pairs = renameText.split("\n");
            pairs.forEach(p => {
                const parts = p.split("=");
                if (parts.length === 2) {
                    const oldCol = parts[0].trim();
                    const newCol = parts[1].trim();
                    const hIdx = workingHeaders.indexOf(oldCol);
                    if (hIdx !== -1) workingHeaders[hIdx] = newCol;
                }
            });
        }

        // Drop rows with empty fields
        if (dropEmptySwitch.checked) {
            workingRows = workingRows.filter(row => !row.some(cell => !cell.toString().trim()));
        }

        // Keyword row filter
        const filterVal = filterTextInput.value.trim().toLowerCase();
        if (filterVal) {
            workingRows = workingRows.filter(row => row.some(cell => cell.toString().toLowerCase().includes(filterVal)));
        }

        state.headers = workingHeaders;
        state.rows = workingRows;
        
        // Apply Sort if active
        if (state.sorting.columnIdx !== null) {
            sortRows(state.sorting.columnIdx, state.sorting.direction);
        }

        renderGrid();
        updateMetrics();
        populateAnalyticsSelectors();
    }

    applyCleanBtn.addEventListener("click", () => {
        applyDataPipeline();
        showError("Clean filters applied to dataset.");
        setTimeout(() => errorBanner.classList.add("hidden"), 2000);
    });

    resetCleanBtn.addEventListener("click", () => {
        state.headers = [...state.rawHeaders];
        state.rows = JSON.parse(JSON.stringify(state.rawRows));
        state.sorting = { columnIdx: null, direction: "asc" };
        sortResetBtn.classList.add("hidden");
        initializeCleaningOptions();
        renderGrid();
        updateMetrics();
        populateAnalyticsSelectors();
    });

    function renderGrid() {
        const thead = outputDataTable.querySelector("thead");
        const tbody = outputDataTable.querySelector("tbody");
        thead.innerHTML = "";
        tbody.innerHTML = "";

        if (state.headers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="100%" class="empty-table-placeholder"><i class="fa-solid fa-folder-open"></i><p>No active columns select. Select headers in sandbox.</p></td></tr>`;
            gridMetaText.textContent = "Showing 0 of 0 rows.";
            return;
        }

        // Header
        const trH = document.createElement("tr");
        state.headers.forEach((h, idx) => {
            const th = document.createElement("th");
            th.className = "sortable";
            th.textContent = h;
            if (state.sorting.columnIdx === idx) {
                th.classList.add(state.sorting.direction === "asc" ? "sort-asc" : "sort-desc");
            }
            th.addEventListener("click", () => {
                const dir = (state.sorting.columnIdx === idx && state.sorting.direction === "asc") ? "desc" : "asc";
                state.sorting = { columnIdx: idx, direction: dir };
                sortResetBtn.classList.remove("hidden");
                applyDataPipeline();
            });
            trH.appendChild(th);
        });
        thead.appendChild(trH);

        // Body Rows
        if (state.rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="100%" class="empty-table-placeholder"><i class="fa-solid fa-folder-open"></i><p>No rows match filters.</p></td></tr>`;
            gridMetaText.textContent = `Showing 0 of ${state.totalScrapedRows} rows.`;
            return;
        }

        state.rows.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            // IMDb clickable recommendations hook
            if (state.activePortal === "imdb") {
                tr.style.cursor = "pointer";
                tr.addEventListener("click", () => triggerImdbRecommendations(row));
            }
            tbody.appendChild(tr);
        });

        gridMetaText.textContent = `Showing ${state.rows.length} of ${state.totalScrapedRows} rows.`;
    }

    sortResetBtn.addEventListener("click", () => {
        state.sorting = { columnIdx: null, direction: "asc" };
        sortResetBtn.classList.add("hidden");
        applyDataPipeline();
    });

    function sortRows(colIdx, direction) {
        state.rows.sort((a, b) => {
            let valA = a[colIdx] ? a[colIdx].toString() : "";
            let valB = b[colIdx] ? b[colIdx].toString() : "";

            const cleanA = valA.replace(/[$,%,₹]/g, "").trim();
            const cleanB = valB.replace(/[$,%,₹]/g, "").trim();
            if (!isNaN(cleanA) && !isNaN(cleanB)) {
                return direction === "asc" ? parseFloat(cleanA) - parseFloat(cleanB) : parseFloat(cleanB) - parseFloat(cleanA);
            }
            return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }

    function updateMetrics() {
        const label1 = document.querySelector(".stats-grid .stat-card:nth-child(1) .stat-label");
        const value1 = document.getElementById("stat-total-rows");
        const icon1  = document.querySelector(".stats-grid .stat-card:nth-child(1) i");

        const label2 = document.querySelector(".stats-grid .stat-card:nth-child(2) .stat-label");
        const value2 = document.getElementById("stat-total-cols");
        const icon2  = document.querySelector(".stats-grid .stat-card:nth-child(2) i");

        const label3 = document.querySelector(".stats-grid .stat-card:nth-child(3) .stat-label");
        const value3 = document.getElementById("stat-data-source");
        const icon3  = document.querySelector(".stats-grid .stat-card:nth-child(3) i");

        if (!label1 || !value1 || !label2 || !value2 || !label3 || !value3) return;

        if (state.activePortal === "generic") {
            label1.textContent = "Total Rows Scraped";
            value1.textContent = state.totalScrapedRows;
            if (icon1) icon1.className = "fa-solid fa-grip-lines";

            label2.textContent = "Columns Identified";
            value2.textContent = state.rawHeaders.length;
            if (icon2) icon2.className = "fa-solid fa-columns";

            label3.textContent = "Engine Connection";
            value3.textContent = statDataSource.textContent || "None";
            if (icon3) icon3.className = "fa-solid fa-bolt";
        } 
        else if (state.activePortal === "amazon") {
            label1.textContent = "Reviews Analyzed";
            value1.textContent = state.totalScrapedRows;
            if (icon1) icon1.className = "fa-solid fa-comments";

            label2.textContent = "Average Rating";
            value2.textContent = state.portalsData.amazon ? state.portalsData.amazon.metrics.avg_rating + " / 5.0" : "0.0 / 5.0";
            if (icon2) icon2.className = "fa-solid fa-star";

            label3.textContent = "Positive Sentiment";
            value3.textContent = state.portalsData.amazon ? state.portalsData.amazon.metrics.pos_percent + "%" : "0%";
            if (icon3) icon3.className = "fa-solid fa-face-smile";
        } 
        else if (state.activePortal === "amazon_tracker") {
            const prods = state.portalsData.amazon_tracker.products;
            let avg = 0;
            if (prods.length > 0) {
                const sum = prods.reduce((a, b) => a + (b.target_price || 0), 0);
                avg = Math.round(sum / prods.length);
            }
            const symbol = prods.length > 0 ? (prods[0].currency || "$") : "$";
            const alertsCount = prods.filter(p => p.alert_sent === 1).length;

            label1.textContent = "Total Products Tracked";
            value1.textContent = prods.length + " Items";
            if (icon1) icon1.className = "fa-solid fa-box-open";

            label2.textContent = "Avg Target Price";
            value2.textContent = symbol + avg.toLocaleString();
            if (icon2) icon2.className = "fa-solid fa-hand-holding-dollar";

            label3.textContent = "Alerts Dispatched";
            value3.textContent = alertsCount + " Triggered";
            if (icon3) icon3.className = "fa-solid fa-bell";
        } 
        else if (state.activePortal === "imdb") {
            let avgRating = 0.0;
            if (state.rows.length > 0) {
                const rIdx = state.headers.indexOf("IMDb Rating");
                if (rIdx !== -1) {
                    const sum = state.rows.reduce((a, b) => a + (parseFloat(b[rIdx]) || 0), 0);
                    avgRating = (sum / state.rows.length).toFixed(1);
                }
            }
            let topGenre = "N/A";
            if (state.rows.length > 0) {
                const gIdx = state.headers.indexOf("Genre");
                if (gIdx !== -1) {
                    const counts = {};
                    state.rows.forEach(r => {
                        const genres = r[gIdx].split(",");
                        genres.forEach(g => {
                            const name = g.trim();
                            if (name) counts[name] = (counts[name] || 0) + 1;
                        });
                    });
                    let maxCount = 0;
                    Object.keys(counts).forEach(g => {
                        if (counts[g] > maxCount) {
                            maxCount = counts[g];
                            topGenre = g;
                        }
                    });
                }
            }

            label1.textContent = "Top Movies Crawled";
            value1.textContent = state.totalScrapedRows + " Movies";
            if (icon1) icon1.className = "fa-solid fa-film";

            label2.textContent = "Average IMDb Rating";
            value2.textContent = avgRating + " / 10";
            if (icon2) icon2.className = "fa-solid fa-star-half-stroke";

            label3.textContent = "Predominant Genre";
            value3.textContent = topGenre;
            if (icon3) icon3.className = "fa-solid fa-masks-theater";
        }
    }

    // ==========================================
    // DATA ANALYTICS PLOTTERS (Generic Chart.js)
    // ==========================================
    function populateAnalyticsSelectors() {
        if (state.headers.length === 0) return;
        const currentX = chartColSelect.value;
        const currentY = chartValueSelect.value;

        chartColSelect.innerHTML = "";
        chartValueSelect.innerHTML = '<option value="_count">-- Row Count Aggregate --</option>';

        state.headers.forEach(h => {
            const opt1 = document.createElement("option");
            opt1.value = h;
            opt1.textContent = h;
            chartColSelect.appendChild(opt1);

            const opt2 = document.createElement("option");
            opt2.value = h;
            opt2.textContent = h;
            chartValueSelect.appendChild(opt2);
        });

        if (state.headers.includes(currentX)) chartColSelect.value = currentX;
        if (currentY === "_count" || state.headers.includes(currentY)) chartValueSelect.value = currentY;

        triggerAnalyticsCompilation();
    }

    chartColSelect.addEventListener("change", triggerAnalyticsCompilation);
    chartValueSelect.addEventListener("change", triggerAnalyticsCompilation);

    chartTypeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            chartTypeBtns.forEach(b => b.classList.remove("active"));
            const targetBtn = e.target.closest(".chart-type-btn");
            targetBtn.classList.add("active");
            triggerAnalyticsCompilation();
        });
    });

    function triggerAnalyticsCompilation() {
        if (state.rows.length === 0 || state.headers.length === 0) return;

        const xCol = chartColSelect.value;
        const yCol = chartValueSelect.value;
        const xIdx = state.headers.indexOf(xCol);
        const yIdx = state.headers.indexOf(yCol);

        if (xIdx === -1) return;

        const groups = {};
        state.rows.forEach(row => {
            const key = row[xIdx] || "N/A";
            if (!groups[key]) groups[key] = [];
            
            if (yCol === "_count") {
                groups[key].push(1);
            } else if (yIdx !== -1) {
                const val = parseFloat(row[yIdx].toString().replace(/[^\d.-]/g, "")) || 0;
                groups[key].push(val);
            }
        });

        const labels = Object.keys(groups);
        const values = labels.map(k => {
            const arr = groups[k];
            return yCol === "_count" ? arr.length : arr.reduce((a,b) => a+b, 0); // sum values
        });

        drawGenericChart(labels, values, yCol === "_count" ? "Row Count" : xCol);
        drawDescriptiveStatsTable(values);
    }

    function drawGenericChart(labels, values, labelName) {
        if (state.chartInstance) {
            state.chartInstance.destroy();
            state.chartInstance = null;
        }
        const canvas = document.getElementById("analytics-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const type = document.querySelector(".chart-type-btn.active").dataset.type;

        state.chartInstance = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: labelName,
                    data: values,
                    backgroundColor: 'rgba(56, 139, 253, 0.6)',
                    borderColor: '#388bfd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#8b949e' } }
                },
                scales: type !== 'pie' ? {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b949e' } },
                    x: { grid: { display: false }, ticks: { color: '#8b949e' } }
                } : {}
            }
        });
    }

    function drawDescriptiveStatsTable(values) {
        if (values.length === 0) {
            statsSummaryContainer.innerHTML = '<p class="light-text">No data summary compiles.</p>';
            return;
        }
        const clean = values.filter(v => !isNaN(v));
        if (clean.length === 0) {
            statsSummaryContainer.innerHTML = '<p class="light-text">Non-numerical parameters selected.</p>';
            return;
        }
        const total = clean.reduce((a,b) => a+b, 0);
        const mean = total / clean.length;
        const sorted = [...clean].sort((a,b) => a-b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        
        statsSummaryContainer.innerHTML = `
            <table class="stats-table">
                <tr><td>Dataset Size</td><td>${clean.length} values</td></tr>
                <tr><td>Sum Total</td><td>${total.toLocaleString(undefined, {maximumFractionDigits:2})}</td></tr>
                <tr><td>Arithmetic Mean</td><td>${mean.toLocaleString(undefined, {maximumFractionDigits:2})}</td></tr>
                <tr><td>Minimum Bound</td><td>${min.toLocaleString(undefined, {maximumFractionDigits:2})}</td></tr>
                <tr><td>Maximum Bound</td><td>${max.toLocaleString(undefined, {maximumFractionDigits:2})}</td></tr>
            </table>
        `;
    }

    // ==========================================
    // EXPORT DOWNLOAD SERVICES
    // ==========================================
    downloadCsvBtn.addEventListener("click", () => {
        if (state.activePortal === "amazon_tracker") {
            window.location.href = "/api/export/csv";
            return;
        }
        if (state.rows.length === 0) {
            alert("No scraped data to export.");
            return;
        }
        let csv = state.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
        state.rows.forEach(r => {
            csv += r.map(c => `"${c.toString().replace(/"/g, '""')}"`).join(",") + "\n";
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "scraped_data_grid.csv");
        link.click();
    });

    downloadExcelBtn.addEventListener("click", async () => {
        if (state.rows.length === 0) return alert("Empty grid.");
        loadingOverlay.classList.remove("hidden");
        try {
            const res = await fetch("/api/export/excel", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ headers: state.headers, rows: state.rows })
            });
            if (res.ok) {
                const blob = await res.blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", "scraped_excel_dataset.xlsx");
                link.click();
            }
        } catch (err) {
            alert("Excel generation failed.");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    downloadJsonBtn.addEventListener("click", () => {
        if (state.rows.length === 0) return alert("Empty grid.");
        const dict = state.rows.map(r => {
            const obj = {};
            state.headers.forEach((h, idx) => { obj[h] = r[idx]; });
            return obj;
        });
        const blob = new Blob([JSON.stringify(dict, null, 4)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "scraped_dataset.json");
        link.click();
    });

    downloadDbBtn.addEventListener("click", async () => {
        if (state.rows.length === 0) return alert("Empty grid.");
        loadingOverlay.classList.remove("hidden");
        try {
            const res = await fetch("/api/export/database", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ headers: state.headers, rows: state.rows })
            });
            if (res.ok) {
                const blob = await res.blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", "scraped_sqlite_db.db");
                link.click();
            }
        } catch (err) {
            alert("SQLite database generation failed.");
        } finally {
            loadingOverlay.classList.add("hidden");
        }
    });

    // Code copy clipboards
    copyCodeBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(pythonCodeBox.textContent);
        copyCodeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { copyCodeBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Script Code'; }, 2000);
    });

    // ==========================================
    // AUTO-REFRESH REFRESH LOOP & TABS EVENT ROUTERS
    // ==========================================
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.dataset.tab || btn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
            
            // Re-trigger layout checks for Plotly or ChartInstance resizing
            if (tabId === "tab-analytics") {
                if (state.activePortal === "generic") triggerAnalyticsCompilation();
                else if (state.activePortal === "amazon" && state.portalsData.amazon) drawAmazonChart(state.portalsData.amazon.metrics);
                else if (state.activePortal === "amazon_tracker" && state.portalsData.amazon_tracker.selectedUrl) {
                    const active = state.portalsData.amazon_tracker.products.find(p => p.url === state.portalsData.amazon_tracker.selectedUrl);
                    if (active) showAmazonProductDetails(active.id);
                } else if (state.activePortal === "imdb" && state.portalsData.imdb) drawImdbGenreChart(state.portalsData.imdb.rows);
            }
        });
    });

    let countdownSecs = 180;
    setInterval(() => {
        if (state.activePortal === "amazon_tracker") {
            countdownSecs--;
            if (countdownSecs <= 0) {
                countdownSecs = 180;
                fetchTrackedAmazonProducts();
                fetchTrackerLogs();
            }
            const mins = Math.floor(countdownSecs / 60);
            const secs = countdownSecs % 60;
            const scanDisplay = document.getElementById("stat-next-scan");
            if (scanDisplay) {
                scanDisplay.textContent = `${mins}m ${secs.toString().padStart(2, "0")}s`;
            }
        }
    }, 1000);

    // Initial triggers
    switchPortal("generic");
});
