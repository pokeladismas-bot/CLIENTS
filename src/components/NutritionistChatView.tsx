import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, Send, Sparkles, User, Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { GlucoseLog, MealLog, UserProfile } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface NutritionistChatViewProps {
  profile: UserProfile;
  latestGlucose?: GlucoseLog;
  recentMeals: MealLog[];
}

const QUICK_QUESTIONS = [
  'Je, ninaweza kula Ugali wa Sembe kama sukari yangu ni 150?',
  'Ni vyakula gani vinasaidia kushusha sukari haraka?',
  'Kiasi gani cha parachichi kinanifaa kwa siku?',
  'Nipe mfano wa kifungua kinywa kisichopandisha sukari kabisa.',
  'Je, chai ya mdalasini inasaidia kweli udhibiti wa kisukari?',
];

export const NutritionistChatView: React.FC<NutritionistChatViewProps> = ({
  profile,
  latestGlucose,
  recentMeals,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Habari ${profile.name}! Mimi ni AfyaLishe AI, Mshauri wako wa Lishe ya Kisukari. 

Ninaweza kukusaidia kuchagua vyakula vinavyofaa, kupima wanga wa milo ya kitanzania (Ugali wa dona/ulezi, ndizi, samaki, mboga za majani), na kutoa ushauri maalum kulingana na kiwango chako cha sasa cha sukari (${latestGlucose ? `${latestGlucose.value} mg/dL` : 'Haijarekodiwa leo'}).

Una swali gani kuhusu lishe yako leo?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const todayMeals = recentMeals.filter(
        (m) => new Date(m.timestamp).toDateString() === new Date().toDateString()
      );
      const totalCarbsToday = todayMeals.reduce((acc, m) => acc + (m.totalCarbs || 0), 0);

      const res = await fetch('/api/chat-nutritionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: profile,
          latestGlucose: latestGlucose?.value,
          todayNutrition: {
            carbs: totalCarbsToday,
            targetCarbs: profile.dailyCarbLimitGrams,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Imeshindikana kuwasiliana na mtaalamu wa lishe.');
      }

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: json.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Samahani, kulikuwa na hitilafu ya mtandao. Tafadhali jaribu tena baada ya muda mfupi.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Mshauri wa Lishe ya Kisukari (AI Nutritionist)</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                Muda Halisi
              </span>
            </h2>
            <p className="text-xs text-slate-500">Uliza swali lolote kuhusu chakula, wanga, na udhibiti wa sukari</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="Anza Mazungumzo Mapya"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-inner h-[500px] flex flex-col justify-between overflow-hidden">
        {/* Messages List */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs font-bold text-xs">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
              <span>Mshauri wa Lishe anaandika jibu...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-full text-[11px] font-semibold text-slate-600 transition-all flex-shrink-0 shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 mt-2"
          >
            <input
              type="text"
              placeholder="Uliza chochote kuhusu chakula na sukari yako..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
