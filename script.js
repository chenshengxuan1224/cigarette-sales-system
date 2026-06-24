let brands = [];
let sales = [];
let customers = [];
let purchases = [];
let suppliers = [];

const STORAGE_KEY_BRANDS = 'cigarette_brands';
const STORAGE_KEY_SALES = 'cigarette_sales';
const STORAGE_KEY_CUSTOMERS = 'cigarette_customers';
const STORAGE_KEY_PURCHASES = 'cigarette_purchases';
const STORAGE_KEY_SUPPLIERS = 'cigarette_suppliers';

let currentStatsView = 'week';

function loadData() {
    const savedBrands = localStorage.getItem(STORAGE_KEY_BRANDS);
    const savedSales = localStorage.getItem(STORAGE_KEY_SALES);
    const savedCustomers = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    const savedPurchases = localStorage.getItem(STORAGE_KEY_PURCHASES);
    const savedSuppliers = localStorage.getItem(STORAGE_KEY_SUPPLIERS);
    if (savedBrands) brands = JSON.parse(savedBrands);
    if (savedSales) sales = JSON.parse(savedSales);
    if (savedCustomers) customers = JSON.parse(savedCustomers);
    if (savedPurchases) purchases = JSON.parse(savedPurchases);
    if (savedSuppliers) suppliers = JSON.parse(savedSuppliers);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(purchases));
    localStorage.setItem(STORAGE_KEY_SUPPLIERS, JSON.stringify(suppliers));
}

function getBrandById(id) {
    return brands.find(b => b.id === parseInt(id));
}

function getSupplierById(id) {
    return suppliers.find(s => s.id === parseInt(id));
}

function formatMoney(value) {
    return '¥' + Number(value).toFixed(2);
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = content.id === `${tabId}-tab` ? 'block' : 'none';
            });
            if (tabId === 'stats') {
                updateAllStats();
            }
        });
    });
}

function initBrandForm() {
    const form = document.getElementById('brandForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('brandId').value;
        const name = document.getElementById('brandName').value.trim();
        const spec = document.getElementById('brandSpec').value.trim();
        const category = document.getElementById('brandCategory').value;
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
        const salePrice = parseFloat(document.getElementById('salePrice').value);
        const stock = parseInt(document.getElementById('stockQuantity').value);
        const alertStock = parseInt(document.getElementById('alertStock').value);

        if (id) {
            const brand = brands.find(b => b.id === parseInt(id));
            if (brand) {
                brand.name = name;
                brand.spec = spec;
                brand.category = category;
                brand.purchasePrice = purchasePrice;
                brand.salePrice = salePrice;
                brand.stock = stock;
                brand.alertStock = alertStock;
            }
        } else {
            brands.push({
                id: Date.now(),
                name,
                spec,
                category,
                purchasePrice,
                salePrice,
                stock,
                alertStock
            });
        }

        saveData();
        renderBrands();
        updateBrandSelect();
        updateFilterBrandSelect();
        form.reset();
        document.getElementById('brandId').value = '';
        document.getElementById('brandSubmitBtn').textContent = '添加品牌';
        document.getElementById('alertStock').value = '10';
    });
}

