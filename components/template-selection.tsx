"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemeStore } from "@/lib/store";
import { fetchMemeTemplates, generateCaptions, generateMeme } from "@/lib/api";
import { Search, ArrowLeft, Shuffle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { MemeTemplate } from "@/lib/store";

interface TemplateSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export default function TemplateSelection({ onNext, onBack }: TemplateSelectionProps) {
  const { 
    templates, 
    setTemplates, 
    selectedTemplate, 
    setSelectedTemplate,
    prompt,
    tone,
    setGeneratedMemeUrl,
    setCaptions
  } = useMemeStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const fetchedTemplates = await fetchMemeTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
      setIsLoading(false);
    };

    loadTemplates();
  }, [setTemplates]);

  const handleRandomMeme = async () => {
    if (!prompt || templates.length === 0) {
      toast.error("Please enter a prompt first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const randomIndex = Math.floor(Math.random() * templates.length);
      const template = templates[randomIndex];
      
      const generatedCaptions = await generateCaptions(prompt, template.box_count, tone);
      const cleanedCaptions = generatedCaptions.map(caption => 
        caption.replace(/^\d+\.\s*"|"$|^"|"$/g, '').trim()
      );
      
      const result = await generateMeme(template.id, cleanedCaptions);
      
      if (result) {
        setSelectedTemplate(template);
        setCaptions(cleanedCaptions);
        setGeneratedMemeUrl(result.url);
        onNext();
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
    setIsGenerating(false);
  };

  const handleGenerateWithTemplate = async () => {
    if (!selectedTemplate || !prompt) return;

    setIsGenerating(true);
    setError(null);
    try {
      const generatedCaptions = await generateCaptions(prompt, selectedTemplate.box_count, tone);
      const cleanedCaptions = generatedCaptions.map(caption => 
        caption.replace(/^\d+\.\s*"|"$|^"|"$/g, '').trim()
      );
      
      const result = await generateMeme(selectedTemplate.id, cleanedCaptions);
      
      if (result) {
        setCaptions(cleanedCaptions);
        setGeneratedMemeUrl(result.url);
        onNext();
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
    setIsGenerating(false);
  };

  const handleTemplateSelect = (template: MemeTemplate) => {
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(template);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-4xl mx-auto p-6 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            Choose a Template
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-muted"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleRandomMeme}
            variant="outline"
            className="flex-1"
            disabled={!prompt || isGenerating || selectedTemplate !== null}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Random Template
          </Button>
        </div>

        <ScrollArea className="h-[400px] rounded-md border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                    selectedTemplate?.id === template.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="relative aspect-square w-full">
                    <div className="absolute inset-0 bg-background/30" />
                    <Image
                      src={template.url}
                      alt={template.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs text-white truncate">{template.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {selectedTemplate && (
            <Button
              onClick={handleGenerateWithTemplate}
              className="gradient-button"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Meme"}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}