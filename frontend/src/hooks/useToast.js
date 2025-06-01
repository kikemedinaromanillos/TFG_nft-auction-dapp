import { toast } from "react-toastify"

export const useToast = () => {
  const showSuccess = (msg) => {
    toast.success(`${msg}`, {
      style: {
        background: "rgba(17, 24, 39, 0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(132, 204, 22, 0.3)",
        color: "#84cc16",
        borderRadius: "12px",
      },
      progressStyle: {
        background: "linear-gradient(to right, #84cc16, #3b82f6)",
      },
    })
  }

  const showError = (msg) => {
    toast.error(`${msg}`, {
      style: {
        background: "rgba(17, 24, 39, 0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#ef4444",
        borderRadius: "12px",
      },
      progressStyle: {
        background: "linear-gradient(to right, #ef4444, #f97316)",
      },
    })
  }

  const showInfo = (msg) => {
    toast.info(`${msg}`, {
      style: {
        background: "rgba(17, 24, 39, 0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        color: "#3b82f6",
        borderRadius: "12px",
      },
      progressStyle: {
        background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      },
    })
  }

  const showWarning = (msg) => {
    toast.warning(`${msg}`, {
      style: {
        background: "rgba(17, 24, 39, 0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(249, 115, 22, 0.3)",
        color: "#f97316",
        borderRadius: "12px",
      },
      progressStyle: {
        background: "linear-gradient(to right, #f97316, #eab308)",
      },
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
