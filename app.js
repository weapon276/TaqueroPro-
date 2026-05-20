// ============ DATOS GLOBALES ============
let taqueriaData = {
    negocio: "Mi Taquería",
    gastos: [],
    ventas: [],
    precioTaco: 15,
    inventario: [],
    premium: false
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    setupNavigation();
});

// Configurar todos los event listeners
function setupEventListeners() {
    // Cambiar nombre del negocio
    const businessNameInput = document.getElementById('businessNameInput');
    if (businessNameInput) {
        businessNameInput.addEventListener('change', function() {
            taqueriaData.negocio = this.value;
            document.getElementById('businessName').innerText = `🌮 ${this.value}`;
            saveData();
        });
    }
    
    // Formulario de gastos
    const gastoForm = document.getElementById('gastoForm');
    if (gastoForm) {
        gastoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarGasto();
        });
    }
    
    // Formulario de ventas
    const ventaForm = document.getElementById('ventaForm');
    if (ventaForm) {
        ventaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registrarVenta();
        });
    }
    
    // Mostrar/ocultar comisión según método de pago
    const metodoPago = document.getElementById('metodoPago');
    if (metodoPago) {
        metodoPago.addEventListener('change', function() {
            const group = document.getElementById('comisionGroup');
            if (group) {
                group.style.display = this.value === 'tarjeta' ? 'block' : 'none';
            }
        });
    }
}

// Configurar navegación por pestañas
function setupNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

// Función global para mostrar pestañas
window.showTab = function(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar el contenido seleccionado
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Actualizar botones activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar displays
    updateAllDisplays();
};

// ============ CARGA Y GUARDADO ============
function loadData() {
    const saved = localStorage.getItem('taqueriaData');
    if (saved) {
        taqueriaData = JSON.parse(saved);
        const businessNameInput = document.getElementById('businessNameInput');
        const businessName = document.getElementById('businessName');
        if (businessNameInput) businessNameInput.value = taqueriaData.negocio;
        if (businessName) businessName.innerText = `🌮 ${taqueriaData.negocio}`;
    }
    if (taqueriaData.premium) {
        activarInventarioPremium();
    }
    updateAllDisplays();
}

function saveData() {
    localStorage.setItem('taqueriaData', JSON.stringify(taqueriaData));
}

// ============ CÁLCULO DE PRECIOS ============
window.calcularPrecioTaco = function() {
    const carne = parseFloat(document.getElementById('carneCosto').value) || 0;
    const tortilla = parseFloat(document.getElementById('tortillaCosto').value) || 0;
    const verdura = parseFloat(document.getElementById('verduraCosto').value) || 0;
    const salsa = parseFloat(document.getElementById('salsaCosto').value) || 0;
    const ganancia = parseFloat(document.getElementById('gananciaPorcentaje').value) || 40;
    
    // 1kg de carne rinde ~40 tacos, 1kg de tortilla rinde ~50 tortillas
    const costoCarnePorTaco = carne / 40;
    const costoTortillaPorTaco = tortilla / 50;
    const costoTotal = costoCarnePorTaco + costoTortillaPorTaco + verdura + salsa;
    const precioSugerido = costoTotal * (1 + ganancia / 100);
    
    const resultado = document.getElementById('precioResultado');
    if (resultado) {
        resultado.style.display = 'block';
        resultado.innerHTML = `
            <strong>💰 Costo por taco: $${costoTotal.toFixed(2)}</strong><br>
            📈 Ganancia ${ganancia}%: $${precioSugerido.toFixed(2)}<br>
            🎯 Precio sugerido: <strong>$${Math.ceil(precioSugerido)}</strong>
        `;
    }
    
    // Consejo según zona
    const consejo = document.getElementById('consejoPrecio');
    if (consejo) {
        if (precioSugerido > 25) {
            consejo.innerHTML = "⚠️ Precio alto para zona económica. Considera reducir ganancia al 30-35% o mejorar calidad.";
        } else if (precioSugerido < 12) {
            consejo.innerHTML = "✅ Buen precio competitivo. Podrías aumentar ganancia al 45-50% si la zona lo permite.";
        } else {
            consejo.innerHTML = "🎯 Precio óptimo para zona media. Ajusta ±$2 según tu ubicación específica.";
        }
    }
    
    taqueriaData.precioTaco = Math.ceil(precioSugerido);
    saveData();
};

