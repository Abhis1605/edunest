'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet"
import CredentialsCard from "./CredentialsCard"

export default function AddUserDrawer({
    open,
    onOpenChange,
    title,
    description,
    credentials,
    onAddAnother,
    submitting,
    onSubmit,
    children,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
                <SheetHeader className="mb-6">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description}
                    </SheetDescription>
                </SheetHeader>

                {credentials ? (
                    <CredentialsCard credentials={credentials} onAddAnother={onAddAnother} onClose={() => onOpenChange(false)} />
                ) : (
                    <div className="space-y-4">
                        {children}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => onOpenChange(false)}
                                    className="flex-1 px-4 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors"
                                >
                                Cancel
                            </button>
                            <button onClick={onSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-[#0E9EAD] text-white rounded-lg text-sm font-medium hover:bg-[#0C8A98] transition-colors disabled:opacity-50">
                                {submitting ? "Adding..." : `Add ${title.replace('Add New ', "")}`}
                            </button>
                        </div>
                    </div>
                )} 

            </SheetContent>
        </Sheet>
    )
}