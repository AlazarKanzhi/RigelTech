import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rigel-blue to-rigel-blue-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rigel-orange rounded-full mb-4">
              <GraduationCap className="text-white text-2xl w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rigel</h1>
            <p className="text-gray-600">Learning Portal</p>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Access your personalized learning dashboard and continue your educational journey.
              </p>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-rigel-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Sign In with Replit
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Contact your instructor for access credentials
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
