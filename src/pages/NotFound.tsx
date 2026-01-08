import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="text-2xl font-bold text-foreground mt-4">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center justify-center gap-2 px-6"
          >
            <Home className="w-4 h-4" />
            Ir para Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center gap-2 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
