import { Heart, Shield, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-medical">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full p-3">
              <Heart className="h-8 w-8 text-white" />
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Arogya Setu AI</h1>
              <p className="text-white/90 text-sm">स्वास्थ्य संदर्भ मार्गदर्शिका | Health Reference Guide</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-white/80">
            <Search className="h-5 w-5" />
            <span className="text-sm">1000+ रोग डेटाबेस | Disease Database</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;