const VIEWER_TEMPLATE = `<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!--TITLE--></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
    <style>
        body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: sans-serif;
            background-color: #000;
        }
        #panorama {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>

<div id="panorama"></div>

<script>
    // Data injected by generator
    const imageData = "<!--IMAGE_DATA-->";
    const projectTitle = "<!--TITLE-->";

    pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": imageData,
        "autoLoad": true,
        "compass": false,
        "title": projectTitle,
        "author": "JoelBastoneLopez",
        "showFullscreenCtrl": true,
        "showControls": true,
        "hfov": 120
    });
</script>

</body>
</html>`;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('panoramaInput');
    const titleInput = document.getElementById('clientTitle');
    const generateBtn = document.getElementById('generateBtn');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const fileNameDisplay = document.getElementById('fileName');

    let base64Image = null;

    // Handle File Selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileNameDisplay.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function (event) {
            base64Image = event.target.result;
            showPreview(base64Image);
            validateForm();
        };
        reader.readAsDataURL(file);
    });

    // Handle Title Input
    titleInput.addEventListener('input', () => {
        validateForm();
    });

    // Show Preview
    function showPreview(src) {
        previewImage.src = src;
        previewContainer.classList.remove('hidden');
    }

    // Enable/Disable Generate Button
    function validateForm() {
        if (base64Image) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    // Generate and Download
    generateBtn.addEventListener('click', async () => {
        if (!base64Image) return;

        const title = titleInput.value.trim() || "Visor 360";
        const originalBtnText = generateBtn.innerHTML;

        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';
        generateBtn.disabled = true;

        try {
            // Inject Data into Template
            const finalHtml = VIEWER_TEMPLATE
                .replace(/<!--TITLE-->/g, title)
                .replace('<!--IMAGE_DATA-->', base64Image);

            // Create Blob and Download
            const blob = new Blob([finalHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            const safeFilename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.href = url;
            link.download = `visor_360_${safeFilename}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (error) {
            console.error(error);
            alert('Hubo un error al generar el visor.');
        } finally {
            generateBtn.innerHTML = '¡Listo! Descargando...';
            setTimeout(() => {
                generateBtn.innerHTML = originalBtnText;
                generateBtn.disabled = false;
            }, 2000);
        }
    });

    // Drag and Drop support
    const dropZone = document.querySelector('.file-upload-label');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.style.borderColor = 'var(--accent-color)';
        dropZone.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    }

    function unhighlight(e) {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'rgba(255,255,255,0.02)';
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            // Trigger change event manually
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
});
