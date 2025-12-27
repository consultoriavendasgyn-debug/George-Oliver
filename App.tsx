
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Trash2, History, ChevronRight, Activity, Zap, 
  PieChart as PieIcon, RefreshCw, X, Apple, Pizza, Carrot, 
  Coffee, Salad, Cherry, Drumstick, Flame, Bike, Timer, Footprints, 
  Dumbbell, LogOut, Mail, Lock, Sparkles, User as UserIcon, ShieldCheck, Trophy, 
  Scale, Calendar, Users
} from 'lucide-react';
import { analyzeFoodImage, calculateProfileStatus } from './services/geminiService';
import { FoodAnalysisResponse, AnalysisHistory, User, ProfileAnalysis } from './types';
import NutrientChart from './components/NutrientChart';

const ZeusLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} relative z-glow flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="z-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path 
        d="M20,25 L80,25 L25,75 L80,75" 
        fill="none" 
        stroke="url(#z-grad)" 
        strokeWidth="18" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  </div>
);

const DecorativeIcons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <Apple className="absolute top-20 left-10 animate-float" size={80} style={{ animationDelay: '0s' }} />
    <Pizza className="absolute top-1/4 right-20 animate-float" size={100} style={{ animationDelay: '1s' }} />
    <Carrot className="absolute bottom-40 left-1/4 animate-float" size={90} style={{ animationDelay: '2s' }} />
    <Coffee className="absolute top-1/2 left-20 animate-float" size={70} style={{ animationDelay: '3s' }} />
    <Salad className="absolute bottom-20 right-1/4 animate-float" size={110} style={{ animationDelay: '4s' }} />
    <Cherry className="absolute top-10 right-1/3 animate-float" size={60} style={{ animationDelay: '1.5s' }} />
    <Drumstick className="absolute bottom-1/3 left-10 animate-float" size={85} style={{ animationDelay: '2.5s' }} />
  </div>
);

