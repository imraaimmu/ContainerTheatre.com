'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Check, Sparkles } from 'lucide-react';
import { Package } from '@/data/packages';
import { formatPrice, cn } from '@/lib/utils';

interface PackageCardProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: () => void;
  isWeekend: boolean;
}

export default function PackageCard({ pkg, isSelected, onSelect, isWeekend }: PackageCardProps) {
  const price = isWeekend ? pkg.weekendPrice : pkg.weekdayPrice;

  const colorClasses = {
    green: 'border-terminal-green/30 hover:border-terminal-green',
    blue: 'border-terminal-blue/30 hover:border-terminal-blue',
    purple: 'border-terminal-purple/30 hover:border-terminal-purple',
    yellow: 'border-terminal-yellow/30 hover:border-terminal-yellow',
  };

  const glowClasses = {
    green: 'shadow-terminal-green/20',
    blue: 'shadow-terminal-blue/20',
    purple: 'shadow-terminal-purple/20',
    yellow: 'shadow-terminal-yellow/20',
  };

  const accentClasses = {
    green: 'text-terminal-green',
    blue: 'text-terminal-blue',
    purple: 'text-terminal-purple',
    yellow: 'text-terminal-yellow',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onSelect}
      className={cn(
        'package-card relative bg-terminal-dark border-2 rounded-xl p-6 cursor-pointer transition-all duration-300',
        colorClasses[pkg.color],
        isSelected && `ring-2 ring-offset-2 ring-offset-terminal-black shadow-lg ${glowClasses[pkg.color]}`,
        isSelected && pkg.color === 'green' && 'ring-terminal-green',
        isSelected && pkg.color === 'blue' && 'ring-terminal-blue',
        isSelected && pkg.color === 'purple' && 'ring-terminal-purple',
        isSelected && pkg.color === 'yellow' && 'ring-terminal-yellow'
      )}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium',
            pkg.color === 'purple' && 'bg-terminal-purple text-terminal-black',
            pkg.color === 'yellow' && 'bg-terminal-yellow text-terminal-black',
            pkg.color === 'green' && 'bg-terminal-green text-terminal-black',
            pkg.color === 'blue' && 'bg-terminal-blue text-terminal-black'
          )}>
            <Sparkles className="w-3 h-3" />
            Popular
          </div>
        </div>
      )}

      {/* Selected checkmark */}
      {isSelected && (
        <div className={cn(
          'absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center',
          pkg.color === 'green' && 'bg-terminal-green',
          pkg.color === 'blue' && 'bg-terminal-blue',
          pkg.color === 'purple' && 'bg-terminal-purple',
          pkg.color === 'yellow' && 'bg-terminal-yellow'
        )}>
          <Check className="w-4 h-4 text-terminal-black" />
        </div>
      )}

      {/* Icon and name */}
      <div className="mb-4">
        <span className="text-4xl mb-3 block">{pkg.icon}</span>
        <h3 className={cn('font-mono font-bold text-lg', accentClasses[pkg.color])}>
          {pkg.name}
        </h3>
        <p className="text-terminal-muted text-sm font-mono mt-1">{pkg.description}</p>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 mb-4 text-terminal-muted text-sm font-mono">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{pkg.capacity}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{pkg.duration}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {pkg.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className={cn('mt-0.5', accentClasses[pkg.color])}>{'>'}</span>
            <span className="text-white/80">{feature}</span>
          </li>
        ))}
        {pkg.features.length > 4 && (
          <li className="text-terminal-muted text-sm font-mono">
            +{pkg.features.length - 4} more...
          </li>
        )}
      </ul>

      {/* Price */}
      <div className="pt-4 border-t border-terminal-gray">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-terminal-muted text-xs font-mono">
              {isWeekend ? 'weekend' : 'weekday'} price
            </p>
            <p className={cn('text-2xl font-mono font-bold', accentClasses[pkg.color])}>
              {formatPrice(price)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-4 py-2 rounded font-mono text-sm font-medium transition-colors',
              isSelected
                ? `${pkg.color === 'green' ? 'bg-terminal-green' : ''} ${pkg.color === 'blue' ? 'bg-terminal-blue' : ''} ${pkg.color === 'purple' ? 'bg-terminal-purple' : ''} ${pkg.color === 'yellow' ? 'bg-terminal-yellow' : ''} text-terminal-black`
                : 'border border-terminal-gray text-white hover:border-terminal-green'
            )}
          >
            {isSelected ? 'Selected' : 'Select'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
