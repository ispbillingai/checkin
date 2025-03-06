
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  useEffect(() => {
    console.log("Loading component mounted");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="animate-scale-in flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