// ============ REGISTRO DE GASTOS ============
function registrarGasto() {
    const fecha = document.getElementById('gastoFecha').value;
    const categoria = document.getElementById('gastoCategoria').value;
    const descripcion = document.getElementById('gastoDesc').value;
    const monto = parseFloat(document.getElementById('gastoMonto').value);
    
    if (!fecha || !descripcion || isNaN(monto)) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const gasto = {
        id: Date.now(),
        fecha: fecha,
        categoria: categoria,
        descripcion: descripcion,
        monto: monto
    };
    
    taqueriaData.gastos.push(gasto);
    saveData();
    updateGastosList();
    
    // Limpiar formulario
    document.getElementById('gastoFecha').value = '';
    document.getElementById('gastoDesc').value = '';
    document.getElementById('gastoMonto').value = '';
    
    alert('✅ Gasto registrado correctamente');
}

// ============ REGISTRO DE VENTAS ============
function registrarVenta() {
    const fecha = document.getElementById('ventaFecha').value;
    const tacos = parseInt(document.getElementById('tacosVendidos').value);
    const precioUnitario = parseFloat(document.getElementById('precioTaco').value);
    const metodo = document.getElementById('metodoPago').value;
    
    if (!fecha || isNaN(tacos) || isNaN(precioUnitario)) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    let comision = 0;
    let comisionMonto = 0;
    
    if (metodo === 'tarjeta') {
        comision = parseFloat(document.getElementById('comisionTerminal').value) || 3.5;
    }
    
    const subtotal = tacos * precioUnitario;
    comisionMonto = (subtotal * comision) / 100;
    const total = subtotal - comisionMonto;
    
    const venta = {
        id: Date.now(),
        fecha: fecha,
        tacos: tacos,
        precioUnitario: precioUnitario,
        metodo: metodo,
        comisionPorcentaje: comision,
        comisionMonto: comisionMonto,
        subtotal: subtotal,
        total: total
    };
    
    taqueriaData.ventas.push(venta);
    saveData();
    updateVentasList();
    
    // Limpiar formulario
    document.getElementById('ventaFecha').value = '';
    document.getElementById('tacosVendidos').value = '';
    document.getElementById('precioTaco').value = '';
    
    alert(`✅ Venta registrada\nTotal recibido: $${total.toFixed(2)}`);
}

// ============ ACTUALIZAR LISTAS ============
function updateGastosList() {
    const container = document.getElementById('gastosList');
    if (!container) return;
    
    if (taqueriaData.gastos.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">No hay gastos registrados</p>';
        return;
    }
    
    const gastosOrdenados = [...taqueriaData.gastos].reverse();
    container.innerHTML = gastosOrdenados.map(g => `
        <div class="record-item">
            <strong>${g.fecha}</strong> - ${g.categoria}<br>
            📝 ${g.descripcion}<br>
            💸 $${g.monto.toFixed(2)}
            <button onclick="eliminarGasto(${g.id})" style="background:#D32F2F; padding:5px 10px; margin-top:5px;">Eliminar</button>
        </div>
    `).join('');
}

