"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Headphones,
  MemoryStick,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import LeadModal from "@/components/LeadModal";
import { product } from "@/lib/product";

const faqs = [
  ["O que está incluso?", "PC montado e testado com todos os componentes descritos na ficha técnica desta página."],
  ["Qual é a garantia?", "O projeto considera 1 ano de garantia para o setup, conforme os requisitos definidos."],
  ["Como funciona a validação?", "Após o cadastro, um código temporário de 6 dígitos é enviado por e-mail e precisa ser validado."],
  ["Quando recebo?", "Após a etapa de pagamento, o sistema poderá enviar a confirmação e a previsão de montagem e despacho."],
];

const highlights = [
  { icon: <Cpu />, title: "Ryzen 7 5700X", text: "8 núcleos e 16 threads" },
  { icon: <Gauge />, title: "RTX 4060 8GB", text: "Ray Tracing + DLSS" },
  { icon: <MemoryStick />, title: "32 GB RAM", text: "DDR4 3200 MHz" },
  { icon: <HardDrive />, title: "SSD NVMe 1 TB", text: "Inicialização e jogos rápidos" },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5599999999999").replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Quero saber mais sobre o PC Gamer Titan Elite.",
  )}`;

  return (
    <main className="grid-bg min-h-screen overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#inicio" className="text-xl font-black tracking-tight" aria-label="PC Gamer - início">
            PC<span className="text-indigo-400">GAMER</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
            <a href="#specs" className="hover:text-white">Especificações</a>
            <a href="#seguranca" className="hover:text-white">Segurança</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-extrabold transition hover:bg-emerald-500 sm:px-4"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-4 py-2 text-xs font-bold tracking-[0.15em] text-indigo-200 sm:text-sm">
            <Sparkles size={15} /> SETUP GAMER • EDIÇÃO LIMITADA
          </div>
          <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            PC Gamer <span className="text-gradient">Titan Elite</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Potência para jogar, criar e evoluir. Um setup equilibrado com Ryzen 7 5700X, RTX 4060 8 GB, 32 GB de RAM e SSD NVMe de 1 TB.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setOpen(true)} className="primary-button justify-center px-7 py-4 text-base">
              Comprar agora
            </button>
            <a href="#specs" className="secondary-button justify-center px-7 py-4 text-center text-base">
              Ver especificações
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Montado e testado</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> 1 ano de garantia</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Atendimento direto</span>
          </div>
        </div>

        <div className="glass relative rounded-[2rem] p-5 sm:p-8">
          <div className="pc-visual relative aspect-square overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/pc-gamer.png"
              alt="PC Gamer Titan Elite"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-4"
            />

            <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur">
              Titan Elite • ARGB
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Oferta do projeto</p>
              <p className="text-3xl font-black sm:text-4xl">R$ 4.999,00</p>
              <p className="mt-1 text-sm text-slate-400">até 12x via Mercado Pago</p>
            </div>
            <span className="w-fit rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-400">Disponível</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:border-indigo-400/30">
              <div className="text-indigo-400">{item.icon}</div>
              <p className="mt-4 text-xl font-black">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="specs" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="section-kicker">Hardware</p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">Ficha técnica</h2>
          <p className="mt-3 text-slate-400">Configuração definida para entregar desempenho e boa margem para upgrades.</p>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40">
          {product.specs.map(([name, value]) => (
            <div key={name} className="grid gap-1 border-b border-white/10 p-5 last:border-0 sm:grid-cols-[.8fr_1.2fr] sm:gap-5">
              <span className="text-sm text-slate-500 sm:text-base">{name}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </section>

      <section id="seguranca" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          <Feature icon={<ShieldCheck />} title="Validação de e-mail" description="Código OTP de 6 dígitos com hash, validade de 10 minutos e limite de tentativas." />
          <Feature icon={<Database />} title="Lead protegido" description="Cadastro persistido no banco relacional com validação dos campos antes de salvar." />
          <Feature icon={<Headphones />} title="Atendimento no WhatsApp" description="Canal direto para tirar dúvidas sobre peças, entrega e disponibilidade antes da compra." />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
        <p className="section-kicker">Dúvidas</p>
        <h2 className="mt-2 text-3xl font-black sm:text-5xl">Perguntas frequentes</h2>
        <div className="mt-7 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="glass group rounded-2xl p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                {question}
                <ChevronDown size={20} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-7 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="glass flex flex-col items-start justify-between gap-6 rounded-3xl p-7 sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="section-kicker">Pronto para começar?</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Cadastre-se e valide seu e-mail.</h2>
            <p className="mt-2 text-slate-400">O processo leva poucos minutos.</p>
          </div>
          <button onClick={() => setOpen(true)} className="primary-button px-7 py-3.5">Quero meu Titan Elite</button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-500">
        PC Gamer Titan Elite • Projeto acadêmico • © 2026
      </footer>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar pelo WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-950/40 transition hover:scale-105 hover:bg-emerald-500"
      >
        <MessageCircle size={27} />
      </a>

      <LeadModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}


function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300">{icon}</div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 leading-7 text-slate-400">{description}</p>
    </div>
  );
}
