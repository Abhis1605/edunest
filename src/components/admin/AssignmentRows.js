import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { Trash2, Plus } from "lucide-react";

const classOptions = [8, 9, 10].map(c => ({
    value: String(c), label: `Class ${c}`
}))

const sectionOptions = ['A', 'B'].map(s => ({
    value: s, label: `Section ${s}`
}))

export default function AssignmentRows({
    assignments, onChange
}) {
    const handleChange = ( index, field, value ) => {
        const updated = assignments.map((a, i) => 
            i === index ? { ...a, [field]: value } : a
        )
        onChange(updated)
    }

    const addRow = () => {
        onChange([...assignments, {
            subjectName: '', class: '', section: ''
        }])
    }

    const removeRow = (index) => {
        if (assignments.length === 1) return;
        onChange(assignments.filter((_, i) => i !== index ))
    }


    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                    Assignments *
                </label>
                <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-[#0E9EAD] hover:text-[#OC8A98] transition-colors font-medium">
                    <Plus className="h-3 w-3" />
                    Add Assignment
                </button>
            </div>

            <div className="space-y-3 ">
                { assignments.map((assignment, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg space-y-2 relative">

                        {/* Remove button */}
                        {assignments.length > 1 && (
                            <button type="button" onClick={() => removeRow(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Subject */}

                <FormInput label="Subject" name="subjectName" value={assignment.subjectName} onChange={(e) => handleChange(
                    index, 'subjectName', e.target.value
                )}  
                    placeholder='e.g. Maths'
                    required
                />

                {/* Class and Section in a row */}
                <div className="grid grid-cols-2 gap-2">
                    <FormSelect label="Class" name="class" value={assignment.class} onChange={(e) => handleChange(
                        index, 'class', e.target.value
                    )}
                        placeholder="Select"
                        required
                        options={classOptions}
                    />
                    <FormSelect label="Section" name="section" value={assignment.section} onChange={(e) => handleChange(
                        index, 'section', e.target.value
                    )}
                    placeholder='Select'
                    required
                    options={sectionOptions}
                 />
                </div>
            </div>
        </div>
    )
}