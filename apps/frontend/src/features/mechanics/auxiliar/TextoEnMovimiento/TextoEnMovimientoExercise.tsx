import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Play, Settings } from 'lucide-react';

interface AnimatedText {
  id: string;
  text: string;
  animation: string;
  duration: number;
  color: string;
  fontSize: number;
}

export const TextoEnMovimientoExercise: React.FC = () => {
  const [texts, setTexts] = useState<AnimatedText[]>([]);
  const [currentText, setCurrentText] = useState('Marie Curie');
  const [selectedAnimation, setSelectedAnimation] = useState('fadeIn');
  const [duration, setDuration] = useState(2);
  const [color, setColor] = useState('#f97316');
  const [fontSize, setFontSize] = useState(48);
  const [isPlaying, setIsPlaying] = useState(false);

  const animations = [
    {
      id: 'fadeIn',
      name: 'Aparecer',
      variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    },
    {
      id: 'slideUp',
      name: 'Deslizar Arriba',
      variants: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    },
    {
      id: 'slideDown',
      name: 'Deslizar Abajo',
      variants: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    },
    {
      id: 'slideLeft',
      name: 'Deslizar Izquierda',
      variants: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    },
    {
      id: 'slideRight',
      name: 'Deslizar Derecha',
      variants: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    },
    {
      id: 'scale',
      name: 'Escalar',
      variants: { hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
    },
    {
      id: 'rotate',
      name: 'Rotar',
      variants: { hidden: { rotate: -180, opacity: 0 }, visible: { rotate: 0, opacity: 1 } },
    },
    {
      id: 'bounce',
      name: 'Rebotar',
      variants: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    },
  ];

  const addText = () => {
    if (!currentText.trim()) return;

    const newText: AnimatedText = {
      id: Date.now().toString(),
      text: currentText,
      animation: selectedAnimation,
      duration,
      color,
      fontSize,
    };

    setTexts([...texts, newText]);
  };

  const getAnimationVariants = (animationId: string) => {
    return animations.find((a) => a.id === animationId)?.variants || animations[0].variants;
  };

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-detective bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-8 w-8 text-detective-orange" />
              <h1 className="text-3xl font-bold text-detective-text">Texto en Movimiento</h1>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 rounded-detective bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              <Play className="h-5 w-5" />
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>
          </div>
          <p className="text-detective-text-secondary">
            Crea animaciones de texto sobre Marie Curie y sus descubrimientos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-4 rounded-detective bg-white p-6 shadow-card">
            <h3 className="flex items-center gap-2 font-bold text-detective-text">
              <Settings className="h-5 w-5" />
              Configuración
            </h3>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Texto:</label>
              <input
                type="text"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Escribe tu texto..."
                className="w-full rounded-detective border-2 border-gray-300 px-3 py-2 focus:border-detective-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Animación:</label>
              <select
                value={selectedAnimation}
                onChange={(e) => setSelectedAnimation(e.target.value)}
                className="w-full rounded-detective border-2 border-gray-300 px-3 py-2 focus:border-detective-orange focus:outline-none"
              >
                {animations.map((anim) => (
                  <option key={anim.id} value={anim.id}>
                    {anim.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">
                Duración: {duration}s
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full accent-detective-orange"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">
                Tamaño: {fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="96"
                step="4"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-detective-orange"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Color:</label>
              <div className="flex gap-2">
                {['#f97316', '#1e3a8a', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-10 w-10 rounded-full border-4 ${color === c ? 'border-detective-text' : 'border-gray-300'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={addText}
              className="w-full rounded-detective bg-detective-orange py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              Agregar Texto
            </button>
          </div>

          <div
            className="overflow-hidden rounded-detective bg-detective-text shadow-card lg:col-span-3"
            style={{ minHeight: '600px' }}
          >
            <div className="relative flex h-full w-full items-center justify-center p-12">
              {texts.map((text, index) => (
                <motion.div
                  key={text.id}
                  initial="hidden"
                  animate={isPlaying ? 'visible' : 'hidden'}
                  variants={getAnimationVariants(text.animation)}
                  transition={
                    text.animation === 'bounce'
                      ? {
                          duration: text.duration,
                          delay: index * (text.duration + 0.5),
                          repeat: isPlaying ? Infinity : 0,
                          repeatDelay: (texts.length - 1) * (text.duration + 0.5),
                          type: 'spring',
                          stiffness: 300,
                        }
                      : {
                          duration: text.duration,
                          delay: index * (text.duration + 0.5),
                          repeat: isPlaying ? Infinity : 0,
                          repeatDelay: (texts.length - 1) * (text.duration + 0.5),
                        }
                  }
                  className="absolute"
                  style={{
                    color: text.color,
                    fontSize: `${text.fontSize}px`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {text.text}
                </motion.div>
              ))}

              {texts.length === 0 && (
                <div className="text-center text-white/50">
                  <Type className="mx-auto mb-4 h-20 w-20" />
                  <p className="text-xl">Agrega textos animados</p>
                  <p className="text-sm">para crear tu animación</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {texts.length > 0 && (
          <div className="rounded-detective bg-white p-6 shadow-card">
            <h3 className="mb-4 font-bold text-detective-text">Secuencia de Animación:</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {texts.map((text, index) => (
                <div key={text.id} className="rounded-detective border-2 border-gray-300 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-detective-blue text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-detective-text">{text.text}</span>
                  </div>
                  <p className="text-xs text-detective-text-secondary">
                    {animations.find((a) => a.id === text.animation)?.name} • {text.duration}s
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
