// State Variables
let uploadedLogoSrc = null;
let uploadedLogoName = null;
let generatingTimeout = null;
let historyLog = [];

// DOM Elements
const qrTextInput = document.getElementById('qrText');
const fgColorInput = document.getElementById('fgColor');
const bgColorInput = document.getElementById('bgColor');
const fgColorVal = document.getElementById('fgColorVal');
const bgColorVal = document.getElementById('bgColorVal');
const roundedQrCheck = document.getElementById('roundedQr');
const dotsStatus = document.getElementById('dotsStatus');
const qrMarginInput = document.getElementById('qrMargin');
const marginVal = document.getElementById('marginVal');
const qrSizeInput = document.getElementById('qrSize');
const sizeVal = document.getElementById('sizeVal');
const errorCorrectionSelect = document.getElementById('errorCorrection');

const dropZone = document.getElementById('dropZone');
const logoUploadInput = document.getElementById('logoUpload');
const logoPreviewContainer = document.getElementById('logoPreviewContainer');
const logoPreview = document.getElementById('logoPreview');
const logoNameSpan = document.getElementById('logoName');
const removeLogoBtn = document.getElementById('removeLogo');

const generateBtn = document.getElementById('generateBtn');
const headerGenBtn = document.getElementById('headerGenBtn');
const clearBtn = document.getElementById('clearBtn');

const qrCanvas = document.getElementById('qrCanvas');
const qrPlaceholder = document.getElementById('qrPlaceholder');
const qrDisplayFrame = document.querySelector('.qr-preview-box');
const infoType = document.getElementById('infoType');
const infoSize = document.getElementById('infoSize');
const renderPercent = document.getElementById('renderPercent');

const downloadPngBtn = document.getElementById('downloadPng');
const downloadSvgBtn = document.getElementById('downloadSvg');
const downloadPdfBtn = document.getElementById('downloadPdf');
const copyUrlBtn = document.getElementById('copyUrl');

const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const toast = document.getElementById('toast');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    setupEventListeners();
    setupClock();
    setupTabSystem();
    triggerAutoGenerate();
});

// System Clock (UTC+0)
function setupClock() {
    function updateClock() {
        const now = new Date();
        const timeString = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
        const clockEl = document.getElementById('headerTime');
        if (clockEl) clockEl.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();
}

// Tab Switching System
function setupTabSystem() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.getAttribute('data-tab');
            if (!targetTab) return;

            // Remove active from all links and contents
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to current
            link.classList.add('active');
            const activeTabContent = document.getElementById(`tab-${targetTab}`);
            if (activeTabContent) {
                activeTabContent.classList.add('active');
            }
        });
    });
}

// Event Listeners setup
function setupEventListeners() {
    // Inputs & customizers
    qrTextInput.addEventListener('input', () => {
        updateLoadBar();
        triggerAutoGenerate();
    });
    
    fgColorInput.addEventListener('input', (e) => {
        fgColorVal.textContent = e.target.value.toUpperCase();
        triggerAutoGenerate();
    });
    bgColorInput.addEventListener('input', (e) => {
        bgColorVal.textContent = e.target.value.toUpperCase();
        triggerAutoGenerate();
    });
    
    roundedQrCheck.addEventListener('change', (e) => {
        dotsStatus.textContent = e.target.checked ? 'ACTIVE' : 'INACTIVE';
        triggerAutoGenerate();
    });
    
    qrMarginInput.addEventListener('input', (e) => {
        marginVal.textContent = e.target.value;
        triggerAutoGenerate();
    });
    qrSizeInput.addEventListener('input', (e) => {
        sizeVal.textContent = e.target.value;
        infoSize.textContent = `${e.target.value}×${e.target.value} PX`;
        triggerAutoGenerate();
    });
    errorCorrectionSelect.addEventListener('change', (e) => {
        // Update redundancy progress indicator
        const value = e.target.value;
        const bar = document.getElementById('redundancyBar');
        const percent = document.getElementById('redundancyPercent');
        let pct = '30%';
        if (value === 'L') pct = '7%';
        if (value === 'M') pct = '15%';
        if (value === 'Q') pct = '25%';
        if (value === 'H') pct = '30%';
        
        bar.style.width = pct;
        percent.textContent = pct;
        
        triggerAutoGenerate();
    });

    // File Drag & Drop
    dropZone.addEventListener('click', () => logoUploadInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleLogoFile(e.dataTransfer.files[0]);
        }
    });
    logoUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleLogoFile(e.target.files[0]);
        }
    });
    removeLogoBtn.addEventListener('click', removeLogo);

    // Action buttons
    generateBtn.addEventListener('click', () => generateQR(true));
    headerGenBtn.addEventListener('click', () => generateQR(true));
    clearBtn.addEventListener('click', resetAll);

    // Exports
    downloadPngBtn.addEventListener('click', downloadPNG);
    downloadSvgBtn.addEventListener('click', downloadSVG);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    copyUrlBtn.addEventListener('click', copySourceText);

    // History Actions
    clearHistoryBtn.addEventListener('click', clearHistory);
}

