type ToastType = "success" | "error" | "warning" | "achievement";

const TEMPLATE_MAP: Record<ToastType, string> = {
  success: "success-toast",
  error: "error-toast",
  warning: "warning-toast",
  achievement: "achievement-toast",
};

export function showToast(message: unknown, type: ToastType = "success", duration?: number, prefix?: string)
{
	const displayMessage = formatMessage(message, prefix);
	const templateId = TEMPLATE_MAP[type];
	const template = document.getElementById(TEMPLATE_MAP[type]) as HTMLTemplateElement;
	if (!template) {
		console.error(`Toast template "${templateId}" not found`);
		return;
	}

	const node = template.content.cloneNode(true) as DocumentFragment;
	
	(node.getElementById("message") as HTMLSpanElement).textContent = displayMessage;

	const toast = node.firstElementChild as HTMLElement;

	const closeBtn = toast.querySelector(".close");
	if (closeBtn)
	{
		closeBtn.addEventListener("click", () => removeToast(toast));
	}

	document.body.appendChild(toast);

	requestAnimationFrame(() => {
		toast.style.opacity = "1";
		toast.style.transform = "translateX(0)";
	});

	if (type === "success")
	{
    	setTimeout(() => removeToast(toast), duration ?? 3000);
  	}
	else if (duration && duration > 0)
	{
    	setTimeout(() => removeToast(toast), duration);
  	}

	stackToasts();
}


function formatMessage(message: unknown, prefix?: string): string
{
	let result: string;

	if (message instanceof Error)
	{
		result = message.message;
	}
	else if (typeof message === "string")
	{
		result = message;
	}
	else
	{
		try {
		result = JSON.stringify(message);
		} catch {
		result = "An unexpected error occurred";
		}
	}
	return prefix ? `${prefix}: ${result}` : result;
}


function removeToast(toast: HTMLElement)
{
	toast.style.opacity = "0";
	toast.style.transform = "translateX(20px)";
	toast.addEventListener("transitionend", () => toast.remove(), { once: true });
}

function stackToasts() {
	const toasts = Array.from(document.querySelectorAll(".toast")) as HTMLElement[];
	
	toasts.forEach((toast, index) => {
		toast.style.top = `${125 + index * 70}px`;
	});
}