function updateVentasList() {
    const container = document.getElementById('ventasList');
    if (!container) return;
    
    if (taqueriaData.ventas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">No hay ventas registradas</p>';
        return;
    }
    
    const ventasOrdenadas = [...taqueriaData.ventas].reverse();
    container.innerHTML = ventasOrdenadas.map(v => `
        <div class="record-item">
            <strong>${v.fecha}</strong> - ${v.tacos} tacos<br>
            💰 Precio: $${v.precioUnitario} c/u<br>
            💳 ${v.metodo === 'tarjeta' ? `Tarjeta (comisión ${v.comisionPorcentaje}%: -$${v.comisionMonto.toFixed(2)})` : 'Efectivo'}<br>
            <strong>Total recibido: $${v.total.toFixed(2)}</strong>
            <button onclick="eliminarVenta(${v.id})" style="background:#D32F2F; padding:5px 10px; margin-top:5px;">Eliminar</button>
        </div>
    `).join('');
}

// ============ ELIMINAR REGISTROS ============
window.eliminarGasto = function(id) {
    if (confirm('¿Eliminar este gasto?')) {
        taqueriaData.gastos = taqueriaData.gastos.filter(g => g.id !== id);
        saveData();
        updateGastosList();
        updateAllDisplays();
    }
};

window.eliminarVenta = function(id) {
    if (confirm('¿Eliminar esta venta?')) {
        taqueriaData.ventas = taqueriaData.ventas.filter(v => v.id !== id);
        saveData();
        updateVentasList();
        updateAllDisplays();
    }
};

// ============ CÁLCULO DE TOTALES ============
function calcularTotales() {
    const totalVentas = taqueriaData.ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = taqueriaData.gastos.reduce((sum, g) => sum + g.monto, 0);
    const gananciaNeta = totalVentas - totalGastos;
    return { totalVentas, totalGastos, gananciaNeta };
}

// ============ DASHBOARD ============
function updateDashboard() {
    const { totalVentas, totalGastos, gananciaNeta } = calcularTotales();
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = taqueriaData.ventas.filter(v => v.fecha === hoy).reduce((sum, v) => sum + v.total, 0);
    const gastosHoy = taqueriaData.gastos.filter(g => g.fecha === hoy).reduce((sum, g) => sum + g.monto, 0);
    
    const summary = document.getElementById('dailySummary');
    if (summary) {
        summary.innerHTML = `
            <div class="grid-2">
                <div style="background:#e8f5e9; padding:15px; border-radius:10px;">
                    <h4>💰 Ventas hoy</h4>
                    <p style="font-size:24px; font-weight:bold;">$${ventasHoy.toFixed(2)}</p>
                </div>
                <div style="background:#ffebee; padding:15px; border-radius:10px;">
                    <h4>💸 Gastos hoy</h4>
                    <p style="font-size:24px; font-weight:bold;">$${gastosHoy.toFixed(2)}</p>
                </div>
                <div style="background:#e3f2fd; padding:15px; border-radius:10px;">
                    <h4>📈 Ganancia neta hoy</h4>
                    <p style="font-size:24px; font-weight:bold;">$${(ventasHoy - gastosHoy).toFixed(2)}</p>
                </div>
                <div style="background:#fff3e0; padding:15px; border-radius:10px;">
                    <h4>🎯 Total acumulado</h4>
                    <p style="font-size:24px; font-weight:bold;">$${gananciaNeta.toFixed(2)}</p>
                </div>
            </div>
        `;
    }
    
    // Gráficas
    const ventasEfectivo = taqueriaData.ventas.filter(v => v.metodo === 'efectivo').reduce((sum, v) => sum + v.total, 0);
    const ventasTarjeta = taqueriaData.ventas.filter(v => v.metodo === 'tarjeta').reduce((sum, v) => sum + v.total, 0);
    
    if (document.getElementById('salesChart') && (ventasEfectivo > 0 || ventasTarjeta > 0)) {
        Highcharts.chart('salesChart', {
            chart: { type: 'pie' },
            title: { text: 'Ventas por método' },
            series: [{ name: 'Ventas', data: [
                { name: 'Efectivo', y: ventasEfectivo, color: '#4CAF50' },
                { name: 'Tarjeta', y: ventasTarjeta, color: '#FF9800' }
            ]}]
        });
    }
    
    const totalVentasTotal = taqueriaData.ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastosTotal = taqueriaData.gastos.reduce((sum, g) => sum + g.monto, 0);
    
    if (document.getElementById('profitChart')) {
        Highcharts.chart('profitChart', {
            chart: { type: 'column' },
            title: { text: 'Ingresos vs Gastos Totales' },
            xAxis: { categories: ['Totales'] },
            series: [
                { name: 'Ingresos', data: [totalVentasTotal], color: '#4CAF50' },
                { name: 'Gastos', data: [totalGastosTotal], color: '#F44336' }
            ]
        });
    }
}

