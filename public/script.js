
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, query, where, Timestamp 
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import firebaseConfig from "./config.js"; // Import your Firebase configuration


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
const MAX_MESSAGE_LENGTH = 300;
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
    function getRandomVeryLightColor() {
        const r = Math.floor(Math.random() * 100 + 155); 
        const g = Math.floor(Math.random() * 100 + 155); 
        const b = Math.floor(Math.random() * 100 + 155);
        const alpha = 0.2; 
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    messageCard.innerHTML = `
        <div class="h-100 card apple-card" style="background-color: ${getRandomVeryLightColor()}">
            <div class="h-100 w-100 d-flex flex-column">
                <div class="text-start fw-semibold card-header apple-header">
                    To: ${data.recipient}
                </div>
                <div class="card-body apple-body">
                    <p class="card-text">${data.message}</p>
                </div>
                <div class="card-footer apple-footer">
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
                recipient: recipientInput.value,
                recipient_lower: recipientInput.value.toLowerCase(), // 🔽 Add this
                message: messageInput.value,
                datePosted: Timestamp.now(),
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

async function searchMessages() {
    const recipientName = searchInput.value.trim().toLowerCase(); // 🔽 Convert input to lowercase

    if (recipientName === "") {
        loadMessages();
        return;
    }

    try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("recipient_lower", "==", recipientName)); // 🔽 Query the lowercase field

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
// 🛠 Load Messages of the Day - Only Display 8 Random Messages Created Today
async function loadMessagesOfTheDay() {
    try {
        console.log("Fetching today's messages for Messages of the Day...");

        // Get today's start and tomorrow's start timestamps
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);
        const endOfTodayTimestamp = Timestamp.fromDate(endOfToday);

        // Query messages created today
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("datePosted", ">=", startOfTodayTimestamp),
            where("datePosted", "<", endOfTodayTimestamp)
        );
        const querySnapshot = await getDocs(q);

        // Convert querySnapshot to an array and randomize the order
        let docsArray = querySnapshot.docs;
        docsArray.sort(() => Math.random() - 0.5);

        // Limit to 8 messages
        const selectedDocs = docsArray.slice(0, 8);

        // Get the container for Messages of the Day
        const messagesOfTheDayContainer = document.getElementById("messagesOfTheDay");
        if (!messagesOfTheDayContainer) {
            console.error("messagesOfTheDay container not found in the DOM.");
            return;
        }
        messagesOfTheDayContainer.innerHTML = "";

        // Display a message if no documents are found
        if (selectedDocs.length === 0) {
            messagesOfTheDayContainer.innerHTML = "<p class='text-muted'>No messages found for today.</p>";
            return;
        }

        // Create and append message cards for each selected document
        selectedDocs.forEach((doc) => {
            const data = doc.data();
            const messageCard = createMessageCard(data);
            messagesOfTheDayContainer.appendChild(messageCard);
        });
    } catch (error) {
        console.error("Error loading messages of the day:", error);
        document.getElementById("messagesOfTheDay").innerHTML = "<p class='text-danger'>Error loading messages of the day.</p>";
    }
}

// 🛠 Initialize on Page Load for Messages of the Day
document.addEventListener("DOMContentLoaded", function () {
    // Load messages for the main container
    if (document.getElementById("messagesContainer")) {
        loadMessages();
    } else {
        console.error("❌ messagesContainer not found in the DOM");
    }
    
    // Load today's messages (8 random messages) for the Messages of the Day section
    if (document.getElementById("messagesOfTheDay")) {
        loadMessagesOfTheDay();
    } else {
        console.error("❌ messagesOfTheDay not found in the DOM");
    }
});
