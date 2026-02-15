import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-neutral-950 to-neutral-950" />
            <div className="relative z-10">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            cardBox: "bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-2xl shadow-violet-500/10",
                            headerTitle: "text-white",
                            headerSubtitle: "text-neutral-400",
                            socialButtonsBlockButton: "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700",
                            formFieldLabel: "text-neutral-300",
                            formFieldInput: "bg-neutral-800 border-neutral-700 text-white",
                            footerActionLink: "text-violet-400 hover:text-violet-300",
                            formButtonPrimary: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
                            identityPreviewEditButton: "text-violet-400",
                        },
                    }}
                />
            </div>
        </div>
    );
}