// ============ REPORTES ============
window.generarReporte = function(tipo) {
    const hoy = new Date();
    let fechaInicio, fechaFin;
    const fechaFinStr = hoy.toISOString().split('T')[0];
    
    if (tipo === 'diario') {
        fechaInicio = fechaFinStr;
        fechaFin = fechaFinStr;
    } else if (tipo === 'semanal') {
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - hoy.getDay());
        fechaInicio = inicio.toISOString().split('T')[0];
        fechaFin = fechaFinStr;
    } else if (tipo === 'mensual') {
        fechaInicio = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`;
        fechaFin = fechaFinStr;
    } else {
        fechaInicio = `${hoy.getFullYear()}-01-01`;
        fechaFin = fechaFinStr;
    }
    
    const ventasPeriodo = taqueriaData.ventas.filter(v => v.fecha >= fechaInicio && v.fecha <= fechaFin);
    const gastosPeriodo = taqueriaData.gastos.filter(g => g.fecha >= fechaInicio && g.fecha <= fechaFin);
    
    const totalVentas = ventasPeriodo.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = gastosPeriodo.reduce((sum, g) => sum + g.monto, 0);
    const ganancia = totalVentas - totalGastos;
    const totalTacos = ventasPeriodo.reduce((sum, v) => sum + v.tacos, 0);
    
    const resultado = document.getElementById('reporteResultado');
    if (resultado) {
        resultado.innerHTML = `
            <div style="background:#f5f5f5; padding:15px; border-radius:10px;">
                <h4>📊 Reporte ${tipo.toUpperCase()}</h4>
                <p>📅 Período: ${fechaInicio} al ${fechaFin}</p>
                <hr style="margin:10px 0;">
                <p>💰 Ventas totales: <strong>$${totalVentas.toFixed(2)}</strong></p>
                <p>💸 Gastos totales: <strong>$${totalGastos.toFixed(2)}</strong></p>
                <p>📈 Ganancia neta: <strong style="color:${ganancia >= 0 ? '#4CAF50' : '#F44336'}">$${ganancia.toFixed(2)}</strong></p>
                <p>🎯 Tacos vendidos: ${totalTacos} unidades</p>
                <p>💰 Precio promedio por taco: ${totalTacos > 0 ? '$' + (totalVentas / totalTacos).toFixed(2) : 'N/A'}</p>
            </div>
        `;
    }
};

// ============ PREMIUM ============
window.mostrarPremiumModal = function() {
    const modal = document.getElementById('premiumModal');
    if (modal) modal.classList.add('active');
};

window.cerrarPremiumModal = function() {
    const modal = document.getElementById('premiumModal');
    if (modal) modal.classList.remove('active');
};

window.simularPago = function() {
    taqueriaData.premium = true;
    saveData();
    cerrarPremiumModal();
    activarInventarioPremium();
    alert('✅ ¡Inventario Premium desbloqueado! Ahora puedes controlar tu stock.');
};

function activarInventarioPremium() {
    const lockDiv = document.getElementById('premiumLockModal');
    const contentDiv = document.getElementById('inventarioContent');
    if (lockDiv && contentDiv) {
        lockDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        cargarInventarioPremium();
    }
}

function cargarInventarioPremium() {
    const container = document.getElementById('inventarioContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h3>📦 Control de inventario</h3>
            <form id="productoForm">
                <div class="grid-2">
                    <div class="form-group">
                        <label>📝 Producto</label>
                        <input type="text" id="productoNombre" required>
                    </div>
                    <div class="form-group">
                        <label>🏷️ Categoría</label>
                        <select id="productoCategoria">
                            <option>Carne</option>
                            <option>Verdura</option>
                            <option>Tortillas</option>
                            <option>Salsas</option>
                            <option>Refrescos</option>
                            <option>Otros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>💰 Costo por unidad</label>
                        <input type="number" id="productoCosto" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>📦 Cantidad en stock</label>
                        <input type="number" id="productoCantidad" required>
                    </div>
                    <div class="form-group">
                        <label>📅 Fecha de compra</label>
                        <input type="date" id="productoFecha" required>
                    </div>
                    <div class="form-group">
                        <label>⚠️ Stock mínimo alerta</label>
                        <input type="number" id="productoMinimo" value="10">
                    </div>
                </div>
                <button type="submit">➕ Agregar producto</button>
            </form>
        </div>
        <div class="card">
            <h3>📋 Inventario actual</h3>
            <div id="inventarioLista"></div>
        </div>
    `;
    
    const productoForm = document.getElementById('productoForm');
    if (productoForm) {
        productoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const producto = {
                id: Date.now(),
                nombre: document.getElementById('productoNombre').value,
                categoria: document.getElementById('productoCategoria').value,
                costo: parseFloat(document.getElementById('productoCosto').value),
                cantidad: parseInt(document.getElementById('productoCantidad').value),
                fecha: document.getElementById('productoFecha').value,
                minimo: parseInt(document.getElementById('productoMinimo').value)
            };
            taqueriaData.inventario.push(producto);
            saveData();
            actualizarListaInventario();
            this.reset();
            alert('✅ Producto agregado al inventario');
        });
    }
    
    actualizarListaInventario();
}

