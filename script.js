// Budget Tracker in JavaScript
// By Oscar Moncada - CSE 310

let records = [];
const now = new Date();
const month = now.toLocaleString("en-US", { month: "long" });
const year = now.getFullYear();
const key = "records_" + year + "_" + (now.getMonth() + 1);

window.onload = function() {
  document.title = "Budget Tracker - " + month + " " + year;

  let title = document.createElement("h2");
  title.textContent = month.toUpperCase() + " " + year;
  document.querySelector("body").prepend(title);

  let saved = localStorage.getItem(key);
  if (saved) {
    records = JSON.parse(saved);
    showTable();
    updateTotals();
  }
};

function save() {
  localStorage.setItem(key, JSON.stringify(records));
}

function clearData() {
  if (confirm("Clear all data for " + month + "?")) {
    records = [];
    localStorage.removeItem(key);
    showTable();
    updateTotals();
  }
}

document.getElementById("entryForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let type = document.getElementById("type").value;
  let desc = document.getElementById("desc").value.trim();
  let amount = parseFloat(document.getElementById("amount").value);
  let date = document.getElementById("date").value;

  if (!desc || isNaN(amount) || !date) {
    alert("Please fill out all fields");
    return;
  }

  let item = {
    id: Date.now(),
    type: type,
    desc: desc,
    amount: amount,
    date: date,
    paid: false
  };

  records.push(item);
  save();
  showTable();
  updateTotals();
  e.target.reset();
});

function showTable() {
  let tbody = document.getElementById("records");
  tbody.innerHTML = "";

  records.sort((a, b) => new Date(a.date) - new Date(b.date));

  records.forEach(function(rec) {
    let row = document.createElement("tr");

    let today = new Date();
    let due = new Date(rec.date);
    if (rec.type === "expense" && !rec.paid && due < today) {
      row.style.background = "#ffd6d6";
    }

    let paidCell = rec.type === "expense"
      ? '<input type="checkbox" ' + (rec.paid ? 'checked' : '') + '>'
      : '-';

    row.innerHTML = `
      <td>${rec.type}</td>
      <td>${rec.desc}</td>
      <td style="color:${rec.type === 'income' ? 'green' : 'red'}">
        $${rec.amount}
      </td>
      <td>${rec.date}</td>
      <td>${paidCell}</td>
      <td>
        <button class="edit" data-id="${rec.id}">Edit</button>
        <button class="delete" data-id="${rec.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);

    if (rec.type === "expense") {
      row.querySelector("input").addEventListener("change", function(e) {
        rec.paid = e.target.checked;
        save();
        updateTotals();
      });
    }

    row.querySelector(".edit").addEventListener("click", function() {
      document.getElementById("type").value = rec.type;
      document.getElementById("desc").value = rec.desc;
      document.getElementById("amount").value = rec.amount;
      document.getElementById("date").value = rec.date;
      records = records.filter(r => r.id !== rec.id);
      save();
      showTable();
      updateTotals();
    });

    row.querySelector(".delete").addEventListener("click", function() {
      if (confirm("Delete this item?")) {
        records = records.filter(r => r.id !== rec.id);
        save();
        showTable();
        updateTotals();
      }
    });
  });

  let main = document.querySelector("body");
  let btn = document.getElementById("clearBtn");
  if (!btn) {
    let clearBtn = document.createElement("button");
    clearBtn.id = "clearBtn";
    clearBtn.textContent = "Clear All Data";
    clearBtn.onclick = clearData;
    main.appendChild(clearBtn);
  }
}

function updateTotals() {
  let totalIncome = 0;
  let totalPaidExp = 0;
  records.forEach(function(r) {
    if (r.type === "income") {
      totalIncome += r.amount;
    }
    if (r.type === "expense" && r.paid) {
      totalPaidExp += r.amount;
    }
  });

  let balance = totalIncome - totalPaidExp;

  document.getElementById("totalIncome").textContent = "$" + totalIncome;
  document.getElementById("totalExpense").textContent = "$" + totalPaidExp;
  document.getElementById("balance").textContent = "$" + balance;
}
