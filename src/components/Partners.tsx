import { partners } from '@/data/partners';
import type { Partner } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PartnersProps {
  onPartnerClick: (partner: Partner) => void;
}

export const Partners = ({ onPartnerClick }: PartnersProps) => {
  // Function to determine if a logo should be circular
  const shouldBeCircular = (index: number) => {
    // Make logos at index 2, 3, 4, 5 circular (0-based index)
    return (index >= 2 && index <= 5) || index === 7 || index === 8;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-auto hidden sm:block">
      <div className="w-full max-w-7xl mx-auto bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap justify-center items-center gap-6">
          {partners.map((partner, index) => (
            <TooltipProvider key={partner.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPartnerClick(partner)}
                    className="w-20 h-20 min-w-[5rem] min-h-[5rem] rounded-lg bg-black/50 hover:bg-black/70 transition-colors p-2 flex items-center justify-center border border-white/5 hover:border-white/20"
                  >
                    <img
                      src={partner.image}
                      alt={partner.name}
                      className={`w-full h-full object-contain filter brightness-90 hover:brightness-100 transition-all ${shouldBeCircular(index) ? 'rounded-full' : ''}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{partner.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};
