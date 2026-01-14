type ToastType = "success" | "error" | "warning";

/* export function showToast(
  message: string,
  type: ToastType = "success",
  duration = 2000
) {
  const toast = document.createElement("div");
  toast.textContent = message;

  let backgroundColor = "";
  switch (type) {
    case "success":
      backgroundColor = "#4CAF50";
      break;
    case "error":
      backgroundColor = "#F5675F";
      break;
    case "warning":
      backgroundColor = "#F7C873";
      break;
  }

  Object.assign(toast.style, {
    position: "fixed",
    top: "150px",
    right: "20px",
    backgroundColor,
    color: "black",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "16px",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
} */
//search: successfully,
export function showToast(
  message: string,
  type: ToastType = "success",
  duration = 3000
) {
  const toast = document.createElement("div");

  Object.assign(toast.style, {
    position: "fixed",
    top: "125px",
    right: "20px",
    minWidth: "260px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "15px",
    color: "black",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: "9999",
    opacity: "0",
    transform: "translateX(20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });

  let bg = "";
  let icon = "";

  switch (type) {
    case "success":
      bg = "#4CAF50"; 
      icon = "✅";
      break;
    case "warning":
      bg = "#F7C873";
      icon = "❗";
      break;
    case "error":
      bg = "#F5675F";
      icon = "❌";
      break;
  }

  toast.style.backgroundColor = bg;

  toast.innerHTML = `
    <span style="font-size:18px">${icon}</span>
    <span style="flex:1">${message}</span>
  `;

  if (type === "warning" || type === "error") {
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✖";
    Object.assign(closeBtn.style, {
      cursor: "pointer",
      fontWeight: "bold",
      marginLeft: "10px",
    });

    closeBtn.addEventListener("click", () => removeToast(toast));
    toast.appendChild(closeBtn);
  }

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  if (type === "success") {
    setTimeout(() => removeToast(toast), duration);
  }

  stackToasts();
}

function removeToast(toast: HTMLElement) {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(20px)";
  toast.addEventListener("transitionend", () => toast.remove());
}

function stackToasts() {
  const all = Array.from(document.querySelectorAll("div")).filter(
    el => el.style.position === "fixed" && el.style.right === "20px"
  );

  all.forEach((el, index) => {
    (el as HTMLElement).style.top = `${125 + index * 70}px`;
  });
}