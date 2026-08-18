/* =========================================================
   MONEY SYSTEM — SUPABASE VERSION
========================================================= */


/* =========================================================
   SUPABASE SETTINGS
========================================================= */

const SUPABASE_URL =
    "https://gzkzwwohdugkqxrtewxm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_XD1DVwklzqQiYx3dmKxRCg_h6NL1pQ-";

const ADMIN_USERNAME = "mom";

let supabase = null;
let currentUser = null;
let currentAccount = null;


/* =========================================================
   LOAD SUPABASE
========================================================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (window.supabase) {
            resolve();
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = resolve;

        script.onerror = function () {
            reject(
                new Error(
                    "Could not load Supabase."
                )
            );
        };

        document.head.appendChild(script);

    });

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeSupabase() {

    try {

        await loadSupabase();

        supabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "Supabase connected."
        );

        const {
            data
        } =
            await supabase.auth.getSession();

        if (
            data &&
            data.session &&
            data.session.user
        ) {

            currentUser =
                data.session.user;

            await loadCurrentAccount();

        }

    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the money system."
        );

    }

}


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
   USERNAME → INTERNAL AUTH EMAIL
========================================================= */

function usernameToEmail(username) {

    return (
        username
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "-")
            +
        "@money-system.local"
    );

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

    return (
        Math.round(cents) / 100
    );

}


function formatMoney(amount) {

    return (
        "€" +
        Number(amount || 0)
            .toFixed(2)
    );

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

async function createAccount() {

    const username =
        newUsername.value.trim();

    const password =
        newPassword.value;


    createMessage.className =
        "message";

    createMessage.textContent =
        "";


    if (!username || !password) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "Enter a username and password.";

        return;
    }


    if (username.length < 2) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "Username must be at least 2 characters.";

        return;
    }


    if (password.length < 6) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "Password must be at least 6 characters.";

        return;
    }


    /*
       "mom" is handled specially.

       Only the first MOM account can become
       the administrator.
    */

    const email =
        usernameToEmail(username);


    try {

        /*
           Check whether this username already
           exists in the database.
        */

        const {
            data: existingAccount,
            error: existingError
        } =
            await supabase
                .from("accounts")
                .select("id, username")
                .ilike(
                    "username",
                    username
                )
                .limit(1);


        if (existingError) {

            throw existingError;

        }


        if (
            existingAccount &&
            existingAccount.length > 0
        ) {

            createMessage.classList.add(
                "error"
            );

            createMessage.textContent =
                "That username already exists.";

            return;

        }


        /*
           Create the actual Supabase Auth user.

           The password is handled by Supabase,
           NOT stored in our accounts table.
        */

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email: email,

                password: password

            });


        if (error) {

            throw error;

        }


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Account could not be created."
            );

        }


        currentUser =
            data.user;


        /*
           Create the public account profile.

           The SQL function decides whether
           "mom" becomes the admin.
        */

        const {
            data: profile,
            error: profileError
        } =
            await supabase.rpc(
                "create_account_profile",
                {
                    p_username:
                        username
                }
            );


        if (profileError) {

            /*
               If profile creation failed,
               sign the Auth user out.
            */

            await supabase.auth.signOut();

            throw profileError;

        }


        currentAccount =
            profile;


        newUsername.value = "";

        newPassword.value = "";


        createMessage.classList.add(
            "success"
        );

        createMessage.textContent =
            "Account created successfully!";


        /*
           If this was MOM, show MOM panel.
           Otherwise show normal account.
        */

        if (
            profile &&
            profile.is_admin === true
        ) {

            setTimeout(
                showAdminPanel,
                500
            );

        } else {

            setTimeout(
                showUserPanel,
                500
            );

        }


    } catch (error) {

        console.error(error);

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            error.message ||
            "Could not create account.";

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


    loginMessage.className =
        "message";

    loginMessage.textContent =
        "";


    if (!username || !password) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Enter your username and password.";

        return;
    }


    try {

        const email =
            usernameToEmail(username);


        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            throw error;

        }


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Login failed."
            );

        }


        currentUser =
            data.user;


        const success =
            await loadCurrentAccount();


        if (!success) {

            await supabase.auth.signOut();

            currentUser = null;

            throw new Error(
                "No money-system account was found for this login."
            );

        }


        if (
            currentAccount.is_admin === true
        ) {

            showAdminPanel();

        } else {

            showUserPanel();

        }


    } catch (error) {

        console.error(error);

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Incorrect username or password.";

    }

}


/* =========================================================
   LOAD CURRENT ACCOUNT
========================================================= */

async function loadCurrentAccount() {

    if (!currentUser) {

        return false;

    }


    const {
        data,
        error
    } =
        await supabase
            .from("accounts")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(error);

        return false;

    }


    if (!data) {

        return false;

    }


    currentAccount =
        data;


    return true;

}


/* =========================================================
   NORMAL USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove(
        "hidden"
    );

    updateUserDisplay();

}


function updateUserDisplay() {

    if (!currentAccount) {

        return;

    }


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        currentAccount.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        formatMoney(
            currentAccount.balance
        );


    document.getElementById(
        "savedValue"
    ).textContent =
        formatMoney(
            currentAccount.saved
        );

}


/* =========================================================
   BUY
========================================================= */

async function buyMoney() {

    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(amount);


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
            currentAccount.balance
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
        data,
        error
    } =
        await supabase
            .from("accounts")
            .update({
                balance:
                    newBalance
            })
            .eq(
                "user_id",
                currentUser.id
            )
            .select()
            .single();


    if (error) {

        console.error(error);

        showUserMessage(
            "Could not update balance.",
            true
        );

        return;

    }


    currentAccount =
        data;


    updateUserDisplay();


    showUserMessage(
        "Purchase successful!"
    );

}


