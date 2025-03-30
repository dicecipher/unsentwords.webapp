document.addEventListener("DOMContentLoaded", function () {
    const recipientInput = document.getElementById("recipient");
    const recipientCounter = document.getElementById("recipientCounter");
    const messageInput = document.getElementById("message");
    const messageCounter = document.getElementById("messageCounter");

    function updateCounter(inputElement, counterElement, limit) {
        if (inputElement.value.length > limit) {
            inputElement.value = inputElement.value.substring(0, limit);
        }

        let length = inputElement.value.length;
        counterElement.textContent = `${length} / ${limit} characters`;

        if (length >= limit) {
            counterElement.classList.add("exceeded");
            counterElement.classList.remove("text-muted");
        } else {
            counterElement.classList.remove("exceeded");
            counterElement.classList.add("text-muted");
        }
    }

    recipientInput.addEventListener("input", function () {
        updateCounter(recipientInput, recipientCounter, 32);
    });

    messageInput.addEventListener("input", function () {
        updateCounter(messageInput, messageCounter, 500);
    });

    document.getElementById("messageForm").addEventListener("submit", function (event) {
        event.preventDefault();

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
        const today = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        const messageCard = document.createElement("div");
        messageCard.classList.add("card", "text-bg-dark", "mb-3","mt-3", "message");
        messageCard.style.maxWidth = "450px";

        messageCard.innerHTML = `
            <div class="card border-dark">
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
                        ${today}
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

        // Reset the form fields
        recipientInput.value = "";
        messageInput.value = "";

        // Reset the counters
        updateCounter(recipientInput, recipientCounter, 32);
        updateCounter(messageInput, messageCounter, 500);

        // Ensure counters return to muted style
        recipientCounter.classList.remove("exceeded");
        recipientCounter.classList.add("text-muted");

        messageCounter.classList.remove("exceeded");
        messageCounter.classList.add("text-muted");
    });
});
