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
let companyProfile = JSON.parse(localStorage.getItem('myProfile')) || { name: 'BIZMANAGER', address: 'Your Address Here' };

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

function saveProfile() {
    const nameVal = document.getElementById('compName').value;
    const addrVal = document.getElementById('compAddress').value;

    // Update the live variable
    companyProfile.name = nameVal;
    companyProfile.address = addrVal;

    // Save to local storage
    localStorage.setItem('myProfile', JSON.stringify(companyProfile));
}

// --- 3. RENDER DASHBOARD TABLE & STATS ---
function renderTable(dataToRender = documents) {
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    let totalRevenue = 0;
    let pendingCount = 0;

    // Calculate Global Stats based on ALL documents
    documents.forEach(doc => {
        const docTotal = doc.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
        if (doc.type === 'Invoice' && doc.status === 'Paid') totalRevenue += docTotal;
        if (doc.type === 'Invoice' && doc.status === 'Pending') pendingCount++;
    });

    // Update UI Cards
    document.getElementById('statRevenue').innerText = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('statPending').innerText = pendingCount;

    // Render the rows (filtered or full)
    dataToRender.forEach((doc, index) => {
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
                <td><div style="display:flex; gap:5px;">${buttons}</div></td>
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
    const itemName = document.getElementById('itemSelect').value;
    const qty = document.getElementById('itemQty').value;
    const totalPrice = document.getElementById('itemPrice').value;

    if(!client || !itemName || !totalPrice) return alert("Please fill in all details!");

    const newDoc = {
        id: 'QT-' + Math.floor(Math.random() * 9000 + 1000),
        date: new Date().toLocaleDateString(),
        clientName: client,
        type: 'Quotation',
        status: 'Pending',
        items: [{ name: `${itemName} (x${qty})`, price: totalPrice }]
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

// --- 6. MODAL & HELPER CONTROLS ---
function openModal() { 
    const clientSelect = document.getElementById('clientName');
    clientSelect.innerHTML = '<option value="">-- Select Client --</option>'; 
    clients.forEach(c => clientSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`);

    const itemSelect = document.getElementById('itemSelect');
    itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
    inventory.forEach(item => itemSelect.innerHTML += `<option value="${item.name}">${item.name}</option>`);

    document.getElementById('docModal').style.display = 'flex'; 
}

function closeModal() { document.getElementById('docModal').style.display = 'none'; }
function openClientModal() { document.getElementById('clientModal').style.display = 'flex'; }
function closeClientModal() { document.getElementById('clientModal').style.display = 'none'; }

function updatePriceFromInventory() {
    const itemName = document.getElementById('itemSelect').value;
    const qty = parseFloat(document.getElementById('itemQty').value) || 0;
    const itemData = inventory.find(i => i.name === itemName);
    if (itemData) {
        document.getElementById('itemPrice').value = (itemData.price * qty).toFixed(2);
    }
}

function filterTable() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = documents.filter(doc => 
        doc.clientName.toLowerCase().includes(term) || doc.id.toLowerCase().includes(term)
    );
    renderTable(filtered);
}

// --- 7. CLIENT MANAGEMENT ---
function addNewClient() {
    const name = document.getElementById('newClientName').value;
    const email = document.getElementById('newClientEmail').value;
    const phone = document.getElementById('newClientPhone').value;
    if(!name) return alert("Client name required");
    clients.push({ id: Date.now(), name, email, phone });
    saveData(); 
    closeClientModal();
}

// --- 8. PRINTING ---
function printDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head><style>
            body { font-family: sans-serif; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
            .total { text-align: right; font-size: 1.5rem; margin-top: 20px; color: #2563eb; }
        </style></head>
        <body>
            <div class="header">
                <div><h1>${companyProfile.name.toUpperCase()}</h1><p>${companyProfile.address}</p></div>
                <div style="text-align:right;"><h2>${doc.type}</h2><p>ID: ${doc.id}</p></div>
            </div>
            <p><strong>BILLED TO:</strong> ${doc.clientName}</p>
            <table>
                <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                <tbody>${doc.items.map(i => `<tr><td>${i.name}</td><td>$${i.price}</td></tr>`).join('')}</tbody>
            </table>
            <div class="total">Total: $${doc.items.reduce((sum, i) => sum + parseFloat(i.price), 0).toFixed(2)}</div>
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body></html>`);
    printWindow.document.close();
}

// --- INITIAL LOAD ---
window.onload = function() {
    // Fill the sidebar boxes with your saved info
    document.getElementById('compName').value = companyProfile.name || "";
    document.getElementById('compAddress').value = companyProfile.address || "";
    
    renderTable(); // Start the dashboard
};
window.onload = function() {
    // Fill the sidebar boxes from our saved data
    if(document.getElementById('compName')) {
        document.getElementById('compName').value = companyProfile.name || "";
    }
    if(document.getElementById('compAddress')) {
        document.getElementById('compAddress').value = companyProfile.address || "";
    }
    
    renderTable(); 
};
// --- Ensure this is at the VERY bottom of your app.js ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Force load the saved profile into the inputs
    const nameInput = document.getElementById('compName');
    const addrInput = document.getElementById('compAddress');

    if (nameInput) nameInput.value = companyProfile.name || "";
    if (addrInput) addrInput.value = companyProfile.address || "";

    // 2. Refresh the dashboard
    renderTable();
});
