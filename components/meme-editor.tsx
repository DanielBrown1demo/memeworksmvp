"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemeStore } from "@/lib/store";
import { generateMeme, generateCaptions } from "@/lib/api";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MemeEditorProps {
  onBack: () => void;
}

export default function MemeEditor({ onBack }: MemeEditorProps) {
  const { 
    selectedTemplate, 
    captions, 
    setCaptions, 
    generatedMemeUrl,
    setGeneratedMemeUrl,
    prompt,
    tone
  } = useMemeStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  const handleUpdateMeme = async () => {
    if (!selectedTemplate) return;
    
    setIsLoading(true);
    try {
      const result = await generateMeme(selectedTemplate.id, captions);
      if (result) {
        setGeneratedMemeUrl(result.url);
        toast.success("Meme updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update meme");
    }
    setIsLoading(false);
  };

  const handleRegenerateCaptions = async () => {
    if (!selectedTemplate) return;
    
    setIsGeneratingCaptions(true);
    try {
      const newCaptions = await generateCaptions(prompt, selectedTemplate.box_count, tone);
      const cleanedCaptions = newCaptions.map(caption => 
        caption.replace(/^\d+\.\s*"|"$|^"|"$/g, '').trim()
      );
      setCaptions(cleanedCaptions);
      
      // Automatically update the meme with new captions
      const result = await generateMeme(selectedTemplate.id, cleanedCaptions);
      if (result) {
        setGeneratedMemeUrl(result.url);
        toast.success("Captions regenerated!");
      }
    } catch (error) {
      toast.error("Failed to regenerate captions");
    }
    setIsGeneratingCaptions(false);
  };

  const handleDownload = async () => {
    if (!generatedMemeUrl) return;
    
    try {
      const response = await fetch(generatedMemeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Meme downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download meme");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-sm bg-card/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              Edit Captions
            </h2>
            <Button
              onClick={handleRegenerateCaptions}
              variant="outline"
              disabled={isGeneratingCaptions}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>

          <div className="space-y-4">
            {Array.from({ length: selectedTemplate?.box_count || 0 }).map((_, index) => (
              <Input
                key={index}
                placeholder="Enter caption"
                value={captions[index] || ''}
                onChange={(e) => {
                  const newCaptions = [...captions];
                  newCaptions[index] = e.target.value;
                  setCaptions(newCaptions);
                }}
                className="bg-background/50 border-muted"
              />
            ))}

            <Button
              onClick={handleUpdateMeme}
              className="w-full gradient-button"
              disabled={isLoading || captions.some(caption => !caption)}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Meme"
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              Preview
            </h2>
            {generatedMemeUrl && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden bg-background/30">
            {generatedMemeUrl ? (
              <Image
                src={generatedMemeUrl}
                alt="Generated meme"
                fill
                className="object-contain"
              />
            ) : selectedTemplate ? (
              <Image
                src={selectedTemplate.url}
                alt={selectedTemplate.name}
                fill
                className="object-contain"
              />
            ) : null}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </motion.div>
  );
}