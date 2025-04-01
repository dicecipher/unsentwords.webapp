import firebaseConfig from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, query, where, Timestamp 
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const messageForm = document.getElementById("messageForm");
const messagesContainer = document.getElementById("messagesContainer");
const searchInput = document.querySelector(".form-control");
const browseButton = document.getElementById("button-addon2");
const messageInput = document.getElementById("message");
const recipientInput = document.getElementById("recipient");
const messageCounter = document.getElementById("messageCounter");
const recipientCounter = document.getElementById("recipientCounter");

// Character Limits
const MAX_MESSAGE_LENGTH = 500;
const MAX_RECIPIENT_LENGTH = 32;

// 🛠 Update Character Counter Function
function updateCounter(inputElement, counterElement, limit) {
    let length = inputElement.value.length;

    // Enforce Limit
    if (length > limit) {
        inputElement.value = inputElement.value.substring(0, limit);
        length = limit;
    }

    counterElement.textContent = `${length} / ${limit} characters`;

    if (length >= limit) {
        counterElement.classList.add("exceeded");
        counterElement.classList.remove("text-muted");
    } else {
        counterElement.classList.remove("exceeded");
        counterElement.classList.add("text-muted");
    }
}

// Event Listeners for Character Counting
if (recipientInput) {
    recipientInput.addEventListener("input", () => updateCounter(recipientInput, recipientCounter, MAX_RECIPIENT_LENGTH));
} else {
    console.error("recipientInput not found in the DOM");
}

if (messageInput) {
    messageInput.addEventListener("input", () => updateCounter(messageInput, messageCounter, MAX_MESSAGE_LENGTH));
} else {
    console.error("messageInput not found in the DOM");
}


// 🛠 Reset Form Fields & Counters
function resetForm() {
    recipientInput.value = "";
    messageInput.value = "";
    updateCounter(recipientInput, recipientCounter, MAX_RECIPIENT_LENGTH);
    updateCounter(messageInput, messageCounter, MAX_MESSAGE_LENGTH);
}

// 🛠 Create Message Card
function createMessageCard(data) {
    const messageCard = document.createElement("div");
    messageCard.classList.add("h-100", "mb-3", "mt-3");
    messageCard.style.maxWidth = "450px";
    messageCard.style.height = "400px"; // Set height

    let date = "Unknown Date";
    if (data.datePosted && data.datePosted.toDate) {
        date = data.datePosted.toDate().toLocaleDateString("en-US", { 
            month: "long", day: "numeric", year: "numeric" 
        });
    }

    messageCard.innerHTML = `
    <div class="card border-dark h-100" style="height: 100%;">
        <div class="w-100 h-100 d-flex flex-column">
            <div class="card-header text-start fw-semibold">
                To: ${data.recipient}
            </div>
            <div class="card-body flex-grow-1">
                <p class="card-text">${data.message}</p>
            </div>
            <div class="card-footer text-body-secondary">
                ${date}
            </div>
        </div>
    </div>
    `;

    return messageCard;
}



// 🛠 Display Messages
async function displayMessages(querySnapshot) {
    console.log("📌 Checking messagesContainer:", messagesContainer); // Debugging line

    if (!messagesContainer) {
        console.error("❌ messagesContainer is NULL. Check your HTML.");
        return;
    }

    messagesContainer.innerHTML = "";

    if (!querySnapshot || querySnapshot.empty) {
        messagesContainer.innerHTML = "<p class='text-muted'>No messages found.</p>";
        return;
    }

    querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const messageCard = createMessageCard(data);
        messagesContainer.appendChild(messageCard);
    });
}


// 🛠 Load Messages
async function loadMessages() {
    try {
        console.log("Fetching messages...");
        const querySnapshot = await getDocs(collection(db, "messages"));

        console.log("Documents found:", querySnapshot.size); // Log how many documents are found

        querySnapshot.forEach((doc) => {
            console.log("Message data:", doc.data()); // Log each document's data
        });

        displayMessages(querySnapshot);
    } catch (error) {
        console.error("Error fetching messages:", error);
        messagesContainer.innerHTML = "<p class='text-danger'>Error loading messages.</p>";
    }
}

// 🛠 Handle Message Submission
if (messageForm) {
    messageForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const recipient = recipientInput.value.trim();
        const message = messageInput.value.trim();

        if (!recipient || !message) {
            alert("Recipient and message cannot be empty!");
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                recipient,
                message,
                datePosted: Timestamp.now()
            });

            alert("Message added successfully!");
            resetForm(); // Reset fields and counters
            loadMessages(); // Refresh messages
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to add message.");
        }
    });
}

// 🛠 Search Messages by Recipient
import { query, where } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

async function searchMessages() {
    const recipientName = searchInput.value.trim();

    if (recipientName === "") {
        loadMessages(); // Reload all messages if search is empty
        return;
    }

    try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("recipient", "==", recipientName)); // Firestore query

        const querySnapshot = await getDocs(q);

        console.log("Filtered messages found:", querySnapshot.size);

        displayMessages(querySnapshot);
    } catch (error) {
        console.error("Error searching messages:", error);
        messagesContainer.innerHTML = "<p class='text-danger'>Error filtering messages.</p>";
    }
}


if (browseButton) {
    browseButton.addEventListener("click", searchMessages);
} else {
    console.error("browseButton not found in the DOM");
}
document.addEventListener("DOMContentLoaded", function () {
    loadMessages(); // Load messages on page load
    
    if (browseButton) {
        browseButton.addEventListener("click", searchMessages);
    } else {
        console.error("browseButton not found in the DOM");
    }
});

// 🛠 Initialize on Page Load
document.addEventListener("DOMContentLoaded", function () {
    const recipientInput = document.getElementById("recipient");
    const messageInput = document.getElementById("message");
    const browseButton = document.getElementById("button-addon2");

    if (!recipientInput) console.error("❌ recipientInput not found in the DOM");
    if (!messageInput) console.error("❌ messageInput not found in the DOM");
    if (!browseButton) console.error("❌ browseButton not found in the DOM");

    // Call loadMessages only if the messages container exists
    const messagesContainer = document.getElementById("messagesContainer");
    if (messagesContainer) {
        loadMessages();
    } else {
        console.error("❌ messagesContainer not found in the DOM");
    }
});
