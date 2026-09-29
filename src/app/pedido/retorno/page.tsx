import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default function PaymentReturnPage({
  searchParams,
}: {
  searchParams: { order?: string; result?: string };
}) {
  const result = searchParams.result;
  const order = searchParams.order;

  const content =
    result === "success"
      ? {
          icon: <CheckCircle2 size={54} className="text-emerald-400" />,
          title: "Pagamento enviado",
          text: "O Mercado Pago informou o retorno de sucesso. O webhook fará a confirmação definitiva do status no servidor.",
        }
      : result === "pending"
        ? {
            icon: <Clock3 size={54} className="text-amber-300" />,
            title: "Pagamento pendente",
            text: "O pagamento ainda está em processamento. O pedido será atualizado quando o Mercado Pago enviar a confirmação.",
          }
        : {
            icon: <XCircle size={54} className="text-red-300" />,
            title: "Pagamento não concluído",
            text: "O checkout retornou sem aprovação. Você pode voltar à página inicial e tentar novamente.",
          };

  return (
    <main className="grid-bg grid min-h-screen place-items-center px-4 py-12">
      <section className="glass w-full max-w-xl rounded-3xl p-8 text-center sm:p-10">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/5">{content.icon}</div>
        <p className="section-kicker mt-6">Pedido {order ? `#${order}` : ""}</p>
        <h1 className="mt-2 text-3xl font-black">{content.title}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-400">{content.text}</p>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          O retorno do navegador não é usado sozinho para marcar um pedido como pago; a confirmação é feita no backend.
        </p>
        <Link href="/" className="primary-button mt-7 px-7 py-3.5">
          Voltar para a loja
        </Link>
      </section>
    </main>
  );
}
