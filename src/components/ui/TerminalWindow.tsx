'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
  showControls?: boolean;
}

export default function TerminalWindow({
  title = 'terminal',
  children,
  className,
  showControls = true,
}: TerminalWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'terminal-window bg-terminal-dark border border-terminal-gray rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Terminal header */}
      <div className="terminal-header bg-terminal-gray/50 px-4 py-3 flex items-center justify-between border-b border-terminal-gray">
        <div className="flex items-center gap-3">
          {showControls && (
            <div className="flex items-center gap-2">
              <div className="terminal-dot bg-terminal-red" />
              <div className="terminal-dot bg-terminal-yellow" />
              <div className="terminal-dot bg-terminal-green" />
            </div>
          )}
          <span className="text-terminal-muted text-sm font-mono">{title}</span>
        </div>
        <div className="text-terminal-muted text-xs font-mono">v1.0</div>
      </div>

      {/* Terminal content */}
      <div className="p-4 md:p-6">{children}</div>
    </motion.div>
  );
}
