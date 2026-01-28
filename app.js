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
