import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ChevronDown, Zap, Play, Star, MessageSquare, ArrowRight, X, Loader2, CheckCircle } from 'lucide-react';

// Detecta si el usuario está en un dispositivo móvil (menor rendimiento)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const Sparkles = ({ isMobile }: { isMobile: boolean }) => {
  const count = isMobile ? 15 : 40;
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }));
    setSparkles(newSparkles);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute bg-cyan-200 rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            boxShadow: isMobile ? 'none' : '0 0 10px rgba(165, 243, 252, 0.8)',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Characters move from sides to center
  const leftX = useTransform(scrollYProgress, [0, 0.4], ["-60vw", "0vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.4], ["60vw", "0vw"]);

  // Revealed content opacity (starts after characters touch)
  const revealedOpacity = useTransform(scrollYProgress, [0.42, 0.55], [0, 1]);
  const revealedScale = useTransform(scrollYProgress, [0.42, 0.6], [0.9, 1]);

  // Sun light effect when they touch (peaks at 0.4)
  const lightScale = useTransform(scrollYProgress, [0.35, 0.4, 0.5], [0, 1.5, 4]);
  const lightOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.45, 0.5], [0, 1, 1, 0]);

  // Circular mask reveal for the new image (starts EXACTLY when they touch at 0.4)
  const maskSize = useTransform(scrollYProgress, [0.4, 0.55], ["0%", "150%"]);

  // Fade out the main text as characters join (from 0 to 0.25)
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.25], [0, -30]);
  const textScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  // Fade out the scroll indicator as soon as user starts scrolling
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Sections visibility (only show when hero is finished)
  const sectionsOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const sectionsY = useTransform(scrollYProgress, [0.85, 0.95], [100, 0]);

  // Section 03: Transformation Reveal
  const transformRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: transformScroll } = useScroll({
    target: transformRef,
    offset: ["start end", "end start"]
  });

  // Clean vertical wipe reveal
  const revealClipPath = useTransform(transformScroll, [0.15, 0.5], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const baseScale = useTransform(transformScroll, [0.15, 0.45], [1, 0.95]);
  const baseOpacity = useTransform(transformScroll, [0.15, 0.45], [1, 0.3]);
  const revealScale = useTransform(transformScroll, [0.15, 0.6], [1.1, 1]);

  const transformTextOpacity = useTransform(transformScroll, [0.4, 0.6], [0, 1]);
  const transformTextY = useTransform(transformScroll, [0.4, 0.6], [50, 0]);

  // Mouse tracking for floating effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const moveX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="bg-[#d7ccc8]">
      <div ref={containerRef} className="relative h-[300vh]">
        {/* Sticky container that stays in view while scrolling */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* Background Image (Static) */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/hero-bg.png)' }}
          />
          {/* Gradient Overlay to make the sun more subtle and text more readable - Darker for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/90" />
          
          {/* Subtle Sun Glow - Making it "tenue" (soft) */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] bg-cyan-100/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Main Hero Text - Fades out as you scroll */}
        <motion.div 
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mb-8 md:mb-12 flex flex-col items-center"
          >
            <span className="text-cyan-400 tracking-[0.4em] uppercase text-xs md:text-sm font-bold drop-shadow-md">
              Bienvenido a SEARMO
            </span>
          </motion.div>

          <div className="relative mb-6">
            <motion.span 
              className="absolute -top-6 -left-4 sm:-top-8 sm:-left-6 md:-top-12 md:-left-10 text-cyan-400/60 text-4xl sm:text-5xl md:text-[7rem] font-serif italic select-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              El
            </motion.span>
            <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-serif leading-[0.85] tracking-tight drop-shadow-2xl">
              comercio <br />
              renace con <br />
              <span className="font-black italic text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">Inteligencia.</span>
            </h1>
          </div>
          
          <p className="text-white/70 text-xs md:text-sm font-sans max-w-md mb-10 tracking-[0.2em] drop-shadow-md uppercase font-light">
            Agentes conversacionales y automatización <br />
            <span className="opacity-80">para escalar tu negocio sin límites.</span>
          </p>


        </motion.div>

        {/* Left Character (Woman) - Moves Left to Right */}
        <motion.img 
          src="/char-left-cup-transparent.png"
          alt="Mujer con café"
          className="absolute right-1/2 bottom-0 h-[60vh] md:h-[85vh] max-w-none object-contain object-right-bottom"
          style={{ x: leftX, translateX: "10%" }}
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Right Character (Man) - Moves Right to Left */}
        <motion.img 
          src="/char-right-skater-transparent.png"
          alt="Hombre con skate"
          className="absolute left-1/2 bottom-0 h-[60vh] md:h-[85vh] max-w-none object-contain object-left-bottom"
          style={{ x: rightX, translateX: "-10%" }}
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Sun Light Effect — simplificado en móvil */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full pointer-events-none"
          style={{
            width: isMobile ? "200px" : "300px",
            height: isMobile ? "200px" : "300px",
            scale: lightScale,
            opacity: lightOpacity,
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(34,211,238,0.8) 30%, rgba(0,0,0,0) 70%)",
            boxShadow: isMobile ? "0 0 60px 30px rgba(34, 211, 238, 0.3)" : "0 0 120px 60px rgba(34, 211, 238, 0.4)",
            mixBlendMode: "screen"
          }}
          animate={isMobile ? {} : {
            boxShadow: [
              "0 0 120px 60px rgba(34, 211, 238, 0.4)",
              "0 0 180px 90px rgba(34, 211, 238, 0.6)",
              "0 0 120px 60px rgba(34, 211, 238, 0.4)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Reveal Image con SVG Mask — filtros simplificados en móvil */}
        <motion.svg 
          className="absolute inset-0 z-20 pointer-events-none w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* En desktop: filtros mágicos con turbulencia. En móvil: círculo limpio para ahorrar GPU */}
            {!isMobile && (
              <>
                <filter id="displacement-edge" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <filter id="glow-edge" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="4" result="blurred" />
                  <feMerge>
                    <feMergeNode in="blurred" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
              </>
            )}

            <mask id="magic-mask">
              <motion.circle 
                cx="50%" 
                cy="50%" 
                r={maskSize} 
                fill="white" 
                filter={!isMobile ? "url(#displacement-edge)" : undefined}
              />
            </mask>
          </defs>

          {/* The revealed image */}
          <image 
            href="/reveal-tablet-woman.png" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="xMidYMid slice" 
            mask="url(#magic-mask)"
          />

          {/* Borde brillante — solo en desktop */}
          {!isMobile && (
            <>
              <motion.circle 
                cx="50%" 
                cy="50%" 
                r={maskSize} 
                fill="none" 
                stroke="rgba(255, 255, 255, 1)" 
                strokeWidth="35" 
                filter="url(#glow-edge)" 
              />
              <motion.circle 
                cx="50%" 
                cy="50%" 
                r={maskSize} 
                fill="none" 
                stroke="rgba(34, 211, 238, 0.6)" 
                strokeWidth="60" 
                filter="url(#glow-edge)" 
                style={{ opacity: 0.5 }}
              />
              <motion.circle 
                cx="50%" 
                cy="50%" 
                r={maskSize} 
                fill="none" 
                stroke="rgba(34, 211, 238, 0.3)" 
                strokeWidth="100" 
                filter="url(#glow-edge)" 
                style={{ opacity: 0.2 }}
              />
            </>
          )}

          {/* En móvil: borde simple sin filtros pesados */}
          {isMobile && (
            <motion.circle 
              cx="50%" 
              cy="50%" 
              r={maskSize} 
              fill="none" 
              stroke="rgba(34, 211, 238, 0.5)" 
              strokeWidth="20" 
            />
          )}
        </motion.svg>

        {/* Revealed Content Overlay (The ai Edition) */}
        <motion.div 
          className="absolute inset-0 z-40 flex flex-col items-start justify-center px-6 sm:px-12 md:px-24 pointer-events-none"
          style={{ opacity: revealedOpacity, scale: revealedScale }}
        >
          <div className="max-w-xl w-full">
            <header className="mb-4 md:mb-8 mt-10 md:mt-0">
              <h2 className="text-white text-xl sm:text-2xl md:text-5xl font-bold leading-tight tracking-tighter max-w-[200px] sm:max-w-xs md:max-w-md drop-shadow-lg">
                Te ayudamos a entrar <br className="md:hidden" /> en la <br className="hidden md:block"/>
                <span className="font-serif italic font-light text-cyan-400 text-3xl sm:text-4xl md:text-6xl block mt-1">nueva era</span>
              </h2>
              <p className="text-white/80 text-[11px] sm:text-xs md:text-base font-serif mt-2 md:mt-4 max-w-[160px] sm:max-w-[180px] md:max-w-xs leading-relaxed drop-shadow-md">
                Convergencia Digital. <br />
                Potenciando tu visión con IA.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-y-0.5 sm:gap-y-1 md:gap-y-1 w-full max-w-[150px] sm:max-w-[160px] md:max-w-[240px]">
              {[
                { name: "Asistente", num: "I" },
                { name: "Agentes", num: "II" },
                { name: "En línea", num: "III" },
                { name: "Comercio", num: "IV" },
                { name: "Marketing", num: "V" },
                { name: "Pago", num: "VI" },
                { name: "Operaciones", num: "VII" },
                { name: "App de compra", num: "VIII" },
                { name: "B2B", num: "IX" },
                { name: "Finanzas", num: "X" },
                { name: "Envíos", num: "XI" },
                { name: "Desarrolladores", num: "XII" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-0.5 md:pb-1 pt-0.5 md:pt-1">
                  <span className="text-white text-[11px] sm:text-[13px] md:text-lg font-bold tracking-tight drop-shadow-md">{item.name}</span>
                  <span className="text-white/40 text-[8px] sm:text-[9px] md:text-xs font-serif italic">{item.num}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 z-30 text-white flex flex-col items-center"
          style={{ opacity: indicatorOpacity }}
        >
          <span className="mb-2 text-sm font-medium uppercase tracking-widest drop-shadow-md">Haz Scroll hacia abajo</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 drop-shadow-md" />
          </motion.div>
        </motion.div>

        </div>
      </div>

      <motion.div 
        className="relative z-50"
        style={{ opacity: sectionsOpacity, y: sectionsY }}
      >
        {/* Sección 1: Innovación (Bento Grid) */}
        <section className="relative z-50 py-24 px-6 md:px-24 bg-[#d7ccc8] border-t border-stone-400/20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-stone-900 text-4xl md:text-6xl font-bold tracking-tighter mb-4 uppercase">01. <span className="font-serif italic font-light text-cyan-700/60 lowercase">Innovación</span></h2>
              <p className="text-stone-800 max-w-md">Diseñamos el futuro del comercio digital con herramientas que potencian tu creatividad.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-[350px] md:h-[400px] bg-stone-900 rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col justify-end relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent z-10" />
                <img 
                  src="/img4.png" 
                  alt="Tecnología avanzada" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" 
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer" 
                />
                <div className="relative z-20">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2">Inteligencia Adaptativa</h3>
                  <p className="text-cyan-100/80 text-xs md:text-sm max-w-sm">Algoritmos que aprenden de tu negocio para ofrecerte las mejores decisiones en tiempo real.</p>
                </div>
              </div>
              <div className="h-[300px] md:h-[400px] bg-stone-900 rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col justify-between shadow-2xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent z-10" />
                <img 
                  src="/velocidad-pura.jpg" 
                  alt="Automatizaciones" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer" 
                />

                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500/80 flex items-center justify-center group-hover:bg-cyan-400 transition-colors duration-300 relative z-20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                  <Zap className="text-stone-950 w-5 h-5 md:w-6 md:h-6" />
                </div>
                
                <div className="relative z-20 mt-auto">
                  <h3 className="text-white text-sm md:text-base font-bold leading-tight mb-1 uppercase drop-shadow-lg">
                    SOÑAR CON QUE TU NEGOCIO CUENTE CON <br />
                    <span className="text-cyan-400 text-lg md:text-xl">AUTOMATIZACIONES</span>
                  </h3>
                  <p className="text-white font-black text-sm md:text-lg mb-2 drop-shadow-md">NOSOTROS LO LOGRAMOS</p>
                  <p className="text-white/90 text-[10px] md:text-xs font-medium leading-relaxed max-w-[90%] drop-shadow-sm">
                    Transformamos tu sueño en una realidad inteligente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Video Carousel (Experiencias) */}
        <section className="relative z-50 py-24 bg-[#cbbda9] overflow-hidden">
          <div className="px-6 md:px-24 mb-12">
            <h2 className="text-stone-900 text-4xl md:text-5xl font-bold tracking-tighter uppercase">02. <span className="font-serif italic font-light text-cyan-700/60 lowercase">Experiencias</span></h2>
            <p className="text-stone-800 text-sm mt-2">Visualiza el impacto de nuestras soluciones en entornos reales.</p>
          </div>
          
          <div className="flex gap-4 md:gap-8 px-6 md:px-24 overflow-x-auto pt-10 pb-12 no-scrollbar snap-x">
            {[
              { title: "Ecosistema Digital", img: "/img3.png", video: "https://res.cloudinary.com/dlqho62j1/video/upload/v1777701131/grok-video-f0709e25-e241-4dce-936c-8340f21d458b_1_a3jvl7.mp4" },
              { title: "Realidad Aumentada", desc: "El nuevo concepto que se vuelve inmersivo", img: "/hero-bg-landscape.png", video: "https://res.cloudinary.com/dlqho62j1/video/upload/v1777701275/Screenrecorder-2026-01-22-16-05-13-400_2_dyw5hl.mp4" },
              { title: "Análisis Profundo", img: "/img1.png", video: "https://res.cloudinary.com/dlqho62j1/video/upload/v1777702431/tu_iburin3_2_gfhmfc.mp4" },
              { title: "Conexión Global", img: "/img3.png", video: "https://res.cloudinary.com/dlqho62j1/video/upload/v1777702040/crm_3_ma5pj6.mp4" },
              { title: "Potencia IA", img: "/hero-bg-landscape.png", video: "https://res.cloudinary.com/dlqho62j1/video/upload/v1777701337/rosalia-17_1_wvunzy.mp4" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ 
                  boxShadow: "0 0 60px rgba(52, 211, 153, 0.5)",
                  borderColor: "rgba(52, 211, 153, 0.8)",
                  zIndex: 20
                }}
                whileTap={{ 
                  boxShadow: "0 0 80px rgba(52, 211, 153, 0.6)",
                  scale: 0.98
                }}
                className="min-w-[240px] md:min-w-[300px] aspect-[10/16] bg-stone-950 rounded-[2rem] overflow-hidden relative border border-white/10 snap-center group shadow-2xl isolation-isolate transition-all duration-300"
              >
                {item.video ? (
                  <div className="absolute inset-0 z-10 overflow-hidden rounded-[2rem]">
                    {/* Blurred background for videos that don't match aspect ratio */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-125"
                      style={{ backgroundImage: `url(${item.img})` }}
                    />
                    <video 
                      src={item.video}
                      poster={item.img}
                      autoPlay
                      muted
                      loop
                      controls
                      playsInline
                      className="relative w-full h-full object-cover opacity-100 z-10"
                    />
                  </div>
                ) : (
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-300" 
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer" 
                  />
                )}
                
                {/* Gradient Overlay - From top to bottom, subtler */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-transparent pointer-events-none z-15 h-1/2" />
                
                {/* Title at the TOP */}
                <div className="absolute inset-x-0 top-0 p-4 md:p-6 pointer-events-none z-20">
                  <h4 className="text-white font-semibold text-base md:text-xl mb-1 md:mb-2 drop-shadow-lg">{item.title}</h4>
                  <p className="text-white/90 text-[11px] md:text-sm leading-snug drop-shadow-md max-w-[85%]">{item.desc || "Transformando la visión en realidad digital."}</p>
                </div>

                {!item.video && (
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                      <Play size={16} className="text-white fill-current" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sección 03: Transformación (Nueva) */}
        <section 
          ref={transformRef} 
          className="relative z-50 h-[200vh] bg-[#d7ccc8]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden bg-stone-950">
            {/* Background Layer (hero-bg-landscape.png) */}
            <motion.div 
              className="absolute inset-0 origin-top"
              style={{ scale: baseScale, opacity: baseOpacity }}
            >
              <img 
                src="/hero-bg-landscape.png" 
                alt="Base" 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-stone-950/40" />
            </motion.div>

            {/* Reveal Layer (reveal-tablet-woman2.png) */}
            <motion.div 
              className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden bg-stone-950/20 backdrop-blur-sm"
              style={{ clipPath: revealClipPath }}
            >
              {/* Sparkles Background */}
              <Sparkles isMobile={isMobile} />
              
              <motion.div
                className="relative z-10 flex items-center justify-center w-full h-full"
                style={{ 
                  scale: revealScale,
                  rotateX, 
                  rotateY, 
                  x: moveX, 
                  y: moveY 
                }}
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src="/reveal-tablet-woman2.png" 
                  alt="Revelación" 
                  className="max-w-[95%] max-h-[85%] md:max-w-[80%] md:max-h-[80%] object-contain drop-shadow-[0_0_80px_rgba(34,211,238,0.2)] rounded-lg md:rounded-2xl border border-cyan-500/10"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/80 pointer-events-none" />
            </motion.div>

            {/* Text Overlay */}
            <motion.div 
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
              style={{ opacity: transformTextOpacity, y: transformTextY }}
            >
              <h2 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter uppercase mb-4 drop-shadow-2xl">
                03. <span className="font-serif italic font-light text-cyan-300 lowercase">Transformación</span>
              </h2>
              <p className="text-white/90 text-base sm:text-lg md:text-xl font-serif max-w-2xl drop-shadow-lg">
                La tecnología no solo cambia lo que hacemos, <br />
                <span className="text-cyan-300">cambia quiénes somos.</span>
              </p>
            </motion.div>

            {/* Removed Decorative Borders that caused green lines */}
          </div>
        </section>

        {/* Sección 4: Métricas (Stats) - Floating Bubbles */}
        <section className="relative z-50 py-32 px-6 md:px-24 bg-[#d7ccc8] overflow-hidden min-h-[600px] flex flex-col">
          <div className="px-6 md:px-24 mb-12 relative z-20">
            <h2 className="text-stone-900 text-4xl md:text-5xl font-bold tracking-tighter uppercase">04. <span className="font-serif italic font-light text-cyan-700/60 lowercase">Métricas</span></h2>
          </div>
          
          <div className="flex-1 relative w-full max-w-7xl mx-auto">
            {/* Background Connection Web */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="50%" cy="50%" r="300" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
            </svg>

            {[
              { label: "Clientes Felices", val: "2.5k+", x: "2%", y: "15%", depth: 0, avatar: "😊" },
              { label: "Actualizaciones", val: "150+", x: "55%", y: "8%", depth: 0, avatar: "🚀" },
              { label: "Soporte", val: "24/7", x: "28%", y: "35%", depth: 0, avatar: "🎧" },
              { label: "Conversión", val: "+45%", x: "5%", y: "92%", depth: 0, avatar: "📈" },
              { label: "Precisión IA", val: "99.9%", x: "50%", y: "90%", depth: 0, avatar: "🤖" },
              { label: "ROI", val: "x10", x: "32%", y: "88%", depth: 0, avatar: "💰" },
              { label: "Latencia", val: "<200ms", x: "58%", y: "42%", depth: 0, avatar: "⚡" },
              { label: "Países", val: "40+", x: "2%", y: "48%", depth: 0, avatar: "🌍" },
              // Background "blurred" bubbles
              { label: "Data Sync", val: "Active", x: "5%", y: "92%", depth: 2, avatar: "☁️" },
              { label: "Neural Net", val: "Processing", x: "65%", y: "22%", depth: 1, avatar: "🧠" },
              { label: "Cloud Ops", val: "Stable", x: "38%", y: "5%", depth: 2, avatar: "☁️" },
              { label: "Security", val: "Encrypted", x: "65%", y: "92%", depth: 1, avatar: "🛡️" },
              { label: "Analytics", val: "Real-time", x: "2%", y: "5%", depth: 2, avatar: "📊" },
              { label: "DevOps", val: "Automated", x: "18%", y: "95%", depth: 1, avatar: "🛠️" },
            ].map((stat, idx) => {
              const isSelected = selectedMetric === idx;
              return (
                <motion.div
                  key={idx}
                  className={`absolute group cursor-pointer ${stat.depth > 0 && !isSelected ? 'z-0' : 'z-10'}`}
                  style={{ 
                    left: stat.x,
                    top: stat.y,
                    zIndex: isSelected ? 100 : (stat.depth > 0 ? 0 : 10)
                  }}
                  animate={{
                    y: isSelected ? -20 : [0, -15, 0],
                    x: isSelected ? 10 : [0, 8, 0],
                    scale: isSelected ? 1.2 : 1
                  }}
                  transition={{
                    duration: isSelected ? 0.3 : 12 + Math.random() * 6,
                    repeat: isSelected ? 0 : Infinity,
                    ease: "easeInOut",
                    delay: isSelected ? 0 : idx * 0.1
                  }}
                  onClick={() => setSelectedMetric(selectedMetric === idx ? null : idx)}
                >
                  <motion.div 
                    className={`
                      relative bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl px-2 py-1.5 md:px-4 md:py-2.5 shadow-lg
                      transition-all duration-300 ease-out flex flex-col justify-between
                      w-[120px] h-[65px] md:w-[200px] md:h-[85px]
                      ${isSelected ? 'blur-0 opacity-100 border-violet-500 bg-white shadow-[0_20px_50px_-10px_rgba(139,92,246,0.7)]' : 
                        (stat.depth === 2 ? 'blur-[8px] opacity-10 scale-75 md:scale-90' : 
                         stat.depth === 1 ? 'blur-[5px] opacity-30 scale-85 md:scale-95' : 
                         'blur-0 opacity-90')}
                      group-hover:blur-0 group-hover:opacity-100 group-hover:scale-110 md:group-hover:scale-125 group-hover:z-[100]
                      group-hover:-translate-y-3 md:group-hover:-translate-y-5 group-hover:rotate-1
                      group-hover:shadow-[0_10px_30px_-5px_rgba(139,92,246,0.5)] md:group-hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.7)]
                      group-hover:border-violet-500 group-hover:bg-white
                    `}
                  >
                    <div className="flex-1">
                      <p className={`text-stone-800 font-bold text-[7px] md:text-[9px] tracking-tight mb-0.5 transition-all truncate ${isSelected ? 'opacity-100 text-violet-900' : 'opacity-60 group-hover:opacity-100 group-hover:text-violet-900'}`}>
                        {stat.label}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 md:gap-2.5">
                        <div className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-base shadow-inner border transition-all duration-500 ${isSelected ? 'bg-violet-600 text-white border-violet-600 scale-110' : 'bg-violet-100 text-violet-600 border-violet-200 group-hover:bg-violet-600 group-hover:text-white'}`}>
                          {stat.avatar}
                        </div>
                        <div className={`transition-colors text-xs md:text-lg font-black tracking-tighter leading-none ${isSelected ? 'text-violet-700' : 'text-cyan-950 group-hover:text-violet-700'}`}>
                          {stat.val}
                        </div>
                      </div>
                    </div>

                    {/* Metallic violet shine effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-violet-400/0 to-transparent transition-all duration-500 pointer-events-none ${isSelected ? 'via-violet-400/40' : 'group-hover:via-violet-400/30'}`} />
                    
                    {/* Glow layer */}
                    <div className={`absolute -inset-1 rounded-2xl bg-violet-500/0 blur-xl transition-all duration-500 -z-10 ${isSelected ? 'bg-violet-500/30' : 'group-hover:bg-violet-500/20'}`} />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Background AI Face (kept but moved) */}
          <div className="absolute right-0 bottom-0 w-1/3 h-1/2 opacity-5 pointer-events-none z-0">
            <img 
              src="/ai-face.png" 
              alt="Inteligencia Artificial" 
              className="w-full h-full object-contain object-right-bottom grayscale opacity-20" 
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer" 
            />
          </div>
        </section>

        {/* Sección 5: Footer / CTA */}
        <footer className="relative z-50 py-24 px-6 md:px-24 bg-[#d7ccc8] border-t border-stone-400/20 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img 
              src="/split-hero.png" 
              alt="Fondo de contacto" 
              className="w-full h-full object-cover grayscale" 
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-[#d7ccc8]/80" />
          </div>
          
          <div className="relative z-10">
            <div className="px-6 md:px-24 mb-12">
              <h2 className="text-stone-900 text-4xl md:text-5xl font-bold tracking-tighter uppercase">05. <span className="font-serif italic font-light text-cyan-700/60 lowercase">Contacto</span></h2>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="max-w-2xl">
                <h2 className="text-stone-900 text-4xl md:text-5xl font-bold mb-8 tracking-tighter leading-tight">¿Listo para el <br/><span className="font-serif italic font-light text-cyan-700/60">siguiente nivel?</span></h2>
                <div className="flex flex-col sm:flex-row gap-6 w-full mt-4">
                  <motion.button 
                    onClick={() => setShowForm(true)}
                    className="relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-10px_rgba(8,145,178,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(8,145,178,0.6)] border border-white/10"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-2">
                      Empezar ahora <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                  
                  <motion.a 
                    href="https://yeiya-ai-v2.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/80 backdrop-blur-md hover:bg-white text-stone-900 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all border border-stone-200 shadow-sm hover:shadow-md"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageSquare className="w-6 h-6 text-cyan-600" />
                    <span>Contactar agente</span>
                  </motion.a>
                </div>
              </div>
              
              {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-6">
                  <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                    <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900">
                      <X />
                    </button>
                    <h3 className="text-2xl font-bold mb-6">Cuéntanos sobre tu proyecto</h3>
                    <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      setIsSubmitting(true);
                      setSubmitSuccess(false);
                      const formData = new FormData(e.currentTarget);
                      const data = Object.fromEntries(formData.entries());
                      try {
                        await fetch('/api/contact', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                        });
                        setSubmitSuccess(true);
                        setTimeout(() => {
                          setShowForm(false);
                          setSubmitSuccess(false);
                        }, 2500);
                      } catch (error) {
                        alert('Hubo un error al enviar el mensaje. Por favor intenta de nuevo.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}>
                      <input type="text" name="nombre" placeholder="Nombre completo" className="w-full p-3 mb-4 border rounded-xl" required disabled={isSubmitting || submitSuccess} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="tel" name="telefono" placeholder="Teléfono" className="w-full p-3 border rounded-xl" required disabled={isSubmitting || submitSuccess} />
                        <input type="email" name="correo" placeholder="Correo electrónico" className="w-full p-3 border rounded-xl" required disabled={isSubmitting || submitSuccess} />
                      </div>
                      <input type="text" name="direccion" placeholder="Dirección / Ciudad" className="w-full p-3 mb-4 border rounded-xl" required disabled={isSubmitting || submitSuccess} />
                      <input type="text" name="empresa" placeholder="Empresa" className="w-full p-3 mb-4 border rounded-xl" required disabled={isSubmitting || submitSuccess} />
                      <textarea name="idea" placeholder="¿Qué idea tienes para tu proyecto?" className="w-full p-3 mb-4 border rounded-xl h-24 resize-none" required disabled={isSubmitting || submitSuccess} />
                      <button 
                        type="submit" 
                        disabled={isSubmitting || submitSuccess}
                        className={`w-full p-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                          submitSuccess 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-700'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando información...
                          </>
                        ) : submitSuccess ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            ¡Información enviada!
                          </>
                        ) : (
                          'Enviar y conectar'
                        )}
                      </button>
                    </form>
                    <p className="mt-4 text-xs text-stone-400 text-center">
                      Al enviar, aceptas nuestro <button type="button" onClick={() => setShowPrivacy(true)} className="underline hover:text-stone-600">Aviso de Privacidad</button>.
                    </p>
                    <p className="mt-4 text-sm text-stone-500">
                      ¿Prefieres hablar directamente? <a href="https://agenteyeiya.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 font-bold">Ve directo al agente aquí.</a>
                    </p>
                  </div>
                </div>
              )}
              
              {showPrivacy && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-6">
                  <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors">
                      <X />
                    </button>
                    <h3 className="text-2xl font-bold mb-6 text-stone-900">Aviso de Privacidad</h3>
                    <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                      <p><strong>Última actualización:</strong> Marzo 2026</p>
                      <p>En <strong>SEARMO</strong>, valoramos profundamente tu privacidad y nos comprometemos a proteger los datos personales que compartes con nosotros.</p>
                      
                      <h4 className="font-bold text-stone-800 mt-6">1. Información que recopilamos</h4>
                      <p>Al utilizar nuestro formulario de contacto, recopilamos tu nombre, correo electrónico, empresa y el mensaje que nos envías. Esta información es proporcionada voluntariamente por ti.</p>
                      
                      <h4 className="font-bold text-stone-800 mt-6">2. Uso de la información</h4>
                      <p>Los datos recopilados se utilizan exclusivamente para:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Responder a tus consultas y mensajes.</li>
                        <li>Proporcionarte información sobre nuestros servicios de automatización y agentes conversacionales.</li>
                        <li>Mejorar la experiencia de usuario en nuestra plataforma.</li>
                      </ul>

                      <h4 className="font-bold text-stone-800 mt-6">3. Protección de datos</h4>
                      <p>Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado, alteración o destrucción. <strong>No compartimos, vendemos ni alquilamos</strong> tu información personal a terceros bajo ninguna circunstancia.</p>

                      <h4 className="font-bold text-stone-800 mt-6">4. Tus derechos</h4>
                      <p>Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales de nuestros registros en cualquier momento. Para ejercer estos derechos, simplemente contáctanos a través de los mismos canales de comunicación.</p>

                      <p className="mt-8 pt-4 border-t border-stone-200 text-xs text-stone-500">
                        Al utilizar nuestro formulario de contacto, aceptas los términos descritos en este Aviso de Privacidad.
                      </p>
                    </div>
                    <button onClick={() => setShowPrivacy(false)} className="mt-8 w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                      Entendido
                    </button>
                  </div>
                </div>
              )}

              {showAbout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-6">
                  <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors">
                      <X />
                    </button>
                    <h3 className="text-2xl font-bold mb-6 text-stone-900">Sobre Nosotros</h3>
                    <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                      <p><strong>Nuestra Misión</strong></p>
                      <p>Innovar en la forma en que las empresas interactúan con la tecnología, brindando herramientas de vanguardia, inteligencia artificial y una experiencia inigualable que optimice procesos, genere crecimiento sostenible y eleve la competitividad en un mundo interconectado y en constante cambio.</p>
                      <h4 className="font-bold text-stone-800 mt-6">Nuestra Visión</h4>
                      <p>Convertirnos en el estándar de oro en transformación digital y comercio electrónico asistido por IA, empoderando a organizaciones de todos los tamaños a liderar la nueva economía digital global con soluciones intuitivas, rápidas y efectivas.</p>
                    </div>
                    <button onClick={() => setShowAbout(false)} className="mt-8 w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {showCareers && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-6">
                  <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setShowCareers(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors">
                      <X />
                    </button>
                    <h3 className="text-2xl font-bold mb-6 text-stone-900">Carreras</h3>
                    <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                      <p><strong>Únete a nuestro equipo</strong></p>
                      <p>Estamos siempre buscando mentes brillantes, desarrolladores apasionados y diseñadores visionarios que se atrevan a construir el futuro de la inteligencia artificial. En este momento no tenemos vacantes abiertas, pero mantente al tanto de futuras oportunidades.</p>
                    </div>
                    <button onClick={() => setShowCareers(false)} className="mt-8 w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
              
            </div>

            {/* Bottom Footer Section */}
            <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-stone-400/20 grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
              {/* Left: Logo & Copyright */}
              <div className="flex flex-col items-start gap-6 justify-self-start">
                <div className="relative group flex items-center justify-start">
                  <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full group-hover:bg-white/60 transition-all duration-500 scale-150"></div>
                  <img 
                    src="/Logo SEARMO estilo t.png" 
                    alt="SEARMO Logo" 
                    className="relative h-28 md:h-40 w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="text-stone-500 text-xs flex flex-col gap-2">
                  <span>© 2026 SEARMO. Todos los derechos reservados.</span>
                  <span className="font-serif italic">Hecho con pasión</span>
                </div>
              </div>
              
              {/* Center: Empresa & Legal */}
              <div className="flex gap-12 md:gap-24 justify-self-center">
                <div>
                  <h5 className="text-stone-900 font-bold mb-4 text-sm uppercase tracking-widest">Empresa</h5>
                  <ul className="space-y-2 text-stone-600 text-sm">
                    <li onClick={() => setShowAbout(true)} className="hover:text-cyan-700 cursor-pointer transition-colors">Sobre nosotros</li>
                    <li onClick={() => setShowCareers(true)} className="hover:text-cyan-700 cursor-pointer transition-colors">Carreras</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-stone-900 font-bold mb-4 text-sm uppercase tracking-widest">Legal</h5>
                  <ul className="space-y-2 text-stone-600 text-sm">
                    <li onClick={() => setShowPrivacy(true)} className="hover:text-cyan-700 cursor-pointer transition-colors">Privacidad</li>
                  </ul>
                </div>
              </div>

              {/* Right: Empty space to balance grid */}
              <div className="hidden md:block justify-self-end"></div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