function renderBrands() {
    const tbody = document.getElementById('brandTableBody');
    const empty = document.getElementById('brandEmpty');
    tbody.innerHTML = '';

    if (brands.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    brands.forEach(brand => {
        const profit = (brand.salePrice - brand.purchasePrice).toFixed(2);
        const rate = brand.purchasePrice > 0 ? ((brand.salePrice - brand.purchasePrice) / brand.purchasePrice * 100).toFixed(1) : 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${brand.name}</td>
            <td>${brand.spec}</td>
            <td>${brand.category}</td>
            <td>${formatMoney(brand.purchasePrice)}</td>
            <td>${formatMoney(brand.salePrice)}</td>
            <td>${brand.stock}</td>
            <td>${brand.alertStock}</td>
            <td>${formatMoney(profit)}</td>
            <td>${rate}%</td>
            <td>
                <button class="btn-edit" onclick="editBrand(${brand.id})">编辑</button>
                <button class="btn-delete" onclick="deleteBrand(${brand.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editBrand(id) {
    const brand = getBrandById(id);
    if (brand) {
        document.getElementById('brandId').value = brand.id;
        document.getElementById('brandName').value = brand.name;
        document.getElementById('brandSpec').value = brand.spec;
        document.getElementById('brandCategory').value = brand.category || '中端';
        document.getElementById('purchasePrice').value = brand.purchasePrice;
        document.getElementById('salePrice').value = brand.salePrice;
        document.getElementById('stockQuantity').value = brand.stock;
        document.getElementById('alertStock').value = brand.alertStock || 10;
        document.getElementById('brandSubmitBtn').textContent = '保存修改';
        document.getElementById('brandForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteBrand(id) {
    if (confirm('确定要删除该品牌吗？相关销售记录不会被删除。')) {
        brands = brands.filter(b => b.id !== id);
        saveData();
        renderBrands();
        updateBrandSelect();
        updateFilterBrandSelect();
    }
}

function updateBrandSelect() {
    const select = document.getElementById('saleBrand');
    const currentValue = select.value;
    select.innerHTML = '<option value="">请选择品牌</option>';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = `${brand.name} (${brand.spec}) - ${formatMoney(brand.salePrice)}/条`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updateFilterBrandSelect() {
    const select = document.getElementById('filterBrand');
    const currentValue = select.value;
    select.innerHTML = '<option value="">所有品牌</option>';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = `${brand.name} (${brand.spec})`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updateSaleCustomerSelect() {
    const select = document.getElementById('saleCustomer');
    const currentValue = select.value;
    select.innerHTML = '<option value="">请选择客户</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} (${customer.type})`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function initSaleForm() {
    const form = document.getElementById('saleForm');
    const brandSelect = document.getElementById('saleBrand');
    const quantityInput = document.getElementById('saleQuantity');
    const dateInput = document.getElementById('saleDate');

    dateInput.value = getTodayDate();

    brandSelect.addEventListener('change', updatePricePreview);
    quantityInput.addEventListener('input', updatePricePreview);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const brandId = parseInt(brandSelect.value);
        const quantity = parseInt(quantityInput.value);
        const customerType = document.getElementById('saleCustomerType').value;
        const customerId = document.getElementById('saleCustomer').value ? parseInt(document.getElementById('saleCustomer').value) : null;
        const timeSlot = document.getElementById('saleTimeSlot').value;
        const date = dateInput.value;
        const remark = document.getElementById('saleRemark').value;
        const brand = getBrandById(brandId);

        if (!brand) return;
        if (quantity > brand.stock) {
            alert('库存不足！');
            return;
        }

        sales.push({
            id: Date.now(),
            brandId,
            quantity,
            salePrice: brand.salePrice,
            purchasePrice: brand.purchasePrice,
            customerType,
            customerId,
            timeSlot,
            date,
            remark,
            timestamp: Date.now()
        });

        brand.stock -= quantity;

        saveData();
        renderSales();
        renderBrands();
        updateAllStats();
        form.reset();
        dateInput.value = getTodayDate();
        document.getElementById('saleCustomerType').value = '零售';
        document.getElementById('saleTimeSlot').value = '上午';
        updatePricePreview();
    });
}

function updatePricePreview() {
    const brandId = document.getElementById('saleBrand').value;
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const brand = getBrandById(brandId);

    if (!brand) {
        document.getElementById('previewPurchase').textContent = '0';
        document.getElementById('previewSale').textContent = '0';
        document.getElementById('previewTotal').textContent = '0';
        document.getElementById('previewProfit').textContent = '0';
        return;
    }

    document.getElementById('previewPurchase').textContent = formatMoney(brand.purchasePrice);
    document.getElementById('previewSale').textContent = formatMoney(brand.salePrice);
    document.getElementById('previewTotal').textContent = formatMoney(brand.salePrice * quantity);
    document.getElementById('previewProfit').textContent = formatMoney((brand.salePrice - brand.purchasePrice) * quantity);
}

function renderSales(filterDate = null, filterBrand = null, filterCustomerType = null) {
    const tbody = document.getElementById('salesTableBody');
    const empty = document.getElementById('salesEmpty');
    tbody.innerHTML = '';

    let filteredSales = sales;
    if (filterDate) {
        filteredSales = filteredSales.filter(s => s.date === filterDate);
    }
    if (filterBrand) {
        filteredSales = filteredSales.filter(s => s.brandId === parseInt(filterBrand));
    }
    if (filterCustomerType) {
        filteredSales = filteredSales.filter(s => s.customerType === filterCustomerType);
    }

    if (filteredSales.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    filteredSales.sort((a, b) => b.timestamp - a.timestamp).forEach(sale => {
        const brand = getBrandById(sale.brandId);
        const customer = customers.find(c => c.id === sale.customerId);
        const brandName = brand ? `${brand.name}` : '未知品牌';
        const brandSpec = brand ? `${brand.spec}` : '';
        const customerName = customer ? customer.name : '-';
        const total = sale.salePrice * sale.quantity;
        const profit = (sale.salePrice - sale.purchasePrice) * sale.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.timeSlot}</td>
            <td>${brandName}</td>
            <td>${brandSpec}</td>
            <td>${sale.quantity}</td>
            <td>${formatMoney(sale.purchasePrice)}</td>
            <td>${formatMoney(sale.salePrice)}</td>
            <td>${formatMoney(total)}</td>
            <td>${formatMoney(profit)}</td>
            <td>${sale.customerType}</td>
            <td>${customerName}</td>
            <td>
                <button class="btn-delete" onclick="deleteSale(${sale.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteSale(id) {
    if (confirm('确定要删除该销售记录吗？库存将恢复。')) {
        const sale = sales.find(s => s.id === id);
        if (sale) {
            const brand = getBrandById(sale.brandId);
            if (brand) {
                brand.stock += sale.quantity;
            }
        }
        sales = sales.filter(s => s.id !== id);
        saveData();
        const filterDate = document.getElementById('filterDate').value || null;
        const filterBrand = document.getElementById('filterBrand').value || null;
        const filterCustomerType = document.getElementById('filterCustomerType').value || null;
        renderSales(filterDate, filterBrand, filterCustomerType);
        renderBrands();
        updateAllStats();
    }
}

function initSalesFilter() {
    document.getElementById('filterBtn').addEventListener('click', () => {
        const date = document.getElementById('filterDate').value || null;
        const brand = document.getElementById('filterBrand').value || null;
        const customerType = document.getElementById('filterCustomerType').value || null;
        renderSales(date, brand, customerType);
    });

    document.getElementById('clearFilterBtn').addEventListener('click', () => {
        document.getElementById('filterDate').value = '';
        document.getElementById('filterBrand').value = '';
        document.getElementById('filterCustomerType').value = '';
        renderSales();
    });
}

function initPurchaseForm() {
    const form = document.getElementById('purchaseForm');
    const brandSelect = document.getElementById('purchaseBrand');
    const supplierSelect = document.getElementById('purchaseSupplier');
    const quantityInput = document.getElementById('purchaseQuantity');
    const priceInput = document.getElementById('purchasePrice');
    const dateInput = document.getElementById('purchaseDate');

    dateInput.value = getTodayDate();

    brandSelect.addEventListener('change', () => {
        const brand = getBrandById(brandSelect.value);
        const basePriceSpan = document.getElementById('brandBasePrice');
        if (brand) {
            priceInput.value = brand.purchasePrice;
            basePriceSpan.textContent = `（基准入库价：${formatMoney(brand.purchasePrice)}）`;
        } else {
            priceInput.value = '';
            basePriceSpan.textContent = '';
        }
        updatePurchasePreview();
    });
    supplierSelect.addEventListener('change', updatePurchasePreview);
    quantityInput.addEventListener('input', updatePurchasePreview);
    priceInput.addEventListener('input', updatePurchasePreview);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const brandId = parseInt(brandSelect.value);
        const supplierId = parseInt(supplierSelect.value);
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(priceInput.value);
        const date = dateInput.value;
        const remark = document.getElementById('purchaseRemark').value;

        const brand = getBrandById(brandId);
        if (!brand) return;

        purchases.push({
            id: Date.now(),
            brandId,
            supplierId,
            quantity,
            price,
            date,
            remark,
            timestamp: Date.now()
        });

        brand.stock += quantity;

        saveData();
        renderPurchases();
        renderBrands();
        updateAllStats();
        form.reset();
        dateInput.value = getTodayDate();
        updatePurchasePreview();
    });
}

function updatePurchasePreview() {
    const brandId = document.getElementById('purchaseBrand').value;
    const supplierId = document.getElementById('purchaseSupplier').value;
    const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 0;
    const price = parseFloat(document.getElementById('purchasePrice').value) || 0;

    document.getElementById('purchasePreviewPrice').textContent = formatMoney(price);
    document.getElementById('purchasePreviewQty').textContent = quantity;
    document.getElementById('purchasePreviewTotal').textContent = formatMoney(price * quantity);
}

function renderPurchases(filterDate = null, filterBrand = null, filterSupplier = null) {
    const tbody = document.getElementById('purchasesTableBody');
    const empty = document.getElementById('purchasesEmpty');
    tbody.innerHTML = '';

    let filteredPurchases = purchases;
    if (filterDate) {
        filteredPurchases = filteredPurchases.filter(p => p.date === filterDate);
    }
    if (filterBrand) {
        filteredPurchases = filteredPurchases.filter(p => p.brandId === parseInt(filterBrand));
    }
    if (filterSupplier) {
        filteredPurchases = filteredPurchases.filter(p => p.supplierId === parseInt(filterSupplier));
    }

    if (filteredPurchases.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    filteredPurchases.sort((a, b) => b.timestamp - a.timestamp).forEach(purchase => {
        const brand = getBrandById(purchase.brandId);
        const supplier = getSupplierById(purchase.supplierId);
        const brandName = brand ? `${brand.name}` : '未知品牌';
        const brandSpec = brand ? `${brand.spec}` : '';
        const supplierName = supplier ? supplier.name : '未知供应商';
        const total = purchase.price * purchase.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${purchase.date}</td>
            <td>${brandName}</td>
            <td>${brandSpec}</td>
            <td>${supplierName}</td>
            <td>${purchase.quantity}</td>
            <td>${formatMoney(purchase.price)}</td>
            <td>${formatMoney(total)}</td>
            <td>${purchase.remark || '-'}</td>
            <td>
                <button class="btn-delete" onclick="deletePurchase(${purchase.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deletePurchase(id) {
    if (confirm('确定要删除该进货记录吗？库存将减少。')) {
        const purchase = purchases.find(p => p.id === id);
        if (purchase) {
            const brand = getBrandById(purchase.brandId);
            if (brand) {
                brand.stock -= purchase.quantity;
            }
        }
        purchases = purchases.filter(p => p.id !== id);
        saveData();
        const filterDate = document.getElementById('purchaseFilterDate').value || null;
        const filterBrand = document.getElementById('purchaseFilterBrand').value || null;
        const filterSupplier = document.getElementById('purchaseFilterSupplier').value || null;
        renderPurchases(filterDate, filterBrand, filterSupplier);
        renderBrands();
        updateAllStats();
    }
}

function initPurchaseFilter() {
    document.getElementById('purchaseFilterBtn').addEventListener('click', () => {
        const date = document.getElementById('purchaseFilterDate').value || null;
        const brand = document.getElementById('purchaseFilterBrand').value || null;
        const supplier = document.getElementById('purchaseFilterSupplier').value || null;
        renderPurchases(date, brand, supplier);
    });

    document.getElementById('purchaseClearFilterBtn').addEventListener('click', () => {
        document.getElementById('purchaseFilterDate').value = '';
        document.getElementById('purchaseFilterBrand').value = '';
        document.getElementById('purchaseFilterSupplier').value = '';
        renderPurchases();
    });
}

function updatePurchaseBrandSelect() {
    const select = document.getElementById('purchaseBrand');
    const currentValue = select.value;
    select.innerHTML = '<option value="">请选择品牌</option>';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = `${brand.name} (${brand.spec}) - 当前库存: ${brand.stock}条`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updatePurchaseFilterBrandSelect() {
    const select = document.getElementById('purchaseFilterBrand');
    const currentValue = select.value;
    select.innerHTML = '<option value="">所有品牌</option>';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = `${brand.name} (${brand.spec})`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updatePurchaseSupplierSelect() {
    const select = document.getElementById('purchaseSupplier');
    const currentValue = select.value;
    select.innerHTML = '<option value="">请选择供应商</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = `${supplier.name} - ${supplier.credit}`;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function updatePurchaseFilterSupplierSelect() {
    const select = document.getElementById('purchaseFilterSupplier');
    const currentValue = select.value;
    select.innerHTML = '<option value="">所有供应商</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function initSupplierForm() {
    const form = document.getElementById('supplierForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('supplierId').value;
        const name = document.getElementById('supplierName').value.trim();
        const contact = document.getElementById('supplierContact').value.trim();
        const phone = document.getElementById('supplierPhone').value.trim();
        const address = document.getElementById('supplierAddress').value.trim();
        const supplierBrands = document.getElementById('supplierBrands').value.trim();
        const credit = document.getElementById('supplierCredit').value;

        if (id) {
            const supplier = suppliers.find(s => s.id === parseInt(id));
            if (supplier) {
                supplier.name = name;
                supplier.contact = contact;
                supplier.phone = phone;
                supplier.address = address;
                supplier.brands = supplierBrands;
                supplier.credit = credit;
            }
        } else {
            suppliers.push({
                id: Date.now(),
                name,
                contact,
                phone,
                address,
                brands: supplierBrands,
                credit
            });
        }

        saveData();
        renderSuppliers();
        updatePurchaseSupplierSelect();
        updatePurchaseFilterSupplierSelect();
        updateAllStats();
        form.reset();
        document.getElementById('supplierId').value = '';
        document.getElementById('supplierSubmitBtn').textContent = '添加供应商';
        document.getElementById('supplierCredit').value = 'B';
    });
}

function renderSuppliers() {
    const tbody = document.getElementById('supplierTableBody');
    const empty = document.getElementById('supplierEmpty');
    tbody.innerHTML = '';

    if (suppliers.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    suppliers.forEach(supplier => {
        const creditColors = {
            'A': 'color: #28a745;',
            'B': 'color: #17a2b8;',
            'C': 'color: #ffc107;',
            'D': 'color: #dc3545;'
        };
        const creditLabels = {
            'A': 'A - 优秀',
            'B': 'B - 良好',
            'C': 'C - 一般',
            'D': 'D - 较差'
        };

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.contact || '-'}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.address || '-'}</td>
            <td>${supplier.brands || '-'}</td>
            <td style="${creditColors[supplier.credit]} font-weight: 600;">${creditLabels[supplier.credit]}</td>
            <td>
                <button class="btn-edit" onclick="editSupplier(${supplier.id})">编辑</button>
                <button class="btn-delete" onclick="deleteSupplier(${supplier.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editSupplier(id) {
    const supplier = getSupplierById(id);
    if (supplier) {
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierContact').value = supplier.contact;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierAddress').value = supplier.address;
        document.getElementById('supplierBrands').value = supplier.brands;
        document.getElementById('supplierCredit').value = supplier.credit;
        document.getElementById('supplierSubmitBtn').textContent = '保存修改';
        document.getElementById('supplierForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteSupplier(id) {
    if (confirm('确定要删除该供应商吗？相关进货记录不会被删除。')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveData();
        renderSuppliers();
        updatePurchaseSupplierSelect();
        updatePurchaseFilterSupplierSelect();
        updateAllStats();
    }
}

function initCustomerForm() {
    const form = document.getElementById('customerForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('customerId').value;
        const name = document.getElementById('customerName').value.trim();
        const type = document.getElementById('customerType').value;
        const phone = document.getElementById('customerPhone').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const totalSpent = parseFloat(document.getElementById('customerTotalSpent').value) || 0;

        if (id) {
            const customer = customers.find(c => c.id === parseInt(id));
            if (customer) {
                customer.name = name;
                customer.type = type;
                customer.phone = phone;
                customer.address = address;
                customer.totalSpent = totalSpent;
            }
        } else {
            customers.push({
                id: Date.now(),
                name,
                type,
                phone,
                address,
                totalSpent
            });
        }

        saveData();
        renderCustomers();
        updateSaleCustomerSelect();
        form.reset();
        document.getElementById('customerId').value = '';
        document.getElementById('customerSubmitBtn').textContent = '添加客户';
    });
}

function renderCustomers() {
    const tbody = document.getElementById('customerTableBody');
    const empty = document.getElementById('customerEmpty');
    tbody.innerHTML = '';

    if (customers.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.type}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>${formatMoney(customer.totalSpent)}</td>
            <td>
                <button class="btn-edit" onclick="editCustomer(${customer.id})">编辑</button>
                <button class="btn-delete" onclick="deleteCustomer(${customer.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editCustomer(id) {
    const customer = customers.find(c => c.id === parseInt(id));
    if (customer) {
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerType').value = customer.type;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerAddress').value = customer.address;
        document.getElementById('customerTotalSpent').value = customer.totalSpent;
        document.getElementById('customerSubmitBtn').textContent = '保存修改';
        document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteCustomer(id) {
    if (confirm('确定要删除该客户吗？')) {
        customers = customers.filter(c => c.id !== id);
        saveData();
        renderCustomers();
        updateSaleCustomerSelect();
    }
}

function updateTodayStats() {
    const today = getTodayDate();
    const todaySales = sales.filter(s => s.date === today);
    
    const totalAmount = todaySales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const totalQuantity = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const totalProfit = todaySales.reduce((sum, s) => sum + (s.salePrice - s.purchasePrice) * s.quantity, 0);
    const rate = totalAmount > 0 ? (totalProfit / totalAmount * 100).toFixed(1) : 0;

    document.getElementById('todaySales').textContent = formatMoney(totalAmount);
    document.getElementById('todayQuantity').textContent = totalQuantity + ' 条';
    document.getElementById('todayProfit').textContent = formatMoney(totalProfit);
    document.getElementById('todayRate').textContent = rate + '%';
}

function updateMonthStats() {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`;
    
    const currentMonthSales = sales.filter(s => s.date.startsWith(currentMonth));
    const lastMonthSales = sales.filter(s => s.date.startsWith(lastMonth));
    
    const currentAmount = currentMonthSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const lastAmount = lastMonthSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    
    const growth = lastAmount > 0 ? ((currentAmount - lastAmount) / lastAmount * 100).toFixed(1) : (currentAmount > 0 ? 100 : 0);
    
    document.getElementById('monthSales').textContent = formatMoney(currentAmount);
    document.getElementById('monthGrowth').textContent = (growth >= 0 ? '+' : '') + growth + '%';
}

function updateAvgOrderValue() {
    if (sales.length === 0) {
        document.getElementById('avgOrderValue').textContent = '¥0.00';
        return;
    }
    const totalAmount = sales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const avgValue = totalAmount / sales.length;
    document.getElementById('avgOrderValue').textContent = formatMoney(avgValue);
}

function updateStockTurnover() {
    const totalStock = brands.reduce((sum, b) => sum + b.stock, 0);
    const totalSalesQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
    
    if (totalStock === 0) {
        document.getElementById('stockTurnover').textContent = '0.0';
        return;
    }
    
    const turnover = (totalSalesQuantity / totalStock).toFixed(1);
    document.getElementById('stockTurnover').textContent = turnover;
}

function updateMonthPurchases() {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthPurchases = purchases.filter(p => p.date.startsWith(currentMonth));
    const totalAmount = currentMonthPurchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
    document.getElementById('monthPurchases').textContent = formatMoney(totalAmount);
}

function updateSupplierCount() {
    document.getElementById('supplierCount').textContent = suppliers.length;
}

function updateActiveCustomerCount() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const activeCustomers = new Set();
    sales.forEach(sale => {
        if (sale.date >= thirtyDaysAgoStr) {
            activeCustomers.add(sale.customerId);
        }
    });
    document.getElementById('activeCustomerCount').textContent = activeCustomers.size;
}

function updateOrderCompletionRate() {
    const today = getTodayDate();
    const todaySales = sales.filter(s => s.date === today);
    const todayPurchases = purchases.filter(p => p.date === today);
    
    if (todaySales.length === 0) {
        document.getElementById('orderCompletionRate').textContent = '0%';
        return;
    }
    
    const rate = ((todaySales.length / (todaySales.length + todayPurchases.length)) * 100).toFixed(1);
    document.getElementById('orderCompletionRate').textContent = rate + '%';
}

function updateProfitAnalysis() {
    const totalAmount = sales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.purchasePrice * s.quantity, 0);
    const totalProfit = totalAmount - totalCost;
    const rate = totalAmount > 0 ? (totalProfit / totalAmount * 100).toFixed(1) : 0;
    const totalOrders = sales.length;
    const avgProfit = totalOrders > 0 ? (totalProfit / totalOrders).toFixed(2) : 0;

    document.getElementById('totalSales').textContent = formatMoney(totalAmount);
    document.getElementById('totalCost').textContent = formatMoney(totalCost);
    document.getElementById('totalProfit').textContent = formatMoney(totalProfit);
    document.getElementById('grossRate').textContent = rate + '%';
    document.getElementById('totalOrders').textContent = totalOrders + ' 笔';
    document.getElementById('avgProfit').textContent = formatMoney(avgProfit);
}

function updateBrandRank() {
    const tbody = document.getElementById('brandRankBody');
    const empty = document.getElementById('rankEmpty');
    tbody.innerHTML = '';

    if (sales.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    const brandStats = {};
    sales.forEach(sale => {
        if (!brandStats[sale.brandId]) {
            brandStats[sale.brandId] = { quantity: 0, amount: 0, profit: 0 };
        }
        brandStats[sale.brandId].quantity += sale.quantity;
        brandStats[sale.brandId].amount += sale.salePrice * sale.quantity;
        brandStats[sale.brandId].profit += (sale.salePrice - sale.purchasePrice) * sale.quantity;
    });

    const totalAmount = Object.values(brandStats).reduce((sum, s) => sum + s.amount, 0);

    const sorted = Object.entries(brandStats)
        .map(([brandId, stats]) => ({
            brandId: parseInt(brandId),
            ...stats,
            percentage: totalAmount > 0 ? (stats.amount / totalAmount * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    sorted.forEach((item, index) => {
        const brand = getBrandById(item.brandId);
        const brandName = brand ? `${brand.name} (${brand.spec})` : '未知品牌';
        const row = document.createElement('tr');
        row.className = index < 3 ? `rank-${index + 1}` : '';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${brandName}</td>
            <td>${item.quantity} 条</td>
            <td>${formatMoney(item.amount)}</td>
            <td>${formatMoney(item.profit)}</td>
            <td>${item.percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateSalesChart() {
    const canvas = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');
    
    const dateStats = {};
    sales.forEach(sale => {
        if (!dateStats[sale.date]) {
            dateStats[sale.date] = { amount: 0, quantity: 0 };
        }
        dateStats[sale.date].amount += sale.salePrice * sale.quantity;
        dateStats[sale.date].quantity += sale.quantity;
    });

    const sortedDates = Object.keys(dateStats).sort().slice(-7);
    const amounts = sortedDates.map(date => dateStats[date].amount);
    const quantities = sortedDates.map(date => dateStats[date].quantity);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (sortedDates.length === 0) {
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无销售数据', rect.width / 2, rect.height / 2);
        return;
    }

    const padding = { top: 35, right: 20, bottom: 45, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const maxAmount = Math.max(...amounts) * 1.2 || 100;

    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(rect.width - padding.right, y);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(rect.width - padding.right, padding.top + chartHeight);
    ctx.stroke();

    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        const value = maxAmount - (maxAmount / 5) * i;
        ctx.fillText(formatMoney(value), padding.left - 10, y);
    }

    const barWidth = (chartWidth / sortedDates.length) * 0.65;
    const barGap = (chartWidth / sortedDates.length) * 0.35;

    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / sortedDates.length) * index + barGap / 2;
        const height = (amounts[index] / maxAmount) * chartHeight;
        
        ctx.shadowColor = 'rgba(45, 90, 135, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        const gradient = ctx.createLinearGradient(x, padding.top + chartHeight - height, x, padding.top + chartHeight);
        gradient.addColorStop(0, '#4f8cff');
        gradient.addColorStop(0.5, '#3b7de8');
        gradient.addColorStop(1, '#2d5a87');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, padding.top + chartHeight - height, barWidth, height, 6);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        const highlightGradient = ctx.createLinearGradient(x, padding.top + chartHeight - height, x, padding.top + chartHeight - height + Math.min(height, 20));
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.roundRect(x, padding.top + chartHeight - height, barWidth, Math.min(height, 20), [6, 6, 0, 0]);
        ctx.fill();

        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#1e3a5f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (height > 30) {
            ctx.fillText(formatMoney(amounts[index]), x + barWidth / 2, padding.top + chartHeight - height - 8);
        }

        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textBaseline = 'top';
        const dateObj = new Date(date);
        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[dateObj.getDay()];
        ctx.fillText(displayDate, x + barWidth / 2, padding.top + chartHeight + 10);
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(weekDay, x + barWidth / 2, padding.top + chartHeight + 25);

        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${quantities[index]}条`, x + barWidth / 2, padding.top + chartHeight - height - 20);
    });

    ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = '#4f8cff';
    ctx.beginPath();
    ctx.roundRect(rect.width - 150, 15, 12, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('销售额', rect.width - 135, 21);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(rect.width - 150, 38, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('销售数量', rect.width - 135, 38);
}

function updateCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    
    const categoryStats = { '高端': 0, '中端': 0, '低端': 0 };
    sales.forEach(sale => {
        const brand = getBrandById(sale.brandId);
        const category = brand ? brand.category : '中端';
        categoryStats[category] += sale.salePrice * sale.quantity;
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const total = Object.values(categoryStats).reduce((sum, v) => sum + v, 0);
    if (total === 0) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无销售数据', rect.width / 2, rect.height / 2);
        return;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    let startAngle = -Math.PI / 2;
    const colors = {
        '高端': '#ff6b6b',
        '中端': '#4ecdc4',
        '低端': '#ffe66d'
    };

    Object.entries(categoryStats).forEach(([category, amount]) => {
        const angle = (amount / total) * Math.PI * 2;
        const endAngle = startAngle + angle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(centerX - radius/3, centerY - radius/3, 0, centerX, centerY, radius);
        gradient.addColorStop(0, lightenColor(colors[category], 20));
        gradient.addColorStop(1, colors[category]);
        ctx.fillStyle = gradient;
        ctx.fill();

        const midAngle = startAngle + angle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
        
        const percentage = ((amount / total) * 100).toFixed(0);
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);

        startAngle = endAngle;
    });

    let legendY = 20;
    Object.entries(categoryStats).forEach(([category, amount]) => {
        ctx.fillStyle = colors[category];
        ctx.beginPath();
        ctx.roundRect(20, legendY, 12, 12, 3);
        ctx.fill();
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${category}: ${formatMoney(amount)}`, 40, legendY + 6);
        legendY += 25;
    });
}

function updateTimeSlotChart() {
    const canvas = document.getElementById('timeSlotChart');
    const ctx = canvas.getContext('2d');
    
    const timeSlots = ['上午', '下午', '晚上'];
    const slotStats = timeSlots.map(slot => {
        return sales.filter(s => s.timeSlot === slot).reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const total = slotStats.reduce((sum, v) => sum + v, 0);
    if (total === 0) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无销售数据', rect.width / 2, rect.height / 2);
        return;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const maxAmount = Math.max(...slotStats) * 1.2 || 100;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    const barWidth = (chartWidth / timeSlots.length) * 0.5;
    const barGap = (chartWidth / timeSlots.length) * 0.5;
    const colors = ['#3b82f6', '#10b981', '#f59e0b'];

    timeSlots.forEach((slot, index) => {
        const x = padding.left + (chartWidth / timeSlots.length) * index + barGap / 2;
        const height = (slotStats[index] / maxAmount) * chartHeight;
        
        ctx.shadowColor = 'rgba(59, 130, 246, 0.2)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        const gradient = ctx.createLinearGradient(x, padding.top + chartHeight - height, x, padding.top + chartHeight);
        gradient.addColorStop(0, colors[index]);
        gradient.addColorStop(1, darkenColor(colors[index], 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, padding.top + chartHeight - height, barWidth, height, 5);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (height > 25) {
            ctx.fillText(formatMoney(slotStats[index]), x + barWidth / 2, padding.top + chartHeight - height - 5);
        }

        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textBaseline = 'top';
        ctx.fillText(slot, x + barWidth / 2, padding.top + chartHeight + 10);
    });
}

function updateCustomerTypeChart() {
    const canvas = document.getElementById('customerTypeChart');
    const ctx = canvas.getContext('2d');
    
    const customerTypes = ['零售', '批发', '团购'];
    const typeStats = customerTypes.map(type => {
        return sales.filter(s => s.customerType === type).reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const total = typeStats.reduce((sum, v) => sum + v, 0);
    if (total === 0) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无销售数据', rect.width / 2, rect.height / 2);
        return;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const maxAmount = Math.max(...typeStats) * 1.2 || 100;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    const barWidth = (chartWidth / customerTypes.length) * 0.5;
    const barGap = (chartWidth / customerTypes.length) * 0.5;
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4'];

    customerTypes.forEach((type, index) => {
        const x = padding.left + (chartWidth / customerTypes.length) * index + barGap / 2;
        const height = (typeStats[index] / maxAmount) * chartHeight;
        
        ctx.shadowColor = 'rgba(139, 92, 246, 0.2)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        const gradient = ctx.createLinearGradient(x, padding.top + chartHeight - height, x, padding.top + chartHeight);
        gradient.addColorStop(0, colors[index]);
        gradient.addColorStop(1, darkenColor(colors[index], 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, padding.top + chartHeight - height, barWidth, height, 5);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (height > 25) {
            ctx.fillText(formatMoney(typeStats[index]), x + barWidth / 2, padding.top + chartHeight - height - 5);
        }

        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textBaseline = 'top';
        ctx.fillText(type, x + barWidth / 2, padding.top + chartHeight + 10);
    });
}

function updateProfitChart() {
    const canvas = document.getElementById('profitChart');
    const ctx = canvas.getContext('2d');
    
    const dateStats = {};
    sales.forEach(sale => {
        if (!dateStats[sale.date]) {
            dateStats[sale.date] = { amount: 0, profit: 0 };
        }
        dateStats[sale.date].amount += sale.salePrice * sale.quantity;
        dateStats[sale.date].profit += (sale.salePrice - sale.purchasePrice) * sale.quantity;
    });

    const sortedDates = Object.keys(dateStats).sort().slice(-14);
    const amounts = sortedDates.map(date => dateStats[date].amount);
    const profits = sortedDates.map(date => dateStats[date].profit);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (sortedDates.length === 0) {
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无销售数据', rect.width / 2, rect.height / 2);
        return;
    }

    const padding = { top: 35, right: 20, bottom: 45, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const maxValue = Math.max(...amounts, ...profits) * 1.2 || 100;

    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(rect.width - padding.right, y);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(rect.width - padding.right, padding.top + chartHeight);
    ctx.stroke();

    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        const value = maxValue - (maxValue / 5) * i;
        ctx.fillText(formatMoney(value), padding.left - 10, y);
    }

    const lineWidth = 3;
    const pointRadius = 5;

    ctx.beginPath();
    ctx.strokeStyle = '#4f8cff';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = 'rgba(79, 140, 255, 0.4)';
    ctx.shadowBlur = 8;
    
    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / (sortedDates.length - 1)) * index;
        const y = padding.top + chartHeight - (amounts[index] / maxValue) * chartHeight;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / (sortedDates.length - 1)) * index;
        const y = padding.top + chartHeight - (amounts[index] / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = '#4f8cff';
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(x, y, pointRadius - 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = 'rgba(34, 197, 94, 0.4)';
    ctx.shadowBlur = 8;
    
    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / (sortedDates.length - 1)) * index;
        const y = padding.top + chartHeight - (profits[index] / maxValue) * chartHeight;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / (sortedDates.length - 1)) * index;
        const y = padding.top + chartHeight - (profits[index] / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = '#22c55e';
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(x, y, pointRadius - 2, 0, Math.PI * 2);
        ctx.fill();
    });

    sortedDates.forEach((date, index) => {
        const x = padding.left + (chartWidth / (sortedDates.length - 1)) * index;
        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const dateObj = new Date(date);
        ctx.fillText(`${dateObj.getMonth() + 1}/${dateObj.getDate()}`, x, padding.top + chartHeight + 10);
    });

    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    
    ctx.fillStyle = '#4f8cff';
    ctx.beginPath();
    ctx.roundRect(rect.width - 150, 15, 12, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('销售额', rect.width - 135, 21);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(rect.width - 150, 38, 12, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('利润', rect.width - 135, 38);
}

function updateCustomerRank() {
    const tbody = document.getElementById('customerRankBody');
    const empty = document.getElementById('customerRankEmpty');
    tbody.innerHTML = '';

    if (customers.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    const customerStats = customers.map(customer => {
        const customerSales = sales.filter(s => s.customerId === customer.id);
        const totalSpent = customerSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
        const orderCount = customerSales.length;
        const avgSpent = orderCount > 0 ? totalSpent / orderCount : 0;
        
        return {
            ...customer,
            totalSpent: totalSpent || customer.totalSpent,
            orderCount,
            avgSpent
        };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    customerStats.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.className = index < 3 ? `rank-${index + 1}` : '';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${customer.name}</td>
            <td>${customer.type}</td>
            <td>${formatMoney(customer.totalSpent)}</td>
            <td>${customer.orderCount} 笔</td>
            <td>${formatMoney(customer.avgSpent)}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateSupplierChart() {
    const canvas = document.getElementById('supplierChart');
    const ctx = canvas.getContext('2d');
    
    const supplierStats = {};
    purchases.forEach(purchase => {
        if (!supplierStats[purchase.supplierId]) {
            supplierStats[purchase.supplierId] = { amount: 0, quantity: 0 };
        }
        supplierStats[purchase.supplierId].amount += purchase.price * purchase.quantity;
        supplierStats[purchase.supplierId].quantity += purchase.quantity;
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const total = Object.values(supplierStats).reduce((sum, s) => sum + s.amount, 0);
    if (total === 0) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无进货数据', rect.width / 2, rect.height / 2);
        return;
    }

    const sortedSuppliers = Object.entries(supplierStats)
        .map(([supplierId, stats]) => ({
            supplierId: parseInt(supplierId),
            ...stats
        }))
        .sort((a, b) => b.amount - a.amount);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    let startAngle = -Math.PI / 2;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    sortedSuppliers.forEach((item, index) => {
        const supplier = getSupplierById(item.supplierId);
        const supplierName = supplier ? supplier.name : '未知供应商';
        const angle = (item.amount / total) * Math.PI * 2;
        const endAngle = startAngle + angle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(centerX - radius/3, centerY - radius/3, 0, centerX, centerY, radius);
        gradient.addColorStop(0, lightenColor(colors[index % colors.length], 20));
        gradient.addColorStop(1, colors[index % colors.length]);
        ctx.fillStyle = gradient;
        ctx.fill();

        const midAngle = startAngle + angle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
        
        const percentage = ((item.amount / total) * 100).toFixed(0);
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);

        startAngle = endAngle;
    });

    let legendY = 20;
    sortedSuppliers.forEach((item, index) => {
        const supplier = getSupplierById(item.supplierId);
        const supplierName = supplier ? supplier.name : '未知供应商';
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.roundRect(20, legendY, 12, 12, 3);
        ctx.fill();
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${supplierName}: ${formatMoney(item.amount)}`, 40, legendY + 6);
        legendY += 25;
    });
}

function updateStockStats() {
    const tbody = document.getElementById('stockTableBody');
    const empty = document.getElementById('stockEmpty');
    tbody.innerHTML = '';

    if (brands.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    let totalStock = 0;
    let totalValue = 0;
    let alertCount = 0;

    brands.forEach(brand => {
        const stockValue = brand.stock * brand.purchasePrice;
        totalStock += brand.stock;
        totalValue += stockValue;
        
        const alertStock = brand.alertStock || 10;
        if (brand.stock <= alertStock) alertCount++;

        const status = brand.stock <= alertStock ? 
            '<span class="stock-warning">库存不足</span>' : 
            '<span class="stock-normal">正常</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${brand.name}</td>
            <td>${brand.spec}</td>
            <td>${brand.category}</td>
            <td>${brand.stock}</td>
            <td>${alertStock}</td>
            <td>${formatMoney(stockValue)}</td>
            <td>${status}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('totalStockValue').textContent = formatMoney(totalValue);
    document.getElementById('stockAlertCount').textContent = alertCount;
}

function updateDailyReport() {
    const today = getTodayDate();
    const todaySales = sales.filter(s => s.date === today);
    
    const totalAmount = todaySales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const totalQuantity = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const totalProfit = todaySales.reduce((sum, s) => sum + (s.salePrice - s.purchasePrice) * s.quantity, 0);
    const rate = totalAmount > 0 ? (totalProfit / totalAmount * 100).toFixed(1) : 0;

    let highEnd = 0, midEnd = 0, lowEnd = 0;
    todaySales.forEach(sale => {
        const brand = getBrandById(sale.brandId);
        const category = brand ? brand.category : '中端';
        if (category === '高端') highEnd += sale.quantity;
        else if (category === '中端') midEnd += sale.quantity;
        else lowEnd += sale.quantity;
    });

    const dateObj = new Date(today);
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const displayDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${weekDays[dateObj.getDay()]}`;

    document.getElementById('reportDate').textContent = displayDate;
    document.getElementById('reportOrders').textContent = todaySales.length + ' 笔';
    document.getElementById('reportQuantity').textContent = totalQuantity + ' 条';
    document.getElementById('reportAmount').textContent = formatMoney(totalAmount);
    document.getElementById('reportProfit').textContent = formatMoney(totalProfit);
    document.getElementById('reportHighEnd').textContent = highEnd + ' 条';
    document.getElementById('reportMidEnd').textContent = midEnd + ' 条';
    document.getElementById('reportLowEnd').textContent = lowEnd + ' 条';
    document.getElementById('reportRate').textContent = rate + '%';
}

function updateAllStats() {
    updateTodayStats();
    updateMonthStats();
    updateAvgOrderValue();
    updateStockTurnover();
    updateMonthPurchases();
    updateSupplierCount();
    updateActiveCustomerCount();
    updateOrderCompletionRate();
    updateProfitAnalysis();
    updateBrandRank();
    updateSalesChart();
    updateCategoryChart();
    updateTimeSlotChart();
    updateCustomerTypeChart();
    updateProfitChart();
    updateCustomerRank();
    updateSupplierChart();
    updateStockStats();
    updateDailyReport();
}

function initExport() {
    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = {
            brands,
            sales,
            customers,
            purchases,
            suppliers,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cigarette_sales_data_${getTodayDate()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.brands) brands = data.brands;
                if (data.sales) sales = data.sales;
                if (data.customers) customers = data.customers;
                if (data.purchases) purchases = data.purchases;
                if (data.suppliers) suppliers = data.suppliers;
                saveData();
                renderBrands();
                renderSales();
                renderCustomers();
                renderPurchases();
                renderSuppliers();
                updateBrandSelect();
                updateFilterBrandSelect();
                updatePurchaseBrandSelect();
                updatePurchaseFilterBrandSelect();
                updatePurchaseSupplierSelect();
                updatePurchaseFilterSupplierSelect();
                updateAllStats();
                alert('数据导入成功！');
            } catch (error) {
                alert('数据导入失败，请确保文件格式正确。');
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            brands = [];
            sales = [];
            customers = [];
            purchases = [];
            suppliers = [];
            saveData();
            renderBrands();
            renderSales();
            renderCustomers();
            renderPurchases();
            renderSuppliers();
            updateBrandSelect();
            updateFilterBrandSelect();
            updatePurchaseBrandSelect();
            updatePurchaseFilterBrandSelect();
            updatePurchaseSupplierSelect();
            updatePurchaseFilterSupplierSelect();
            updateAllStats();
            alert('数据已清空！');
        }
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function initStatsFilter() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatsView = btn.dataset.view;
            updateAllStats();
        });
    });

    document.getElementById('statsRefreshBtn').addEventListener('click', () => {
        updateAllStats();
    });
}

function init() {
    loadData();
    initTabs();
    initBrandForm();
    initSaleForm();
    initSalesFilter();
    initPurchaseForm();
    initPurchaseFilter();
    initSupplierForm();
    initCustomerForm();
    initStatsFilter();
    initExport();
    renderBrands();
    renderSales();
    renderCustomers();
    renderPurchases();
    renderSuppliers();
    updateBrandSelect();
    updateFilterBrandSelect();
    updatePurchaseBrandSelect();
    updatePurchaseFilterBrandSelect();
    updatePurchaseSupplierSelect();
    updatePurchaseFilterSupplierSelect();
    updateSaleCustomerSelect();
    updateAllStats();
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

init();