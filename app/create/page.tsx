"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMemeStore } from "@/lib/store";
import PromptInput from "@/components/prompt-input";
import TemplateSelection from "@/components/template-selection";
import MemeEditor from "@/components/meme-editor";

export default function CreatePage() {
  const [step, setStep] = useState(1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PromptInput onNext={() => setStep(2)} />;
      case 2:
        return <TemplateSelection onNext={() => setStep(3)} onBack={() => setStep(1)} />;
      case 3:
        return <MemeEditor onBack={() => setStep(2)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
}