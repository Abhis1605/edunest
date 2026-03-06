export default function FormSelect({
    label, name, value, onChange, options, placholder, required
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">
                {label} {required && '*'}
            </label>
            <select>
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