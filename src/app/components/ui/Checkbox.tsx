interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function Checkbox({
  error,
  className,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 accent-black ${className ?? ""}`}
      {...props}
    />
  );
}
