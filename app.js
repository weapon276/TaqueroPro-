// Datos globales
let taqueriaData = {
    negocio: "Mi Taquería",
    gastos: [],
    ventas: [],
    precioTaco: 15,
    inventario: [],
    premium: false
};

// Cargar datos
function loadData() {
    const saved = localStorage.getItem('taqueriaData');
    if (saved) {
        taqueriaData = JSON.parse(saved);
        document.getElementById('businessNameInput').value = taqueriaData.negocio;
        document.getElementById('businessName').innerText = `🌮 ${taqueriaData.negocio}`;
    }
    if (taqueriaData.premium) {
        activarInventarioPremium();
    }
    updateAllDisplays();
}

// Guardar datos
function saveData() {
    localStorage.setItem('taqueriaData', JSON.stringify(taqueriaData));
}

// Cambiar nombre del negocio
document.getElementById('businessNameInput')?.addEventListener('change', function() {
    taqueriaData.negocio = this.value;
    document.getElementById('businessName').innerText = `🌮 ${this.value}`;
    saveData();
});

// Navegación
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateAllDisplays();
}

// Calcular precio de taco
function calcularPrecioTaco() {
    const carne = parseFloat(document.getElementById('carneCosto').value) || 0;
    const tortilla = parseFloat(document.getElementById('tortillaCosto').value) || 0;
    const verdura = parseFloat(document.getElementById('verduraCosto').value) || 0;
    const salsa = parseFloat(document.getElementById('salsaCosto').value) || 0;
    const ganancia = parseFloat(document.getElementById('gananciaPorcentaje').value) || 40;
    
    // 1kg de carne rinde ~40 tacos
    const costoCarnePorTaco = carne / 40;
    const costoTortillaPorTaco = tortilla / 50; // 50 tortillas por kg
    const costoTotal = costoCarnePorTaco + costoTortillaPorTaco + verdura + salsa;
    const precioSugerido = costoTotal * (1 + ganancia / 100);
    
    const resultado = document.getElementById('precioResultado');
    resultado.style.display = 'block';
    resultado.innerHTML = `
        <strong>💰 Costo por taco: $${costoTotal.toFixed(2)}</strong><br>
        📈 Ganancia ${ganancia}%: $${precioSugerido.toFixed(2)}<br>
        🎯 Precio sugerido: <strong>$${Math.ceil(precioSugerido)}</strong>
    `;
    
    // Consejo según zona
    const consejo = document.getElementById('consejoPrecio');
    if (precioSugerido > 25) {
        consejo.innerHTML = "⚠️ Precio alto para zona económica. Considera reducir ganancia al 30-35% o mejorar calidad.";
    } else if (precioSugerido < 12) {
        consejo.innerHTML = "✅ Buen precio competitivo. Podrías aumentar ganancia al 45-50% si la zona lo permite.";
    } else {
        consejo.innerHTML = "🎯 Precio óptimo para zona media. Ajusta ±$2 según tu ubicación específica.";
    }
    
    taqueriaData.precioTaco = Math.ceil(precioSugerido);
}

// Registrar gasto
document.getElementById('gastoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const gasto = {
        id: Date.now(),
        fecha: document.getElementById('gastoFecha').value,
        categoria: document.getElementById('gastoCategoria').value,
        descripcion: document.getElementById('gastoDesc').value,
        monto: parseFloat(document.getElementById('gastoMonto').value)
    };
    taqueriaData.gastos.push(gasto);
    saveData();
    updateGastosList();
    this.reset();
});

// Registrar venta
document.getElementById('ventaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const metodo = document.getElementById('metodoPago').value;
    let comision = 0;
    if (metodo === 'tarjeta') {
        comision = parseFloat(document.getElementById('comisionTerminal').value) || 3.5;
    }
    
    const tacos = parseInt(document.getElementById('tacosVendidos').value);
    const precioUnitario = parseFloat(document.getElementById('precioTaco').value);
    const subtotal = tacos * precioUnitario;
    const comisionMonto = (subtotal * comision) / 100;
    const total = subtotal - comisionMonto;
    
    const venta = {
        id: Date.now(),
        fecha: document.getElementById('ventaFecha').value,
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
    this.reset();
});

// Mostrar/ocultar comisión según método de pago
document.getElementById('metodoPago')?.addEventListener('change', function() {
    const group = document.getElementById('comisionGroup');
    group.style.display = this.value === 'tarjeta' ? 'block' : 'none';
});

// Actualizar listas
function updateGastosList() {
    const container = document.getElementById('gastosList');
    if (!container) return;
    const gastosOrdenados = [...taqueriaData.gastos].reverse();
    container.innerHTML = gastosOrdenados.map(g => `
        <div class="record-item">
            <strong>${g.fecha}</strong> - ${g.categoria}<br>
            📝 ${g.descripcion}<br>
            💸 $${g.monto.toFixed(2)}
            <button onclick="deleteGasto(${g.id})" style="background:#D32F2F; padding:5px 10px; margin-top:5px;">Eliminar</button>
        </div>
    `).join('');
}

