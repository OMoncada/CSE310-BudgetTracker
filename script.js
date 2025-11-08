// Budget Tracker
// By Oscar Moncada - CSE 310

let records = [];
const now = new Date();
const month = now.toLocaleString("en-US", { month: "long" });
const year = now.getFullYear();
const key = "records_" + year + "_" + (now.getMonth() + 1);

// Recursive function example: count days left in current month
function daysLeftInMonth(day = now.getDate()) {
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  if (day > lastDay) return 0;
  return lastDay - day;
}

window.onload = function() {
  document.title = "Budget Tracker - " + month + " " + year;

  let title = document.createElement("h2");
  title.textContent = month.toUpperCase() + " " + year;
  document.querySelector("body").prepend(title);

  console.log("Days left in the month:", daysLeftInMonth());
  console.log("Generated random ID from Lodash:", _.random(1000, 9999));

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
  try {
    let type = document.getElementById("type").value;
    let desc = document.getElementById("desc").value.trim();
    let amount = parseFloat(document.getElementById("amount").value);
    let date = document.getElementById("date").value;

    if (!desc || isNaN(amount) || !date) {
      throw new Error("Please fill out all fields correctly.");
    }

    let item = {
      id: _.random(1000, 9999),
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
  } catch (err) {
    alert("Error: " + err.message);
  }
});

function showTable() {
  let tbody = document.getElementById("records");
  tbody.innerHTML = "";

  // Sort by date
  records.sort((a, b) => new Date(a.date) - new Date(b.date));

  records.forEach(function(rec) {
    let row = document.createElement("tr");

    let today = new Date();
    let due = new Date(rec.date);
    if (rec.type === "expense" && !rec.paid && due < today) {
      row.style.background = "#ffd6d6"; // overdue alert color
    }

    let paidCell =
      rec.type === "expense"
        ? '<input type="checkbox" ' + (rec.paid ? "checked" : "") + ">"
        : "-";

    row.innerHTML = `
      <td>${rec.type}</td>
      <td>${rec.desc}</td>
      <td style="color:${rec.type === "income" ? "green" : "red"}">
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

    // Checkbox to mark paid
    if (rec.type === "expense") {
      row.querySelector("input").addEventListener("change", function(e) {
        rec.paid = e.target.checked;
        save();
        updateTotals();
      });
    }

    // Edit button
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

    // Delete button
    row.querySelector(".delete").addEventListener("click", function() {
      if (confirm("Delete this item?")) {
        records = records.filter(r => r.id !== rec.id);
        save();
        showTable();
        updateTotals();
      }
    });
  });

  // Create Clear All button at the end of the table
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
  let totalExpenseAll = 0;
  let totalPaidExp = 0;

  records.forEach(function(r) {
    if (r.type === "income") {
      totalIncome += r.amount;
    }
    if (r.type === "expense") {
      totalExpenseAll += r.amount; // sum all expenses
      if (r.paid) {
        totalPaidExp += r.amount; // sum only paid expenses
      }
    }
  });

  // Balance only subtracts paid expenses
  let balance = totalIncome - totalPaidExp;

  document.getElementById("totalIncome").textContent = "$" + totalIncome;
  document.getElementById("totalExpense").textContent = "$" + totalExpenseAll;
  document.getElementById("balance").textContent = "$" + balance;
}
