// 1. Data Initialization
let documents = JSON.parse(localStorage.getItem('myDocs')) || [];
let inventory = JSON.parse(localStorage.getItem('myInv')) || [
    { id: 1, name: "Widget A", price: 100, desc: "High quality widget" },
    { id: 2, name: "Service B", price: 500, desc: "Consulting per hour" }
];

// 2. Core Functions
function saveData() {
    localStorage.setItem('myDocs', JSON.stringify(documents));
    localStorage.setItem('myInv', JSON.stringify(inventory));
    renderTable();
}

// Updated showSection to also refresh Inventory list
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'inventory') {
        renderInventory();
    }
}

// 3. Render Table
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
                <td><div class="action-gap">${buttons}</div></td>
            </tr>
        `;
    });
}

// 4. Inventory Management
function renderInventory() {
    const invContainer = document.getElementById('inventoryList');
    if (!invContainer) return;

    invContainer.innerHTML = `
        <div class="table-container" style="margin-top: 20px;">
            <table>
                <thead>
                    <tr><th>Name</th><th>Price</th><th>Description</th></tr>
                </thead>
                <tbody>
                    ${inventory.map(item => `
                        <tr><td>${item.name}</td><td>$${item.price}</td><td>${item.desc}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function downloadInventoryReport() {
    let csv = "Item Name,Price,Description\n";
    inventory.forEach(item => {
        csv += `${item.name},${item.price},"${item.desc}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_report.csv';
    a.click();
}

// 5. Document Actions
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

// 6. Modal Controls
function openModal() { document.getElementById('docModal').style.display = 'flex'; }
function closeModal() { document.getElementById('docModal').style.display = 'none'; }

renderTable();