// Update Encoding Load progress bar
function updateLoadBar() {
    const text = qrTextInput.value.trim();
    const loadBar = document.getElementById('loadBar');
    const loadPercent = document.getElementById('loadPercent');
    
    const maxChars = 150;
    const pct = Math.min(100, Math.floor((text.length / maxChars) * 100));
    
    if (loadBar && loadPercent) {
        loadBar.style.width = `${pct}%`;
        loadPercent.textContent = `${pct}%`;
    }
}

// Debounced Generation for performance
function triggerAutoGenerate() {
    if (generatingTimeout) clearTimeout(generatingTimeout);
    generatingTimeout = setTimeout(() => {
        generateQR(false);
    }, 150);
}

// Logo Handling
function handleLogoFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Invalid file format. Please upload an image.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedLogoSrc = e.target.result;
        uploadedLogoName = file.name;
        
        logoPreview.src = uploadedLogoSrc;
        logoNameSpan.textContent = file.name;
        
        dropZone.style.display = 'none';
        logoPreviewContainer.style.display = 'flex';
        
        triggerAutoGenerate();
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    uploadedLogoSrc = null;
    uploadedLogoName = null;
    logoUploadInput.value = '';
    logoPreview.src = '';
    logoNameSpan.textContent = '';
    
    logoPreviewContainer.style.display = 'none';
    dropZone.style.display = 'flex';
    
    triggerAutoGenerate();
}

// Reset Dashboard
function resetAll() {
    qrTextInput.value = '';
    fgColorInput.value = '#000000';
    fgColorVal.textContent = '#000000';
    bgColorInput.value = '#ffffff';
    bgColorVal.textContent = '#FFFFFF';
    roundedQrCheck.checked = false;
    dotsStatus.textContent = 'INACTIVE';
    qrMarginInput.value = '2';
    marginVal.textContent = '2';
    qrSizeInput.value = '300';
    sizeVal.textContent = '300';
    infoSize.textContent = '300×300 PX';
    errorCorrectionSelect.value = 'H';
    
    const redundancyBar = document.getElementById('redundancyBar');
    const redundancyPercent = document.getElementById('redundancyPercent');
    redundancyBar.style.width = '30%';
    redundancyPercent.textContent = '30%';
    
    updateLoadBar();
    removeLogo();
    triggerAutoGenerate();
    showToast('Dashboard reset completed.');
}

// Check if a cell is part of the three outer/inner Finder Patterns
function isFinderPattern(r, c, size) {
    if (r < 7 && c < 7) return true; // Top-Left
    if (r < 7 && c >= size - 7) return true; // Top-Right
    if (r >= size - 7 && c < 7) return true; // Bottom-Left
    return false;
}

// Guess input type for metadata panel
function detectDataType(text) {
    if (!text) return '--';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (text.startsWith('http://') || text.startsWith('https://')) {
        return 'URL';
    } else if (text.startsWith('mailto:') || emailRegex.test(text)) {
        return 'EMAIL';
    } else if (text.startsWith('tel:') || phoneRegex.test(text)) {
        return 'PHONE';
    } else if (text.startsWith('WIFI:')) {
        return 'WIFI';
    }
    return 'TEXT';
}

