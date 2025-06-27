interface AlertMessageProps {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  const baseStyles = "px-4 py-3 rounded mb-6 relative";
  const typeStyles =
    type === "error"
      ? "bg-red-100 border border-red-400 text-red-700"
      : "bg-green-100 border border-green-400 text-green-700";

  return (
    <div className={`${typeStyles} ${baseStyles}`}>
      <span className="block sm:inline">{message}</span>
      <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onClose}>
        <span className="text-xl">&times;</span>
      </button>
    </div>
  );
}
