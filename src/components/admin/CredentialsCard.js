'use client'
import { Check, Copy, Lock, Mail } from "lucide-react"
import { useState } from "react"

export default function CredentialsCard({
    credentials, onAddAnother, onClose
}) {
    const [copied, setCopied] = useState(false)
    return (
        <div className="space-y-4">

            <p className="text-sm text-muted-foreground">
                Share these login credentials with the teacher:
            </p>

            {/* Email */}
            <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0 "/>
                <span className="text-sm font-medium text-foreground break-all">
                    {credentials.email}
                </span>
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                <Lock className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                <span className="text-sm font-medium text-foreground">
                    {credentials.password}
                </span>
            </div>

            {/* Button */}
            <div className="flex gap-2 pt-2">
                
                <button className="flex items-center gap-2 px-3 py-2 bg-[#0E9EAD] text-white rounded-lg text-sm hover:[#0C8A98] transition-colors">
                    { copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} 
                    {copied ? "Copied" : "Copy" }
                </button>
                <button onChange={onAddAnother} className="px-3 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors">
                    Add Another
                </button>
                <button onClose={onclose} className="px-3 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors">
                    Close
                </button>

            </div>

        </div>
    )
}