import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { UserRound, Send, X, MessageSquare, Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { getAdvisorResponse } from '../services/aiService';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useUIStore } from '../features/ui/store/uiStore';

export default function AINexus() {
  const { profile } = useAuth();
  const activeModal = useUIStore((state) => state.activeModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const isOpen = activeModal === 'ai_advisor';

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Buenas tardes. Terminal de inversión I LIKE Real Estate operativa. Soy su Asesora IA, especializada en la optimización de portafolios dentro del ecosistema inmobiliario metropolitano. Mi función es proporcionar inteligencia de mercado basada en datos precisos para asegurar una ejecución estratégica de alto nivel. Ya sea que su objetivo sea realizar un análisis de rendimiento exhaustivo, evaluar la velocidad urbana de un sector emergente o diversificar mediante la tokenización de activos, estoy preparada para procesar los indicadores clave que maximicen su ROI. ¿Qué segmento del mercado requiere nuestra atención hoy? Podemos iniciar con una evaluación de tasas de capitalización o un mapeo de absorción en distritos de alto potencial.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition'))) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert('Tu navegador no soporta reconocimiento de voz.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (!shouldSpeak) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.lang.includes('es') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('mujer') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('laura')));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const organizationId = profile?.organizationId || 'default-org';
    const response = await getAdvisorResponse(userMsg, organizationId, messages);
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
    
    const voiceText = response.replace(/[*#_~`]/g, '');
    speak(voiceText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.95 }}
          className="glass-panel fixed bottom-28 right-6 md:right-8 w-[92vw] md:w-[380px] h-[550px] max-h-[70vh] rounded-2xl flex flex-col overflow-hidden border border-outline shadow-2xl backdrop-blur-3xl z-[250] bg-surface-card/95"
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-primary/5">
            <div className="flex items-center gap-2">
              <UserRound className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm tracking-widest text-primary uppercase">Asesora IA</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShouldSpeak(!shouldSpeak)} 
                className={`${shouldSpeak ? 'text-primary' : 'text-zinc-400 hover:text-primary'} transition-colors`}
                title={shouldSpeak ? 'Desactivar voz' : 'Activar voz'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={closeModal} className="text-zinc-400 hover:text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-zinc-100">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-[#101420] border border-primary/20 shadow-sm font-semibold' 
                    : 'bg-[#131722]/80 text-zinc-100 border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#131722]/80 p-3 rounded-xl border border-white/5">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 flex gap-2 bg-[#101420]/80">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-zinc-400 hover:text-primary hover:bg-white/10'}`}
              title="Dictar mensaje"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Escuchando...' : 'Preguntar al asesor...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder-zinc-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="p-2 bg-primary text-[#101420] rounded-lg hover:bg-primary-dim transition-colors disabled:opacity-50 flex items-center justify-center font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
