/**
 * Mi Billetera Lite - Lógica Principal de la Aplicación (PWA)
 * 100% Offline-First con persistencia en LocalStorage
 */

// Clave de almacenamiento en LocalStorage
const STORAGE_KEY = 'billetera_lite_gastos';

// Mapa de emojis y clases para cada categoría
const CATEGORY_META = {
  'Comida': { icon: '🍔', className: 'cat-comida' },
  'Transporte': { icon: '🚌', className: 'cat-transporte' },
  'Servicios': { icon: '💡', className: 'cat-servicios' },
  'Ocio': { icon: '🎮', className: 'cat-ocio' },
  'Otros': { icon: '📦', className: 'cat-otros' }
};

// Elementos del DOM
const expenseForm = document.getElementById('expenseForm');
const conceptInput = document.getElementById('conceptInput');
const amountInput = document.getElementById('amountInput');
const categoryInput = document.getElementById('categoryInput');
const conceptError = document.getElementById('conceptError');
const amountError = document.getElementById('amountError');

const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const expenseListEl = document.getElementById('expenseList');
const emptyStateEl = document.getElementById('emptyState');
const historyCounterEl = document.getElementById('historyCounter');
const clearContainerEl = document.getElementById('clearContainer');
const btnClearAll = document.getElementById('btnClearAll');

const connectionBadge = document.getElementById('connectionBadge');
const connectionText = document.getElementById('connectionText');
const btnInstall = document.getElementById('btnInstall');
const toastEl = document.getElementById('toast');

let deferredInstallPrompt = null;
let toastTimeout = null;

// ==========================================================================
// 1. Registro del Service Worker
// ==========================================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado exitosamente con scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Error al registrar el Service Worker:', error);
        });
    });
  } else {
    console.warn('[PWA] Los Service Workers no están soportados en este navegador.');
  }
}

// ==========================================================================
// 2. Manejo de Instalación PWA (beforeinstallprompt)
// ==========================================================================
function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el banner automático del navegador para controlarlo nosotros
    e.preventDefault();
    deferredInstallPrompt = e;
    // Mostrar el botón de instalación en el encabezado
    if (btnInstall) {
      btnInstall.classList.remove('hidden');
    }
    console.log('[PWA] Evento beforeinstallprompt capturado. Listo para instalar.');
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;

      // Mostrar el prompt nativo de instalación
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      console.log('[PWA] Elección del usuario:', choiceResult.outcome);

      // Limpiar prompt diferido y ocultar botón si fue aceptado
      deferredInstallPrompt = null;
      btnInstall.classList.add('hidden');
    });
  }

  // Detectar cuando la app ya fue instalada
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Mi Billetera Lite fue instalada exitosamente.');
    if (btnInstall) {
      btnInstall.classList.add('hidden');
    }
    showToast('¡Aplicación instalada exitosamente!');
  });
}

// ==========================================================================
// 3. Detección de Estado de Red (Online / Offline)
// ==========================================================================
function updateConnectionStatus() {
  const isOnline = navigator.onLine;

  if (isOnline) {
    connectionBadge.classList.remove('offline');
    connectionBadge.classList.add('online');
    connectionBadge.title = 'Conectado a Internet';
    connectionText.textContent = 'En línea';
  } else {
    connectionBadge.classList.remove('online');
    connectionBadge.classList.add('offline');
    connectionBadge.title = 'Sin conexión (Modo Offline activo)';
    connectionText.textContent = 'Sin conexión';
  }
}

function setupNetworkListeners() {
  updateConnectionStatus();

  window.addEventListener('online', () => {
    updateConnectionStatus();
    showToast('🟢 Conexión restablecida');
  });

  window.addEventListener('offline', () => {
    updateConnectionStatus();
    showToast('🟠 Modo sin conexión activo (100% funcional)', 'warning');
  });
}

// ==========================================================================
// 4. Persistencia de Datos (LocalStorage)
// ==========================================================================
function getGastos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Storage] Error al leer LocalStorage:', error);
    return [];
  }
}

function saveGastos(gastos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
  } catch (error) {
    console.error('[Storage] Error al guardar en LocalStorage:', error);
    showToast('Error de almacenamiento en el dispositivo', 'danger');
  }
}

function addGasto(concepto, monto, categoria) {
  const gastos = getGastos();
  const nuevoGasto = {
    id: 'gasto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    concepto: concepto.trim(),
    monto: parseFloat(parseFloat(monto).toFixed(2)),
    categoria: categoria,
    fecha: new Date().toISOString()
  };

  // Insertar al inicio para mantener orden descendente (más reciente al más antiguo)
  gastos.unshift(nuevoGasto);
  saveGastos(gastos);
  render();
  return nuevoGasto;
}

function deleteGasto(id) {
  const gastos = getGastos();
  const index = gastos.findIndex((g) => g.id === id);
  if (index !== -1) {
    const eliminado = gastos.splice(index, 1)[0];
    saveGastos(gastos);
    render();
    showToast(`Eliminado: "${eliminado.concepto}"`);
  }
}

