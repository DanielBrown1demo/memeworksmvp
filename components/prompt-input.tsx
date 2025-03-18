"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMemeStore } from "@/lib/store";

interface PromptInputProps {
  onNext: () => void;
}

export default function PromptInput({ onNext }: PromptInputProps) {
  const { prompt, setPrompt, tone, setTone } = useMemeStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNext();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container max-w-2xl mx-auto px-4"
    >
      <Card className="p-6 sm:p-8 backdrop-blur-sm bg-card/50 border-2 border-primary/10 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold gradient-text text-center">
              What's your meme idea?
            </h2>
            <Input
              placeholder="e.g., When the code works but you don't know why"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-background/50 border-2 border-primary/20 rounded-xl h-14 px-6 text-lg placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="space-y-4">
            <label className="text-lg font-medium text-center block">Choose the tone:</label>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant={tone === 'funny' ? 'default' : 'outline'}
                onClick={() => setTone('funny')}
                className="flex-1 min-w-[120px] max-w-[150px] h-12 text-base"
              >
                😄 Funny
              </Button>
              <Button
                type="button"
                variant={tone === 'wholesome' ? 'default' : 'outline'}
                onClick={() => setTone('wholesome')}
                className="flex-1 min-w-[120px] max-w-[150px] h-12 text-base"
              >
                🥰 Wholesome
              </Button>
              <Button
                type="button"
                variant={tone === 'absurd' ? 'default' : 'outline'}
                onClick={() => setTone('absurd')}
                className="flex-1 min-w-[120px] max-w-[150px] h-12 text-base"
              >
                🤪 Absurd
              </Button>
              <Button
                type="button"
                variant={tone === 'political' ? 'default' : 'outline'}
                onClick={() => setTone('political')}
                className="flex-1 min-w-[120px] max-w-[150px] h-12 text-base"
              >
                🗣 Political
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="gradient-button w-full h-14 text-lg rounded-xl"
            disabled={!prompt || isLoading}
          >
            {isLoading ? "Processing..." : "Next"}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}