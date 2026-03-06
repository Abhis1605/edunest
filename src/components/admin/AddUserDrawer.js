'user client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet"

export default function AddUserDrawer({
    open,
    onOpenChange,
    title,
    description,
    onAddAnother,
    submitting,
    onSubmit,
    children,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description}
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}