// Core Generation Function
function generateQR(forceScanEffect = false) {
    const text = qrTextInput.value.trim();
    
    if (!text) {
        // Reset view
        qrCanvas.style.display = 'none';
        qrPlaceholder.style.display = 'flex';
        infoType.textContent = '--';
        renderPercent.textContent = '100%';
        
        const qrLoader = document.getElementById('qrLoader');
        if (qrLoader) qrLoader.style.display = 'none';
        
        // Disable actions
        downloadPngBtn.disabled = true;
        downloadSvgBtn.disabled = true;
        downloadPdfBtn.disabled = true;
        copyUrlBtn.disabled = true;
        return;
    }

    try {
        const sizeSelected = parseInt(qrSizeInput.value);
        const margin = parseInt(qrMarginInput.value);
        const errorCorrection = errorCorrectionSelect.value;
        const fgColor = fgColorInput.value;
        const bgColor = bgColorInput.value;
        const isRounded = roundedQrCheck.checked;

        // Generate matrix using node-qrcode
        const qr = QRCode.create(text, { errorCorrectionLevel: errorCorrection });
        const size = qr.modules.size;
        const data = qr.modules.data;

        // Setup Canvas
        qrCanvas.width = sizeSelected;
        qrCanvas.height = sizeSelected;
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, sizeSelected, sizeSelected);

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, sizeSelected, sizeSelected);

        // Calculate modules layout
        const totalModules = size + margin * 2;
        const moduleSize = sizeSelected / totalModules;
        const offset = margin * moduleSize;

        // Space allocation for Center Logo
        const logoSizeInModules = uploadedLogoSrc ? Math.floor(size * 0.24) : 0;
        const centerStart = Math.floor((size - logoSizeInModules) / 2);
        const centerEnd = centerStart + logoSizeInModules;

        // Draw Matrix Modules
        ctx.fillStyle = fgColor;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                // If logo exists, mask out the center modules
                if (uploadedLogoSrc && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) {
                    continue;
                }

                // If module is dark
                if (data[r * size + c] === 1) {
                    const x = offset + c * moduleSize;
                    const y = offset + r * moduleSize;

                    // Draw module depending on style
                    if (isRounded && !isFinderPattern(r, c, size)) {
                        ctx.beginPath();
                        const cx = x + moduleSize / 2;
                        const cy = y + moduleSize / 2;
                        const radius = (moduleSize / 2) * 0.9;
                        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                        ctx.fill();
                    } else {
                        // Standard square (or finder patterns always square for readability)
                        ctx.fillRect(x, y, moduleSize, moduleSize);
                    }
                }
            }
        }

        // Draw Center Logo Overlay
        if (uploadedLogoSrc) {
            const logoImg = new Image();
            logoImg.src = uploadedLogoSrc;
            logoImg.onload = () => {
                const logoPxSize = logoSizeInModules * moduleSize;
                const logoX = offset + centerStart * moduleSize;
                const logoY = offset + centerStart * moduleSize;

                // Draw background mask/backing under logo
                ctx.fillStyle = bgColor;
                ctx.fillRect(logoX, logoY, logoPxSize, logoPxSize);

                // Draw logo with safe margins
                const logoInnerPx = logoPxSize * 0.9;
                const logoInnerOffset = (logoPxSize - logoInnerPx) / 2;
                
                // Draw rounded mask container for the logo inside the cyber frame
                ctx.save();
                ctx.beginPath();
                ctx.arc(logoX + logoPxSize/2, logoY + logoPxSize/2, logoInnerPx/2, 0, 2 * Math.PI);
                ctx.clip();
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(logoX + logoInnerOffset, logoY + logoInnerOffset, logoInnerPx, logoInnerPx);
                ctx.drawImage(logoImg, logoX + logoInnerOffset, logoY + logoInnerOffset, logoInnerPx, logoInnerPx);
                ctx.restore();

                // Cyber logo border glow (black / fgColor)
                ctx.strokeStyle = fgColor;
                ctx.lineWidth = Math.max(1.5, moduleSize * 0.15);
                ctx.beginPath();
                ctx.arc(logoX + logoPxSize/2, logoY + logoPxSize/2, logoInnerPx/2, 0, 2 * Math.PI);
                ctx.stroke();

                // Push to history after logo load completes
                saveToHistoryCache(text, sizeSelected, errorCorrection, fgColor, bgColor, isRounded, margin);
            };
        } else {
            // Push to history immediately
            saveToHistoryCache(text, sizeSelected, errorCorrection, fgColor, bgColor, isRounded, margin);
        }

        // Show UI Elements
        qrCanvas.style.display = 'block';
        qrPlaceholder.style.display = 'none';

        // Update Stats
        infoType.textContent = detectDataType(text);

        // Enable buttons
        downloadPngBtn.disabled = false;
        downloadSvgBtn.disabled = false;
        downloadPdfBtn.disabled = false;
        copyUrlBtn.disabled = false;

        // Visual Speeder Loader or instant sync
        if (forceScanEffect) {
            const qrLoader = document.getElementById('qrLoader');
            if (qrLoader) {
                qrLoader.style.display = 'flex';
                qrCanvas.style.display = 'none';
                qrPlaceholder.style.display = 'none';
            }
            
            qrDisplayFrame.classList.add('generating');
            renderPercent.textContent = '83%';
            
            setTimeout(() => {
                if (qrLoader) qrLoader.style.display = 'none';
                qrCanvas.style.display = 'block';
                qrDisplayFrame.classList.remove('generating');
                renderPercent.textContent = '100%';
            }, 1200);
        } else {
            renderPercent.textContent = '100%';
            const qrLoader = document.getElementById('qrLoader');
            if (qrLoader) qrLoader.style.display = 'none';
        }

    } catch (error) {
        console.error('Error generating QR Code', error);
        showToast('Generation failure. Please verify inputs.');
    }
}