const ExerciseIcon = ({ activity }: { activity: string }) => {
  const name = activity.toLowerCase();
  if (name.includes('corrida')) return <Flame className="text-orange-500" />;
  if (name.includes('bike') || name.includes('ciclismo')) return <Bike className="text-blue-500" />;
  if (name.includes('caminhada')) return <Footprints className="text-emerald-500" />;
  return <Dumbbell className="text-purple-500" />;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ 
    email: '', 
    name: '', 
    password: '', 
    gender: 'Masculino' as User['gender'], 
    age: 25, 
    weight: 75 
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('zeus_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedHistory = localStorage.getItem('zeus_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const analysis = await calculateProfileStatus({
        name: loginForm.name,
        gender: loginForm.gender,
        age: loginForm.age,
        weight: loginForm.weight
      });
      
      const newUser: User = { 
        email: loginForm.email, 
        name: loginForm.name,
        gender: loginForm.gender,
        age: loginForm.age,
        weight: loginForm.weight,
        analysis: analysis
      };
      
      setUser(newUser);
      localStorage.setItem('zeus_user', JSON.stringify(newUser));
    } catch (err) {
      console.error("Erro ao processar perfil:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zeus_user');
    reset();
  };

  const saveToHistory = (data: FoodAnalysisResponse, imageUrl: string) => {
    const newItem: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl,
      data
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('zeus_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const analysis = await analyzeFoodImage(base64);
      setResult(analysis);
      saveToHistory(analysis, base64);
    } catch (err) {
      setError('A conexão com o Olimpo falhou. Tente novamente.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setAnalyzing(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('zeus_history');
  };

  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-x-hidden">
        <DecorativeIcons />
        <div className="glass p-10 rounded-[3rem] w-full max-w-2xl relative z-10 animate-in fade-in zoom-in duration-500 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <ZeusLogo className="w-24 h-24 mb-4" />
            <h1 className="text-5xl font-black text-white tracking-tighter">ZEUS</h1>
            <p className="text-blue-300 text-xs font-black uppercase tracking-[0.3em] mt-2">Medidor de Calorias</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">Nome do Herói</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input 
                    type="text" required placeholder="Nome"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20 font-medium"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input 
                    type="email" required placeholder="E-mail"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-white/20 font-medium"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">Sexo</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none font-medium"
                    value={loginForm.gender}
                    onChange={(e) => setLoginForm({...loginForm, gender: e.target.value as any})}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">Idade</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input 
                    type="number" required placeholder="Idade" min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    value={loginForm.age}
                    onChange={(e) => setLoginForm({...loginForm, age: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">Peso Atual (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input 
                    type="number" required placeholder="Peso" step="0.1"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    value={loginForm.weight}
                    onChange={(e) => setLoginForm({...loginForm, weight: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-200/50 uppercase ml-2 tracking-widest">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                  <input 
                    type="password" required placeholder="Senha"
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={isLoggingIn}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-[1.5rem] transition-all shadow-xl shadow-blue-900/40 transform active:scale-95 flex items-center justify-center gap-3 overflow-hidden group mt-6"
            >
              {isLoggingIn ? (
                <RefreshCw className="animate-spin" />
              ) : (
                <>
                  Domine suas Calorias
                  <ShieldCheck size={24} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <DecorativeIcons />

      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 h-20">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZeusLogo className="w-12 h-12" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight leading-none text-white">ZEUS</h1>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Medidor de Calorias</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className="p-3 hover:bg-white/10 rounded-2xl relative group transition-all">
              <History size={24} className="text-blue-300 group-hover:text-white transition-colors" />
              {history.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#05070a]"></span>}
            </button>
            <button onClick={handleLogout} className="p-3 hover:bg-red-500/10 text-blue-300 hover:text-red-400 rounded-2xl transition-all"><LogOut size={24} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* PHYSICAL STATUS CARD - NEW AI COMPONENT */}
        {!image && !showHistory && user.analysis && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-6 duration-700">
             <div className="glass p-8 rounded-[3rem] border-gold bg-gradient-to-br from-yellow-500/10 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Scale size={140} className="rotate-12" /></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                   <div className="shrink-0 flex flex-col items-center">
                      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-3 shadow-xl shadow-blue-900/40">
                         <Activity size={48} className="text-white" />
                      </div>
                      <div className="text-xs font-black text-yellow-500 uppercase tracking-widest">{user.analysis.healthStatus}</div>
                   </div>
                   
                   <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap gap-4">
                         <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-blue-200/30 uppercase block">Peso Ideal IA</span>
                            <span className="text-xl font-black text-white">{user.analysis.idealWeightRange.min} - {user.analysis.idealWeightRange.max} kg</span>
                         </div>
                         <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-blue-200/30 uppercase block">Peso Atual</span>
                            <span className="text-xl font-black text-white">{user.weight} kg</span>
                         </div>
                      </div>
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl italic text-blue-100/70">
                         <Sparkles className="inline-block text-yellow-500 mr-2 mb-1" size={16} />
                         "{user.analysis.heroAdvice}"
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {!image && !showHistory && (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-700">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6 border-blue-500/20">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Sabedoria Nutricional AI</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Domine suas <br />
                <span className="gradient-text">Calorias.</span>
              </h2>
              <p className="text-blue-200/60 max-w-lg mx-auto text-xl font-medium">
                O medidor definitivo para uma vida lendária. <br />
                Identifique pratos instantaneamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-12 bg-blue-600 hover:bg-blue-500 text-white rounded-[3rem] transition-all transform hover:-translate-y-3 shadow-2xl shadow-blue-900/60 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 to-transparent opacity-50"></div>
                <div className="relative z-10 w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Camera size={40} />
                </div>
                <span className="font-black text-2xl relative z-10 tracking-tight">SCANNER ZEUS</span>
                <span className="text-xs font-bold opacity-60 mt-2 relative z-10 uppercase tracking-widest">Câmera Real</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center p-12 glass hover:bg-white/5 text-white rounded-[3rem] transition-all transform hover:-translate-y-3 shadow-2xl border-white/5"
              >
                <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-all">
                  <Upload size={40} className="text-blue-400" />
                </div>
                <span className="font-black text-2xl tracking-tight">IMPORTAR</span>
                <span className="text-xs font-bold opacity-40 mt-2 uppercase tracking-widest">Galeria de Fotos</span>
              </button>
            </div>
          </div>
        )}

        {image && !showHistory && (
          <div className="space-y-10 max-w-3xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5 aspect-video group">
              <img src={image} alt="Refeição" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
              <button onClick={reset} className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-3xl border border-white/10 transition-all z-20"><X size={24} /></button>
              {analyzing && (
                <div className="absolute inset-0 glass flex flex-col items-center justify-center text-white z-30">
                  <div className="relative w-32 h-32 mb-8">
                    <ZeusLogo className="w-full h-full animate-pulse z-glow" />
                    <div className="absolute inset-0 border-8 border-blue-500/20 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-3xl font-black gradient-text">Zeus Invocado...</p>
                  <p className="text-blue-200/50 text-sm mt-3 font-bold tracking-[0.3em] uppercase">Mapeando Nutrientes</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 glass p-8 rounded-[2.5rem] border-l-8 border-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Trophy size={120} /></div>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Relatório do Olimpo</h3>
                        <div className="text-4xl font-black text-white">{result.mealType}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-blue-200/40 uppercase mb-2">Meta Ideal</div>
                        <div className="text-2xl font-black text-white tracking-tight">{result.idealCaloriesRange.min}-{result.idealCaloriesRange.max} <span className="text-sm opacity-40">kcal</span></div>
                      </div>
                    </div>
                    <div className="mt-8 relative h-5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                      <div className={`h-full transition-all duration-1000 ease-out rounded-full ${result.totalCalories > result.idealCaloriesRange.max ? 'bg-orange-500' : 'bg-blue-500'} shadow-[0_0_15px_rgba(59,130,246,0.5)]`} style={{ width: `${Math.min((result.totalCalories / result.idealCaloriesRange.max) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center items-center border-gold">
                    <Zap className="text-yellow-400 mb-3" size={32} />
                    <div className="text-xs font-black text-yellow-400/50 uppercase tracking-widest mb-1">Impacto Total</div>
                    <div className="text-5xl font-black text-white">{result.totalCalories}</div>
                    <div className="text-xs font-bold text-blue-200/40 mt-1 uppercase">KCAL</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2 bg-yellow-500 text-black rounded-full font-black text-xs uppercase tracking-widest shadow-xl">SABEDORIA DE ZEUS</div>
                  <div className="glass p-10 rounded-[3rem] border-2 border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent">
                    <h3 className="text-2xl font-black text-white mb-8 text-center flex items-center justify-center gap-3"><Sparkles className="text-yellow-400" /> Melhores Caminhos Alimentares</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {result.healthyAlternatives.map((alt, idx) => (
                        <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/30 transition-all group hover:bg-yellow-500/5">
                          <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Trophy size={20} className="text-yellow-500" /></div>
                          <h4 className="font-black text-white text-xl mb-3 leading-tight">{alt.title}</h4>
                          <p className="text-blue-100/60 text-sm leading-relaxed">{alt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <StatMiniCard icon={<Activity size={16} />} label="Proteínas" value={result.totalMacros.protein} unit="g" color="blue" />
                  <StatMiniCard icon={<Zap size={16} />} label="Carbos" value={result.totalMacros.carbs} unit="g" color="cyan" />
                  <StatMiniCard icon={<PieIcon size={16} />} label="Gorduras" value={result.totalMacros.fats} unit="g" color="amber" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3"><PieIcon className="text-blue-400" /> Balanço de Forças</h3>
                    <div className="h-72"><NutrientChart nutrition={result.totalMacros} /></div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/10 to-transparent">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3"><Flame className="text-orange-500" /> Protocolo de Queima</h3>
                    <div className="space-y-4">
                      {result.exerciseSuggestions.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl"><ExerciseIcon activity={ex.activity} /></div>
                            <div>
                              <div className="font-black text-white text-lg">{ex.activity}</div>
                              <div className="text-[10px] text-blue-200/30 uppercase font-black">{ex.intensity}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-white">{ex.durationMinutes}<span className="text-xs font-normal opacity-40 ml-1">min</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8 pb-12">
                  <button onClick={reset} className="flex items-center gap-4 px-12 py-6 glass hover:bg-white/10 text-white rounded-full font-black text-xl transition-all transform hover:scale-105 active:scale-95 border-blue-500/30 shadow-2xl"><RefreshCw size={24} /> NOVA ANÁLISE</button>
                </div>
              </div>
            )}
          </div>
        )}

        {showHistory && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-500 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black text-white">Arquivo <span className="text-blue-500">Zeus</span></h2>
              <div className="flex gap-3">
                <button onClick={clearHistory} className="p-4 glass text-red-400 hover:text-red-300 rounded-2xl transition-all hover:bg-red-500/10"><Trash2 size={24} /></button>
                <button onClick={() => setShowHistory(false)} className="p-4 glass text-white rounded-2xl transition-all hover:bg-white/10"><X size={24} /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {history.map((item) => (
                <button key={item.id} onClick={() => { setImage(item.imageUrl); setResult(item.data); setShowHistory(false); }} className="flex items-center gap-6 p-6 glass rounded-[2.5rem] hover:bg-white/5 transition-all text-left">
                  <img src={item.imageUrl} className="w-24 h-24 rounded-3xl object-cover" alt="Past meal" />
                  <div className="flex-1">
                    <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{new Date(item.timestamp).toLocaleDateString()}</div>
                    <div className="text-2xl font-black text-white">{item.data.totalCalories} kcal</div>
                    <div className="text-sm text-blue-200/40 uppercase font-bold">{item.data.mealType}</div>
                  </div>
                  <ChevronRight size={24} className="text-white opacity-20" />
                </button>
              ))}
              {history.length === 0 && <div className="text-center py-20 glass rounded-[3rem] opacity-30 text-xl font-bold uppercase tracking-widest">Nenhuma Memória</div>}
            </div>
          </div>
        )}

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
      </main>

      {!image && !showHistory && (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex gap-4">
          <button onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-4 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-900/60"><Camera size={28} /> SCANNER</button>
          <button onClick={() => fileInputRef.current?.click()} className="p-6 glass text-white rounded-[2rem]"><Upload size={28} /></button>
        </div>
      )}
    </div>
  );
};

const StatMiniCard = ({ icon, label, value, unit, color }: { icon: any, label: string, value: any, unit: string, color: string }) => {
  const colors: Record<string, string> = {
    blue: "text-blue-400 border-blue-500/10 bg-blue-500/5",
    cyan: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5",
    amber: "text-amber-400 border-amber-500/10 bg-amber-500/5"
  };

  return (
    <div className={`glass p-6 rounded-[2rem] border transition-transform hover:scale-105 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3 opacity-60">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black tracking-tight">
        {value}<span className="text-xs font-normal opacity-40 ml-1">{unit}</span>
      </div>
    </div>
  );
};

export default App;
