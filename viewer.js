// INTERACTIVE VISOR MULTI-MODE ENGINE (viewer.js)
document.addEventListener("DOMContentLoaded", () => {
    
    // Nodos UI Principales
    const viewerApp = document.getElementById("viewer-app");
    const bodyElement = document.body;
    const albumCover = document.getElementById("album-cover");
    const albumBackCover = document.getElementById("album-back-cover"); // Img física real del reverso
    const albumTitle = document.getElementById("album-title");
    const albumArtist = document.getElementById("album-artist");
    const albumGenre = document.getElementById("album-genre");
    const albumYear = document.getElementById("album-year");
    const albumCopyright = document.getElementById("album-copyright");
    const playerMode = document.getElementById("player-mode");
    const editionPill = document.getElementById("edition-pill");
    
    // Nodos del Reproductor de Audio
    const audioElement = document.getElementById("audio-element");
    const currentTrackTitle = document.getElementById("current-track-title");
    const tracksContainer = document.getElementById("tracks-list-container");

    // Nodos de Secciones Editoriales
    const editorialBlock = document.getElementById("editorial-block");
    const linerNotesContent = document.getElementById("liner-notes-content");
    const creditsBlock = document.getElementById("credits-block");
    const creditsContent = document.getElementById("credits-content");

    // Nodos del Motor Interactivo Cinemático 3D
    const albumCard3D = document.getElementById("album-card-3d");
    const btnZoomToggle = document.getElementById("btn-zoom-toggle");
    const btnFlipJacket = document.getElementById("btn-flip-jacket");

    // Estados Globales de Interacción
    let isZoomed = false;

    // Extracción de ID por URL paramétrica (?id=...)
    const getAlbumIdFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    };

    // MOTOR DE CARGA CENTRAL
    const loadSystemData = async () => {
        const albumId = getAlbumIdFromURL();
        if (!albumId) {
            albumTitle.textContent = "ESPERANDO TARJETA";
            tracksContainer.innerHTML = "<p class='loading-text'>Escanea un código QR para iniciar el reproductor.</p>";
            return;
        }

        // MODO 1: INTENTAR LEER DATA PREMIUM EN JSON LOCAL
        try {
            const localResponse = await fetch(`data/${albumId}.json`);
            if (localResponse.ok) {
                const premiumData = await localResponse.json();
                console.log(`[Card-Diggin'] Desplegando visor Premium Autónomo para ID: ${albumId}`);
                renderPremiumExperience(premiumData, albumId);
                return; 
            }
        } catch (e) {
            console.log("Sin JSON personalizado local. Ejecutando consulta iTunes estándar...");
        }

        // MODO 2: RESPALDO AUTOMÁTICO EN API EN VIVO DE ITUNES
        fetchiTunesStandard(albumId);
    };

    // PROCESAMIENTO MODO 1 (PREMIUM AUTÓNOMO DEL ARCHIVO)
    const renderPremiumExperience = (data, albumId) => {
        playerMode.textContent = "PREMIUM ARCHIVE";
        playerMode.style.backgroundColor = "#ff4500";

        albumTitle.textContent = data.itunes_backup.title.toUpperCase();
        albumArtist.textContent = data.itunes_backup.artist.toUpperCase();
        albumGenre.textContent = data.itunes_backup.genre.toUpperCase();
        albumYear.textContent = data.itunes_backup.year;
        albumCopyright.textContent = data.editorial_data.label_text ? `© ${data.editorial_data.label_text.toUpperCase()} RECORDS` : "© CARD-DIGGIN'";

        if (data.editorial_data.edition_variant) {
            editionPill.textContent = data.editorial_data.edition_variant.toUpperCase();
            editionPill.style.display = "inline-block";
        }

        // Carga de Portada Frontal
        albumCover.src = data.itunes_backup.cover_url;
        albumCover.setAttribute("crossorigin", "anonymous");

        // SOLUCIÓN: Forzar la búsqueda obligatoria en la carpeta assets/ con el ID actual
        if (albumBackCover) {
            albumBackCover.src = `assets/${albumId}-b.webp`;
            albumBackCover.setAttribute("crossorigin", "anonymous");
            
            // Fallback por si acaso quedó guardado con otra ruta en JSON antiguos
            albumBackCover.onerror = () => {
                if(data.editorial_data.back_cover_url && albumBackCover.src !== data.editorial_data.back_cover_url) {
                    albumBackCover.src = data.editorial_data.back_cover_url;
                }
            };
        }

        // Aplicación del Color de Fondo del Configurado en el Designer
        if (data.editorial_data.card_bg_color) {
            viewerApp.style.setProperty("--dynamic-bg", data.editorial_data.card_bg_color);
            applyContrastByHex(data.editorial_data.card_bg_color);
        }

        // Despliegue de Liner Notes Críticas
        if (data.editorial_data.liner_notes && data.editorial_data.liner_notes.trim() !== "") {
            linerNotesContent.textContent = data.editorial_data.liner_notes;
            editorialBlock.style.display = "block";
        } else {
            editorialBlock.style.display = "none";
        }

        // Despliegue de Créditos de Producción
        if (data.editorial_data.credits && data.editorial_data.credits.trim() !== "") {
            creditsContent.textContent = data.editorial_data.credits.toUpperCase();
            creditsBlock.style.display = "block";
        } else {
            creditsBlock.style.display = "none";
        }

        buildTracksList(data.itunes_backup.tracks);
    };

    // PROCESAMIENTO MODO 2 (LIVE ITUNES LIVE FALLBACK)
    const fetchiTunesStandard = async (albumId) => {
        const url = `https://itunes.apple.com/lookup?id=${albumId}&entity=song`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                albumTitle.textContent = "ÁLBUM INDEFINIDO";
                return;
            }

            const albumInfo = data.results[0];
            const tracksData = data.results.slice(1).filter(item => item.wrapperType === "track").sort((a, b) => a.trackNumber - b.trackNumber);

            albumTitle.textContent = albumInfo.collectionName.toUpperCase();
            albumArtist.textContent = albumInfo.artistName.toUpperCase();
            albumGenre.textContent = albumInfo.primaryGenreName.toUpperCase();
            albumYear.textContent = albumInfo.releaseDate.split("-")[0];
            albumCopyright.textContent = albumInfo.copyright ? albumInfo.copyright.toUpperCase() : "© ITUNES ARCHIVE";

            const hiResCover = albumInfo.artworkUrl100.replace("100x100bb", "600x600bb");
            albumCover.src = hiResCover;
            albumCover.setAttribute("crossorigin", "anonymous");

            // Fallback por ID en assets/ si se navega de manera estándar en iTunes live
            if (albumBackCover) {
                albumBackCover.src = `assets/${albumId}-b.webp`;
                albumBackCover.setAttribute("crossorigin", "anonymous");
            }

            // Inyección cromática en tiempo real con ColorThief
            albumCover.onload = () => {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(albumCover);
                const hexColor = "#" + dominantColor.map(x => x.toString(16).padStart(2, '0')).join("");
                viewerApp.style.setProperty("--dynamic-bg", hexColor);
                
                const brightness = Math.round(((dominantColor[0] * 299) + (dominantColor[1] * 587) + (dominantColor[2] * 114)) / 1000);
                adjustContrastVariables(brightness);
            };

            const structuredTracks = tracksData.map(t => ({
                number: t.trackNumber,
                title: t.trackName,
                preview_url: t.previewUrl || ""
            }));
            buildTracksList(structuredTracks);

        } catch (err) {
            console.error(err);
            albumTitle.textContent = "ERROR DE SERVICIO";
        }
    };

    // Constructor Unificado del Tracklist del DOM
    const buildTracksList = (tracks) => {
        tracksContainer.innerHTML = "";
        if (!tracks || tracks.length === 0) {
            tracksContainer.innerHTML = "<p class='loading-text'>Audio no disponible para esta edición.</p>";
            return;
        }
        tracks.forEach(track => {
            const row = document.createElement("div");
            row.className = "track-item";
            row.innerHTML = `
                <span class="track-number">${track.number.toString().padStart(2, '0')}</span>
                <span class="track-name">${track.title.toUpperCase()}</span>
                <span class="play-icon">▶</span>
            `;
            row.addEventListener("click", () => {
                document.querySelectorAll(".track-item").forEach(r => r.classList.remove("active-track"));
                row.classList.add("active-track");

                if (track.preview_url) {
                    audioElement.src = track.preview_url;
                    currentTrackTitle.textContent = track.title.toUpperCase();
                    audioElement.play();
                } else {
                    currentTrackTitle.textContent = `${track.title.toUpperCase()} (SIN PREVIEW AUDIO)`;
                    audioElement.src = "";
                }
            });
            tracksContainer.appendChild(row);
        });
    };

    // SISTEMA CONTROLADOR DE EVENTOS INTERACTIVOS (ZOOM Y REVERSO)
    if (btnZoomToggle) {
        btnZoomToggle.addEventListener("click", () => {
            isZoomed = !isZoomed;
            
            if (isZoomed) {
                bodyElement.classList.add("zoom-active");
                btnZoomToggle.textContent = "📉 REDUCIR VISTA";
                btnZoomToggle.style.background = "var(--text-color)";
                btnZoomToggle.style.color = "var(--dynamic-bg)";
            } else {
                bodyElement.classList.remove("zoom-active");
                btnZoomToggle.textContent = "🔍 AMPLIAR DETALLE";
                btnZoomToggle.style.background = "transparent";
                btnZoomToggle.style.color = "var(--text-color)";
            }
        });
    }

    if (btnFlipJacket) {
        btnFlipJacket.addEventListener("click", () => {
            if (albumCard3D) {
                albumCard3D.classList.toggle("flipped");
                if (albumCard3D.classList.contains("flipped")) {
                    btnFlipJacket.textContent = "👁️ VER FRENTE";
                } else {
                    btnFlipJacket.textContent = "🔄 VER REVERSO";
                }
            }
        });
    }

    // Funciones utilitarias de análisis cromático y contraste
    const applyContrastByHex = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
        adjustContrastVariables(brightness);
    };

    const adjustContrastVariables = (brightness) => {
        if (brightness < 125) {
            viewerApp.style.setProperty("--text-color", "#ffffff");
            viewerApp.style.setProperty("--card-inner-bg", "rgba(255,255,255,0.12)");
        } else {
            viewerApp.style.setProperty("--text-color", "#000000");
            viewerApp.style.setProperty("--card-inner-bg", "#ffffff");
        }
    };

    // Inicialización del flujo
    loadSystemData();
});