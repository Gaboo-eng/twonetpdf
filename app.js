(function () {
  'use strict';

  const APP_VERSION = 'v1.0.1';
  const DEFAULT_DOC_NAME = 'TwonetPDF_documento';
  const DEFAULT_TITLES = [
    'Comprobante de Pago',
    'Captura de Solicitud IPTV',
    'Documento de Identidad',
    'Formato de Cambio Titular'
  ];

  const state = {
    layout: 2,
    selectedFieldIndex: 0,
    fields: [],
    filePickerTarget: null
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function getTodayDDMMYYYY() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function sanitizeFileName(name) {
    const base = (name || '').trim() || DEFAULT_DOC_NAME;
    return base.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim() || DEFAULT_DOC_NAME;
  }

  function initState() {
    state.fields = Array.from({ length: 4 }, (_, i) => ({
      title: DEFAULT_TITLES[i] || `Campo ${i + 1}`,
      imageData: null,
      imageFormat: null
    }));
  }

  function cacheEls() {
    els.docName = $('docName');
    els.docDescription = $('docDescription');
    els.docDate = $('docDate');
    els.sheetDocName = $('sheetDocName');
    els.sheetDocDescription = $('sheetDocDescription');
    els.sheetDocDate = $('sheetDocDate');
    els.sheetAppVersion = $('sheetAppVersion');
    els.a4Sheet = $('a4Sheet');
    els.fieldsGrid = $('fieldsGrid');
    els.layoutSelector = $('layoutSelector');
    els.downloadBtn = $('downloadBtn');
    els.printBtn = $('printBtn');
    els.clearAllBtn = $('clearAllBtn');
    els.filePicker = $('filePicker');
  }

  function setLayout(layout) {
    const n = Number(layout);
    if (![2, 3, 4].includes(n)) return;
    state.layout = n;
    if (state.selectedFieldIndex >= n) state.selectedFieldIndex = 0;
    els.a4Sheet.classList.remove('layout-2', 'layout-3', 'layout-4');
    els.a4Sheet.classList.add(`layout-${n}`);
    const buttons = els.layoutSelector.querySelectorAll('.seg-btn');
    buttons.forEach((btn) => {
      const active = Number(btn.dataset.layout) === n;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderFields();
  }

  function updateSheetHeader() {
    const name = (els.docName.value || '').trim();
    const desc = (els.docDescription.value || '').trim();
    els.sheetDocName.textContent = name || DEFAULT_DOC_NAME;
    if (desc) {
      els.sheetDocDescription.textContent = desc;
      els.sheetDocDescription.hidden = false;
    } else {
      els.sheetDocDescription.textContent = '';
      els.sheetDocDescription.hidden = true;
    }
  }

  function renderFields() {
    els.fieldsGrid.innerHTML = '';
    for (let i = 0; i < state.layout; i++) {
      els.fieldsGrid.appendChild(createFieldElement(i));
    }
  }

  function createFieldElement(index) {
    const field = state.fields[index];
    const wrapper = document.createElement('article');
    wrapper.className = 'image-field' + (index === state.selectedFieldIndex ? ' selected' : '') + (field.imageData ? ' has-image' : '');
    wrapper.dataset.index = String(index);
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', `Campo ${index + 1}`);

    const top = document.createElement('div');
    top.className = 'field-top';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'field-title-input';
    titleInput.value = field.title;
    titleInput.placeholder = `Título del campo ${index + 1}`;
    titleInput.setAttribute('aria-label', `Título del campo ${index + 1}`);
    titleInput.addEventListener('input', (e) => {
      state.fields[index].title = e.target.value;
    });
    titleInput.addEventListener('click', (e) => e.stopPropagation());
    titleInput.addEventListener('focus', () => selectField(index));

    const actions = document.createElement('div');
    actions.className = 'field-actions';

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'icon-btn select-btn';
    selectBtn.textContent = field.imageData ? 'Cambiar' : 'Seleccionar';
    selectBtn.title = 'Seleccionar imagen';
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openFilePicker(index);
    });

    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.className = 'icon-btn replace-btn';
    replaceBtn.textContent = 'Reemplazar';
    replaceBtn.title = 'Reemplazar imagen';
    replaceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openFilePicker(index);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn delete-img-btn danger';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.title = 'Eliminar imagen';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearFieldImage(index);
    });

    actions.append(selectBtn, replaceBtn, deleteBtn);
    top.append(titleInput, actions);

    const preview = document.createElement('div');
    preview.className = 'preview-area';
    if (field.imageData) {
      const img = document.createElement('img');
      img.className = 'preview-image';
      img.src = field.imageData;
      img.alt = field.title || `Imagen del campo ${index + 1}`;
      preview.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'preview-placeholder';
      ph.innerHTML = 'Sin imagen<br><small>Haz clic, arrastra o pega con Ctrl + V</small>';
      preview.appendChild(ph);
    }

    wrapper.append(top, preview);

    wrapper.addEventListener('click', () => selectField(index));
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target === wrapper) {
          e.preventDefault();
          selectField(index);
        }
      }
    });

    wrapper.addEventListener('dragenter', (e) => {
      e.preventDefault();
      wrapper.classList.add('drag-over');
    });
    wrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      wrapper.classList.add('drag-over');
    });
    wrapper.addEventListener('dragleave', (e) => {
      if (!wrapper.contains(e.relatedTarget)) {
        wrapper.classList.remove('drag-over');
      }
    });
    wrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      wrapper.classList.remove('drag-over');
      selectField(index);
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadImageFile(file, index);
      }
    });

    return wrapper;
  }

  function selectField(index) {
    if (index < 0 || index >= state.layout) return;
    state.selectedFieldIndex = index;
    const nodes = els.fieldsGrid.querySelectorAll('.image-field');
    nodes.forEach((node) => {
      node.classList.toggle('selected', Number(node.dataset.index) === index);
    });
  }

  function openFilePicker(index) {
    state.filePickerTarget = index;
    selectField(index);
    els.filePicker.value = '';
    els.filePicker.click();
  }

  function loadImageFile(file, index) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.fields[index].imageData = reader.result;
      state.fields[index].imageFormat = file.type === 'image/jpeg' ? 'JPEG' : 'PNG';
      renderFields();
      selectField(index);
    };
    reader.readAsDataURL(file);
  }

  function clearFieldImage(index) {
    state.fields[index].imageData = null;
    state.fields[index].imageFormat = null;
    renderFields();
    selectField(index);
  }

  function hasLoadedData() {
    const hasText = (els.docName.value || '').trim() !== '' || (els.docDescription.value || '').trim() !== '';
    const hasImages = state.fields.some((f) => !!f.imageData);
    return hasText || hasImages;
  }

  function clearAll() {
    if (hasLoadedData()) {
      const ok = window.confirm('¿Deseas eliminar todo? Se borrarán las imágenes, el nombre y la descripción.');
      if (!ok) return;
    }
    els.docName.value = '';
    els.docDescription.value = '';
    initState();
    updateSheetHeader();
    setLayout(2);
    state.selectedFieldIndex = 0;
    renderFields();
  }

  function handlePaste(e) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.id !== 'docDate') {
      // allow normal paste into text fields
      if (target.type !== 'file') return;
    }
    const items = (e.clipboardData || window.clipboardData) && (e.clipboardData || window.clipboardData).items;
    if (!items) return;
    let imageItem = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') !== -1) {
        imageItem = items[i];
        break;
      }
    }
    if (!imageItem) return;
    const index = (state.selectedFieldIndex >= 0 && state.selectedFieldIndex < state.layout) ? state.selectedFieldIndex : 0;
    const file = imageItem.getAsFile ? imageItem.getAsFile() : null;
    if (!file) return;
    e.preventDefault();
    selectField(index);
    loadImageFile(file, index);
  }

  function getImageFormat(dataUrl) {
    if (!dataUrl) return 'PNG';
    if (dataUrl.indexOf('data:image/jpeg') === 0 || dataUrl.indexOf('data:image/jpg') === 0) return 'JPEG';
    return 'PNG';
  }

  function loadImageDimensions(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
  }

  function getLayoutRects(layout, contentX, contentY, contentW, contentH, gap) {
    const rects = [];
    if (layout === 2) {
      const h = (contentH - gap) / 2;
      rects.push({ x: contentX, y: contentY, w: contentW, h });
      rects.push({ x: contentX, y: contentY + h + gap, w: contentW, h });
    } else if (layout === 3) {
      const topH = contentH * 0.56 - gap / 2;
      const bottomH = contentH - topH - gap;
      const halfW = (contentW - gap) / 2;
      rects.push({ x: contentX, y: contentY, w: contentW, h: topH });
      rects.push({ x: contentX, y: contentY + topH + gap, w: halfW, h: bottomH });
      rects.push({ x: contentX + halfW + gap, y: contentY + topH + gap, w: halfW, h: bottomH });
    } else {
      const halfW = (contentW - gap) / 2;
      const halfH = (contentH - gap) / 2;
      rects.push({ x: contentX, y: contentY, w: halfW, h: halfH });
      rects.push({ x: contentX + halfW + gap, y: contentY, w: halfW, h: halfH });
      rects.push({ x: contentX, y: contentY + halfH + gap, w: halfW, h: halfH });
      rects.push({ x: contentX + halfW + gap, y: contentY + halfH + gap, w: halfW, h: halfH });
    }
    return rects;
  }

  async function downloadPDF() {
    const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) {
      window.alert('No se pudo cargar la librería jsPDF. Verifica tu conexión e inténtalo nuevamente.');
      return;
    }

    const doc = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = 210;
    const pageH = 297;
    const margin = 12;
    const innerW = pageW - margin * 2;

    const docName = (els.docName.value || '').trim() || DEFAULT_DOC_NAME;
    const description = (els.docDescription.value || '').trim();
    const dateText = els.docDate.value || getTodayDDMMYYYY();

    let y = margin;
    doc.setTextColor(31, 35, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const nameLines = doc.splitTextToSize(docName, innerW - 45);
    doc.text(nameLines, margin, y + 2);
    const nameBlockH = nameLines.length * 6.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(31, 35, 40);
    doc.text(`Fecha: ${dateText}`, pageW - margin, y + 2, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Versión: ${APP_VERSION}`, pageW - margin, y + 6.5, { align: 'right' });

    y += Math.max(nameBlockH, 10) + 2;

    if (description) {
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(description, innerW);
      doc.text(descLines, margin, y);
      y += descLines.length * 4.8 + 2;
    }

    doc.setDrawColor(220, 226, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 4;

    const contentX = margin;
    const contentY = y;
    const contentW = innerW;
    const contentH = pageH - margin - contentY;
    const gap = 5;
    const rects = getLayoutRects(state.layout, contentX, contentY, contentW, contentH, gap);

    for (let i = 0; i < state.layout; i++) {
      const rect = rects[i];
      const field = state.fields[i];
      const title = (field.title || `Campo ${i + 1}`).trim() || `Campo ${i + 1}`;

      doc.setDrawColor(213, 222, 234);
      doc.setFillColor(251, 252, 254);
      doc.roundedRect(rect.x, rect.y, rect.w, rect.h, 2, 2, 'FD');

      const padding = 3;
      const titleH = 6;
      doc.setTextColor(31, 95, 191);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const titleLines = doc.splitTextToSize(title, rect.w - padding * 2);
      const titleLine = titleLines[0] || title;
      doc.text(titleLine, rect.x + padding, rect.y + padding + 3.5);

      const imgBox = {
        x: rect.x + padding,
        y: rect.y + padding + titleH,
        w: rect.w - padding * 2,
        h: rect.h - padding * 2 - titleH
      };

      if (field.imageData) {
        const dims = await loadImageDimensions(field.imageData);
        const scale = Math.min(imgBox.w / dims.w, imgBox.h / dims.h);
        const drawW = dims.w * scale;
        const drawH = dims.h * scale;
        const drawX = imgBox.x + (imgBox.w - drawW) / 2;
        const drawY = imgBox.y + (imgBox.h - drawH) / 2;
        const format = field.imageFormat || getImageFormat(field.imageData);
        try {
          doc.addImage(field.imageData, format, drawX, drawY, drawW, drawH, undefined, 'FAST');
        } catch (err) {
          try {
            doc.addImage(field.imageData, 'PNG', drawX, drawY, drawW, drawH, undefined, 'FAST');
          } catch (_) {
            doc.setTextColor(140, 140, 140);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('No se pudo insertar la imagen.', imgBox.x + imgBox.w / 2, imgBox.y + imgBox.h / 2, { align: 'center' });
          }
        }
      } else {
        doc.setTextColor(150, 160, 175);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Sin imagen', imgBox.x + imgBox.w / 2, imgBox.y + imgBox.h / 2, { align: 'center', baseline: 'middle' });
      }
    }

    doc.save(`${sanitizeFileName(docName)}.pdf`);
  }

  function printDocument() {
    window.print();
  }

  function bindEvents() {
    els.docName.addEventListener('input', updateSheetHeader);
    els.docDescription.addEventListener('input', updateSheetHeader);

    els.layoutSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setLayout(btn.dataset.layout);
    });

    els.downloadBtn.addEventListener('click', () => {
      downloadPDF();
    });

    els.printBtn.addEventListener('click', printDocument);
    els.clearAllBtn.addEventListener('click', clearAll);

    els.filePicker.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      const index = state.filePickerTarget != null ? state.filePickerTarget : state.selectedFieldIndex;
      if (file) loadImageFile(file, index);
      state.filePickerTarget = null;
      els.filePicker.value = '';
    });

    document.addEventListener('paste', handlePaste);

    // Prevent default browser behavior for image drops outside fields
    document.addEventListener('dragover', (e) => {
      if (e.target && e.target.closest && e.target.closest('.image-field')) return;
      e.preventDefault();
    });
    document.addEventListener('drop', (e) => {
      if (e.target && e.target.closest && e.target.closest('.image-field')) return;
      e.preventDefault();
    });
  }

  function init() {
    cacheEls();
    initState();
    const today = getTodayDDMMYYYY();
    els.docDate.value = today;
    els.sheetDocDate.textContent = today;
    if (els.sheetAppVersion) {
      els.sheetAppVersion.textContent = `TwonetPDF ${APP_VERSION}`;
    }
    updateSheetHeader();
    bindEvents();
    setLayout(2);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