// Download PNG Image
function downloadPNG() {
    const dataURL = qrCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-brutalist-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    showToast('PNG successfully downloaded.');
}

// Custom SVG String Builder
function buildSVGString() {
    const text = qrTextInput.value.trim();
    const margin = parseInt(qrMarginInput.value);
    const errorCorrection = errorCorrectionSelect.value;
    const fgColor = fgColorInput.value;
    const bgColor = bgColorInput.value;
    const isRounded = roundedQrCheck.checked;

    const qr = QRCode.create(text, { errorCorrectionLevel: errorCorrection });
    const size = qr.modules.size;
    const data = qr.modules.data;

    const totalModules = size + margin * 2;
    const viewSize = 500; // Scalable SVG dimensions
    const moduleSize = viewSize / totalModules;
    const offset = margin * moduleSize;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="100%" height="100%">`;
    
    // Background Rect
    svg += `<rect width="${viewSize}" height="${viewSize}" fill="${bgColor}"/>`;

    // Space allocation for Center Logo
    const logoSizeInModules = uploadedLogoSrc ? Math.floor(size * 0.24) : 0;
    const centerStart = Math.floor((size - logoSizeInModules) / 2);
    const centerEnd = centerStart + logoSizeInModules;

    // Draw grid paths
    svg += `<g fill="${fgColor}">`;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (uploadedLogoSrc && r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) {
                continue;
            }

            if (data[r * size + c] === 1) {
                const x = offset + c * moduleSize;
                const y = offset + r * moduleSize;

                if (isRounded && !isFinderPattern(r, c, size)) {
                    const cx = x + moduleSize / 2;
                    const cy = y + moduleSize / 2;
                    const radius = (moduleSize / 2) * 0.9;
                    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}"/>`;
                } else {
                    svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;
                }
            }
        }
    }
    svg += `</g>`;

    // Embed logo
    if (uploadedLogoSrc) {
        const logoPxSize = logoSizeInModules * moduleSize;
        const logoX = offset + centerStart * moduleSize;
        const logoY = offset + centerStart * moduleSize;
        const logoInnerPx = logoPxSize * 0.9;
        const logoInnerOffset = (logoPxSize - logoInnerPx) / 2;

        // Mask background backing
        svg += `<rect x="${logoX}" y="${logoY}" width="${logoPxSize}" height="${logoPxSize}" fill="${bgColor}"/>`;
        
        // Draw white badge base
        svg += `<circle cx="${logoX + logoPxSize/2}" cy="${logoY + logoPxSize/2}" r="${logoInnerPx/2}" fill="#FFFFFF"/>`;
        
        // Draw logo image
        svg += `<image href="${uploadedLogoSrc}" x="${logoX + logoInnerOffset}" y="${logoY + logoInnerOffset}" width="${logoInnerPx}" height="${logoInnerPx}"/>`;
        
        // Draw cyber border ring
        svg += `<circle cx="${logoX + logoPxSize/2}" cy="${logoY + logoPxSize/2}" r="${logoInnerPx/2}" fill="none" stroke="${fgColor}" stroke-width="${Math.max(1.5, moduleSize * 0.15)}"/>`;
    }

    svg += `</svg>`;
    return svg;
}

