/* =========================================================
   MONEY SYSTEM
   script.js

   SUPABASE VERSION
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://gzkzwwohdugkqxrtewxm.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_XD1DVwklzqQiYx3dmKxRCg_h6NL1pQ-";


/*
   The Supabase library is loaded by index.html
   before this file.

   This is the part that was missing before.
*/

if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
) {

    alert(
        "Supabase failed to load. Please refresh the page."
    );

    throw new Error(
        "Supabase JavaScript library was not loaded."
    );

}


const supabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   SETTINGS
========================================================= */

const ADMIN_USERNAME = "mom";


/*
   The database table we created.
*/

const TABLE_NAME = "accounts";


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


const loading =
    document.getElementById(
        "loading"
    );


const loadingText =
    document.getElementById(
        "loadingText"
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
   LOADING
========================================================= */

function showLoading(text = "Loading...") {

    loadingText.textContent = text;

    loading.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


/* =========================================================
   MONEY
========================================================= */

function moneyToCents(amount) {

    return Math.round(
        Number(amount) * 100
    );

}


function centsToMoney(cents) {

    return Number(cents) / 100;

}


function cleanMoney(amount) {

    return centsToMoney(
        moneyToCents(amount)
    );

}


function formatMoney(amount) {

    return (
        "€" +
        cleanMoney(amount)
            .toFixed(2)
    );

}


/* =========================================================
   USERNAME
========================================================= */

function normalizeUsername(username) {

    return username
        .trim()
        .toLowerCase();

}


/* =========================================================
   MESSAGE HELPERS
========================================================= */

function setMessage(
    element,
    text,
    error = false
) {

    element.className =
        "message";


    if (error) {

        element.classList.add(
            "error"
        );

    } else {

        element.classList.add(
            "success"
        );

    }


    element.textContent =
        text;

}


function clearMessage(element) {

    element.className =
        "message";

    element.textContent =
        "";

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

    clearMessage(
        createMessage
    );

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function databaseErrorMessage(error) {

    console.error(
        "Supabase error:",
        error
    );


    if (!error) {

        return "Unknown database error.";

    }


    if (
        error.message &&
        error.message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Could not connect to Supabase."
        );

    }


    if (
        error.message &&
        error.message.includes(
            "row-level security"
        )
    ) {

        return (
            "Supabase blocked this action with Row Level Security."
        );

    }


    if (
        error.message &&
        error.message.includes(
            "permission denied"
        )
    ) {

        return (
            "Supabase denied database access."
        );

    }


    return (
        error.message ||
        "Database request failed."
    );

}


/* =========================================================
   DATABASE: FIND ACCOUNT
========================================================= */

async function findAccount(username) {

    const key =
        normalizeUsername(username);


    const {
        data,
        error
    } =
        await supabase
            .from(TABLE_NAME)
            .select(
                "*"
            )
            .eq(
                "username",
                key
            )
            .maybeSingle();


    if (error) {

        throw error;

    }


    return data;

}


/* =========================================================
   DATABASE: GET ALL ACCOUNTS
========================================================= */

async function getAllAccounts() {

    const {
        data,
        error
    } =
        await supabase
            .from(TABLE_NAME)
            .select(
                "*"
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        throw error;

    }


    return data || [];

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

async function createAccount() {

    const username =
        newUsername.value.trim();


    const password =
        newPassword.value;


    clearMessage(
        createMessage
    );


    if (!username || !password) {

        setMessage(
            createMessage,
            "Enter a username and password.",
            true
        );

        return;

    }


    if (
        username.length < 2
    ) {

        setMessage(
            createMessage,
            "Username must be at least 2 characters.",
            true
        );

        return;

    }


    if (
        username.length > 30
    ) {

        setMessage(
            createMessage,
            "Username is too long.",
            true
        );

        return;

    }


    if (
        password.length < 4
    ) {

        setMessage(
            createMessage,
            "Password must be at least 4 characters.",
            true
        );

        return;

    }


    const key =
        normalizeUsername(
            username
        );


    if (
        key ===
        ADMIN_USERNAME
    ) {

        setMessage(
            createMessage,
            "That username is reserved.",
            true
        );

        return;

    }


    showLoading(
        "Creating account..."
    );


    try {

        const existing =
            await findAccount(
                key
            );


        if (existing) {

            setMessage(
                createMessage,
                "That username already exists.",
                true
            );

            return;

        }


        /*
           This version expects the accounts table
           to have a password column.

           That matches the table you originally
           created in the Supabase Table Editor.
        */

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .insert({

                    username: key,

                    password: password,

                    balance: 0,

                    saved: 0,

                    is_admin: false

                });


        if (error) {

            throw error;

        }


        newUsername.value =
            "";

        newPassword.value =
            "";


        setMessage(
            createMessage,
            "Account created successfully!"
        );


        setTimeout(
            function() {

                showLogin();

            },
            900
        );

    }

    catch (error) {

        setMessage(
            createMessage,
            databaseErrorMessage(error),
            true
        );

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const username =
        loginUsername.value.trim();


    const password =
        loginPassword.value;


    clearMessage(
        loginMessage
    );


    if (!username || !password) {

        setMessage(
            loginMessage,
            "Enter your username and password.",
            true
        );

        return;

    }


    showLoading(
        "Logging in..."
    );


    try {

        const account =
            await findAccount(
                username
            );


        if (!account) {

            setMessage(
                loginMessage,
                "Account does not exist.",
                true
            );

            return;

        }


        if (
            String(account.password) !==
            String(password)
        ) {

            setMessage(
                loginMessage,
                "Incorrect password.",
                true
            );

            return;

        }


        currentUser =
            account;


        loginUsername.value =
            "";

        loginPassword.value =
            "";


        if (
            account.is_admin === true
        ) {

            await showAdminPanel();

        } else {

            showUserPanel();

        }

    }

    catch (error) {

        setMessage(
            loginMessage,
            databaseErrorMessage(error),
            true
        );

    }

    finally {

        hideLoading();

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


/* =========================================================
   USER DISPLAY
========================================================= */

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
        formatMoney(
            currentUser.balance
        );


    document.getElementById(
        "savedValue"
    ).textContent =
        formatMoney(
            currentUser.saved
        );

}


/* =========================================================
   RELOAD CURRENT USER
========================================================= */

async function reloadCurrentUser() {

    if (!currentUser) {

        return;

    }


    const fresh =
        await findAccount(
            currentUser.username
        );


    if (!fresh) {

        currentUser = null;

        showLogin();

        alert(
            "Your account no longer exists."
        );

        return;

    }


    currentUser =
        fresh;


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
            "How much do you want to spend?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


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


    const amountCents =
        moneyToCents(
            amount
        );


    if (
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


    showLoading(
        "Processing purchase..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .update({

                    balance:
                        newBalance

                })
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser.balance =
            newBalance;


        updateUserDisplay();


        showUserMessage(
            "Purchase successful!"
        );

    }

    catch (error) {

        showUserMessage(
            databaseErrorMessage(error),
            true
        );

    }

    finally {

        hideLoading();

    }

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


    if (input === null) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


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


    const amountCents =
        moneyToCents(
            amount
        );


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


    showLoading(
        "Saving money..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
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

            throw error;

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

    catch (error) {

        showUserMessage(
            databaseErrorMessage(error),
            true
        );

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   WITHDRAW
========================================================= */

async function withdrawMoney() {

    if (!currentUser) {

        return;

    }


    const input =
        prompt(
            "How much do you want to withdraw from Saved?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


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


    const amountCents =
        moneyToCents(
            amount
        );


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


    showLoading(
        "Withdrawing money..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
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

            throw error;

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

    catch (error) {

        showUserMessage(
            databaseErrorMessage(error),
            true
        );

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   USER MESSAGE
========================================================= */

function showUserMessage(
    text,
    error = false
) {

    setMessage(
        userMessage,
        text,
        error
    );


    setTimeout(
        function() {

            if (
                userMessage.textContent ===
                text
            ) {

                clearMessage(
                    userMessage
                );

            }

        },
        2500
    );

}


/* =========================================================
   MOM PANEL
========================================================= */

async function showAdminPanel() {

    hideAllScreens();

    adminScreen.classList.remove(
        "hidden"
    );


    await refreshAdminPanel();

}


/* =========================================================
   REFRESH MOM PANEL
========================================================= */

async function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML =
        "<p>Loading accounts...</p>";


    try {

        const accounts =
            await getAllAccounts();


        list.innerHTML =
            "";


        let normalAccounts = 0;


        for (
            const account of accounts
        ) {

            if (
                account.is_admin === true
            ) {

                continue;

            }


            normalAccounts++;


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
                "💶 Balance: " +
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
                "🏦 Saved: " +
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
                        account
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
                        account
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


        if (
            normalAccounts === 0
        ) {

            list.innerHTML =
                "<p>No normal accounts yet.</p>";

        }

    }

    catch (error) {

        list.innerHTML =
            "";


        const message =
            document.createElement(
                "p"
            );


        message.className =
            "error";


        message.textContent =
            databaseErrorMessage(
                error
            );


        list.appendChild(
            message
        );

    }

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

async function increaseBalance(
    account
) {

    if (!account) {

        return;

    }


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
        Number(
            input.replace(
                ",",
                "."
            )
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;

    }


    const amountCents =
        moneyToCents(
            amount
        );


    const balanceCents =
        moneyToCents(
            account.balance
        );


    const newBalance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    showLoading(
        "Adding money..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .update({

                    balance:
                        newBalance

                })
                .eq(
                    "id",
                    account.id
                );


        if (error) {

            throw error;

        }


        await refreshAdminPanel();


        alert(
            "Added " +
            formatMoney(
                amount
            ) +
            " to " +
            account.username +
            "'s balance."
        );

    }

    catch (error) {

        alert(
            databaseErrorMessage(
                error
            )
        );

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   MOM: DELETE ACCOUNT
========================================================= */

async function deleteAccount(
    account
) {

    if (!account) {

        return;

    }


    if (
        account.is_admin === true
    ) {

        alert(
            "The MOM account cannot be deleted here."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete the account '" +
            account.username +
            "'?\n\n" +
            "This permanently removes its Balance and Saved money."
        );


    if (!confirmed) {

        return;

    }


    showLoading(
        "Deleting account..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .delete()
                .eq(
                    "id",
                    account.id
                );


        if (error) {

            throw error;

        }


        await refreshAdminPanel();


        alert(
            "Account deleted."
        );

    }

    catch (error) {

        alert(
            databaseErrorMessage(
                error
            )
        );

    }

    finally {

        hideLoading();

    }

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
            "This permanently removes your Balance and Saved money."
        );


    if (!confirmed) {

        return;

    }


    const secondConfirmation =
        confirm(
            "ARE YOU SURE?\n\n" +
            "This cannot be undone."
        );


    if (!secondConfirmation) {

        return;

    }


    showLoading(
        "Deleting account..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .delete()
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser =
            null;


        hideLoading();


        alert(
            "Your account has been deleted."
        );


        showLogin();

    }

    catch (error) {

        hideLoading();


        alert(
            databaseErrorMessage(
                error
            )
        );

    }

}


/* =========================================================
   DELETE MOM ACCOUNT
========================================================= */

async function deleteMomAccount() {

    if (!currentUser) {

        return;

    }


    if (
        currentUser.is_admin !== true
    ) {

        return;

    }


    const confirmed =
        confirm(
            "DELETE THE MOM ACCOUNT?\n\n" +
            "This will permanently remove the admin account."
        );


    if (!confirmed) {

        return;

    }


    const secondConfirmation =
        confirm(
            "FINAL WARNING.\n\n" +
            "Delete MOM permanently?"
        );


    if (!secondConfirmation) {

        return;

    }


    showLoading(
        "Deleting MOM account..."
    );


    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .delete()
                .eq(
                    "id",
                    currentUser.id
                );


        if (error) {

            throw error;

        }


        currentUser =
            null;


        hideLoading();


        alert(
            "MOM account deleted."
        );


        showLogin();

    }

    catch (error) {

        hideLoading();


        alert(
            databaseErrorMessage(
                error
            )
        );

    }

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


    clearMessage(
        loginMessage
    );


    clearMessage(
        createMessage
    );


    clearMessage(
        userMessage
    );


    showLogin();

}


/* =========================================================
   TEST SUPABASE CONNECTION
========================================================= */

async function testSupabaseConnection() {

    try {

        const {
            error
        } =
            await supabase
                .from(TABLE_NAME)
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Supabase connection/database test failed:",
                error
            );

            return false;

        }


        console.log(
            "Supabase connection successful."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Supabase connection failed:",
            error
        );


        return false;

    }

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
   START
========================================================= */

async function startApp() {

    showLogin();


    showLoading(
        "Connecting to Supabase..."
    );


    const connected =
        await testSupabaseConnection();


    hideLoading();


    if (!connected) {

        setMessage(
            loginMessage,
            "Could not connect to the money system.",
            true
        );

        return;

    }


    console.log(
        "💰 MONEY SYSTEM READY"
    );

}


startApp();
