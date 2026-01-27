
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
function renderTable() {
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
