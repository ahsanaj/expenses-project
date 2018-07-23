let email = null;
const DOM = {};
let monthlyIncome = [];
let monthlyExpense = [];
let monthlyBalance = [];
const categories = [
  "Groceries",
  "Rent",
  "Internet",
  "Mobile",
  "Electricity",
  "Gas",
  "Water",
  "Fuel",
  "Personal",
  "Shopping",
  "Hoteling",
  "Car",
  "Gym",
  "Health",
  "Donations",
  "Other"
];
const DOMCache = () => {
  DOM.email = document.querySelector("#email");
  DOM.login = document.querySelector("#login");
  DOM.formLogin = document.querySelector("#form-login");
  DOM.displayUser = document.querySelector("#display-user");
  DOM.incomeCard = document.querySelector("#income-card");
  DOM.expenseCard = document.querySelector("#expense-card");
  DOM.expenseListCard = document.querySelector("#expense-list-card");
  DOM.balanceCard = document.querySelector("#balance-card");
  DOM.formExpense = document.querySelector("#form-expense");
  DOM.category = document.querySelector("#category");
  DOM.amount = document.querySelector("#amount");
  DOM.date = document.querySelector("#date");
  DOM.comments = document.querySelector("#comments");
};
const bindEvents = () => {
  $("#modal-login").on("shown.bs.modal", function() {
    DOM.email.focus();
  });
  DOM.formLogin.addEventListener("submit", handleLoginFormSubmit);
  DOM.incomeCard.addEventListener("click", handleIncomeCardClick);
  DOM.formExpense.addEventListener("submit", handleExpenseFormSubmit);
  DOM.amount.addEventListener("keydown", handleAmountKeypress);
};
const fillCategory = () => {
  categories.sort();
  categories.forEach(category => {
    const option = document.createElement("option");
    option.text = category;
    option.value = category.toLowerCase();
    DOM.category.appendChild(option);
  });
};
const setDatePicker = () => {
  $("#date").val(moment().format("DD/MM/YYYY"));
  $("#date").datepicker({ dateFormat: "dd/mm/yy" });
};
const handleAmountKeypress = e => {
  if (
    (e.keyCode >= 48 && e.keyCode <= 57) ||
    (e.keyCode >= 96 && e.keyCode <= 105) ||
    (e.keyCode === 8 || e.keyCode === 190)
  ) {
    // 0-9 only
  } else {
    e.preventDefault();
  }
};
const getLoggedInUser = () => {
  email = localStorage.getItem("user-expenses");
  return email;
};
const handleExpenseFormSubmit = event => {
  event.preventDefault();
  const expense = {
    email: email,
    month: new Date().getMonth() + 1,
    category: DOM.category.value,
    amount: Number(DOM.amount.value),
    date: DOM.date.value,
    comments: DOM.comments.value
  };
  monthlyExpense.push(expense);
  localStorage.setItem("monthlyExpense", JSON.stringify(monthlyExpense));
  renderExpenseList(monthlyExpense);
  setMonthlyBalance();
  DOM.formExpense.reset();
  $("#date").val(moment().format("DD/MM/YYYY"));
};
const handleIncomeCardClick = event => {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.nodeName === "BUTTON") {
    if (event.target.name === "edit") {
      handleIncomeEditClick(event.target);
    } else if (event.target.name === "update") {
      handleIncomeUpdateClick(event.target);
    } else if (event.target.name === "cancel") {
      handleIncomeCancelClick(event.target);
    }
  }
};
const handleIncomeEditClick = target => {
  const li = target.parentElement.parentElement;
  const number = li.querySelector(".number");
  const input = li.querySelector("input");
  input.value = Number(String(number.innerText).replace("$", ""));
  const hiddenElements = li.querySelectorAll(".hidden");
  hiddenElements.forEach(item => item.classList.add("hidden-remove"));
  number.classList.add("hidden");
  target.classList.add("hidden");
  input.focus();
};
const handleIncomeUpdateClick = target => {
  const li = target.parentElement.parentElement;
  const number = li.querySelector(".number");
  const input = li.querySelector("input");
  updateIncome(input.name, input.value);
  const edit = li.querySelector("[name='edit']");
  const shownElements = li.querySelectorAll(".hidden-remove");
  shownElements.forEach(item => item.classList.remove("hidden-remove"));
  number.classList.remove("hidden");
  edit.classList.remove("hidden");
};
const updateIncome = (name, value) => {
  let num = -1;
  for (let i = 0; i < monthlyIncome.length; i++) {
    const item = monthlyIncome[i];
    if (item.email === email && item.month === new Date().getMonth() + 1) {
      console.log("found", name, value);
      monthlyIncome[i][name] = Number(value);
      localStorage.setItem("monthlyIncome", JSON.stringify(monthlyIncome));
      renderIncome(monthlyIncome[i]);
      setMonthlyBalance();
    }
  }
};
const handleIncomeCancelClick = target => {
  const li = target.parentElement.parentElement;
  const number = li.querySelector(".number");
  const edit = li.querySelector("[name='edit']");
  const shownElements = li.querySelectorAll(".hidden-remove");
  shownElements.forEach(item => item.classList.remove("hidden-remove"));
  number.classList.remove("hidden");
  edit.classList.remove("hidden");
};
const handleLoginFormSubmit = event => {
  event.preventDefault();
  email = DOM.email.value;
  localStorage.setItem("user-expenses", email);
  hideModal("#modal-login");
  DOM.displayUser.innerHTML = `<li class="nav-item"><a>Welcome, ${email}</a></li>`;
  setMonthlyIncome();
  setMonthlyBalance();
};
const setMonthlyIncome = () => {
  DOM.incomeCard.querySelector(
    ".card-header"
  ).innerHTML = `Income for the month of ${moment().format("MMMM")}`;
  const localMonthlyIncomeArray = JSON.parse(
    localStorage.getItem("monthlyIncome")
  );
  if (localMonthlyIncomeArray && localMonthlyIncomeArray.length > 0) {
    const data = localMonthlyIncomeArray.filter(
      item => item.email === email && item.month === new Date().getMonth() + 1
    );
    if (data.length > 0) {
      monthlyIncome.push(data[0]);
    }
  } else {
    monthlyIncome.push({
      email: email,
      budget: 0,
      income: 0,
      familyTaxBenefit: 0,
      month: new Date().getMonth() + 1
    });
    localStorage.setItem("monthlyIncome", JSON.stringify(monthlyIncome));
  }
  const thisMonthIncome = monthlyIncome.filter(
    item => item.email === email && item.month === new Date().getMonth() + 1
  );
  renderIncome(thisMonthIncome[0]);
};
const renderIncome = obj => {
  DOM.incomeCard.querySelector(".card-text").innerHTML = `
            <li>Budget (monthly): <span class="number">$${obj.budget}</span>
                <input type="number" name="budget" class="hidden" id="budget" />
                <div class='btn-div'>
                    <button name="edit" class='btn btn-info'>Edit</button>
                    <button name="cancel" class='btn btn-secondary hidden'>Cancel</button>
                    <button name="update" class='btn btn-info hidden'>Update</button>       
                </div>
            </li>
            <li>Income (monthly): <span class="number">$${obj.income}</span>
                <input type="number" name="income" class="hidden" id="income" />
                <div class='btn-div'>
                    <button name="edit" class='btn btn-info'>Edit</button>
                    <button name="cancel" class='btn btn-secondary hidden'>Cancel</button>
                    <button name="update" class='btn btn-info hidden'>Update</button>       
                </div>
            </li>
            <li>Family Tax Benefit: <span class="number">$${
              obj.familyTaxBenefit
            }</span>   
                <input type="number" name="familyTaxBenefit" class="hidden" id="familyTaxBenefit" />
                <div class='btn-div'>
                    <button name="edit" class='btn btn-info'>Edit</button>
                    <button name="cancel" class='btn btn-secondary hidden'>Cancel</button>
                    <button name="update" class='btn btn-info hidden'>Update</button>       
                </div> 
            </li>
        `;
};
const setMonthlyExpense = () => {
  DOM.expenseCard.querySelector(
    ".card-header"
  ).innerHTML = `Expense for the month of ${moment().format("MMMM")}`;
};
const setMonthlyExpenseList = () => {
  DOM.expenseListCard.querySelector(
    ".card-header"
  ).innerHTML = `Expense List for the month of ${moment().format("MMMM")}`;
  const localMonthlyExpenseArray = JSON.parse(
    localStorage.getItem("monthlyExpense")
  );
  if (localMonthlyExpenseArray && localMonthlyExpenseArray.length > 0) {
    const data = localMonthlyExpenseArray.filter(
      item => item.email === email && item.month === new Date().getMonth() + 1
    );
    if (data.length > 0) {
      monthlyExpense = data;
      renderExpenseList(monthlyExpense);
    }
  } else {
    localStorage.setItem("monthlyExpense", JSON.stringify(monthlyExpense));
  }
  const thisMonthIncome = monthlyIncome.filter(
    item => item.email === email && item.month === new Date().getMonth() + 1
  );
};
const setMonthlyBalance = () => {
  localStorage.removeItem("monthlyBalance");
  DOM.balanceCard.querySelector(
    ".card-header"
  ).innerHTML = `Balance for the month of ${moment().format("MMMM")}`;
  const localMonthlyBalanceArray = JSON.parse(
    localStorage.getItem("monthlyBalance")
  );
  const expense = monthlyExpense
    .filter(
      item => item.email === email && item.month === new Date().getMonth() + 1
    )
    .reduce((sum, item) => Number(sum) + Number(item.amount), 0);
  const incomeData = monthlyIncome.filter(
    item => item.email === email && item.month === new Date().getMonth() + 1
  )[0];
  const income = incomeData.income;
  const familyTaxBenefit = incomeData.familyTaxBenefit;
  const budget = incomeData.budget;

  const remaining = Number(budget) - Number(expense);
  const savings = Number(familyTaxBenefit) + Number(income) - Number(expense);
  let balanceExists = null;
  for (let j = 0; j < monthlyBalance.length; j++) {
    const current = monthlyBalance[j];
    if (
      current.email === email &&
      current.month === Number(new Date().getMonth() + 1)
    ) {
      balanceExists = true;
      monthlyBalance[j].savings = savings;
      monthlyBalance[j].remaining = remaining;
      monthlyBalance[j].expense = expense;
      break;
    }
  }
  if (!balanceExists) {
    monthlyBalance.push({
      email: email,
      month: new Date().getMonth() + 1,
      savings: savings,
      remaining: remaining,
      expense: expense
    });
  }
  localStorage.setItem("monthlyBalance", JSON.stringify(monthlyBalance));
  const thisMonthBalance = monthlyBalance.filter(
    item => item.email === email && item.month === new Date().getMonth() + 1
  );
  renderBalance(thisMonthBalance[0]);
};
const renderExpenseList = array => {
  const tbody = DOM.expenseListCard.querySelector(".card-text table tbody");
  const markup = array.reduce((html, item, index) => {
    return (
      html +
      `
        <tr>
            <td><span class="">${index + 1}</span></td>
            <td><span class="">${item.category}</td>
            <td><span class="">${item.date}</td>
            <td><span class="">$${item.amount}</td>
            <td><span class="">${item.comments}</td>            
        </tr>        
    `
    );
  }, "");
  tbody.innerHTML = markup;
};
const renderBalance = obj => {
  DOM.balanceCard.querySelector(".card-text").innerHTML = `
            <li>Total expenses: <span class="number">$${
              obj.expense
            }</span>               
            </li>          
            <li>Budget remaining: <span class="number">$${
              obj.remaining
            }</span>                
            </li>
            <li>Total savings: <span class="number">$${
              obj.savings
            }</span>               
            </li>
            `;
};
const showModal = el => {
  $(el).modal({
    show: true,
    keyboard: false,
    backdrop: "static"
  });
};
const hideModal = el => {
  $(el).modal("hide");
};
const init = () => {
  DOMCache();
  bindEvents();
  fillCategory();
  setDatePicker();
  if (!getLoggedInUser()) {
    showModal("#modal-login");
  } else {
    DOM.displayUser.innerHTML = `
        <li class="nav-item">
            <a class="nav-link">Welcome, ${email}</a>
        </li>`;
    setMonthlyIncome();
    setMonthlyExpense();
    setMonthlyExpenseList();
    setMonthlyBalance();
  }
};

init();
