export async function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.classList.add("notification", isError ? "error" : "success");
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