function clearAllGastos() {
  if (confirm('¿Estás seguro de que deseas borrar todos los gastos registrados? Esta acción no se puede deshacer.')) {
    saveGastos([]);
    render();
    showToast('Historial vaciado correctamente');
  }
}

// ==========================================================================
// 5. Formateo y Renderizado en la Interfaz
// ==========================================================================
const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    
    // Opciones de formato de hora
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const hora = date.toLocaleTimeString('es-MX', timeOptions);

    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Hoy, ${hora}`;
    } else if (isYesterday) {
      return `Ayer, ${hora}`;
    } else {
      const day = date.getDate();
      const month = date.toLocaleDateString('es-MX', { month: 'short' });
      return `${day} ${month}, ${hora}`;
    }
  } catch (e) {
    return 'Reciente';
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function render() {
  const gastos = getGastos();

  // 1. Calcular el Totalizador
  const total = gastos.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);
  totalAmountEl.textContent = formatCurrency(total);
  
  const countText = gastos.length === 1 ? '1 movimiento' : `${gastos.length} movimientos`;
  totalCountEl.textContent = countText;
  historyCounterEl.textContent = gastos.length;

  // 2. Controlar estado vacío y botón de borrar todo
  if (gastos.length === 0) {
    emptyStateEl.style.display = 'flex';
    expenseListEl.innerHTML = '';
    clearContainerEl.classList.add('hidden');
    return;
  }

  emptyStateEl.style.display = 'none';
  clearContainerEl.classList.remove('hidden');

  // 3. Renderizar Lista de Gastos (ordenados del más reciente al más antiguo)
  const itemsHTML = gastos.map((gasto) => {
    const meta = CATEGORY_META[gasto.categoria] || CATEGORY_META['Otros'];
    const safeConcepto = escapeHTML(gasto.concepto);
    const formattedMonto = formatCurrency(gasto.monto);
    const formattedFecha = formatDate(gasto.fecha);

    return `
      <article class="expense-item" data-id="${gasto.id}">
        <div class="expense-left">
          <div class="category-icon ${meta.className}" title="${gasto.categoria}">
            ${meta.icon}
          </div>
          <div class="expense-details">
            <span class="expense-concept" title="${safeConcepto}">${safeConcepto}</span>
            <div class="expense-meta">
              <span>${gasto.categoria}</span>
              <span>•</span>
              <time datetime="${gasto.fecha}">${formattedFecha}</time>
            </div>
          </div>
        </div>
        <div class="expense-right">
          <span class="expense-amount">-$${formattedMonto}</span>
          <button 
            type="button" 
            class="btn-delete" 
            data-delete-id="${gasto.id}" 
            title="Eliminar este gasto"
            aria-label="Eliminar gasto ${safeConcepto}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');

  expenseListEl.innerHTML = itemsHTML;

  // Delegar eventos de borrado
  const deleteButtons = expenseListEl.querySelectorAll('.btn-delete');
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-delete-id');
      if (id) {
        deleteGasto(id);
      }
    });
  });
}

// ==========================================================================
// 6. Validación y Manejo del Formulario
// ==========================================================================
function validateForm() {
  let isValid = true;
  conceptError.textContent = '';
  amountError.textContent = '';

  const conceptoVal = conceptInput.value.trim();
  const montoVal = parseFloat(amountInput.value);

  if (!conceptoVal) {
    conceptError.textContent = 'Ingresa el concepto del gasto.';
    isValid = false;
  }

  if (isNaN(montoVal) || montoVal <= 0) {
    amountError.textContent = 'Ingresa un monto válido mayor a 0.';
    isValid = false;
  }

  return isValid;
}

expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const concepto = conceptInput.value.trim();
  const monto = amountInput.value;
  const categoria = categoryInput.value;

  addGasto(concepto, monto, categoria);

  // Limpiar campos y dar feedback
  expenseForm.reset();
  conceptInput.focus();
  showToast(`✅ Gasto guardado: ${concepto}`);
});

// Limpieza dinámica de errores al escribir
conceptInput.addEventListener('input', () => {
  if (conceptInput.value.trim()) conceptError.textContent = '';
});

amountInput.addEventListener('input', () => {
  if (parseFloat(amountInput.value) > 0) amountError.textContent = '';
});

// Botón de limpiar todo
btnClearAll.addEventListener('click', clearAllGastos);

// ==========================================================================
// 7. Notificaciones Toast
// ==========================================================================
function showToast(message, type = 'normal') {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastEl.textContent = message;
  toastEl.className = 'toast show';

  if (type === 'warning') toastEl.classList.add('toast-warning');
  if (type === 'danger') toastEl.classList.add('toast-danger');

  toastTimeout = setTimeout(() => {
    toastEl.className = 'toast';
  }, 2800);
}

// ==========================================================================
// 8. Inicialización
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  setupInstallPrompt();
  setupNetworkListeners();
  render();
});
