import { motion } from 'framer-motion';
import { GlobeVisualization } from '../components/GlobeVisualization';
import { Stats } from '../components/Stats';
import { NodeList } from '../components/NodeList';
import { Partners } from '../components/Partners';
import { useState, useEffect } from 'react';
import type { UserNode, Partner } from '@/types';
import { initialUserNodes } from '@/data/initialUserNodes';
import { partners } from '@/data/partners';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

const Index = () => {
  const [userNodes] = useState<UserNode[]>(initialUserNodes);

  const handlePartnerClick = (partner: Partner) => {
    const event = new CustomEvent('partnerSelected', { 
      detail: { partner }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'luma-checkout';
    script.src = 'https://embed.lu.ma/checkout-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('luma-checkout');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      {/* Globe Background */}
      <div className="fixed sm:inset-0 top-[6rem] sm:top-0 bottom-0 w-full">
        <GlobeVisualization userNodes={userNodes} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 w-full">
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 w-full">
            {/* Left Column - Title and Stats */}
            <div className="relative text-center sm:text-left mb-6 sm:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold font-['Jura'] flex items-center gap-2 justify-center sm:justify-start"
              >
                Agent to Agent Payment$ hackathon
                <span className="hidden sm:flex items-center gap-2">
                  💰
                </span>
              </motion.h1>
              
              {/* Stats Section - Hidden on mobile */}
              <div className="absolute left-0 top-16 hidden sm:block">
                <Stats />
              </div>
            </div>

            {/* Right Column - Register Button and NodeList */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto">
              <p className="text-sm font-light tracking-wider text-white/40 uppercase hidden sm:block">
                BRILLIANCE IS FORGED BY CONSTRAINTS
              </p>
              <div className="relative w-full sm:w-auto flex flex-col items-center">
                <a
                  href="https://lu.ma/event/evt-Z8RgiDZTMQGHzNC"
                  className="luma-checkout--button !bg-[#FFD700] hover:!bg-[#FFD700]/90 !text-black inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                  data-luma-action="checkout"
                >
                  Register for Event
                </a>

                {/* Node List - Mobile: Bottom fixed, Desktop: Under register button */}
                <div className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-0 sm:top-16 w-full sm:w-[400px] p-4 sm:p-0">
                  <NodeList userNodes={userNodes} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section - Fixed at bottom */}
      <Partners onPartnerClick={handlePartnerClick} />
    </div>
  );
};

export default Index;