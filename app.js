// --- 1. DATA INITIALIZATION ---
let documents = JSON.parse(localStorage.getItem('myDocs')) || [];
let inventory = JSON.parse(localStorage.getItem('myInv')) || [
    { id: 1, name: "Widget A", price: 100, desc: "High quality widget" },
    { id: 2, name: "Service B", price: 500, desc: "Consulting per hour" }
];
let clients = JSON.parse(localStorage.getItem('myClients')) || [
    { id: 1, name: "Acme Corp", email: "contact@acme.com", phone: "012-3456789" },
    { id: 2, name: "Global Tech", email: "hello@gt.com", phone: "099-888777" }
];

// --- 2. CORE STORAGE & NAVIGATION ---
function saveData() {
    localStorage.setItem('myDocs', JSON.stringify(documents));
    localStorage.setItem('myInv', JSON.stringify(inventory));
    localStorage.setItem('myClients', JSON.stringify(clients));
    renderTable(); 
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'inventory') renderInventory();
    if (sectionId === 'clients') renderClients();
}

// --- 3. RENDER DASHBOARD TABLE ---
function renderTable() {
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    documents.forEach((doc, index) => {
        let buttons = '';
        if (doc.type === 'Quotation') {
            buttons += `<button class="btn-sm" onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>`;
        } 
        if (doc.type === 'Invoice' && doc.status === 'Pending') {
            buttons += `<button class="btn-sm success" onclick="markAsPaid('${doc.id}')">Mark Paid</button>`;
        }
buttons += `<button class="btn-sm secondary" onclick="printDocument('${doc.id}')">Print</button>`;
        buttons += `<button class="btn-sm danger" onclick="deleteDoc(${index})">Delete</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${doc.date}</td>
                <td>${doc.id}</td>
                <td>${doc.clientName}</td>
                <td><span class="badge">${doc.type}</span></td>
                <td><span class="status-${doc.status.toLowerCase()}">${doc.status}</span></td>
                <td><div class="action-gap" style="display:flex; gap:5px;">${buttons}</div></td>
            </tr>
        `;
    });
}
function renderTable() {
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    // --- NEW: CALCULATION VARIABLES ---
    let totalRevenue = 0;
    let pendingCount = 0;

    documents.forEach((doc, index) => {
        // Calculate document total
        const docTotal = doc.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
        
        // Update Stats Logic
        if (doc.type === 'Invoice' && doc.status === 'Paid') {
            totalRevenue += docTotal;
        }
        if (doc.type === 'Invoice' && doc.status === 'Pending') {
            pendingCount++;
        }

        // --- EXISTING TABLE RENDERING ---
        let buttons = '';
        if (doc.type === 'Quotation') {
            buttons += `<button class="btn-sm" onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>`;
        } 
        if (doc.type === 'Invoice' && doc.status === 'Pending') {
            buttons += `<button class="btn-sm success" onclick="markAsPaid('${doc.id}')">Mark Paid</button>`;
        }
        buttons += `<button class="btn-sm secondary" onclick="printDocument('${doc.id}')">Print</button>`;
        buttons += `<button class="btn-sm danger" onclick="deleteDoc(${index})">Delete</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${doc.date}</td>
                <td>${doc.id}</td>
                <td>${doc.clientName}</td>
                <td><span class="badge">${doc.type}</span></td>
                <td><span class="status-${doc.status.toLowerCase()}">${doc.status}</span></td>
                <td><div class="action-gap" style="display:flex; gap:5px;">${buttons}</div></td>
            </tr>
        `;
    });

    // --- UPDATE THE UI CARDS ---
    document.getElementById('statRevenue').innerText = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('statPending').innerText = pendingCount;
}

// --- 4. INVENTORY & CLIENT RENDERING ---
function renderInventory() {
    const invContainer = document.getElementById('inventoryList');
    invContainer.innerHTML = `
        <div class="table-container" style="margin-top: 20px;">
            <table>
                <thead><tr><th>Name</th><th>Price</th><th>Description</th></tr></thead>
                <tbody>
                    ${inventory.map(item => `<tr><td>${item.name}</td><td>$${item.price}</td><td>${item.desc}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>`;
}

function renderClients() {
    const clientContainer = document.getElementById('clientList');
    if (!clientContainer) return;

    clientContainer.innerHTML = `
        <div class="table-container" style="margin-top: 20px;">
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
                <tbody>
                    ${clients.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>`;
}

// --- 5. DOCUMENT ACTIONS ---
function createNewQuote() {
    const client = document.getElementById('clientName').value;
    const item = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;

    if(!client || !item) return alert("Please fill in details");

    const newDoc = {
        id: 'QT-' + Math.floor(Math.random() * 1000),
        date: new Date().toLocaleDateString(),
        clientName: client,
        type: 'Quotation',
        status: 'Pending',
        items: [{ name: item, price: price }]
    };

    documents.push(newDoc);
    saveData();
    closeModal();
}

function convertToInvoice(quoteId) {
    const quote = documents.find(d => d.id === quoteId);
    if (!quote) return;
    const newInvoice = {...quote, id: quote.id.replace('QT-', 'INV-'), type: 'Invoice', status: 'Pending'};
    documents.push(newInvoice);
    saveData();
}

function markAsPaid(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) { doc.status = 'Paid'; saveData(); }
}

function deleteDoc(index) {
    if(confirm("Delete this?")) { documents.splice(index, 1); saveData(); }
}

// --- 6. MODAL CONTROLS ---
function openModal() { 
    // 1. Fill Clients Dropdown
    const clientSelect = document.getElementById('clientName');
    clientSelect.innerHTML = '<option value="">-- Select Client --</option>'; 
    clients.forEach(c => {
        clientSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });

    // 2. NEW: Fill Inventory Dropdown (matches the new 'itemSelect' ID in HTML)
    const itemSelect = document.getElementById('itemSelect');
    if (itemSelect) {
        itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
        inventory.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.name}">${item.name}</option>`;
        });
    }

    document.getElementById('docModal').style.display = 'flex'; 
}

