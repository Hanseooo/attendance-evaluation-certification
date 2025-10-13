import { Button } from "@/components/ui/button";
import AuthModal from "../components/overlay/AuthModal";
import { useAuthModal } from "@/context/AuthModalContext";

export default function LandingPage() {
    const { openLogin, openRegister } = useAuthModal();

    return (
        <>
            <AuthModal />
                <div className=" flex flex-col p-4 min-h-screen">
                <a className="font-semibold">Semina</a>
                <header className="flex flex-col items-center px-10 mb-auto mt-auto">
                <h2 className="text-4xl font-bold mb-2 text-center">
                    Seamless Seminar Management
                </h2>
                <h5 className="text-lg mb-6 text-center">
                    From Finding Seminars to Receiving E-Certificates, We've Got You Covered. <span className="text-primary font-semibold italic">Semina</span> makes every seminar seamless.
                </h5>
                <div className="flex gap-4">
                    <Button onClick={openLogin}>
                        Sign In
                    </Button>
                    <Button onClick={openRegister} variant="outline" >
                    Register
                </Button>
                </div>
                </header>
            </div>
        </>
    )
}