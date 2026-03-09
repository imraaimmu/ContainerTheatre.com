'use client';

import { motion } from 'framer-motion';
import { Check, Plus, Gamepad2, Clock, Sparkles, Camera, Cake, Flower, UtensilsCrossed, Film, Wind } from 'lucide-react';
import { AddOn } from '@/data/packages';
import { formatPrice, cn } from '@/lib/utils';

interface AddOnSelectorProps {
  addOns: AddOn[];
  selectedAddOns: AddOn[];
  onToggle: (addOn: AddOn) => void;
}

const addOnIcons: Record<string, any> = {
  gaming: Gamepad2,
  'extra-hour': Clock,
  'premium-decor': Sparkles,
  'fog-entry': Wind,
  photography: Camera,
  'photography-premium': Camera,
  cake: Cake,
  roses: Flower,
  snacks: UtensilsCrossed,
  slideshow: Film,
};

export default function AddOnSelector({ addOns, selectedAddOns, onToggle }: AddOnSelectorProps) {
  const isSelected = (addOn: AddOn) => selectedAddOns.some((a) => a.id === addOn.id);

  return (
    <div className="space-y-4">
      <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-6">
        <h3 className="text-terminal-green font-mono font-bold mb-2">
          {'>'} Install plugins (optional)
        </h3>
        <p className="text-terminal-muted text-sm font-mono mb-6">
          Enhance your experience with add-ons
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addOns.map((addOn) => {
            const Icon = addOnIcons[addOn.id] || Plus;
            const selected = isSelected(addOn);

            return (
              <motion.button
                key={addOn.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggle(addOn)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border text-left transition-all duration-200',
                  selected
                    ? 'border-terminal-green bg-terminal-green/10'
                    : 'border-terminal-gray hover:border-terminal-green/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  selected ? 'bg-terminal-green text-terminal-black' : 'bg-terminal-gray/50 text-terminal-green'
                )}>
                  {selected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      'font-mono font-medium truncate',
                      selected ? 'text-terminal-green' : 'text-white'
                    )}>
                      {addOn.name}
                    </p>
                    <span className="text-terminal-green font-mono text-sm font-bold whitespace-nowrap">
                      +{formatPrice(addOn.price)}
                    </span>
                  </div>
                  <p className="text-terminal-muted text-xs font-mono mt-1">{addOn.description}</p>
                  <p className="text-terminal-blue text-xs font-mono mt-2 opacity-60">
                    {addOn.command}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected summary */}
      {selectedAddOns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-terminal-green/10 border border-terminal-green/30 rounded-xl p-4"
        >
          <p className="text-terminal-green font-mono text-sm mb-2">
            {'>'} {selectedAddOns.length} plugin(s) installed:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedAddOns.map((addOn) => (
              <span
                key={addOn.id}
                className="px-3 py-1 bg-terminal-green/20 rounded-full text-terminal-green text-xs font-mono"
              >
                {addOn.name} (+{formatPrice(addOn.price)})
              </span>
            ))}
          </div>
          <p className="text-terminal-green font-mono text-sm mt-3 font-bold">
            Add-ons total: {formatPrice(selectedAddOns.reduce((sum, a) => sum + a.price, 0))}
          </p>
        </motion.div>
      )}
    </div>
  );
}
