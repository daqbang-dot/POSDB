function openModal() { 
    document.getElementById('docModal').style.display = 'flex'; 
}
// 1. Data Initialization
let documents = JSON.parse(localStorage.getItem('myDocs')) || [];
let inventory = JSON.parse(localStorage.getItem('myInv')) || [
    { id: 1, name: "Service A", price: 500, desc: "Standard Consulting" }
];

// 2. Core Functions
function saveData() {
    localStorage.setItem('myDocs', JSON.stringify(documents));
    localStorage.setItem('myInv', JSON.stringify(inventory));
    renderTable();
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// 3. Render Table (The "Smart" Version)
function renderTable() {
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    documents.forEach((doc, index) => {
        let buttons = '';
        
        // Show "Convert" only for Quotations
        if (doc.type === 'Quotation') {
            buttons += `<button class="btn-sm" onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>`;
        } 
        
        // Show "Mark Paid" only for Pending Invoices
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

// 4. Document Actions
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

    const newInvoice = {
        ...quote,
        id: quote.id.replace('QT-', 'INV-'),
        type: 'Invoice',
        date: new Date().toLocaleDateString(),
        status: 'Pending'
    };

    documents.push(newInvoice);
    saveData();
}

function markAsPaid(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        doc.status = 'Paid';
        saveData();
    }
}

function deleteDoc(index) {
    if(confirm("Delete this document?")) {
        documents.splice(index, 1);
        saveData();
    }
}

// 5. Modal Controls
function openModal() { document.getElementById('docModal').style.display = 'flex'; }
function closeModal() { document.getElementById('docModal').style.display = 'none'; }

// Run on load
renderTable();
