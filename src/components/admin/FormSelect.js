export default function FormSelect({
    label, name, value, onChange, options, placholder, required
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">
                {label} {required && '*'}
            </label>
            <select 
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9EAD]"
            >
                <option value=''>{placholder}</option>
                {
                    options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))
                }
            </select>
        </div>
    )
}