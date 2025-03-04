import cn from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  title?: string;
  color?: string;
  active?: boolean;
  icon?: LucideIcon;
}

export const DockItem = ({ onClick, title, color, active, icon: Icon, ...props }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        {...props}
        type="button"
        onClick={onClick}
        className={cn(
          'grid size-9 cursor-pointer place-items-center rounded-full border border-slate-300 outline-offset-2 transition-all hover:bg-slate-100 data-[active=true]:outline-2',
          props.className,
        )}
        style={{ backgroundColor: color, outlineColor: color, borderColor: color }}
        data-active={active}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {Icon && <Icon className="size-5 text-slate-900" />}
      </button>
      <AnimatePresence>
        {showTooltip && title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15, delay: 0.1 }}
            className="absolute bottom-full left-1/2 mb-0.5 hidden -translate-x-1/2 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs md:block"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
