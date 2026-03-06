export default function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {required && '*'}
      </label>
      <input type={type} name={name} value={value} onChange={onchange} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9EAD]" />
    </div>
  );
}