function updateVentasList() {
    const container = document.getElementById('ventasList');
    if (!container) return;
    const ventasOrdenadas = [...taqueriaData.ventas].reverse();
    container.innerHTML = ventasOrdenadas.map(v => `
        <div class="record-item">
            <strong>${v.fecha}</strong> - ${v.tacos} tacos<br>
            💰 Precio: $${v.precioUnitario} c/u<br>
            💳 ${v.metodo === 'tarjeta' ? `Tarjeta (comisión ${v.comisionPorcentaje}%: -$${v.comisionMonto.toFixed(2)})` : 'Efectivo'}<br>
            <strong>Total: $${v.total.toFixed(2)}</strong>
            <button onclick="deleteVenta(${v.id})" style="background:#D32F2F; padding:5px 10px; margin-top:5px;">Eliminar</button>
        </div>
    `).join('');
}

// Eliminar registros
function deleteGasto(id) {
    if (confirm('¿Eliminar este gasto?')) {
        taqueriaData.gastos = taqueriaData.gastos.filter(g => g.id !== id);
        saveData();
        updateGastosList();
        updateAllDisplays();
    }
}

function deleteVenta(id) {
    if (confirm('¿Eliminar esta venta?')) {
        taqueriaData.ventas = taqueriaData.ventas.filter(v => v.id !== id);
        saveData();
        updateVentasList();
        updateAllDisplays();
    }
}

// Calcular totales
function calcularTotales() {
    const totalVentas = taqueriaData.ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = taqueriaData.gastos.reduce((sum, g) => sum + g.monto, 0);
    const gananciaNeta = totalVentas - totalGastos;
    return { totalVentas, totalGastos, gananciaNeta };
}

// Actualizar dashboard
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
                    <h4>📈 Ganancia neta</h4>
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
    
    if (document.getElementById('salesChart')) {
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
            title: { text: 'Ingresos vs Gastos' },
            series: [
                { name: 'Ingresos', data: [totalVentasTotal], color: '#4CAF50' },
                { name: 'Gastos', data: [totalGastosTotal], color: '#F44336' }
            ]
        });
    }
}

// Generar reportes
function generarReporte(tipo) {
    const hoy = new Date();
    let fechaInicio, fechaFin;
    
    if (tipo === 'diario') {
        fechaInicio = hoy.toISOString().split('T')[0];
        fechaFin = fechaInicio;
    } else if (tipo === 'semanal') {
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - hoy.getDay());
        fechaInicio = inicio.toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
    } else if (tipo === 'mensual') {
        fechaInicio = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`;
        fechaFin = hoy.toISOString().split('T')[0];
    } else {
        fechaInicio = `${hoy.getFullYear()}-01-01`;
        fechaFin = hoy.toISOString().split('T')[0];
    }
    
    const ventasPeriodo = taqueriaData.ventas.filter(v => v.fecha >= fechaInicio && v.fecha <= fechaFin);
    const gastosPeriodo = taqueriaData.gastos.filter(g => g.fecha >= fechaInicio && g.fecha <= fechaFin);
    
    const totalVentas = ventasPeriodo.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = gastosPeriodo.reduce((sum, g) => sum + g.monto, 0);
    const ganancia = totalVentas - totalGastos;
    
    const resultado = document.getElementById('reporteResultado');
    resultado.innerHTML = `
        <h4>📊 Reporte ${tipo.toUpperCase()}</h4>
        <p>📅 Período: ${fechaInicio} al ${fechaFin}</p>
        <p>💰 Ventas totales: $${totalVentas.toFixed(2)}</p>
        <p>💸 Gastos totales: $${totalGastos.toFixed(2)}</p>
        <p>📈 Ganancia neta: <strong>$${ganancia.toFixed(2)}</strong></p>
        <p>🎯 Tacos vendidos: ${ventasPeriodo.reduce((sum, v) => sum + v.tacos, 0)}</p>
    `;
}

// Premium
function mostrarPremiumModal() {
    document.getElementById('premiumModal').classList.add('active');
}

function cerrarPremiumModal() {
    document.getElementById('premiumModal').classList.remove('active');
}

function simularPago() {
    taqueriaData.premium = true;
    saveData();
    cerrarPremiumModal();
    activarInventarioPremium();
    alert('✅ ¡Inventario Premium desbloqueado! Ahora puedes controlar tu stock.');
}

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
    
    document.getElementById('productoForm')?.addEventListener('submit', function(e) {
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
        taqueriaData.inventario.push
