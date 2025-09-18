import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Star, Phone, CheckCircle, AlertTriangle, Shield, Pill, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = ['All', 'Infectious', 'Chronic', 'Seasonal', 'Lifestyle', 'Others'];

export const DiseaseInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState<any>(null);

  const { data: diseases = [], isLoading } = useQuery({
    queryKey: ['diseases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('disease_name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: featuredDiseases = [] } = useQuery({
    queryKey: ['featured-diseases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('featured', true)
        .order('disease_name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredDiseases = useMemo(() => {
    return diseases.filter(disease => {
      const matchesSearch = disease.disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           disease.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           disease.symptoms.some((symptom: string) => 
                             symptom.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      
      const matchesCategory = selectedCategory === 'All' || disease.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [diseases, searchQuery, selectedCategory]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Moderate': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const DiseaseCard = ({ disease }: { disease: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedDisease(disease)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{disease.disease_name}</CardTitle>
            {disease.name_hindi && (
              <p className="text-sm text-muted-foreground">{disease.name_hindi}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              {disease.category}
            </Badge>
            <Badge variant={getSeverityColor(disease.severity)} className="text-xs">
              {disease.severity}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {disease.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {disease.who_verified && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {disease.featured && (
              <Star className="h-4 w-4 text-yellow-500" />
            )}
            {disease.seasonal && (
              <Badge variant="outline" className="text-xs">Seasonal</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DiseaseDetail = ({ disease }: { disease: any }) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{disease.disease_name}</h2>
          {disease.name_hindi && (
            <p className="text-lg text-muted-foreground">{disease.name_hindi}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
        >
          <Phone className="h-4 w-4 mr-2" />
          Quick Consult
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{disease.category}</Badge>
        <Badge variant={getSeverityColor(disease.severity)}>{disease.severity}</Badge>
        {disease.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
        {disease.seasonal && <Badge variant="outline">Seasonal</Badge>}
        {disease.who_verified && (
          <Badge variant="outline" className="text-green-700 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            WHO Verified
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📌 Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{disease.description}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {disease.symptoms.map((symptom: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                  {symptom}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {disease.treatments.map((treatment: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {treatment}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {disease.remedies && disease.remedies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5" />
                Home Remedies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {disease.remedies.map((remedy: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {remedy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Precautions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {disease.precautions.map((precaution: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {precaution}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {disease.prevalence && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Prevalence</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{disease.prevalence}</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Disclaimer:</strong> This information is verified from WHO/CDC/MoHFW. Always consult a doctor for diagnosis and treatment.
        </p>
      </div>
    </div>
  );

  if (selectedDisease) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedDisease(null)}
          className="mb-4"
        >
          ← Back to Disease List
        </Button>
        <DiseaseDetail disease={selectedDisease} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diseases, symptoms, treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Filter className="h-9 w-9 p-2 border rounded-md bg-background" />
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Diseases</TabsTrigger>
          <TabsTrigger value="featured">Featured Diseases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDiseases.map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
          )}
          
          {filteredDiseases.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No diseases found matching your search.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredDiseases.map((disease) => (
              <DiseaseCard key={disease.id} disease={disease} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};