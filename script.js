/* =========================================================
   MONEY SYSTEM
   script.js
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "moneySystemAccounts";

let accounts = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {};

let currentUser = null;


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const createScreen =
    document.getElementById("createScreen");

const userScreen =
    document.getElementById("userScreen");

const adminScreen =
    document.getElementById("adminScreen");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const newUsername =
    document.getElementById("newUsername");

const newPassword =
    document.getElementById("newPassword");

const loginMessage =
    document.getElementById("loginMessage");

const createMessage =
    document.getElementById("createMessage");

const userMessage =
    document.getElementById("userMessage");


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
    );

}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    loginScreen.classList.add("hidden");

    createScreen.classList.add("hidden");

    userScreen.classList.add("hidden");

    adminScreen.classList.add("hidden");

}


function showLogin() {

    hideAllScreens();

    loginScreen.classList.remove("hidden");

}


function showCreateAccount() {

    hideAllScreens();

    createScreen.classList.remove("hidden");

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

function createAccount() {

    const username =
        newUsername.value.trim();

    const password =
        newPassword.value;


    createMessage.className = "message";


    if (!username || !password) {

        createMessage.classList.add("error");

        createMessage.textContent =
            "Enter a username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    /*
       "mom" is reserved for the
       MOM/admin account.
    */

    if (key === "mom") {

        createMessage.classList.add("error");

        createMessage.textContent =
            "That username is reserved.";

        return;
    }


    if (accounts[key]) {

        createMessage.classList.add("error");

        createMessage.textContent =
            "That username already exists.";

        return;
    }


    accounts[key] = {

        username: username,

        password: password,

        balance: 0,

        saved: 0

    };


    saveDatabase();


    createMessage.classList.add("success");

    createMessage.textContent =
        "Account created successfully!";


    newUsername.value = "";

    newPassword.value = "";

}


/* =========================================================
   LOGIN
========================================================= */

function login() {

    const username =
        loginUsername.value.trim();

    const password =
        loginPassword.value;


    loginMessage.className = "message";


    if (!username || !password) {

        loginMessage.classList.add("error");

        loginMessage.textContent =
            "Enter your username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    /* =====================================================
       MOM LOGIN
    ===================================================== */

    if (key === "mom") {

        /*
           If the MOM account does not exist,
           create it using the password entered
           the first time.
        */

        if (!accounts["mom"]) {

            accounts["mom"] = {

                username: "mom",

                password: password,

                admin: true,

                balance: 0,

                saved: 0

            };


            saveDatabase();


            alert(
                "MOM admin account created!"
            );

        }


        if (
            accounts["mom"].password !==
            password
        ) {

            loginMessage.classList.add(
                "error"
            );

            loginMessage.textContent =
                "Incorrect MOM password.";

            return;
        }


        currentUser = "mom";

        showAdminPanel();

        return;
    }


    /* =====================================================
       NORMAL ACCOUNT LOGIN
    ===================================================== */

    if (!accounts[key]) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Account does not exist.";

        return;
    }


    if (
        accounts[key].password !==
        password
    ) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Incorrect password.";

        return;
    }


    currentUser = key;

    showUserPanel();

}


/* =========================================================
   NORMAL USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove("hidden");

    updateUserDisplay();

}


function updateUserDisplay() {

    const account =
        accounts[currentUser];


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        account.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        "€" +
        account.balance.toFixed(2);


    document.getElementById(
        "savedValue"
    ).textContent =
        "€" +
        account.saved.toFixed(2);

}


/* =========================================================
   BUY
========================================================= */

function buyMoney() {

    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    if (amount > account.balance) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    account.balance -= amount;


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Purchase successful!"
    );

}


/* =========================================================
   SAVE MONEY
========================================================= */

function saveMoney() {

    const input =
        prompt(
            "How much do you want to save?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    if (amount > account.balance) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    account.balance -= amount;

    account.saved += amount;


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money saved!"
    );

}


/* =========================================================
   WITHDRAW
========================================================= */

function withdrawMoney() {

    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    if (amount > account.saved) {

        showUserMessage(
            "🚨 NOT ENOUGH SAVED MONEY!",
            true
        );

        return;
    }


    account.saved -= amount;

    account.balance += amount;


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money withdrawn!"
    );

}


/* =========================================================
   USER MESSAGE
========================================================= */

function showUserMessage(
    text,
    error = false
) {

    userMessage.className = "message";


    if (error) {

        userMessage.classList.add(
            "error"
        );

    } else {

        userMessage.classList.add(
            "success"
        );

    }


    userMessage.textContent = text;


    setTimeout(
        function() {

            userMessage.textContent = "";

        },
        2500
    );

}


/* =========================================================
   MOM PANEL
========================================================= */

function showAdminPanel() {

    hideAllScreens();

    adminScreen.classList.remove(
        "hidden"
    );

    refreshAdminPanel();

}


function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML = "";


    for (
        const key in accounts
    ) {

        /*
           Don't show the MOM account
           inside the normal account list.
        */

        if (key === "mom") {
            continue;
        }


        const account =
            accounts[key];


        const div =
            document.createElement(
                "div"
            );


        div.className = "account";


        const info =
            document.createElement(
                "div"
            );

        info.className =
            "accountInfo";


        const name =
            document.createElement(
                "div"
            );

        name.className =
            "accountName";

        name.textContent =
            "👤 " +
            account.username;


        const balance =
            document.createElement(
                "div"
            );

        balance.className =
            "accountMoney";

        balance.textContent =
            "💶 Balance: €" +
            account.balance.toFixed(2);


        const saved =
            document.createElement(
                "div"
            );

        saved.className =
            "accountMoney";

        saved.textContent =
            "🏦 Saved: €" +
            account.saved.toFixed(2);


        info.appendChild(name);

        info.appendChild(balance);

        info.appendChild(saved);


        const button =
            document.createElement(
                "button"
            );

        button.className =
            "increase";

        button.textContent =
            "➕ Increase balance";


        button.addEventListener(
            "click",
            function() {

                increaseBalance(key);

            }
        );


        div.appendChild(info);

        div.appendChild(button);


        list.appendChild(div);

    }

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

function increaseBalance(key) {

    const account =
        accounts[key];


    const input =
        prompt(
            "Add money to " +
            account.username +
            "'s balance:"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    account.balance += amount;


    saveDatabase();

    refreshAdminPanel();


    alert(
        "Added €" +
        amount.toFixed(2) +
        " to " +
        account.username +
        "'s balance."
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;


    loginUsername.value = "";

    loginPassword.value = "";


    loginMessage.textContent = "";


    showLogin();

}


/* =========================================================
   BUTTON CONNECTIONS
========================================================= */

document
    .getElementById("loginButton")
    .addEventListener(
        "click",
        login
    );


document
    .getElementById("showCreateButton")
    .addEventListener(
        "click",
        showCreateAccount
    );


document
    .getElementById("createButton")
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById("backToLoginButton")
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById("buyButton")
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById("withdrawButton")
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById("userLogoutButton")
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById("adminLogoutButton")
    .addEventListener(
        "click",
        logout
    );


/* =========================================================
   ENTER KEY LOGIN
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* =========================================================
   START
========================================================= */

showLogin();