// Keep these three - they are still perfect!
function closeModal() { document.getElementById('docModal').style.display = 'none'; }
function openClientModal() { document.getElementById('clientModal').style.display = 'flex'; }
function closeClientModal() { document.getElementById('clientModal').style.display = 'none'; }

// --- NEW HELPER FUNCTION ---
// Add this right below the modal controls to handle the auto-pricing
function updatePriceFromInventory() {
    const selectedItemName = document.getElementById('itemSelect').value;
    const itemData = inventory.find(i => i.name === selectedItemName);
    
    if (itemData) {
        document.getElementById('itemPrice').value = itemData.price;
    }
}

// --- 7. CLIENT MANAGEMENT ---
function addNewClient() {
    const name = document.getElementById('newClientName').value;
    const email = document.getElementById('newClientEmail').value;
    const phone = document.getElementById('newClientPhone').value;

    if(!name) return alert("Client name is required");

    clients.push({ id: Date.now(), name, email, phone });
    saveData(); 
    renderClients(); 
    closeClientModal();
    
    document.getElementById('newClientName').value = '';
    document.getElementById('newClientEmail').value = '';
    document.getElementById('newClientPhone').value = '';
}

function downloadInventoryReport() {
    let csv = "Item Name,Price,Description\n";
    inventory.forEach(item => { csv += `${item.name},${item.price},"${item.desc}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_report.csv';
    a.click();
}

// Run on start
renderTable();
// --- 8. PRINTING LOGIC ---
function printDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${doc.type} - ${doc.id}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
                .details { margin-top: 30px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th { background: #f1f5f9; padding: 12px; border: 1px solid #cbd5e1; text-align: left; }
                td { padding: 12px; border: 1px solid #cbd5e1; }
                .total-box { text-align: right; margin-top: 30px; font-size: 1.4rem; font-weight: bold; color: #2563eb; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div><h1>BIZMANAGER PRO</h1><p>Official ${doc.type}</p></div>
                <div style="text-align: right;"><h2>${doc.id}</h2><p>Date: ${doc.date}</p></div>
            </div>
            <div class="details">
                <strong>BILLED TO:</strong><br>
                ${doc.clientName}
            </div>
            <table>
                <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                <tbody>
                    ${doc.items.map(i => `<tr><td>${i.name}</td><td>$${i.price}</td></tr>`).join('')}
                </tbody>
            </table>
            <div class="total-box">Total Amount: $${doc.items.reduce((sum, i) => sum + parseFloat(i.price), 0)}</div>
            <p style="margin-top: 100px; text-align: center; font-size: 0.9rem; color: #64748b;">
                Thank you for your business! Generated by BizManager Pro.
            </p>
            <script>
                setTimeout(() => { window.print(); window.close(); }, 500);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
// --- 9. SEARCH & FILTER LOGIC ---
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;

    // Clear the table first
    tbody.innerHTML = '';

    // Filter the documents array
    const filteredDocs = documents.filter(doc => 
        doc.clientName.toLowerCase().includes(searchTerm) || 
        doc.id.toLowerCase().includes(searchTerm)
    );

    // Re-render only the filtered documents
    filteredDocs.forEach((doc, index) => {
        // We reuse the exact same button logic from your original renderTable
        let buttons = '';
        if (doc.type === 'Quotation') {
            buttons += `<button class="btn-sm" onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>`;
        } 
        if (doc.type === 'Invoice' && doc.status === 'Pending') {
            buttons += `<button class="btn-sm success" onclick="markAsPaid('${doc.id}')">Mark Paid</button>`;
        }
        buttons += `<button class="btn-sm secondary" onclick="printDocument('${doc.id}')">Print</button>`;
        buttons += `<button class="btn-sm danger" onclick="deleteDoc(${index})">Delete</button>`;

        tbody.innerHTML += `
            <tr>
                <td>${doc.date}</td>
                <td>${doc.id}</td>
                <td>${doc.clientName}</td>
                <td><span class="badge">${doc.type}</span></td>
                <td><span class="status-${doc.status.toLowerCase()}">${doc.status}</span></td>
                <td><div class="action-gap" style="display:flex; gap:5px;">${buttons}</div></td>
            </tr>
        `;
    });
}
function updatePriceFromInventory() {
    const selectedItemName = document.getElementById('itemSelect').value;
    const qty = parseFloat(document.getElementById('itemQty').value) || 1;
    const itemData = inventory.find(i => i.name === selectedItemName);
    
    if (itemData) {
        // Calculation: Unit Price * Quantity
        const totalPrice = itemData.price * qty;
        document.getElementById('itemPrice').value = totalPrice.toFixed(2);
    }
}

function createNewQuote() {
    const client = document.getElementById('clientName').value;
    const itemName = document.getElementById('itemSelect').value;
    const qty = document.getElementById('itemQty').value;
    const totalPrice = document.getElementById('itemPrice').value;

    if(!client || !itemName) return alert("Please select a client and item");

    const newDoc = {
        id: 'QT-' + Math.floor(Math.random() * 1000),
        date: new Date().toLocaleDateString(),
        clientName: client,
        type: 'Quotation',
        status: 'Pending',
        // We store the quantity in the description for the printout
        items: [{ name: `${itemName} (x${qty})`, price: totalPrice }]
    };

    documents.push(newDoc);
    saveData();
    closeModal();
}
