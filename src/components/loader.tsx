import { ClipLoader } from "react-spinners";

export default function Loader({
  color = "#ffffff",
  loading = true,
  size = 20,
  className = "",
}) {
  return (
    <ClipLoader
      className={className}
      color={color}
      loading={loading}
      size={size}
      aria-label="Loading..."
    />
  );
}
