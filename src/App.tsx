/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Layout,
  MousePointer2,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const PRESETS = [
  { feature: "회원가입", situation: "이메일 형식 오류" },
  { feature: "로그인", situation: "비밀번호 불일치" },
  { feature: "결제", situation: "잔액 부족" },
  { feature: "검색", situation: "결과 없음" },
  { feature: "프로필 수정", situation: "저장 완료" },
];

const TONES = [
  { id: 'friendly', label: '친절한', description: '부드럽고 따뜻한 느낌' },
  { id: 'professional', label: '전문적인', description: '신뢰감 있고 정중한 느낌' },
  { id: 'concise', label: '간결한', description: '핵심만 짧고 명확하게' },
  { id: 'humorous', label: '유머러스한', description: '재치 있고 즐거운 느낌' },
];

export default function App() {
  const [feature, setFeature] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0].id);
  const [results, setResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateUXWriting = async () => {
    if (!feature || !situation) return;

    setIsLoading(true);
    setResults([]);
    setSelectedIndex(null);
    
    const toneLabel = TONES.find(t => t.id === selectedTone)?.label;

    try {
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: [{ 
          parts: [{ 
            text: `당신은 전문 UX 라이터입니다. 
            입력된 기능(${feature})과 상황(${situation})에 대해 '${toneLabel}' 톤앤매너를 가진 3가지 UX 문구를 제안해주세요. 
            각 문구는 간결하고 명확하며 사용자 중심적이어야 합니다. 
            선택된 톤(${toneLabel})의 특징을 잘 살려주세요.` 
          }] 
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 different UX writing options in the specified tone"
              }
            },
            required: ["options"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"options": []}');
      setResults(data.options.slice(0, 3));
    } catch (error) {
      console.error("Error generating UX writing:", error);
      setResults(["오류가 발생했습니다. 잠시 후 다시 시도해주세요."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetClick = (p: typeof PRESETS[0]) => {
    setFeature(p.feature);
    setSituation(p.situation);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-emerald-600">
              UX Writing Lab
            </h1>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            UX Writing 생성기
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 max-w-xl"
          >
            기능, 상황, 그리고 원하는 톤을 선택하면 AI가 3가지 맞춤형 문구를 제안합니다.
          </motion.p>
        </header>

        {/* Main Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 mb-8"
        >
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <Layout size={14} />
                기능 (Feature)
              </label>
              <input 
                type="text" 
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="예: 회원가입, 결제, 검색..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <AlertCircle size={14} />
                상황 (Situation)
              </label>
              <input 
                type="text" 
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="예: 이메일 중복, 잔액 부족..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-4 mb-8">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Palette size={14} />
              톤앤매너 (Tone & Manner)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    selectedTone === tone.id 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{tone.label}</div>
                  <div className="text-[10px] leading-tight opacity-70">{tone.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-8">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePresetClick(p)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              >
                {p.feature} - {p.situation}
              </button>
            ))}
          </div>

          <button
            onClick={generateUXWriting}
            disabled={isLoading || !feature || !situation}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={20} />
                문구 생성하기
              </>
            )}
          </button>
        </motion.div>

        {/* Result Area */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {results.map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedIndex(index)}
                className={`group relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedIndex === index 
                    ? 'border-emerald-500 bg-emerald-50/30' 
                    : 'border-transparent hover:border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        selectedIndex === index ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        Option 0{index + 1}
                      </span>
                      {selectedIndex === index && (
                        <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                          <MousePointer2 size={10} /> Selected
                        </span>
                      )}
                    </div>
                    <p className={`text-xl font-medium leading-relaxed ${
                      selectedIndex === index ? 'text-emerald-900' : 'text-gray-700'
                    }`}>
                      {text}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(text);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      selectedIndex === index 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 group-hover:text-gray-600'
                    }`}
                  >
                    {copied && selectedIndex === index ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-emerald-600/5 rounded-2xl border border-emerald-600/10 flex items-center gap-3 text-emerald-700 text-sm"
          >
            <AlertCircle size={18} />
            마음에 드는 문구를 클릭하여 선택하거나 복사 버튼을 눌러 바로 사용하세요.
          </motion.div>
        )}

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            © 2026 UX Writing Lab. Powered by Google Gemini.
          </p>
        </footer>
      </div>
    </div>
  );
}