// Download SVG Vector Graphic
function downloadSVG() {
    try {
        const svgStr = buildSVGString();
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const blobURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `qr-brutalist-${Date.now()}.svg`;
        link.href = blobURL;
        link.click();
        URL.revokeObjectURL(blobURL);
        showToast('SVG successfully downloaded.');
    } catch (e) {
        console.error(e);
        showToast('Failed to export SVG.');
    }
}

// Download PDF Document (Brutalist style matching)
function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const canvasData = qrCanvas.toDataURL('image/png');
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const qrPrintWidth = 320;
        const qrPrintHeight = 320;
        const x = (pageWidth - qrPrintWidth) / 2;
        const y = (pageHeight - qrPrintHeight - 120) / 2;

        // Light Brutalist Background styling
        doc.setFillColor(244, 244, 246); // Matching #f4f4f6
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Draw structural layout lines
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(40, 0, 40, pageHeight);
        doc.line(pageWidth - 40, 0, pageWidth - 40, pageHeight);

        // Header Title in bold Oswald-like heavy print
        doc.setTextColor(0, 0, 0);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('✦ QR_BRUTALISM MODULE MATRIX', 60, 80);

        // Subtitle / Encoded source reference
        doc.setTextColor(76, 58, 237); // Accent purple
        doc.setFontSize(10);
        
        let truncatedText = qrTextInput.value.trim();
        if (truncatedText.length > 55) {
            truncatedText = truncatedText.substring(0, 52) + '...';
        }
        doc.text(`DATA_SOURCE_PARAMETER: ${truncatedText}`, 60, 105);

        // Horizontal separator line
        doc.setDrawColor(0, 0, 0);
        doc.line(40, 120, pageWidth - 40, 120);

        // Outer brutalist framed box
        doc.setFillColor(255, 255, 255);
        doc.rect(x - 20, y - 20, qrPrintWidth + 40, qrPrintHeight + 40, 'FD');

        // Draw overlapping coordinates badge inside PDF
        doc.setFillColor(204, 255, 0); // Lime #CCFF00
        doc.rect(x + qrPrintWidth - 40, y + qrPrintHeight + 10, 60, 20, 'FD');
        doc.setTextColor(0, 0, 0);
        doc.setFont('Courier', 'bold');
        doc.setFontSize(7);
        doc.text('SCN_BRUT', x + qrPrintWidth - 35, y + qrPrintHeight + 22);

        // Render QR Code Image
        doc.addImage(canvasData, 'PNG', x, y, qrPrintWidth, qrPrintHeight);

        // Footer table
        const rowY = y + qrPrintHeight + 60;
        doc.line(40, rowY, pageWidth - 40, rowY);

        doc.setTextColor(139, 148, 158);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('SYS_NODE: QR_BRUT_01', 60, rowY + 20);
        doc.text(`SYS_TIME: ${new Date().toISOString()}`, pageWidth - 60, rowY + 20, { align: 'right' });

        // Save PDF
        doc.save(`qr-brutalist-${Date.now()}.pdf`);
        showToast('PDF successfully downloaded.');
    } catch (e) {
        console.error(e);
        showToast('Failed to export PDF.');
    }
}

// Copy source text to Clipboard
function copySourceText() {
    const text = qrTextInput.value.trim();
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Source text copied to clipboard!');
        }).catch(err => {
            console.error('Copy failure', err);
            showToast('Failed to copy text.');
        });
    }
}