/* =========================================================
   SAVE MONEY
========================================================= */

async function saveMoney() {

    const input =
        prompt(
            "How much do you want to save?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(amount);


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
            currentAccount.balance
        );


    const savedCents =
        moneyToCents(
            currentAccount.saved
        );


    /*
       EVERYTHING is calculated in cents.

       So €0.03 = 3 cents.

       This fixes the old €0.03 bug.
    */

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
        data,
        error
    } =
        await supabase
            .from("accounts")
            .update({

                balance:
                    newBalance,

                saved:
                    newSaved

            })
            .eq(
                "user_id",
                currentUser.id
            )
            .select()
            .single();


    if (error) {

        console.error(error);

        showUserMessage(
            "Could not save money.",
            true
        );

        return;

    }


    currentAccount =
        data;


    updateUserDisplay();


    showUserMessage(
        "Money saved!"
    );

}


/* =========================================================
   WITHDRAW
========================================================= */

async function withdrawMoney() {

    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(amount);


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
            currentAccount.saved
        );


    const balanceCents =
        moneyToCents(
            currentAccount.balance
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
        data,
        error
    } =
        await supabase
            .from("accounts")
            .update({

                balance:
                    newBalance,

                saved:
                    newSaved

            })
            .eq(
                "user_id",
                currentUser.id
            )
            .select()
            .single();


    if (error) {

        console.error(error);

        showUserMessage(
            "Could not withdraw money.",
            true
        );

        return;

    }


    currentAccount =
        data;


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

    userMessage.className =
        "message";


    if (error) {

        userMessage.classList.add(
            "error"
        );

    } else {

        userMessage.classList.add(
            "success"
        );

    }


    userMessage.textContent =
        text;


    setTimeout(
        function () {

            userMessage.textContent =
                "";

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
   REFRESH MOM ACCOUNT LIST
========================================================= */

async function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML =
        "Loading accounts...";


    const {
        data,
        error
    } =
        await supabase.rpc(
            "mom_get_accounts"
        );


    if (error) {

        console.error(error);

        list.innerHTML =
            "<p>Could not load accounts.</p>";

        return;

    }


    list.innerHTML = "";


    /*
       Show normal accounts only.

       MOM does NOT get a delete button
       for other people's accounts.
    */

    const normalAccounts =
        (data || []).filter(
            account =>
                account.is_admin !== true
        );


    if (
        normalAccounts.length === 0
    ) {

        list.innerHTML =
            "<p>No normal accounts yet.</p>";

        return;

    }


    normalAccounts.forEach(
        function (account) {

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


            info.appendChild(name);

            info.appendChild(balance);

            info.appendChild(saved);


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
                function () {

                    increaseBalance(
                        account.user_id
                    );

                }
            );


            buttons.appendChild(
                increaseButton
            );


            div.appendChild(info);

            div.appendChild(buttons);


            list.appendChild(div);

        }
    );

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

async function increaseBalance(
    userId
) {

    const input =
        prompt(
            "How much do you want to add?"
        );


    if (input === null) {

        return;

    }


    const amount =
        Number(input);


    const amountCents =
        moneyToCents(amount);


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
        data,
        error
    } =
        await supabase.rpc(
            "mom_increase_balance",
            {
                p_user_id:
                    userId,

                p_amount:
                    centsToMoney(
                        amountCents
                    )
            }
        );


    if (error) {

        console.error(error);

        alert(
            "Could not increase balance."
        );

        return;

    }


    await refreshAdminPanel();


    alert(
        "Added " +
        formatMoney(
            centsToMoney(
                amountCents
            )
        ) +
        " successfully."
    );

}


/* =========================================================
   DELETE OWN NORMAL ACCOUNT
========================================================= */

async function deleteOwnAccount() {

    if (!currentUser) {

        return;

    }


    const confirmed =
        confirm(
            "Delete your account?\n\n" +
            "Your Balance and Saved money " +
            "will be permanently removed."
        );


    if (!confirmed) {

        return;

    }


    /*
       Delete the public account first.

       The Auth user itself needs a server-side
       deletion mechanism. We deliberately do
       NOT put a service_role key in this browser.
    */

    const {
        error
    } =
        await supabase
            .from("accounts")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(error);

        alert(
            "Could not delete the account."
        );

        return;

    }


    await supabase.auth.signOut();


    currentUser = null;

    currentAccount = null;


    alert(
        "Your money-system account was deleted."
    );


    showLogin();

}


/* =========================================================
   DELETE MOM ACCOUNT
========================================================= */

async function deleteMomAccount() {

    if (
        !currentUser ||
        !currentAccount ||
        currentAccount.is_admin !== true
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Delete the MOM account?\n\n" +
            "This removes the MOM money-system " +
            "profile."
        );


    if (!confirmed) {

        return;

    }


    /*
       Delete MOM's public profile.

       We do NOT use a service_role key in
       the browser to delete auth.users.
    */

    const {
        error
    } =
        await supabase
            .from("accounts")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(error);

        alert(
            "Could not delete the MOM account."
        );

        return;

    }


    await supabase.auth.signOut();


    currentUser = null;

    currentAccount = null;


    alert(
        "MOM account profile deleted."
    );


    showLogin();

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    await supabase.auth.signOut();


    currentUser = null;

    currentAccount = null;


    loginUsername.value = "";

    loginPassword.value = "";

    loginMessage.textContent = "";


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
   ENTER KEY LOGIN
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            login();

        }

    }
);


/* =========================================================
   START
========================================================= */

showLogin();

initializeSupabase();
