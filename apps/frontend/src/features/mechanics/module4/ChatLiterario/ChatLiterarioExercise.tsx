import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, MessageCircle, Award } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { normalizeProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';
import { ExerciseProps, ChatLiterarioState, Message } from './chatLiterarioTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';

export const ChatLiterarioExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // State management
  const [messages, setMessages] = useState<Message[]>(
    initialData?.messages || [
      {
        id: '1',
        sender: 'marie',
        text: '¡Bonjour! Soy Marie Curie. Estoy trabajando en mi laboratorio investigando materiales radioactivos. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
      },
    ],
  );
  const [input, setInput] = useState('');
  const [activeCharacter, setActiveCharacter] = useState<'marie' | 'pierre'>(
    initialData?.activeCharacter || 'marie',
  );
  const [startTime] = useState(new Date());
  const [_showFeedback, _setShowFeedback] = useState(false);
  const [_feedback] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const responses = {
    marie: [
      'La investigación científica requiere dedicación y curiosidad incansable. ¿Qué aspectos de la radioactividad te interesan?',
      'El descubrimiento del polonio y el radio fue resultado de años de trabajo meticuloso. La perseverancia es clave en la ciencia.',
      'Como mujer en la ciencia, he enfrentado muchos obstáculos, pero la pasión por el conocimiento siempre me ha impulsado.',
      'Los dos Premios Nobel han sido un honor, pero lo más importante es contribuir al avance científico de la humanidad.',
    ],
    pierre: [
      'Marie y yo trabajamos juntos en la investigación de la radioactividad. La colaboración científica es fundamental.',
      'El estudio de los rayos invisibles emitidos por el uranio abrió un mundo completamente nuevo en la física.',
      'La investigación científica requiere precisión y observación cuidadosa. Cada experimento nos acerca más a la verdad.',
      'Marie es una científica extraordinaria. Su dedicación y talento son incomparables.',
    ],
  };

  // Calculate progress
  const calculateProgress = () => {
    const minMessages = exercise?.minMessages || 5;
    const userMessages = messages.filter((m) => m.sender === 'user').length;
    return Math.min(Math.round((userMessages / minMessages) * 100), 100);
  };

  // Calculate score
  const calculateScore = () => {
    const userMessages = messages.filter((m) => m.sender === 'user').length;
    const minMessages = exercise?.minMessages || 5;
    const conversationScore = Math.min((userMessages / minMessages) * 70, 70);
    const engagementScore = userMessages > minMessages ? 30 : (userMessages / minMessages) * 30;
    return Math.round(conversationScore + engagementScore);
  };

  // Get exercise instance
  const exerciseInstance = exercise || { minMessages: 5 };

  // Progress tracking

  useEffect(() => {
    const progress = calculateProgress();
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    onProgressUpdate?.(
      normalizeProgressUpdate(
        progress,
        messages.length,
        exerciseInstance.minMessages,
        0, // hintsUsed - no disponible en este componente
        timeSpent,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, exerciseInstance.minMessages, startTime, onProgressUpdate]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState: ChatLiterarioState = {
        messages,
        activeCharacter,
      };
      saveProgressUtil(exerciseId || 'chat-literario', currentState);
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [messages, activeCharacter, exerciseId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate response after 1 second
    setTimeout(() => {
      const responseText =
        responses[activeCharacter][Math.floor(Math.random() * responses[activeCharacter].length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: activeCharacter,
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const getAvatar = (sender: Message['sender']) => {
    if (sender === 'user') {
      return <User className="h-6 w-6 text-white" />;
    }
    return <Bot className="h-6 w-6 text-white" />;
  };

  const getAvatarBg = (sender: Message['sender']) => {
    if (sender === 'user') return 'bg-detective-blue';
    if (sender === 'marie') return 'bg-detective-orange';
    return 'bg-detective-gold';
  };

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Exercise Description */}
          <div className="rounded-detective bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white shadow-detective-lg">
            <div className="mb-2 flex items-center gap-3">
              <MessageCircle className="h-8 w-8" />
              <h2 className="text-detective-2xl font-bold">Chat Literario con Marie Curie</h2>
            </div>
            <p className="text-detective-base opacity-90">
              Conversa con Marie Curie y Pierre Curie sobre sus descubrimientos científicos.
            </p>
          </div>

          {/* Character Selection */}
          <div className="flex gap-3">
            <DetectiveButton
              variant={activeCharacter === 'marie' ? 'primary' : 'secondary'}
              onClick={() => setActiveCharacter('marie')}
              className="flex-1"
            >
              Marie Curie
            </DetectiveButton>
            <DetectiveButton
              variant={activeCharacter === 'pierre' ? 'gold' : 'secondary'}
              onClick={() => setActiveCharacter('pierre')}
              className="flex-1"
            >
              Pierre Curie
            </DetectiveButton>
          </div>

          {/* Chat Interface */}
          <DetectiveCard
            variant="default"
            padding="none"
            className="flex flex-col"
            style={{ height: '600px' }}
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getAvatarBg(message.sender)}`}
                  >
                    {getAvatar(message.sender)}
                  </div>
                  <div
                    className={`flex-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[80%] rounded-detective px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-detective-blue text-white'
                          : 'border-2 border-gray-200 bg-detective-bg text-detective-text'
                      }`}
                    >
                      {message.sender !== 'user' && (
                        <p className="mb-1 text-sm font-bold text-detective-orange">
                          {message.sender === 'marie' ? 'Marie Curie' : 'Pierre Curie'}
                        </p>
                      )}
                      <p>{message.text}</p>
                    </div>
                    <p className="mt-1 text-xs text-detective-text-secondary">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Escribe tu mensaje a ${activeCharacter === 'marie' ? 'Marie' : 'Pierre'}...`}
                  className="flex-1 rounded-detective border-2 border-detective-border-medium px-4 py-2 transition-colors focus:border-detective-orange focus:outline-none"
                />
                <DetectiveButton
                  variant="primary"
                  onClick={handleSend}
                  icon={<Send className="h-5 w-5" />}
                  disabled={!input.trim()}
                >
                  Enviar
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>

          {/* Stats Card */}
          <DetectiveCard variant="default" padding="md">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-detective-orange" />
              <h3 className="font-bold text-detective-text">Estadísticas</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-detective-text-secondary">Mensajes enviados</p>
                <p className="text-2xl font-bold text-detective-text">
                  {messages.filter((m) => m.sender === 'user').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-detective-text-secondary">Mensajes totales</p>
                <p className="text-2xl font-bold text-detective-text">{messages.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-detective-text-secondary">Personaje activo</p>
                <p className="text-2xl font-bold text-detective-text">
                  {activeCharacter === 'marie' ? 'Marie' : 'Pierre'}
                </p>
              </div>
            </div>
          </DetectiveCard>
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {_feedback && (
        <FeedbackModal
          isOpen={_showFeedback}
          feedback={_feedback}
          onClose={() => {
            _setShowFeedback(false);
            if (_feedback.type === 'success' && onComplete) {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete(calculateScore(), timeSpent);
            }
          }}
          onRetry={() => {
            _setShowFeedback(false);
          }}
        />
      )}
    </>
  );
};
