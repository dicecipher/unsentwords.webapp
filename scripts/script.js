document.getElementById("messageForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const recipientInput = document.getElementById("recipient");
    const messageInput = document.getElementById("message");
    const alertBox = document.getElementById("alertBox"); 

    alertBox.classList.add("d-none");

    if (recipientInput.value.length > 32) {
        alertBox.innerHTML = "Recipient name must be 32 characters or less.";
        alertBox.classList.remove("d-none");
        return;
    }

    if (messageInput.value.length > 500) {
        alertBox.innerHTML = "Message must be 500 characters or less.";
        alertBox.classList.remove("d-none");
        return;
    }

    const recipient = recipientInput.value;
    const message = messageInput.value;

    const messageCard = document.createElement("div");
    messageCard.classList.add("card", "text-bg-dark", "mb-3", "message");
    messageCard.style.maxWidth = "400px";

    messageCard.innerHTML = `
        <div class="card border-dark" style="max-width: 400px;">
            <div class="w-100">
                <div class="card-header text-start bold-text d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center fw-semibold">
                        To:&nbsp;<div>${recipient}</div>
                    </div>
                    <div class="d-flex align-items-center" style="gap: 5px;">
                        <span class="heart-icon" style="cursor: pointer;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16"> 
                                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                            </svg>
                        </span>
                        <div class="react-count">0</div>
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text">${message}</p>
                </div>
                <div class="card-footer text-body-secondary">
                    March 30, 2025
                </div>
            </div>
        </div>
    `;

    document.getElementById("messagesContainer").prepend(messageCard);
    const heartIcon = messageCard.querySelector(".heart-icon");
    const reactCount = messageCard.querySelector(".react-count");

    heartIcon.addEventListener("click", function () {
        if (heartIcon.innerHTML.includes("bi-heart-fill")) {
            heartIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16"> 
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>`;
            reactCount.textContent = Math.max(0, parseInt(reactCount.textContent) - 1);
        } else {
            heartIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-heart-fill" viewBox="0 0 16 16"> 
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                </svg>`;
            reactCount.textContent = parseInt(reactCount.textContent) + 1;
        }
    });

    recipientInput.value = "";
    messageInput.value = "";

    document.getElementById("recipientCounter").textContent = "0 / 32 characters";
    document.getElementById("messageCounter").textContent = "0 / 500 characters";
});

document.addEventListener("DOMContentLoaded", function () {
    const recipientInput = document.getElementById("recipient");
    const messageInput = document.getElementById("message");

    const recipientCounter = document.getElementById("recipientCounter");
    const messageCounter = document.getElementById("messageCounter");

    function updateCounters() {
        recipientCounter.textContent = `${recipientInput.value.length} / 32 characters`;
        messageCounter.textContent = `${messageInput.value.length} / 500 characters`;

        recipientCounter.classList.toggle("text-danger", recipientInput.value.length > 32);
        messageCounter.classList.toggle("text-danger", messageInput.value.length > 500);
    }

    recipientInput.addEventListener("input", updateCounters);
    messageInput.addEventListener("input", function () {
        if (messageInput.value.length > 500) {
            messageInput.value = messageInput.value.substring(0, 500);
        }
        updateCounters();
    });
});
