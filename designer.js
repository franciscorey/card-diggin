// CONTROLADOR CENTRAL - DESIGNER ENGINE (designer.js)
document.addEventListener("DOMContentLoaded", () => {
    
    // Nodos Formulario Básicos
    const searchInput = document.getElementById("search-input");
    const btnSearch = document.getElementById("btn-search");
    const searchResults = document.getElementById("search-results");
    const inputCatalogId = document.getElementById("input-catalog-id"); // ID Visual Solo Lectura
    const inputTitle = document.getElementById("input-title");
    const inputArtist = document.getElementById("input-artist");
    const inputYear = document.getElementById("input-year");
    const inputGenre = document.getElementById("input-genre");
    const inputLabel = document.getElementById("input-label");
    const inputCredits = document.getElementById("input-credits");
    const inputLinerNotes = document.getElementById("input-liner-notes");
    const inputUrl = document.getElementById("input-url");

    // Assets Premium e Imágenes
    const fileTitlePng = document.getElementById("file-title-png");
    const fileLabelPng = document.getElementById("file-label-png");
    const inputBackCoverUrl = document.getElementById("input-back-cover-url"); // Aquí pegas la URL externa (jpg, png, etc)
    const cardTitlePngPreview = document.getElementById("card-title-png-preview");
    const cardLabelPngPreview = document.getElementById("card-label-png-preview");

    // Selectores de Configuración y Metadatos Extra
    const selectEdition = document.getElementById("select-edition");
    const inputRunningTime = document.getElementById("input-running-time");
    const inputStatus = document.getElementById("input-status");
    const inputRecorded = document.getElementById("input-recorded");

    // Toggles de Estructura de Capas
    const checkHideInnerFront = document.getElementById("check-hide-inner-front");
    const checkWhiteTextFront = document.getElementById("check-white-text-front");

    // Selectores de Color y Layout
    const pickerBg = document.getElementById("picker-bg");
    const pickerP1 = document.getElementById("picker-p1");
    const pickerP2 = document.getElementById("picker-p2");
    const pickerP3 = document.getElementById("picker-p3");
    const pickerP4 = document.getElementById("picker-p4");
    const selectColumns = document.getElementById("select-columns");

    // Botones de Exportación Dedicados
    const btnExportJson = document.getElementById("btn-export-json");
    const btnExportBackCover = document.getElementById("btn-export-back-cover"); // Convertidor de Imagen Real a WebP
    const btnPrint = document.getElementById("btn-export");

    // Nodos Tarjeta Física (Vista Previa DOM)
    const cardTitle = document.getElementById("card-title");
    const cardMetaArtist = document.getElementById("card-meta-artist");
    const cardMetaYear = document.getElementById("card-meta-year");
    const cardMetaGenre = document.getElementById("card-meta-genre");
    const cardTextLabel = document.getElementById("card-text-label");
    const cardCreditsText = document.getElementById("card-credits-text");
    const cardFooterCopyright = document.getElementById("card-footer-copyright");
    const cardTracksWrapper = document.getElementById("card-tracks-wrapper");
    const cardElement = document.getElementById("card-element");
    const cardFrontElement = document.getElementById("card-front-element");
    const cardFrontBadge = document.getElementById("card-front-badge");
    const cardFrontArtwork = document.getElementById("card-front-artwork");
    const frontTitleText = document.getElementById("front-title-text");
    const frontArtistText = document.getElementById("front-artist-text");
    const imgBuffer = document.getElementById("img-buffer");

    // VARIABLES DE PERSISTENCIA GLOBAL
    let activeCollectionId = "00000000"; 
    let itunesTracksBackup = []; 
    let currentTracksCache = [];

    // Inicialización del código QR
    let qrInstance = new QRCode(document.getElementById("qrcode"), {
        text: "https://tu-proyecto.netlify.app/",
        width: 60,
        height: 60,
        correctLevel: QRCode.CorrectLevel.M
    });

    // Sincronización en tiempo real del Formulario con las Tarjetas
    const syncCards = () => {
        const title = inputTitle.value.toUpperCase() || "ALBUM TITLE";
        const artist = inputArtist.value.toUpperCase() || "ARTIST NAME";
        
        if (cardTitlePngPreview.style.display === "none") cardTitle.textContent = title;
        if (cardLabelPngPreview.style.display === "none") cardTextLabel.textContent = inputLabel.value.toUpperCase() || "LABEL";

        cardMetaArtist.textContent = artist;
        cardMetaYear.textContent = inputYear.value || "0000";
        cardMetaGenre.textContent = inputGenre.value.toUpperCase() || "GENRE / STYLE";
        cardCreditsText.textContent = inputCredits.value.toUpperCase() || "PRODUCTION DETAILS...";
        cardFooterCopyright.textContent = `© ${inputLabel.value.toUpperCase() || "LABEL"}`;

        document.getElementById("card-ms-time").textContent = inputRunningTime.value.toUpperCase() || "—";
        document.getElementById("card-ms-status").textContent = inputStatus.value.toUpperCase() || "—";
        document.getElementById("card-ms-recorded").textContent = inputRecorded.value.toUpperCase() || "—";

        frontTitleText.textContent = title;
        frontArtistText.textContent = artist;
        cardFrontBadge.textContent = selectEdition.value;

        // Forzar actualización del QR dinámico
        qrInstance.clear();
        qrInstance.makeCode(`${inputUrl.value}${activeCollectionId}`);
    };

    // Toggles de Layout del Frente
    checkHideInnerFront.addEventListener("change", () => {
        cardFrontElement.classList.toggle("front-clean-layout", checkHideInnerFront.checked);
    });
    checkWhiteTextFront.addEventListener("change", () => {
        cardFrontElement.classList.toggle("front-text-white", checkWhiteTextFront.checked);
    });

    // Carga de PNGs transparentes alternativos para Título y Sello
    fileTitlePng.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cardTitlePngPreview.src = event.target.result;
                cardTitlePngPreview.style.display = "block";
                cardTitle.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    fileLabelPng.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cardLabelPngPreview.src = event.target.result;
                cardLabelPngPreview.style.display = "inline-block";
                cardTextLabel.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    // Registro de eventos Input para propagar cambios en tiempo real
    [inputTitle, inputArtist, inputYear, inputGenre, inputLabel, inputCredits, inputRunningTime, inputStatus, inputRecorded, selectEdition, inputUrl, inputBackCoverUrl].forEach(elem => {
        if (elem) elem.addEventListener("input", syncCards);
    });

    // Control del Selector de Fondo de Tarjeta
    pickerBg.addEventListener("input", () => {
        cardElement.style.setProperty("--card-outer-bg", pickerBg.value);
        cardFrontElement.style.setProperty("--card-outer-bg", pickerBg.value);
    });

    // Renderizador de Barra de Muestras de Color Trasera (4 Bloques)
    const updatePaletteFromPickers = () => {
        const paletteContainer = document.getElementById("card-palette");
        if (!paletteContainer) return;
        paletteContainer.innerHTML = "";
        [pickerP1.value, pickerP2.value, pickerP3.value, pickerP4.value].forEach(color => {
            const block = document.createElement("div");
            block.className = "color-block";
            block.style.backgroundColor = color;
            paletteContainer.appendChild(block);
        });
    };
    [pickerP1, pickerP2, pickerP3, pickerP4].forEach(p => p.addEventListener("input", updatePaletteFromPickers));

    // Control de Columnas de Canciones
    selectColumns.addEventListener("change", () => renderTracks(currentTracksCache));

    const renderTracks = (tracks) => {
        currentTracksCache = tracks;
        const mode = selectColumns.value;
        const useTwoColumns = (mode === "2") || (mode === "auto" && tracks.length > 12);

        if (useTwoColumns && tracks.length > 0) {
            const mid = Math.ceil(tracks.length / 2);
            let html = `<div class="tracks-two-columns"><div class="tracks-col"><ol class="tracks-list">`;
            tracks.slice(0, mid).forEach(t => html += `<li><span>${t.toUpperCase()}</span></li>`);
            html += `</ol></div><div class="tracks-col"><ol class="tracks-list" start="${mid + 1}">`;
            tracks.slice(mid).forEach(t => html += `<li><span>${t.toUpperCase()}</span></li>`);
            html += `</ol></div></div>`;
            cardTracksWrapper.innerHTML = html;
        } else {
            let html = `<ol class="tracks-list">`;
            tracks.forEach(t => html += `<li><span>${t.toUpperCase()}</span></li>`);
            html += `</ol>`;
            cardTracksWrapper.innerHTML = html;
        }
    };

    // Buscador Integrado API de iTunes
    const searchAlbum = async (query) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=15`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            displayResults(data.results || []);
        } catch (err) { console.error(err); }
    };

    // Despliegue de Resultados de Búsqueda con Chequeo Local de Archivos Existentes
    const displayResults = async (albums) => {
        searchResults.innerHTML = "";
        if(albums.length === 0) {
            searchResults.innerHTML = "<div class='result-item'>Sin resultados</div>";
            return;
        }

        for (const album of albums) {
            const item = document.createElement("div");
            item.className = "result-item";
            item.style.justifyContent = "space-between";

            let itemContent = `
                <div style="display:flex; align-items:center;">
                    <img src="${album.artworkUrl100}" style="width:35px; height:35px; margin-right:10px; object-fit:cover;">
                    <div style="text-align:left;">
                        <strong>${album.collectionName}</strong><br>
                        <span style="color:#666">${album.artistName}</span>
                    </div>
                </div>
            `;

            let isPreEdited = false;
            try {
                const checkResponse = await fetch(`data/${album.collectionId}.json`, { method: 'HEAD' });
                if (checkResponse.ok) {
                    isPreEdited = true;
                }
            } catch(e) { }

            if (isPreEdited) {
                itemContent += `
                    <span style="background:#ff4500; color:white; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:3px; letter-spacing:0.5px; white-space:nowrap; margin-left:10px;">
                        ✓ EN ARCHIVO
                    </span>
                `;
            }

            item.innerHTML = itemContent;
            
            item.addEventListener("click", () => {
                openDetails(album.collectionId);
                searchResults.style.display = "none";
            });
            searchResults.appendChild(item);
        }
        searchResults.style.display = "block";
    };

    // Apertura Híbrida: Carga de JSON Local Completo vs Consulta limpia a iTunes
    const openDetails = async (collectionId) => {
        activeCollectionId = collectionId.toString();
        if (inputCatalogId) inputCatalogId.value = activeCollectionId;

        try {
            const localResponse = await fetch(`data/${activeCollectionId}.json`);
            if (localResponse.ok) {
                const localData = await localResponse.json();
                console.log(`[Card-Diggin'] Cargando data premium guardada para el ID ${activeCollectionId}`);
                
                itunesTracksBackup = localData.itunes_backup.tracks;
                
                inputTitle.value = localData.itunes_backup.title;
                inputArtist.value = localData.itunes_backup.artist;
                inputYear.value = localData.itunes_backup.year;
                inputGenre.value = localData.itunes_backup.genre;
                cardFrontArtwork.src = localData.itunes_backup.cover_url;

                inputLabel.value = localData.editorial_data.label_text || "";
                inputRecorded.value = localData.editorial_data.recorded_at || "";
                inputStatus.value = localData.editorial_data.status || "";
                inputRunningTime.value = localData.editorial_data.running_time || "";
                inputCredits.value = localData.editorial_data.credits || "";
                inputLinerNotes.value = localData.editorial_data.liner_notes || "";
                selectEdition.value = localData.editorial_data.edition_variant || "EDICIÓN ESTÁNDAR";
                
                // Mapear el valor guardado en el JSON (ya sea la URL original de la red o la ruta final procesada)
                if (inputBackCoverUrl) inputBackCoverUrl.value = localData.editorial_data.back_cover_url || "";

                pickerBg.value = localData.editorial_data.card_bg_color || "#e0dfdb";
                cardElement.style.setProperty("--card-outer-bg", pickerBg.value);
                cardFrontElement.style.setProperty("--card-outer-bg", pickerBg.value);

                if (localData.editorial_data.palette_colors) {
                    pickerP1.value = localData.editorial_data.palette_colors[0] || "#e5e5e5";
                    pickerP2.value = localData.editorial_data.palette_colors[1] || "#cccccc";
                    pickerP3.value = localData.editorial_data.palette_colors[2] || "#999999";
                    pickerP4.value = localData.editorial_data.palette_colors[3] || "#333333";
                    updatePaletteFromPickers();
                }

                checkHideInnerFront.checked = localData.editorial_data.front_clean || false;
                checkWhiteTextFront.checked = localData.editorial_data.front_dark_mode || false;
                cardFrontElement.classList.toggle("front-clean-layout", checkHideInnerFront.checked);
                cardFrontElement.classList.toggle("front-text-white", checkWhiteTextFront.checked);

                renderTracks(itunesTracksBackup.map(t => t.title));
                syncCards();
                return; 
            }
        } catch (e) {
            console.log("No hay archivo JSON local. Consultando API de iTunes...");
        }

        // Caso B: Consulta directa a iTunes API por falta de archivo local
        const url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.results || data.results.length === 0) return;

            const albumInfo = data.results[0];
            const tracksData = data.results.slice(1).filter(item => item.wrapperType === "track").sort((a, b) => a.trackNumber - b.trackNumber);

            itunesTracksBackup = tracksData.map(t => ({
                number: t.trackNumber,
                title: t.trackName,
                preview_url: t.previewUrl || ""
            }));

            cardTitlePngPreview.style.display = "none"; cardTitle.style.display = "block";
            cardLabelPngPreview.style.display = "none"; cardTextLabel.style.display = "inline-block";
            fileTitlePng.value = ""; fileLabelPng.value = "";
            inputLinerNotes.value = "";
            inputCredits.value = "";
            if (inputBackCoverUrl) inputBackCoverUrl.value = ""; // Vacío al buscar un disco nuevo de iTunes

            inputTitle.value = albumInfo.collectionName;
            inputArtist.value = albumInfo.artistName;
            inputYear.value = albumInfo.releaseDate.split("-")[0];
            inputGenre.value = albumInfo.primaryGenreName;
            inputLabel.value = albumInfo.copyright ? albumInfo.copyright.replace(/℗|©/g, "").trim() : "INDEPENDIENTE";

            let totalMs = tracksData.reduce((acc, t) => acc + (t.trackTimeMillis || 0), 0);
            const totalSeconds = Math.floor(totalMs / 1000);
            inputRunningTime.value = `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;

            const hiResCover = albumInfo.artworkUrl100.replace("100x100bb", "600x600bb");
            cardFrontArtwork.src = hiResCover;
            imgBuffer.src = hiResCover;

            renderTracks(tracksData.map(t => t.trackName));

            imgBuffer.onload = () => {
                const colorThief = new ColorThief();
                const mainColor = colorThief.getColor(imgBuffer);
                const mainHex = rgbToHex(mainColor[0], mainColor[1], mainColor[2]);
                cardElement.style.setProperty("--card-outer-bg", mainHex);
                cardFrontElement.style.setProperty("--card-outer-bg", mainHex);
                pickerBg.value = mainHex;

                const palette = colorThief.getPalette(imgBuffer, 4);
                if(palette.length >= 4) {
                    pickerP1.value = rgbToHex(palette[0][0], palette[0][1], palette[0][2]);
                    pickerP2.value = rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
                    pickerP3.value = rgbToHex(palette[2][0], palette[2][1], palette[2][2]);
                    pickerP4.value = rgbToHex(palette[3][0], palette[3][1], palette[3][2]);
                    updatePaletteFromPickers();
                }
            };
            syncCards();
        } catch (err) { console.error(err); }
    };

    const rgbToHex = (r, g, b) => "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join("");

    // EXPORTACIÓN COMPLETA DEL ARCHIVO CONFIGURADOR JSON
    btnExportJson.addEventListener("click", () => {
        if (!activeCollectionId || activeCollectionId === "00000000") {
            alert("Primero busca y selecciona un álbum válido del catálogo.");
            return;
        }

        // El JSON guardará la ruta estructurada a donde tú moverás el archivo descargado de forma interna
        const targetLocalWebp = `data/${activeCollectionId}-b.webp`;

        const consolidatedData = {
            id: activeCollectionId,
            itunes_backup: {
                title: inputTitle.value,
                artist: inputArtist.value,
                year: inputYear.value,
                genre: inputGenre.value,
                cover_url: cardFrontArtwork.src,
                tracks: itunesTracksBackup
            },
            editorial_data: {
                label_text: inputLabel.value,
                title_png_local: fileTitlePng.files[0] ? `assets/albums/${activeCollectionId}/title.png` : "",
                label_png_local: fileLabelPng.files[0] ? `assets/albums/${activeCollectionId}/label.png` : "",
                recorded_at: inputRecorded.value,
                status: inputStatus.value,
                running_time: inputRunningTime.value,
                credits: inputCredits.value,
                liner_notes: inputLinerNotes.value,
                card_bg_color: pickerBg.value,
                palette_colors: [pickerP1.value, pickerP2.value, pickerP3.value, pickerP4.value],
                front_clean: checkHideInnerFront.checked,
                front_dark_mode: checkWhiteTextFront.checked,
                edition_variant: selectEdition.value,
                back_cover_url: targetLocalWebp // El visor tomará este asset local de alta definición obligatoriamente
            }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(consolidatedData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${activeCollectionId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // MOTOR GRÁFICO CANVAS: Captura, Conversión y Redimensionamiento de Imagen Real Externa a WebP (1200x1200px)
    if (btnExportBackCover) {
        btnExportBackCover.addEventListener("click", () => {
            const externalUrl = inputBackCoverUrl.value.trim();
            if (!activeCollectionId || activeCollectionId === "00000000") {
                alert("Primero debes cargar un álbum para vincular el ID de descarga.");
                return;
            }
            if (!externalUrl) {
                alert("Por favor inserta una URL válida de imagen en el campo de reverso.");
                return;
            }

            console.log(`[Canvas-Pipeline] Descargando y procesando imagen de reverso remota...`);
            
            const processImg = new Image();
            processImg.crossOrigin = "anonymous"; // Rompe restricciones CORS básicas si el host lo permite
            processImg.src = externalUrl;

            processImg.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 1200;
                canvas.height = 1200;
                const ctx = canvas.getContext("2d");

                // Renderizamos la imagen real forzando las dimensiones simétricas de 1200x1200px (Maquetación cover)
                ctx.drawImage(processImg, 0, 0, 1200, 1200);

                // Convertir binario a un archivo WebP de alto rendimiento (Calidad del 95%)
                const dataURL = canvas.toDataURL("image/webp", 0.95);
                const downloadLink = document.createElement("a");
                downloadLink.download = `${activeCollectionId}-b.webp`;
                downloadLink.href = dataURL;
                downloadLink.click();
                console.log(`[Canvas-Pipeline] Imagen ${activeCollectionId}-b.webp exportada exitosamente.`);
            };

            processImg.onerror = () => {
                alert("Error al cargar la imagen remota. Asegúrate de que la URL es directa y no tiene restricciones de acceso (CORS).");
            };
        });
    }

    // Disparadores Globales del Buscador e Impresión Impresa nativa
    btnSearch.addEventListener("click", () => searchInput.value.trim() && searchAlbum(searchInput.value));
    searchInput.addEventListener("keypress", (e) => e.key === "Enter" && searchInput.value.trim() && searchAlbum(searchInput.value));
    if (btnPrint) btnPrint.addEventListener("click", () => window.print());
    
    // Forzar primera carga de la paleta vacía por consistencia visual
    updatePaletteFromPickers();
});