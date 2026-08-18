/* =========================================================
   MONEY SYSTEM
   SUPABASE VERSION
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://gzkzwwohdugkqxrtewxm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_XD1DVwklzqQiYx3dmKxRCg_h6NL1pQ-";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

let supabase = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {

    supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


/* =========================================================
   SETTINGS
========================================================= */

const ADMIN_USERNAME = "mom";


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const createScreen =
    document.getElementById(
        "createScreen"
    );

const userScreen =
    document.getElementById(
        "userScreen"
    );

const adminScreen =
    document.getElementById(
        "adminScreen"
    );


const loginUsername =
    document.getElementById(
        "loginUsername"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const newUsername =
    document.getElementById(
        "newUsername"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const createMessage =
    document.getElementById(
        "createMessage"
    );

const userMessage =
    document.getElementById(
        "userMessage"
    );


/* =========================================================
   DATABASE CHECK
========================================================= */

function databaseReady() {

    if (!supabase) {

        showLoginMessage(
            "Could not load Supabase.",
            true
        );

        return false;
    }

    return true;
}


/* =========================================================
   MONEY HELPERS
========================================================= */

function moneyToCents(amount) {

    return Math.round(
        Number(amount) * 100
    );

}


function centsToMoney(cents) {

    return Number(cents) / 100;

}


function formatMoney(amount) {

    return centsToMoney(
        moneyToCents(amount)
    ).toFixed(2);

}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    loginScreen.classList.add(
        "hidden"
    );

    createScreen.classList.add(
        "hidden"
    );

    userScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.add(
        "hidden"
    );

}


function showLogin() {

    hideAllScreens();

    loginScreen.classList.remove(
        "hidden"
    );

}


function showCreateAccount() {

    hideAllScreens();

    createScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MESSAGES
========================================================= */

function showLoginMessage(
    text,
    error = false
) {

    loginMessage.className =
        "message";

    loginMessage.classList.add(
        error
            ? "error"
            : "success"
    );

    loginMessage.textContent =
        text;
}


function showCreateMessage(
    text,
    error = false
) {

    createMessage.className =
        "message";

    createMessage.classList.add(
        error
            ? "error"
            : "success"
    );

    createMessage.textContent =
        text;
}


function showUserMessage(
    text,
    error = false
) {

    userMessage.className =
        "message";

    userMessage.classList.add(
        error
            ? "error"
            : "success"
    );

    userMessage.textContent =
        text;

    setTimeout(
        function() {

            userMessage.textContent =
                "";

        },
        2500
    );
}


/* =========================================================
   DATABASE ERROR
========================================================= */

function explainDatabaseError(error) {

    if (!error) {

        return "Unknown database error.";
    }


    console.error(
        "Supabase error:",
        error
    );


    if (
        error.code ===
        "42501"
    ) {

        return (
            "Database permission denied. " +
            "RLS policies need to be configured."
        );
    }


    if (
        error.code ===
        "PGRST116"
    ) {

        return (
            "The requested account was not found."
        );
    }


    if (
        error.code ===
        "23505"
    ) {

        return (
            "That username already exists."
        );
    }


    return (
        error.message ||
        "Database request failed."
    );
}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

async function createAccount() {

    if (!databaseReady()) {
        return;
    }


    const username =
        newUsername.value.trim();

    const password =
        newPassword.value;


    createMessage.className =
        "message";

    createMessage.textContent =
        "";


    if (!username || !password) {

        showCreateMessage(
            "Enter a username and password.",
            true
        );

        return;
    }


    if (
        username.length < 2
    ) {

        showCreateMessage(
            "Username must be at least 2 characters.",
            true
        );

        return;
    }


    if (
        password.length < 4
    ) {

        showCreateMessage(
            "Password must be at least 4 characters.",
            true
        );

        return;
    }


    if (
        username.toLowerCase() ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        showCreateMessage(
            "That username is reserved.",
            true
        );

        return;
    }


    const button =
        document.getElementById(
            "createButton"
        );


    button.disabled = true;

    button.textContent =
        "CREATING...";


    try {

        /*
           Check whether username already exists.
        */

        const {
            data: existing,
            error: checkError
        } = await supabase
            .from("accounts")
            .select("id")
            .ilike(
                "username",
                username
            )
            .limit(1);


        if (checkError) {

            throw checkError;
        }


        if (
            existing &&
            existing.length > 0
        ) {

            showCreateMessage(
                "That username already exists.",
                true
            );

            return;
        }


        /*
           Create the account.
        */

        const {
            error: insertError
        } = await supabase
            .from("accounts")
            .insert({

                username:
                    username,

                password:
                    password,

                balance:
                    0,

                saved:
                    0,

                is_admin:
                    false

            });


        if (insertError) {

            throw insertError;
        }


        newUsername.value = "";

        newPassword.value = "";


        showCreateMessage(
            "Account created successfully!"
        );

    }

    catch (error) {

        showCreateMessage(
            explainDatabaseError(error),
            true
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            "CREATE ACCOUNT";

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    if (!databaseReady()) {
        return;
    }


    const username =
        loginUsername.value.trim();

    const password =
        loginPassword.value;


    loginMessage.className =
        "message";

    loginMessage.textContent =
        "";


    if (!username || !password) {

        showLoginMessage(
            "Enter your username and password.",
            true
        );

        return;
    }


    const button =
        document.getElementById(
            "loginButton"
        );


    button.disabled = true;

    button.textContent =
        "LOGGING IN...";


    try {

        /*
           Find the account.

           We deliberately do not use
           user_id here because your current
           accounts table did not originally
           have that column.
        */

        const {
            data,
            error
        } = await supabase
            .from("accounts")
            .select(
                "id, username, password, balance, saved, is_admin"
            )
            .ilike(
                "username",
                username
            )
            .limit(1);


        if (error) {

            throw error;
        }


        if (
            !data ||
            data.length === 0
        ) {

            showLoginMessage(
                "Account does not exist.",
                true
            );

            return;
        }


        const account =
            data[0];


        if (
            account.password !==
            password
        ) {

            showLoginMessage(
                "Incorrect password.",
                true
            );

            return;
        }


        currentUser =
            account;


        /*
           Admin is determined by the
           database is_admin field.
        */

        if (
            account.is_admin === true
        ) {

            showAdminPanel();

        } else {

            showUserPanel();

        }

    }

    catch (error) {

        showLoginMessage(
            explainDatabaseError(error),
            true
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            "🔐 LOG IN";

    }

}


/* =========================================================
   USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove(
        "hidden"
    );

    updateUserDisplay();

}


function updateUserDisplay() {

    if (!currentUser) {
        return;
    }


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        currentUser.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        "€" +
        formatMoney(
            currentUser.balance
        );


    document.getElementById(
        "savedValue"
    ).textContent =
        "€" +
        formatMoney(
            currentUser.saved
        );

}


/* =========================================================
   REFRESH CURRENT ACCOUNT
========================================================= */

async function refreshCurrentAccount() {

    if (
        !currentUser ||
        !databaseReady()
    ) {

        return;
    }


    const {
        data,
        error
    } = await supabase
        .from("accounts")
        .select(
            "id, username, password, balance, saved, is_admin"
        )
        .eq(
            "id",
            currentUser.id
        )
        .single();


    if (error) {

        console.error(
            error
        );

        return;
    }


    currentUser =
        data;


    updateUserDisplay();

}


/* =========================================================
   BUY
========================================================= */

async function buyMoney() {

    if (!currentUser) {
        return;
    }


    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (
        input === null
    ) {

        return;
    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    const newBalance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    const {
        error
    } = await supabase
        .from("accounts")
        .update({

            balance:
                newBalance

        })
        .eq(
            "id",
            currentUser.id
        );


    if (error) {

        showUserMessage(
            explainDatabaseError(error),
            true
        );

        return;
    }


    currentUser.balance =
        newBalance;


    updateUserDisplay();


    showUserMessage(
        "Purchase successful!"
    );

}


/* =========================================================
   SAVE MONEY
========================================================= */

async function saveMoney() {

    if (!currentUser) {
        return;
    }


    const input =
        prompt(
            "How much do you want to save?"
        );


    if (
        input === null
    ) {

        return;
    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    const savedCents =
        moneyToCents(
            currentUser.saved
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    const newBalance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    const newSaved =
        centsToMoney(
            savedCents +
            amountCents
        );


    const {
        error
    } = await supabase
        .from("accounts")
        .update({

            balance:
                newBalance,

            saved:
                newSaved

        })
        .eq(
            "id",
            currentUser.id
        );


    if (error) {

        showUserMessage(
            explainDatabaseError(error),
            true
        );

        return;
    }


    currentUser.balance =
        newBalance;

    currentUser.saved =
        newSaved;


    updateUserDisplay();


    showUserMessage(
        "Money saved!"
    );

}


/* =========================================================
   WITHDRAW SAVED MONEY
========================================================= */

async function withdrawMoney() {

    if (!currentUser) {
        return;
    }


    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (
        input === null
    ) {

        return;
    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const savedCents =
        moneyToCents(
            currentUser.saved
        );


    if (
        amountCents >
        savedCents
    ) {

        showUserMessage(
            "🚨 NOT ENOUGH SAVED MONEY!",
            true
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            currentUser.balance
        );


    const newSaved =
        centsToMoney(
            savedCents -
            amountCents
        );


    const newBalance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    const {
        error
    } = await supabase
        .from("accounts")
        .update({

            balance:
                newBalance,

            saved:
                newSaved

        })
        .eq(
            "id",
            currentUser.id
        );


    if (error) {

        showUserMessage(
            explainDatabaseError(error),
            true
        );

        return;
    }


    currentUser.balance =
        newBalance;

    currentUser.saved =
        newSaved;


    updateUserDisplay();


    showUserMessage(
        "Money withdrawn!"
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


/* =========================================================
   LOAD ALL ACCOUNTS
========================================================= */

async function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML =
        "<p>Loading accounts...</p>";


    const {
        data,
        error
    } = await supabase
        .from("accounts")
        .select(
            "id, username, balance, saved, is_admin"
        )
        .order(
            "username",
            {
                ascending: true
            }
        );


    if (error) {

        list.innerHTML =
            "<p class='error'>" +
            explainDatabaseError(error) +
            "</p>";

        return;
    }


    list.innerHTML =
        "";


    const normalAccounts =
        (data || []).filter(
            function(account) {

                return (
                    account.is_admin !== true
                );

            }
        );


    if (
        normalAccounts.length === 0
    ) {

        list.innerHTML =
            "<p>No normal accounts yet.</p>";

        return;
    }


    normalAccounts.forEach(
        function(account) {

            createAdminAccountCard(
                account
            );

        }
    );

}


/* =========================================================
   CREATE MOM ACCOUNT CARD
========================================================= */

function createAdminAccountCard(
    account
) {

    const list =
        document.getElementById(
            "accountList"
        );


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "account";


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
        formatMoney(
            account.balance
        );


    const saved =
        document.createElement(
            "div"
        );


    saved.className =
        "accountMoney";


    saved.textContent =
        "🏦 Saved: €" +
        formatMoney(
            account.saved
        );


    info.appendChild(
        name
    );

    info.appendChild(
        balance
    );

    info.appendChild(
        saved
    );


    const buttons =
        document.createElement(
            "div"
        );


    buttons.className =
        "adminButtons";


    const increaseButton =
        document.createElement(
            "button"
        );


    increaseButton.className =
        "increase";


    increaseButton.textContent =
        "➕ Increase balance";


    increaseButton.addEventListener(
        "click",
        function() {

            increaseBalance(
                account.id
            );

        }
    );


    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "delete";


    deleteButton.textContent =
        "🗑️ Delete account";


    deleteButton.addEventListener(
        "click",
        function() {

            deleteAccount(
                account.id,
                account.username
            );

        }
    );


    buttons.appendChild(
        increaseButton
    );

    buttons.appendChild(
        deleteButton
    );


    div.appendChild(
        info
    );

    div.appendChild(
        buttons
    );


    list.appendChild(
        div
    );

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

async function increaseBalance(
    accountId
) {

    const input =
        prompt(
            "Add money to this account:"
        );


    if (
        input === null
    ) {

        return;
    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    const {
        data: account,
        error: getError
    } = await supabase
        .from("accounts")
        .select(
            "id, username, balance"
        )
        .eq(
            "id",
            accountId
        )
        .single();


    if (getError) {

        alert(
            explainDatabaseError(
                getError
            )
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            account.balance
        );


    const newBalance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    const {
        error: updateError
    } = await supabase
        .from("accounts")
        .update({

            balance:
                newBalance

        })
        .eq(
            "id",
            accountId
        );


    if (updateError) {

        alert(
            explainDatabaseError(
                updateError
            )
        );

        return;
    }


    await refreshAdminPanel();


    alert(
        "Added €" +
        formatMoney(amount) +
        " to " +
        account.username +
        "'s balance."
    );

}


/* =========================================================
   MOM: DELETE ACCOUNT
========================================================= */

async function deleteAccount(
    accountId,
    username
) {

    const confirmed =
        confirm(
            "Delete the account '" +
            username +
            "'?\n\n" +
            "This permanently removes " +
            "its Balance and Saved money."
        );


    if (!confirmed) {

        return;
    }


    const {
        error
    } = await supabase
        .from("accounts")
        .delete()
        .eq(
            "id",
            accountId
        );


    if (error) {

        alert(
            explainDatabaseError(
                error
            )
        );

        return;
    }


    await refreshAdminPanel();


    alert(
        "Account deleted."
    );

}


/* =========================================================
   DELETE OWN ACCOUNT
========================================================= */

async function deleteOwnAccount() {

    if (!currentUser) {

        return;
    }


    const confirmed =
        confirm(
            "Delete your account?\n\n" +
            "Your Balance and Saved money " +
            "will also be permanently deleted."
        );


    if (!confirmed) {

        return;
    }


    const {
        error
    } = await supabase
        .from("accounts")
        .delete()
        .eq(
            "id",
            currentUser.id
        );


    if (error) {

        showUserMessage(
            explainDatabaseError(error),
            true
        );

        return;
    }


    alert(
        "Your account has been deleted."
    );


    logout();

}


/* =========================================================
   DELETE MOM ACCOUNT
========================================================= */

async function deleteMomAccount() {

    if (
        !currentUser ||
        currentUser.is_admin !== true
    ) {

        return;
    }


    const confirmed =
        confirm(
            "DELETE THE MOM ACCOUNT?\n\n" +
            "This will permanently remove " +
            "the admin account."
        );


    if (!confirmed) {

        return;
    }


    const {
        error
    } = await supabase
        .from("accounts")
        .delete()
        .eq(
            "id",
            currentUser.id
        );


    if (error) {

        alert(
            explainDatabaseError(error)
        );

        return;
    }


    alert(
        "MOM account deleted."
    );


    logout();

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser =
        null;


    loginUsername.value =
        "";

    loginPassword.value =
        "";

    newUsername.value =
        "";

    newPassword.value =
        "";


    loginMessage.textContent =
        "";

    createMessage.textContent =
        "";

    userMessage.textContent =
        "";


    showLogin();

}


/* =========================================================
   BUTTON CONNECTIONS
========================================================= */

document
    .getElementById(
        "loginButton"
    )
    .addEventListener(
        "click",
        login
    );


document
    .getElementById(
        "showCreateButton"
    )
    .addEventListener(
        "click",
        showCreateAccount
    );


document
    .getElementById(
        "createButton"
    )
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById(
        "backToLoginButton"
    )
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById(
        "buyButton"
    )
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById(
        "withdrawButton"
    )
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById(
        "userLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "adminLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "deleteOwnAccountButton"
    )
    .addEventListener(
        "click",
        deleteOwnAccount
    );


document
    .getElementById(
        "deleteMomButton"
    )
    .addEventListener(
        "click",
        deleteMomAccount
    );


/* =========================================================
   ENTER KEY
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            login();

        }

    }
);


newPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            createAccount();

        }

    }
);


/* =========================================================
   STARTUP
========================================================= */

if (!supabase) {

    showLoginMessage(
        "Supabase failed to load. Check your internet connection.",
        true
    );

} else {

    console.log(
        "✅ Supabase client initialized."
    );

    showLogin();

}
