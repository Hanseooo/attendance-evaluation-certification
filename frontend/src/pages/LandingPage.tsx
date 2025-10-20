import { Button } from "@/components/ui/button";
import AuthModal from "@/components/overlay/AuthModal";
import { useAuthModal } from "@/context/AuthModalContext";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { openLogin, openRegister } = useAuthModal();

  return (
    <>
      <AuthModal />

      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/40 px-6 text-center">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />


        <motion.div
          className="relative z-10 max-w-2xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
 
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Welcome to The Podium
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8">
            Join, explore, and track your seminars with ease.  
            Stay organized, stay ahead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={openLogin}
              size="lg"
              className="px-8 text-base font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={openRegister}
              size="lg"
              variant="outline"
              className="px-8 text-base font-medium border-primary/80 hover:border-primary"
            >
              Register
            </Button>
          </div>
        </motion.div>

        <div className="absolute bottom-[-5rem] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full" />
      </section>
    </>
  );
}
