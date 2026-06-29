// CONTROLADOR LÓGICO DEL DISEÑADOR (app.js)
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Vinculación de entradas del formulario (Panel de Control)
    const inputTitle = document.getElementById("input-title");
    const inputArtist = document.getElementById("input-artist");
    const inputYear = document.getElementById("input-year");
    const inputGenre = document.getElementById("input-genre");
    const inputLabel = document.getElementById("input-label");
    const inputCredits = document.getElementById("input-credits");
    const inputUrl = document.getElementById("input-url");

    // 2. Vinculación de elementos visuales de la tarjeta
    const cardTitle = document.getElementById("card-title");
    const cardMetaArtist = document.getElementById("card-meta-artist");
    const cardMetaYear = document.getElementById("card-meta-year");
    const cardMetaGenre = document.getElementById("card-meta-genre");
    const cardTextLabel = document.getElementById("card-text-label");
    const cardCreditsText = document.getElementById("card-credits-text");
    const cardFooterCopyright = document.getElementById("card-footer-copyright");
    const cardTracksWrapper = document.getElementById("card-tracks-wrapper");
    const cardElement = document.getElementById("card-element");

    // 3. Sincronización en tiempo real (Reactividad nativa mediante eventos)
    const syncCard = () => {
        cardTitle.textContent = inputTitle.value || "ALBUM TITLE";
        cardMetaArtist.textContent = inputArtist.value || "ARTIST NAME";
        cardMetaYear.textContent = inputYear.value || "0000";
        cardMetaGenre.textContent = inputGenre.value || "GENRE / STYLE";
        cardTextLabel.textContent = inputLabel.value || "LABEL";
        cardCreditsText.textContent = inputCredits.value || "PRODUCTION DETAILS GO HERE...";
        cardFooterCopyright.textContent = `© ${inputLabel.value || "LABEL"} RECORDS`;
    };

    // Escuchar cuando el usuario escribe en cualquier input para actualizar la tarjeta al instante
    [inputTitle, inputArtist, inputYear, inputGenre, inputLabel, inputCredits].forEach(input => {
        input.addEventListener("input", syncCard);
    });

    // 4. DATA DEMO: Estructura idéntica a la que automatizaremos con la API de Apple Music
    const demoData = {
        title: "estadio nacional",
        artist: "LOS PRISIONEROS",
        year: "2002",
        genre: "ROCK / POP",
        label: "WARNER MUSIC CHILE",
        outerBg: "#89b0c4", // Color de fondo del borde exterior (azul pastel de tu carta)
        palette: ["#f2994a", "#e2583e", "#27ae60", "#d5b979", "#333333"], // Bloques de color
        credits: "JORGE GONZALEZ (VOZ Y BAJO) - CLAUDIO NAREA (GUITARRA) - MIGUEL TAPIA (BATERÍA) - CARLOS FONSECA (PROD.)",
        tracks: [
            "La voz de los '80", "Brigada de negro", "¿Por qué los ricos?", "Jugar a la guerra", 
            "¿Quién mató a Marilyn?", "Paramar", "No necesitamos banderas", "Mentalidad televisiva", 
            "¿Por qué no se van?", "Muevan las industrias", "Por favor", "Tren al sur", "Que no destrocen tu vida",
            "El baile de los que sobran", "Quieren dinero", "Usted y su ambición", "Maldito sudaca", 
            "Lo estamos pasando muy bien", "We are south american rockers", "Corazones rojos", "Sexo", 
            "De la cultura de la basura", "Mal de Parkinson", "Latinoamérica es un pueblo al sur de Estados Unidos", 
            "Nunca quedas mal con nadie", "Generación de mierda", "De Rusia con amor"
        ]
    };

    // 5. Renderizador inteligente de tracks (Divide en 2 columnas si superan los 12 elementos)
    const renderTracks = (tracks) => {
        if (tracks.length > 12) {
            const mid = Math.ceil(tracks.length / 2);
            const col1 = tracks.slice(0, mid);
            const col2 = tracks.slice(mid);

            let html = `<div class="tracks-two-columns">`;
            html += `<div class="tracks-col"><ol class="tracks-list">`;
            col1.forEach(t => html += `<li>${t}</li>`);
            html += `</ol></div>`;
            // El atributo 'start' mantiene la numeración correlativa en la segunda columna
            html += `<div class="tracks-col"><ol class="tracks-list" start="${mid + 1}">`;
            col2.forEach(t => html += `<li>${t}</li>`);
            html += `</ol></div></div>`;
            
            cardTracksWrapper.innerHTML = html;
        } else {
            let html = `<ol class="tracks-list">`;
            tracks.forEach(t => html += `<li>${t}</li>`);
            html += `</ol>`;
            cardTracksWrapper.innerHTML = html;
        }
    };

    // 6. Función para inyectar un set completo de datos al formulario y a la tarjeta
    const applyData = (data) => {
        inputTitle.value = data.title;
        inputArtist.value = data.artist;
        inputYear.value = data.year;
        inputGenre.value = data.genre;
        inputLabel.value = data.label;
        inputCredits.value = data.credits;
        
        // Aplicar color de fondo usando la variable CSS dinámica
        cardElement.style.setProperty("--card-outer-bg", data.outerBg);
        
        // Renderizar la paleta de colores en la barra horizontal
        const paletteContainer = document.getElementById("card-palette");
        paletteContainer.innerHTML = "";
        data.palette.forEach(color => {
            const block = document.createElement("div");
            block.className = "color-block";
            block.style.backgroundColor = color;
            paletteContainer.appendChild(block);
        });

        // Pintar las canciones y refrescar textos
        renderTracks(data.tracks);
        syncCard();
    };

    // Evento para el botón de simulación Demo
    document.getElementById("btn-demo").addEventListener("click", () => {
        applyData(demoData);
    });

    // 7. Disparador de impresión nativa del navegador (Configurada vía CSS @media print)
    document.getElementById("btn-export").addEventListener("click", () => {
        window.print();
    });
});
