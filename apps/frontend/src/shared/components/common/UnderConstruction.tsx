import React from 'react';
import { Construction, Wrench, Clock, ArrowLeft, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface UnderConstructionProps {
  feature: string;
  description?: string;
  estimatedDate?: string;
  variant?: 'page' | 'section' | 'button';
  className?: string;
  onBackClick?: () => void;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  feature,
  description,
  estimatedDate,
  variant = 'page',
  className = '',
  onBackClick,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const floatVariants = {
    float: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const rotateVariants = {
    rotate: {
      rotate: [0, 10, 0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  // Render button variant (compact badge/tooltip style)
  if (variant === 'button') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
          'bg-gradient-to-r from-detective-orange-400 to-detective-orange',
          'text-xs font-medium text-white shadow-orange',
          'border border-detective-orange-dark',
          className,
        )}
        role="status"
        aria-label={`${feature} - Coming Soon`}
      >
        <Construction size={14} className="flex-shrink-0" />
        <span>Coming Soon</span>
      </motion.div>
    );
  }

  // Render section variant (medium-sized card)
  if (variant === 'section') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'relative overflow-hidden rounded-detective-lg',
          'bg-gradient-to-br from-detective-bg to-detective-bg-secondary',
          'border-2 border-dashed border-detective-orange',
          'p-8 shadow-card-detective',
          className,
        )}
        role="region"
        aria-label={`${feature} under construction`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-4 top-4">
            <Hammer size={64} className="text-detective-orange" />
          </div>
          <div className="absolute bottom-4 right-4">
            <Wrench size={64} className="text-detective-blue" />
          </div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center text-center">
          <motion.div
            variants={floatVariants}
            animate="float"
            className="mb-4 rounded-full bg-white p-4 shadow-orange"
          >
            <Construction size={48} className="text-detective-orange" />
          </motion.div>

          <h3 className="mb-2 text-detective-2xl font-bold text-detective-blue">{feature}</h3>

          {description && (
            <p className="mb-3 max-w-md text-detective-base text-detective-text-secondary">
              {description}
            </p>
          )}

          {estimatedDate && (
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Clock size={16} className="text-detective-gold" />
              <span className="text-detective-sm font-medium text-detective-text">
                {estimatedDate}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Render page variant (full page placeholder)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative flex min-h-[600px] flex-col items-center justify-center',
        'bg-gradient-to-br from-detective-bg via-white to-detective-bg-secondary',
        'px-4 py-12',
        className,
      )}
      role="main"
      aria-label={`${feature} page under construction`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <motion.div variants={rotateVariants} animate="rotate" className="absolute left-20 top-20">
          <Construction size={120} className="text-detective-blue" />
        </motion.div>
        <motion.div
          variants={rotateVariants}
          animate="rotate"
          className="absolute bottom-20 right-20"
        >
          <Wrench size={100} className="text-detective-orange" />
        </motion.div>
        <motion.div variants={rotateVariants} animate="rotate" className="absolute right-40 top-40">
          <Hammer size={80} className="text-detective-gold" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Icon container with animation */}
        <motion.div
          variants={floatVariants}
          animate="float"
          className="mb-8 rounded-full bg-white p-8 shadow-orange-lg"
        >
          <Construction size={96} className="text-detective-orange" />
        </motion.div>

        {/* Feature name */}
        <h1 className="mb-4 text-detective-3xl font-bold text-detective-blue md:text-5xl">
          {feature}
        </h1>

        {/* Under construction badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-detective-orange-400 to-detective-orange px-6 py-3 text-white shadow-orange">
          <Wrench size={20} />
          <span className="text-detective-lg font-semibold">Under Construction</span>
        </div>

        {/* Description */}
        {description && (
          <p className="mb-6 text-detective-lg leading-relaxed text-detective-text-secondary">
            {description}
          </p>
        )}

        {/* Estimated date */}
        {estimatedDate && (
          <div className="mb-8 flex items-center gap-3 rounded-detective bg-white px-6 py-4 shadow-card-detective">
            <Clock size={24} className="text-detective-gold" />
            <div className="text-left">
              <p className="text-detective-xs uppercase tracking-wide text-detective-text-secondary">
                Estimated Availability
              </p>
              <p className="text-detective-lg font-bold text-detective-blue">{estimatedDate}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-8 h-px w-32 bg-gradient-to-r from-transparent via-detective-border-medium to-transparent" />

        {/* Additional message */}
        <p className="mb-8 max-w-md text-detective-base text-detective-text-secondary">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>

        {/* Back button */}
        {onBackClick && (
          <motion.button
            onClick={onBackClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'inline-flex items-center gap-2 rounded-detective',
              'bg-detective-blue px-6 py-3 text-white',
              'font-semibold shadow-detective transition-all',
              'hover:bg-detective-blue/90 hover:shadow-detective-lg',
              'focus:outline-none focus:ring-2 focus:ring-detective-blue focus:ring-offset-2',
            )}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </motion.button>
        )}
      </div>

      {/* Construction tape effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-detective-gold via-black to-detective-gold opacity-10">
        <div
          className="h-full bg-repeat-x"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.1) 35px, rgba(0,0,0,.1) 70px)',
          }}
        />
      </div>
    </motion.div>
  );
};

UnderConstruction.displayName = 'UnderConstruction';
