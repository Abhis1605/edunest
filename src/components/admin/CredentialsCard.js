'use client'
import { Check, Copy, Lock, Mail } from "lucide-react"
import { useState } from "react"

export default function CredentialsCard({
    credentials, onAddAnother, onClose
}) {
    const [copied, setCopied] = useState(false)

    const isStdent = credentials?.student && credentials?.parent

    const copyCredentials = () => {
         let text = ''
         if (isStdent) {
            text = `Student Email: ${credentials.student.email}\nStudent Password: ${credentials.student.password}\n\nParent Email: ${credentials.parent.email}\nParent Password:${credentials.parent.password}`
         }
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

    return (
        <div className="space-y-4">

            <p className="text-sm text-muted-foreground">
                Share these login credentials with the teacher:
            </p>

            {isStdent ? (
                <>
                {/* Student Credentials */}
                    <p className="text-xs font-semibold text-[#0E9EAD] uppercase tracking-wide">
                        Student Login
                    </p>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                        <span className="text-sm font-medium text-foreground break-all">
                            {credentials.student.email}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                        <Lock className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                        <span className="text-sm font-medium text-foreground">
                            {credentials.student.password}
                        </span>
                    </div>

                    {/* Parent Credentials */}
                    <p className="text-xs font-semibold text-[#0E9EAD] uppercase tracking-wide pt-2">
                        Parent Login
                    </p>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                        <span className="text-sm font-medium text-foreground break-all">
                            {credentials.parent.email}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                        <Lock className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                        <span className="text-sm font-medium text-foreground">
                            {credentials.parent.password}
                        </span>
                    </div>
                </>
            ): (
                <>
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
                </>
            )}

          

            {/* Button */}
            <div className="flex gap-2 pt-2">

                <button onClick={copyCredentials} className="flex items-center gap-2 px-3 py-2 bg-[#0E9EAD] text-white rounded-lg text-sm hover:[#0C8A98] transition-colors">
                    { copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} 
                    {copied ? "Copied" : "Copy" }
                </button>
                <button onClick={onAddAnother} className="px-3 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors">
                    Add Another
                </button>
                <button onClick={onClose} className="px-3 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors">
                    Close
                </button>

            </div>

        </div>
    )
}