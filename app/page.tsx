"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

// ─── Logo Icon ───────────────────────────────────────────────────────────────

function CytronLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Black rounded square with white border */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0a0a0a" stroke="white" strokeWidth="2" />
      {/* Clean C lettermark */}
      <path
        d="M30 16C28.2 14.5 25.8 13.5 23.5 13.5C17.7 13.5 13 18.2 13 24C13 29.8 17.7 34.5 23.5 34.5C25.8 34.5 28.2 33.5 30 32"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  bg: "#000000",
  white: "#ffffff",
  purple: "#8052FF",
  gold: "#FFB829",
  gray: "#9A9A9A",
  lightGray: "#BDBDBD",
  divider: "rgba(255,255,255,0.1)",
  glow: "rgba(217,119,87,",
};

// ─── Loading Screen ──────────────────────────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const duration = 2200;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setProgress(Math.floor(eased * 100));
      if (p >= 1) {
        clearInterval(timer);
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 300);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col justify-between p-8 md:p-12"
    >
      {/* Center text */}
      <div className="flex-1 flex items-center">
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 80, rotate: 3 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-white text-[clamp(1.5rem,4vw,2.25rem)] font-light leading-[1.2] tracking-[-0.02em]"
          >
            Your business creates content.
            <br />
            Ask Cytron to automate it.
          </motion.h1>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex justify-between items-end">
        <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#9A9A9A]">
          {done ? "COMPLETED" : "LOADING.."}
        </span>
        <span className="text-white text-[48px] md:text-[72px] font-light tracking-[-0.03em] leading-none tabular-nums">
          {String(progress).padStart(2, "0")}
        </span>
      </div>

      {/* Loading diamonds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rotate-45"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Vignette Border ─────────────────────────────────────────────────────────

function VignetteBorder() {
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        boxShadow: `${C.glow}0.5) 0px 0px 10px 0px inset, ${C.glow}0.3) 0px 0px 20px 0px inset, ${C.glow}0.1) 0px 0px 30px 0px inset`,
      }}
    />
  );
}

// ─── 3D Colorful Brain Dome (WebGL - Dala style) ─────────────────────────────

function BrainSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    import("three").then((THREE) => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
      camera.position.set(0, 0.5, 3.2);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Colors matching Dala palette
      const colors = [
        new THREE.Color(0xff8844), // orange
        new THREE.Color(0xffcc22), // yellow/gold
        new THREE.Color(0x44dd88), // green
        new THREE.Color(0x4488ff), // blue
        new THREE.Color(0x8852ff), // purple
        new THREE.Color(0xff44aa), // pink
        new THREE.Color(0x44dddd), // cyan
      ];

      // Create triangle geometry for instances
      const triGeo = new THREE.BufferGeometry();
      const s = 0.04;
      const triVerts = new Float32Array([0, s, 0, -s * 0.866, -s * 0.5, 0, s * 0.866, -s * 0.5, 0]);
      triGeo.setAttribute("position", new THREE.BufferAttribute(triVerts, 3));

      const count = 4000;
      const dummy = new THREE.Object3D();
      const meshMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      // Store particle data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const particleData: { pos: any; vel: any; color: any; rotSpeed: number; offset: number; baseR: number }[] = [];

      const instancedMesh = new THREE.InstancedMesh(triGeo, meshMaterial, count);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      // Color buffer for instances
      const colorArr = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Hemisphere distribution (dome shape)
        const phi = Math.acos(1 - 2 * Math.random() * 0.55); // top hemisphere only
        const theta = Math.random() * Math.PI * 2;
        const r = 1.6 + (Math.random() - 0.5) * 0.5;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi); // up
        const z = r * Math.sin(phi) * Math.sin(theta);

        const color = colors[Math.floor(Math.random() * colors.length)];
        colorArr[i * 3] = color.r;
        colorArr[i * 3 + 1] = color.g;
        colorArr[i * 3 + 2] = color.b;

        particleData.push({
          pos: new THREE.Vector3(x, y - 0.5, z),
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.002),
          color,
          rotSpeed: (Math.random() - 0.5) * 2,
          offset: Math.random() * Math.PI * 2,
          baseR: r,
        });
      }

      instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colorArr, 3);
      scene.add(instancedMesh);

      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        const t = clock.getElapsedTime();

        // Global rotation + mouse
        const rotY = t * 0.08 + mouseRef.current.x * 0.4;
        const rotX = t * 0.03 + mouseRef.current.y * 0.2;

        for (let i = 0; i < count; i++) {
          const pd = particleData[i];

          // Organic pulsing
          const pulse = Math.sin(t * 0.5 + pd.offset) * 0.08;
          const nx = pd.pos.x * (1 + pulse);
          const ny = pd.pos.y * (1 + pulse);
          const nz = pd.pos.z * (1 + pulse);

          dummy.position.set(nx, ny, nz);
          dummy.rotation.set(t * pd.rotSpeed * 0.3, t * pd.rotSpeed * 0.2, pd.offset);

          // Scale variation
          const scale = 0.8 + Math.sin(t + pd.offset) * 0.3;
          dummy.scale.setScalar(scale);

          dummy.updateMatrix();
          instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;

        // Apply global rotation
        instancedMesh.rotation.y = rotY;
        instancedMesh.rotation.x = rotX * 0.3;

        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        const nw = container.offsetWidth;
        const nh = container.offsetHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        triGeo.dispose();
        meshMaterial.dispose();
      };
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

// ─── Text Reveal Animation ───────────────────────────────────────────────────

function RevealText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", rotate: 2 }}
        animate={isInView ? { y: 0, rotate: 0 } : { y: "100%", rotate: 2 }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "FEATURES", href: "#features" },
    { label: "PROCESS", href: "#process" },
    { label: "PRICING", href: "#pricing" },
    { label: "CONTACT", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 h-[76px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <CytronLogo size={30} />
          <span className="text-white font-semibold text-lg tracking-[-0.02em]">cytron</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#9A9A9A] hover:text-white transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-[12px] font-semibold uppercase tracking-[0.025em] text-white px-5 py-3 rounded-[22.5px] transition-colors duration-300"
            style={{ background: C.purple }}
          >
            GET STARTED
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden relative bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 py-8 flex flex-col gap-5"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold uppercase tracking-wider text-[#9A9A9A] hover:text-white">
                {l.label}
              </a>
            ))}
            <Link href="/login" className="text-[12px] font-semibold uppercase tracking-wider text-white px-5 py-3 rounded-[22.5px] text-center mt-2" style={{ background: C.purple }}>
              GET STARTED
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-[76px] overflow-hidden">
      <BrainSphere />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 w-full">
        <div className="max-w-xl">
          <RevealText delay={0.1}>
            <span
              className="text-[12px] font-semibold uppercase tracking-[0.05em] mb-6 block"
              style={{ color: C.gold }}
            >
              AI-POWERED CONTENT AUTOMATION
            </span>
          </RevealText>

          <RevealText delay={0.2}>
            <h1 className="text-[clamp(3rem,8vw,5rem)] font-normal tracking-[-0.03em] text-white leading-[0.9]">
              Automate your
            </h1>
          </RevealText>
          <RevealText delay={0.3}>
            <h1 className="text-[clamp(3rem,8vw,5rem)] font-normal tracking-[-0.03em] text-white leading-[0.9]">
              content engine.
            </h1>
          </RevealText>

          <FadeIn delay={0.5}>
            <p className="mt-8 text-white font-light text-[18px] leading-[1.5] max-w-md opacity-80">
              Snap a photo on the job site. Cytron&apos;s AI generates cinematic videos, writes captions, and auto-publishes to your social channels. Zero manual work.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.025em] text-white px-6 py-3.5 rounded-[22.5px] transition-all duration-300 hover:brightness-110"
                style={{ background: C.purple }}
              >
                START FREE TRIAL <ArrowRight size={14} />
              </Link>
              <a href="#process" className="text-[14px] font-semibold uppercase tracking-[0.025em] text-[#9A9A9A] hover:text-white transition-colors">
                HOW IT WORKS
              </a>
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}

// ─── Statement Sections (Manifesto style) ────────────────────────────────────

function StatementSection({ text, align = "left" }: { text: string; align?: "left" | "right" }) {
  return (
    <section className="min-h-[60vh] flex items-center py-20 md:py-32">
      <div className={`max-w-[1400px] mx-auto px-6 md:px-10 w-full ${align === "right" ? "flex justify-end" : ""}`}>
        <FadeIn>
          <p className={`text-[clamp(1.5rem,4vw,3rem)] font-normal text-white leading-[1.2] tracking-[-0.02em] max-w-3xl ${align === "right" ? "text-right" : ""}`}>
            {text}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { title: "Photo to Video", desc: "Upload a photo from the job site. AI generates a cinematic marketing video in 60 seconds." },
    { title: "Auto-Publish", desc: "Videos are posted directly to Instagram, TikTok, and LinkedIn. Captions and hashtags included." },
    { title: "AI Captions", desc: "Platform-optimized copy written by AI. Different tone for each channel, always on-brand." },
    { title: "Smart Analytics", desc: "Track performance across all channels. AI-powered insights tell you what works and why." },
    { title: "Video Uploads", desc: "Upload your own raw footage. AI handles the cuts, transitions, subtitles, and music." },
    { title: "Operations Suite", desc: "Warehouse inventory, compliance reports, quoting system. Everything in one platform." },
  ];

  return (
    <section id="features" className="py-24 md:py-32 border-t" style={{ borderColor: C.divider }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <RevealText>
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-4" style={{ color: C.gold }}>
            WHAT WE BUILD
          </span>
        </RevealText>
        <RevealText delay={0.1}>
          <h2 className="text-[clamp(2rem,5vw,2.625rem)] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-16 max-w-xl">
            Everything your business needs to automate content.
          </h2>
        </RevealText>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: C.divider }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="bg-black p-8 md:p-10 group h-full hover:bg-white/[0.03] transition-colors duration-500">
                <h3 className="text-white font-semibold text-[15px] uppercase tracking-[0.025em] mb-3">
                  {f.title}
                </h3>
                <p className="text-[#9A9A9A] text-[15px] font-light leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process ─────────────────────────────────────────────────────────────────

function Process() {
  const steps = [
    { n: "01", title: "Snap a photo", desc: "Your employee takes a photo on the job site. That's the only manual step." },
    { n: "02", title: "AI analyses the scene", desc: "Computer vision identifies materials, context, and the best angle for marketing." },
    { n: "03", title: "Video is generated", desc: "AI creates a cinematic video with motion, transitions, and professional editing." },
    { n: "04", title: "Captions are written", desc: "Platform-optimized copy with hashtags, tailored for each social channel." },
    { n: "05", title: "Published automatically", desc: "Posted to Instagram, TikTok, and LinkedIn. You get notified when it's live." },
  ];

  return (
    <section id="process" className="py-24 md:py-32 border-t" style={{ borderColor: C.divider }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <RevealText>
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-4" style={{ color: C.gold }}>
            HOW IT WORKS
          </span>
        </RevealText>
        <RevealText delay={0.1}>
          <h2 className="text-[clamp(2rem,5vw,2.625rem)] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-16 max-w-xl">
            From photo to published in under 60 seconds.
          </h2>
        </RevealText>

        <div className="space-y-0">
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div className="flex items-start gap-8 md:gap-12 py-10 border-t group" style={{ borderColor: C.divider }}>
                <span className="text-[clamp(2rem,5vw,4rem)] font-light text-white/10 group-hover:text-white/30 transition-colors duration-500 tabular-nums tracking-tight min-w-[60px] md:min-w-[100px]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-white font-normal text-[18px] md:text-[24px] tracking-[-0.01em] mb-2">{s.title}</h3>
                  <p className="text-[#9A9A9A] text-[15px] font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      desc: "For small businesses getting started",
      price: annual ? 49 : 59,
      features: ["10 AI videos/month", "1 brand", "Instagram auto-post", "Basic analytics", "Email support"],
      popular: false,
    },
    {
      name: "Pro",
      desc: "For growing teams and agencies",
      price: annual ? 149 : 179,
      features: ["50 AI videos/month", "5 brands", "Instagram + TikTok + LinkedIn", "Advanced analytics", "Compliance reports", "Warehouse system", "Priority support"],
      popular: true,
    },
    {
      name: "Enterprise",
      desc: "For large organisations",
      price: annual ? 399 : 499,
      features: ["Unlimited videos", "Unlimited brands", "All platforms", "Custom AI models", "Full compliance suite", "Warehouse + Field Commander", "Dedicated account manager", "SLA guarantee"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 border-t" style={{ borderColor: C.divider }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <RevealText>
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-4" style={{ color: C.gold }}>
              PRICING
            </span>
          </RevealText>
          <RevealText delay={0.1}>
            <h2 className="text-[clamp(2rem,5vw,2.625rem)] font-normal text-white leading-[1.2] tracking-[-0.02em]">
              Simple, transparent pricing.
            </h2>
          </RevealText>
          <FadeIn delay={0.2}>
            <p className="mt-3 text-[#9A9A9A] text-[15px] font-light">No contracts. Cancel anytime.</p>
          </FadeIn>
        </div>

        <FadeIn delay={0.15}>
          <div className="flex justify-center mb-12">
            <div className="flex items-center border rounded-full p-1" style={{ borderColor: C.divider }}>
              <button
                onClick={() => setAnnual(false)}
                className={`text-[12px] font-semibold uppercase tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${!annual ? "bg-white text-black" : "text-[#9A9A9A]"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`text-[12px] font-semibold uppercase tracking-wider px-5 py-2 rounded-full transition-all duration-300 ${annual ? "bg-white text-black" : "text-[#9A9A9A]"}`}
              >
                Annual
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={`rounded-[24px] p-8 md:p-10 relative h-full flex flex-col border transition-colors duration-300 ${
                  plan.popular ? "border-[#8052FF]/50 bg-white/[0.03]" : "border-white/10 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-wider text-white px-4 py-1 rounded-full"
                    style={{ background: C.purple }}
                  >
                    Popular
                  </span>
                )}
                <div>
                  <h3 className="text-white font-semibold text-[15px]">{plan.name}</h3>
                  <p className="text-[#9A9A9A] text-[13px] font-light mt-1">{plan.desc}</p>
                </div>
                <div className="mt-6 mb-8">
                  <span className="text-[48px] font-light text-white tracking-[-0.03em]">${plan.price}</span>
                  <span className="text-[#9A9A9A] text-[14px] font-light ml-1">/mo</span>
                </div>
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-[#BDBDBD] font-light">
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-[#8052FF]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center text-[12px] font-semibold uppercase tracking-[0.025em] py-3 rounded-[22.5px] transition-all duration-300 ${
                    plan.popular
                      ? "text-white hover:brightness-110"
                      : "text-white border border-white/20 hover:bg-white/10"
                  }`}
                  style={plan.popular ? { background: C.purple } : {}}
                >
                  GET STARTED
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 border-t" style={{ borderColor: C.divider }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl">
          <RevealText>
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em] block mb-4" style={{ color: C.gold }}>
              GET IN TOUCH
            </span>
          </RevealText>
          <RevealText delay={0.1}>
            <h2 className="text-[clamp(2rem,5vw,2.625rem)] font-normal text-white leading-[1.2] tracking-[-0.02em] mb-6">
              Let&apos;s talk about your project.
            </h2>
          </RevealText>
          <FadeIn delay={0.2}>
            <p className="text-[#9A9A9A] text-[15px] font-light leading-relaxed mb-10">
              Get in touch and we&apos;ll show you how Cytron can automate your content pipeline.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  className="w-full bg-transparent border border-white/10 rounded-xl px-5 py-3.5 text-[15px] text-white font-light placeholder-[#666] focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Your name"
                />
                <input
                  type="email"
                  className="w-full bg-transparent border border-white/10 rounded-xl px-5 py-3.5 text-[15px] text-white font-light placeholder-[#666] focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <textarea
                rows={4}
                className="w-full bg-transparent border border-white/10 rounded-xl px-5 py-3.5 text-[15px] text-white font-light placeholder-[#666] focus:outline-none focus:border-white/30 transition-colors resize-none"
                placeholder="Tell us about your project..."
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.025em] text-white px-6 py-3.5 rounded-[22.5px] transition-all duration-300 hover:brightness-110"
                style={{ background: C.purple }}
              >
                SEND MESSAGE <ArrowRight size={14} />
              </button>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: C.divider }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Footer head */}
        <div className="py-16">
          <RevealText>
            <h3 className="text-[clamp(1.5rem,4vw,2.25rem)] font-normal text-white leading-[1.2] tracking-[-0.02em] max-w-lg">
              Your business creates content. Ask Cytron to automate it.
            </h3>
          </RevealText>
          <FadeIn delay={0.2}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.025em] text-white px-6 py-3.5 rounded-[22.5px] mt-6 transition-all duration-300 hover:brightness-110"
              style={{ background: C.purple }}
            >
              GET STARTED <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>

        {/* Footer bar */}
        <div className="border-t py-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: C.divider }}>
          <div className="flex items-center gap-6">
            <CytronLogo size={24} />
            <span className="text-white font-semibold text-[15px] tracking-[-0.02em]">cytron</span>
            <span className="text-[12px] text-[#9A9A9A]">&copy; 2026 Cytron Technologies. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            {["Features", "Process", "Pricing", "Contact", "Privacy", "Terms"].map((l) => (
              <a
                key={l}
                href={l === "Privacy" || l === "Terms" ? "#" : `#${l.toLowerCase()}`}
                className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#9A9A9A] hover:text-white transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={handleLoadComplete} />}</AnimatePresence>
      <VignetteBorder />
      <Navbar />
      <Hero />
      <StatementSection text="Your team already creates incredible work every day. But 80% of it never reaches your audience. Content sits in phones, projects go unshared, and marketing stays manual." />
      <StatementSection text="Cytron turns every job site photo into a cinematic social media campaign — automatically. No designers, no editors, no posting schedules." align="right" />
      <Features />
      <Process />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
