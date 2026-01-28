// --- 1. DATA INITIALIZATION ---
let documents = JSON.parse(localStorage.getItem('myDocs')) || [];
let inventory = JSON.parse(localStorage.getItem('myInv')) || [
    { name: "Widget A", price: 100 },
    { name: "Service B", price: 500 }
];
let clients = JSON.parse(localStorage.getItem('myClients')) || [{ name: "Acme Corp" }];
let companyProfile = JSON.parse(localStorage.getItem('myProfile')) || { name: 'POSDB', address: 'Address' };

// --- 2. CORE STORAGE & NAVIGATION ---
function saveData() {
    localStorage.setItem('myDocs', JSON.stringify(documents));
    renderTable();
}
function saveProfile() {
    companyProfile.name = document.getElementById('compName').value;
    companyProfile.address = document.getElementById('compAddress').value;
    localStorage.setItem('myProfile', JSON.stringify(companyProfile));
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
function updatePriceFromInventory() {
    const selectedItemName = document.getElementById('itemSelect').value;
    const qty = parseFloat(document.getElementById('itemQty').value) || 1;
    
    // Find the item in your inventory array to get its price
    const itemData = inventory.find(i => i.name === selectedItemName);
    
    if (itemData) {
        const total = itemData.price * qty;
        document.getElementById('itemPrice').value = total.toFixed(2);
    }
}
// --- 6. MODAL CONTROLS ---
function openModal() { 
    const select = document.getElementById('clientName');
    select.innerHTML = '<option value="">-- Select Client --</option>'; 
    clients.forEach(c => {
        select.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
    document.getElementById('docModal').style.display = 'flex'; 
}

function closeModal() { document.getElementById('docModal').style.display = 'none'; }

function openClientModal() { document.getElementById('clientModal').style.display = 'flex'; }
function closeClientModal() { document.getElementById('clientModal').style.display = 'none'; }

// --- 7. CLIENT MANAGEMENT ---
function addNewClient() {
    const name = document.getElementById('newClientName').value;
    const email = document.getElementById('newClientEmail').value;
    const phone = document.getElementById('newClientPhone').value;

    if(!name) return alert("Client name is required");

    // 1. Add to the array
    clients.push({ id: Date.now(), name, email, phone });

    // 2. Save specifically to the 'myClients' storage key
    localStorage.setItem('myClients', JSON.stringify(clients));
    
    // 3. Update the UI
    renderClients(); 
    closeClientModal();
    
    // 4. Clear the inputs
    document.getElementById('newClientName').value = '';
    document.getElementById('newClientEmail').value = '';
    document.getElementById('newClientPhone').value = '';
    
    alert("Client added successfully!");
}
// Run on start
// Run on start
window.onload = () => {
    if (document.getElementById('compName')) {
        document.getElementById('compName').value = companyProfile.name;
    }
    if (document.getElementById('compAddress')) {
        document.getElementById('compAddress').value = companyProfile.address;
    }
    renderTable();
};
// Add items to the dropdown when opening the modal
function openModal() { 
    // Fill Clients
    const clientSelect = document.getElementById('clientName');
    clientSelect.innerHTML = '<option value="">-- Select Client --</option>'; 
    clients.forEach(c => clientSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`);

    // Fill Items
    const itemSelect = document.getElementById('itemSelect');
    itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
    inventory.forEach(item => itemSelect.innerHTML += `<option value="${item.name}">${item.name}</option>`);

    document.getElementById('docModal').style.display = 'flex'; 
}

// Updated quote creation to use the selected item and qty
function createNewQuote() {
    const client = document.getElementById('clientName').value;
    const itemName = document.getElementById('itemSelect').value;
    const qty = document.getElementById('itemQty').value;
    const price = document.getElementById('itemPrice').value;

    if(!client || !itemName || !price) return alert("Please fill in details");

    const newDoc = {
        id: 'QT-' + Math.floor(Math.random() * 9000 + 1000),
        date: new Date().toLocaleDateString(),
        clientName: client,
        type: 'Quotation',
        status: 'Pending',
        items: [{ name: `${itemName} (x${qty})`, price: price }]
    };
function printDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head><title>Print ${doc.id}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <h1 style="margin:0; color: #2563eb;">${companyProfile.name}</h1>
                    <p style="white-space: pre-line;">${companyProfile.address}</p>
                </div>
                <div style="text-align: right;">
                    <h2>${doc.type.toUpperCase()}</h2>
                    <p><b>ID:</b> ${doc.id}<br><b>Date:</b> ${doc.date}</p>
                </div>
            </div>
            <hr style="margin: 20px 0;">
            <p><b>To:</b> ${doc.clientName}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Description</th>
                        <th style="text-align: right; padding: 10px; border: 1px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${doc.items.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                            <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">$${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 20px;">
                <h3>Total Amount: $${doc.items.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)}</h3>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
    documents.push(newDoc);
    saveData();
    closeModal();
}