function actualizarListaInventario() {
    const container = document.getElementById('inventarioLista');
    if (!container) return;
    
    if (taqueriaData.inventario.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">No hay productos en inventario</p>';
        return;
    }
    
    let alertas = [];
    container.innerHTML = taqueriaData.inventario.map(p => {
        if (p.cantidad <= p.minimo) alertas.push(p.nombre);
        return `
            <div class="record-item">
                <strong>${p.nombre}</strong> (${p.categoria})<br>
                💰 $${p.costo} c/u | 📦 ${p.cantidad} unidades<br>
                📅 Compra: ${p.fecha}<br>
                ${p.cantidad <= p.minimo ? '⚠️ <strong style="color:#F57C00;">¡Stock bajo! Necesitas reabastecer</strong>' : ''}
                <button onclick="eliminarProducto(${p.id})" style="background:#D32F2F; padding:5px 10px; margin-top:5px;">Eliminar</button>
            </div>
        `;
    }).join('');
    
    if (alertas.length > 0) {
        const notificacion = document.getElementById('inventarioContent');
        if (notificacion && !document.querySelector('.alert-stock')) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-stock';
            alertDiv.style.marginBottom = '10px';
            alertDiv.innerHTML = `⚠️ <strong>Productos con stock bajo:</strong> ${alertas.join(', ')}`;
            notificacion.insertBefore(alertDiv, container);
            setTimeout(() => alertDiv.remove(), 5000);
        }
    }
}

window.eliminarProducto = function(id) {
    if (confirm('¿Eliminar este producto del inventario?')) {
        taqueriaData.inventario = taqueriaData.inventario.filter(p => p.id !== id);
        saveData();
        actualizarListaInventario();
    }
};

// ============ ACTUALIZAR TODO ============
function updateAllDisplays() {
    updateDashboard();
    updateGastosList();
    updateVentasList();
    if (taqueriaData.premium) {
        actualizarListaInventario();
    }
}

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('Service Worker registrado:', reg);
    }).catch(err => {
        console.log('Error al registrar Service Worker:', err);
    });
}
