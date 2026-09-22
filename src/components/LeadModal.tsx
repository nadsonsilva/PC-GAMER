"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, MapPin, RefreshCw, X } from "lucide-react";

type Props = { open: boolean; onClose: () => void };
type Step = "form" | "otp" | "success";

type LeadForm = {
  name: string;
  email: string;
  whatsapp: string;
  cep: string;
  address: string;
};

const initialForm: LeadForm = { name: "", email: "", whatsapp: "", cep: "", address: "" };

function maskWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function LeadModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || step !== "otp" || seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, step, seconds]);

  if (!open) return null;

  function close() {
    setStep("form");
    setForm(initialForm);
    setCode("");
    setError("");
    setSeconds(0);
    onClose();
  }

  async function lookupCep(cepValue: string) {
    const cep = cepValue.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.erro) return;
      const address = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean).join(", ");
      if (address) setForm((current) => ({ ...current, address }));
    } catch {
      // O endereço continua editável caso o ViaCEP esteja indisponível.
    } finally {
      setSearchingCep(false);
    }
  }

  async function submitLead(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          setSeconds(data.retryAfter);
          setStep("otp");
        }
        setError(data.message ?? "Não foi possível enviar os dados.");
        return;
      }

      setSeconds(data.resendIn ?? 60);
      setStep("otp");
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Código inválido.");
        return;
      }

      setStep("success");
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (seconds > 0 || loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfter) setSeconds(data.retryAfter);
        setError(data.message ?? "Não foi possível reenviar o código.");
        return;
      }

      setCode("");
      setSeconds(data.resendIn ?? 60);
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      <div className="glass my-auto w-full max-w-xl rounded-3xl p-5 shadow-2xl shadow-indigo-950/40 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
              {step === "form" ? "Cadastro" : step === "otp" ? "Segurança" : "Concluído"}
            </p>
            <h2 id="lead-modal-title" className="mt-1 text-2xl font-black sm:text-3xl">
              {step === "form" && "Começar compra"}
              {step === "otp" && "Validar e-mail"}
              {step === "success" && "E-mail validado"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={submitLead} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-300">Nome completo</span>
              <input
                required
                minLength={3}
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Seu nome"
                className="field"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-300">E-mail</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value.trimStart() })}
                placeholder="voce@email.com"
                className="field"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-300">WhatsApp</span>
                <input
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.whatsapp}
                  onChange={(event) => setForm({ ...form, whatsapp: maskWhatsapp(event.target.value) })}
                  placeholder="(92) 99999-9999"
                  className="field"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  CEP {searchingCep && <Loader2 size={14} className="animate-spin" />}
                </span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.cep}
                  onChange={(event) => {
                    const value = maskCep(event.target.value);
                    setForm({ ...form, cep: value });
                    if (value.replace(/\D/g, "").length === 8) lookupCep(value);
                  }}
                  placeholder="00000-000"
                  className="field"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <MapPin size={15} /> Endereço de entrega
              </span>
              <textarea
                required
                minLength={5}
                rows={3}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="Rua, número, bairro, cidade/UF"
                className="field resize-none"
              />
            </label>

            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

            <button disabled={loading} className="primary-button w-full py-3.5">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={19} />}
              {loading ? "Enviando..." : "Cadastrar e enviar código"}
            </button>
            <p className="text-center text-xs leading-5 text-slate-500">
              Seus dados são usados somente para contato, entrega e validação desta compra.
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyCode} className="mt-7">
            <div className="rounded-2xl border border-indigo-400/15 bg-indigo-400/5 p-4 text-sm leading-6 text-slate-300">
              Enviamos um código de 6 dígitos para <b className="text-white">{form.email}</b>. Ele expira em 10 minutos.
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">Código de verificação</span>
              <input
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="field text-center text-3xl font-black tracking-[0.32em]"
              />
            </label>

            {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

            <button disabled={loading || code.length !== 6} className="primary-button mt-5 w-full py-3.5">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {loading ? "Validando..." : "Validar e-mail"}
            </button>

            <button
              type="button"
              disabled={seconds > 0 || loading}
              onClick={resendCode}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {seconds > 0 ? `Reenviar em ${seconds}s` : "Reenviar código"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={44} />
            </div>
            <h3 className="mt-5 text-2xl font-black">Validação concluída</h3>
            <p className="mx-auto mt-2 max-w-sm text-slate-400">
              Seu lead foi salvo no banco e o e-mail foi confirmado. O fluxo está pronto para seguir para o checkout na próxima etapa do projeto.
            </p>
            <button type="button" onClick={close} className="primary-button mx-auto mt-6 px-8 py-3">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