// History Storage Cache Engine
function saveToHistoryCache(text, size, errorCorrection, fgColor, bgColor, isRounded, margin) {
    const entryId = `${text}-${fgColor}-${bgColor}-${isRounded}-${uploadedLogoName || 'no_logo'}`;
    const duplicateIndex = historyLog.findIndex(item => item.id === entryId);

    if (duplicateIndex !== -1) {
        const duplicateItem = historyLog.splice(duplicateIndex, 1)[0];
        historyLog.unshift(duplicateItem);
    } else {
        const thumbnail = qrCanvas.toDataURL('image/png');
        const now = new Date();
        const timestamp = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} // UTC+0`;

        const newLog = {
            id: entryId,
            text: text,
            size: size,
            errorCorrection: errorCorrection,
            fgColor: fgColor,
            bgColor: bgColor,
            isRounded: isRounded,
            margin: margin,
            logoName: uploadedLogoName,
            logoSrc: uploadedLogoSrc,
            thumbnail: thumbnail,
            time: timestamp
        };

        historyLog.unshift(newLog);
    }

    if (historyLog.length > 8) {
        historyLog.pop();
    }

    localStorage.setItem('qr_history_quantum_brut', JSON.stringify(historyLog));
    renderHistory();
}

// Load history cache on initialization
function loadHistory() {
    const saved = localStorage.getItem('qr_history_quantum_brut');
    if (saved) {
        try {
            historyLog = JSON.parse(saved);
            renderHistory();
        } catch (e) {
            console.error('History load failure', e);
            historyLog = [];
        }
    }
}

// Render History Cache List
function renderHistory() {
    historyList.innerHTML = '';
    
    if (historyLog.length === 0) {
        historyList.innerHTML = '<li class="history-empty">// NO RECENT RECORDS FOUND //</li>';
        return;
    }

    historyLog.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.addEventListener('click', (e) => {
            if (e.target.closest('.history-delete-btn')) return;
            restoreHistoryItem(index);
        });

        li.innerHTML = `
            <div class="history-item-details">
                <img class="history-thumbnail" src="${item.thumbnail}" alt="QR">
                <div class="history-text-wrapper">
                    <span class="history-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</span>
                    <span class="history-time">${item.time}</span>
                </div>
            </div>
            <button class="history-delete-btn" title="Delete record">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
        `;

        const deleteBtn = li.querySelector('.history-delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteHistoryItem(index);
        });

        historyList.appendChild(li);
    });
}

function deleteHistoryItem(index) {
    historyLog.splice(index, 1);
    localStorage.setItem('qr_history_quantum_brut', JSON.stringify(historyLog));
    renderHistory();
    showToast('Record deleted from history.');
}

function clearHistory() {
    if (confirm('Clear entire cache history?')) {
        historyLog = [];
        localStorage.removeItem('qr_history_quantum_brut');
        renderHistory();
        showToast('History log cleared.');
    }
}

// Restore configuration state
function restoreHistoryItem(index) {
    const item = historyLog[index];
    if (!item) return;

    qrTextInput.value = item.text;
    fgColorInput.value = item.fgColor;
    fgColorVal.textContent = item.fgColor.toUpperCase();
    bgColorInput.value = item.bgColor;
    bgColorVal.textContent = item.bgColor.toUpperCase();
    roundedQrCheck.checked = item.isRounded;
    dotsStatus.textContent = item.isRounded ? 'ACTIVE' : 'INACTIVE';
    qrMarginInput.value = item.margin;
    marginVal.textContent = item.margin;
    qrSizeInput.value = item.size;
    sizeVal.textContent = item.size;
    infoSize.textContent = `${item.size}×${item.size} PX`;
    
    // Sync redundancy details
    errorCorrectionSelect.value = item.errorCorrection;
    const bar = document.getElementById('redundancyBar');
    const percent = document.getElementById('redundancyPercent');
    let pct = '30%';
    if (item.errorCorrection === 'L') pct = '7%';
    if (item.errorCorrection === 'M') pct = '15%';
    if (item.errorCorrection === 'Q') pct = '25%';
    if (item.errorCorrection === 'H') pct = '30%';
    bar.style.width = pct;
    percent.textContent = pct;

    if (item.logoSrc) {
        uploadedLogoSrc = item.logoSrc;
        uploadedLogoName = item.logoName;
        logoPreview.src = item.logoSrc;
        logoNameSpan.textContent = item.logoName;
        dropZone.style.display = 'none';
        logoPreviewContainer.style.display = 'flex';
    } else {
        removeLogo();
    }

    updateLoadBar();
    generateQR(true);
    
    // Auto switch to GENERATE tab for live preview reference
    const generateTabLink = document.querySelector('.nav-link[data-tab="generate"]');
    if (generateTabLink) generateTabLink.click();
    
    showToast('Configuration loaded from history.');
}

// Helper to escape HTML characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Notification Toast Display
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
