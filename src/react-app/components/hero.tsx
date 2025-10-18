import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Secure Authentication
            </span>
            <br />
            <span className="text-foreground">Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience lightning-fast, secure authentication with Better Auth.
            Built with Vite and React for modern web applications.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure by Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Easy Integration</span>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-muted-foreground pt-8">
            Join thousands of developers building secure applications
          </p>
        </div>
      </div>
    </section>
  );
}
