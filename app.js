
// Initialize data from LocalStorage (or empty arrays if new)
let documents = JSON.parse(localStorage.getItem('myDocs')) || [];
let inventory = JSON.parse(localStorage.getItem('myInv')) || [
    { id: 1, name: "Service A", price: 500, desc: "Standard Consulting" }
];

// Function to save everything to the browser's memory
function saveData() {
    localStorage.setItem('myDocs', JSON.stringify(documents));
    localStorage.setItem('myInv', JSON.stringify(inventory));
    renderTable();
}

// Function to switch between Dashboard, Inventory, and Clients
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Function to display the documents in the HTML table
function function renderTable() {
    const tbody = document.getElementById('docListBody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    documents.forEach((doc, index) => {
        // Logic to decide which buttons to show
        let buttons = '';
        
        if (doc.type === 'Quotation') {
            buttons += `<button class="btn-sm" onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>`;
        } 
        
        if (doc.type === 'Invoice' && doc.status === 'Pending') {
            buttons += `<button class="btn-sm success" onclick="markAsPaid('${doc.id}')">Mark Paid</button>`;
        }

        // Always show a delete button for every row
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

// Add this helper function to delete records
function deleteDoc(index) {
    if(confirm("Are you sure you want to delete this?")) {
        documents.splice(index, 1);
        saveData();
    }
}
 {
    const tbody = document.getElementById('docListBody');
    tbody.innerHTML = ''; // Clear table

    documents.forEach(doc => {
        tbody.innerHTML += `
            <tr>
                <td>${doc.date}</td>
                <td>${doc.id}</td>
                <td>${doc.clientName}</td>
                <td><span class="badge">${doc.type}</span></td>
                <td>${doc.status}</td>
                <td>
                    <button onclick="convertToInvoice('${doc.id}')">Convert to Inv</button>
                </td>
            </tr>
        `;
    });
}

// Run this when the page loads
renderTable();
function openModal() {
    document.getElementById('docModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('docModal').style.display = 'none';
}

function createNewQuote() {
    const client = document.getElementById('clientName').value;
    const item = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;

    const newDoc = {
        id: 'QT-' + Math.floor(Math.random() * 1000),
        date: new Date().toLocaleDateString(),
        clientName: client,
        type: 'Quotation',
        status: 'Pending',
        items: [{ name: item, price: price }]
    };

    documents.push(newDoc); // Add to our list
    saveData();             // Save to LocalStorage and Refresh table
    closeModal();           // Hide popup
}
function convertToInvoice(quoteId) {
    // 1. Find the original quotation
    const quoteIndex = documents.findIndex(d => d.id === quoteId);
    if (quoteIndex === -1) return;

    const quote = documents[quoteIndex];

    // 2. Create the new Invoice based on the Quote data
    const newInvoice = {
        ...quote, // Copy all data (client, items, etc.)
        id: quote.id.replace('QT-', 'INV-'), // Change ID prefix
        type: 'Invoice',
        date: new Date().toLocaleDateString(),
        status: 'Pending'
    };

    // 3. Add to our list and save
    documents.push(newInvoice);
    saveData();
    alert(`Success! ${quoteId} has been converted to ${newInvoice.id}`);
}
function markAsPaid(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        doc.status = 'Paid';
        saveData();
    }
}
