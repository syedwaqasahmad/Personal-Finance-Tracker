// ===============================
// LOAD DATA FROM LOCAL STORAGE
// ===============================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let pieChart;
let barChart;

// ===============================
// ADD TRANSACTION
// ===============================
function addTransaction() {
  const desc = document.getElementById("desc").value.trim();
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (desc === "" || amount === "") {
    alert("Please enter all values.");
    return;
  }

  if (Number(amount) <= 0) {
    alert("Amount must be greater than 0.");
    return;
  }

  const transaction = {
    id: Date.now(),
    desc,
    amount: Number(amount),
    type,
    category,
    date: new Date().toISOString().slice(0, 10)
  };

  transactions.push(transaction);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";

  render();
}

// ===============================
// DELETE TRANSACTION
// ===============================
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter(t => t.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  render();
}

// ===============================
// RENDER UI
// ===============================
function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let income = 0;
  let expense = 0;

  const filter = document.getElementById("filter").value;

  transactions.sort((a, b) => b.id - a.id);

  transactions.forEach(t => {
    if (filter !== "all" && t.type !== filter) return;

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${t.desc}</strong><br>
        Rs. ${t.amount} | ${t.type} | ${t.category}<br>
        <small>${t.date}</small>
      </div>
      <button onclick="deleteTransaction(${t.id})">Delete</button>
    `;

    list.appendChild(li);

    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  document.getElementById("income").innerText = income;
  document.getElementById("expense").innerText = expense;
  document.getElementById("balance").innerText = income - expense;

  updatePieChart();
  updateBarChart();
}

// ===============================
// PIE CHART
// ===============================
function updatePieChart() {
  const categories = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      categories[t.category] =
        (categories[t.category] || 0) + t.amount;
    }
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (labels.length === 0) {
    labels.push("No Expenses");
    data.push(1);
  }

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#4bc0c0",
          "#ffcd56",
          "#9966ff"
        ]
      }]
    }
  });
}

// ===============================
// BAR CHART
// ===============================
function updateBarChart() {
  const months = {};

  transactions.forEach(t => {
    const month = t.date.slice(0, 7);

    if (!months[month]) {
      months[month] = {
        income: 0,
        expense: 0
      };
    }

    months[month][t.type] += t.amount;
  });

  const labels = Object.keys(months);
  const incomeData = labels.map(m => months[m].income);
  const expenseData = labels.map(m => months[m].expense);

  if (barChart) barChart.destroy();

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "green"
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: "red"
        }
      ]
    }
  });
}

// ===============================
// DARK MODE
// ===============================
function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// ===============================
// LOAD SAVED THEME
// ===============================
(function () {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
})();

// ===============================
// INITIAL LOAD
// ===============================
render();