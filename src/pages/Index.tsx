import React, { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import DiseaseCard from "@/components/DiseaseCard";
import DiseaseModal from "@/components/DiseaseModal";
import Header from "@/components/Header";
import { ChatBot } from "@/components/ChatBot";
import { DiseaseInfo } from "@/components/DiseaseInfo";
import { MisinformationDashboard } from "@/components/MisinformationDashboard";
import { sampleDiseases, diseaseCategories, severityLevels } from "@/data/sampleDiseases";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Database, AlertTriangle, Home } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const filteredDiseases = useMemo(() => {
    return sampleDiseases.filter((disease) => {
      const matchesSearch = searchQuery === "" || 
        disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.nameHindi.includes(searchQuery) ||
        disease.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.commonSymptoms.some(symptom => 
          symptom.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(disease.category);

      const matchesSeverity = selectedSeverities.length === 0 || 
        selectedSeverities.includes(disease.severity);

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [searchQuery, selectedCategories, selectedSeverities]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSeverityToggle = (severity: string) => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSeverities([]);
    setSearchQuery("");
  };

  const handleDiseaseClick = (disease: any) => {
    setSelectedDisease(disease);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Aarogya Setu
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Your trusted companion for health information with AI-powered chatbot assistance.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="diseases" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Disease Info
            </TabsTrigger>
            <TabsTrigger value="misinformation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Misinformation Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">AI Health Assistant</h3>
                  <p className="text-gray-600 text-sm">Chat with our AI bot for instant verified medical information</p>
                  <Button 
                    className="mt-4" 
                    size="sm"
                    onClick={() => setActiveTab("chatbot")}
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Disease Database</h3>
                  <p className="text-gray-600 text-sm">Browse comprehensive information about 1000+ diseases</p>
                  <Button 
                    className="mt-4" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab("diseases")}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Misinformation Tracking</h3>
                  <p className="text-gray-600 text-sm">Monitor and combat health misinformation with analytics</p>
                  <Button 
                    className="mt-4" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab("misinformation")}
                  >
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <ChatBot />
          </TabsContent>

          <TabsContent value="diseases">
            <DiseaseInfo />
          </TabsContent>

          <TabsContent value="misinformation">
            <MisinformationDashboard />
          </TabsContent>
        </Tabs>
      </main>

      <DiseaseModal
        disease={selectedDisease}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDisease(null);
        }}
      />
    </div>
  );
};

export default Index;