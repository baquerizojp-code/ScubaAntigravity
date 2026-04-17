import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-7xl font-black font-headline text-primary">{t('notFound.title')}</h1>
          <p className="mb-8 text-xl text-muted-foreground">{t('notFound.message')}</p>
          <Button asChild>
            <a href="/">{t('notFound.returnHome')}</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
