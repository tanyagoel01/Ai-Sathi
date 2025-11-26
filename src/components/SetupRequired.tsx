import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Terminal, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SetupRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            Setup Required
          </h1>
          
          <p className="text-muted-foreground">
            The AI Math Tutor needs to be set up before you can use it.
            This is a one-time process that takes about 1-2 minutes.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Step 1: Open Terminal</h3>
              <p className="text-sm text-muted-foreground">
                Open a terminal in your project root directory
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Step 2: Run Setup Command</h3>
              <div className="bg-background rounded p-3 font-mono text-sm">
                cd src/math-tutor && npm run generate-embeddings
              </div>
              <p className="text-sm text-muted-foreground">
                This will process the Class 1 curriculum and create the AI database
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold">Step 3: Refresh Page</h3>
              <p className="text-sm text-muted-foreground">
                Once complete, refresh this page and the AI Tutor will be ready!
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">What will be created:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Embeddings database (~10-20 MB)</li>
            <li>• 14 Class 1 math chapters</li>
            <li>• 150+ practice questions</li>
            <li>• AI-powered semantic search</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            I've Run the Setup
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Need help? Check{" "}
          <code className="bg-muted px-1 py-0.5 rounded">
            /src/math-tutor/INTEGRATION.md
          </code>
        </div>
      </Card>
    </div>
  );
};

export default SetupRequired;
