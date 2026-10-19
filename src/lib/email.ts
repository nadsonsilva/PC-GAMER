import net from "node:net";
import tls from "node:tls";
import type { Socket } from "node:net";
import type { TLSSocket } from "node:tls";

type AnySocket = Socket | TLSSocket;

class SmtpReader {
  private buffer = "";
  private responseLines: string[] = [];
  private queue: string[][] = [];
  private waiters: Array<(lines: string[]) => void> = [];
  private onDataBound = (chunk: Buffer) => this.onData(chunk);
  private onErrorBound = (error: Error) => this.fail(error);
  private onCloseBound = () => this.fail(new Error("Conexão SMTP encerrada antes da resposta."));
  private failures: Array<(error: Error) => void> = [];
  private terminalError: Error | null = null;

  constructor(private socket: AnySocket) {
    socket.on("data", this.onDataBound);
    socket.on("error", this.onErrorBound);
    socket.on("close", this.onCloseBound);
  }

  dispose() {
    this.socket.off("data", this.onDataBound);
    this.socket.off("error", this.onErrorBound);
    this.socket.off("close", this.onCloseBound);
  }

  private fail(error: Error) {
    this.terminalError = error;
    for (const reject of this.failures.splice(0)) reject(error);
    this.waiters.length = 0;
  }

  private onData(chunk: Buffer) {
    this.buffer += chunk.toString("utf8");
    let lineEnd = this.buffer.indexOf("\n");

    while (lineEnd !== -1) {
      const raw = this.buffer.slice(0, lineEnd + 1);
      this.buffer = this.buffer.slice(lineEnd + 1);
      const line = raw.replace(/\r?\n$/, "");
      this.responseLines.push(line);

      if (/^\d{3} /.test(line)) {
        const complete = this.responseLines;
        this.responseLines = [];
        const waiter = this.waiters.shift();
        if (waiter) { this.failures.shift(); waiter(complete); }
        else this.queue.push(complete);
      }
      lineEnd = this.buffer.indexOf("\n");
    }
  }

  read() {
    const queued = this.queue.shift();
    if (queued) return Promise.resolve(queued);
    if (this.terminalError) return Promise.reject(this.terminalError);
    return new Promise<string[]>((resolve, reject) => {
      this.waiters.push(resolve);
      this.failures.push(reject);
    });
  }
}

function smtpCode(lines: string[]) {
  return Number(lines.at(-1)?.slice(0, 3));
}

async function expect(reader: SmtpReader, accepted: number[]) {
  const lines = await reader.read();
  const code = smtpCode(lines);
  if (!accepted.includes(code)) {
    throw new Error(`SMTP respondeu ${code}: ${lines.join(" | ")}`);
  }
  return lines;
}

async function command(socket: AnySocket, reader: SmtpReader, value: string, accepted: number[]) {
  socket.write(`${value}\r\n`);
  return expect(reader, accepted);
}

function waitForConnect(socket: AnySocket, event: "connect" | "secureConnect") {
  return new Promise<void>((resolve, reject) => {
    socket.once(event, () => { socket.off("error", reject); resolve(); });
    socket.once("error", reject);
  });
}

function fromAddress(value: string) {
  return value.match(/<([^>]+)>/)?.[1] ?? value;
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function dotStuff(value: string) {
  return value.replace(/^\./gm, "..");
}

async function createSmtpConnection(host: string, port: number) {
  if (port === 465) {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: true });
    socket.setTimeout(15000, () => socket.destroy(new Error("Timeout SMTP")));
    const reader = new SmtpReader(socket);
    await waitForConnect(socket, "secureConnect");
    return { socket, reader };
  }

  const plainSocket = net.connect({ host, port });
  plainSocket.setTimeout(15000, () => plainSocket.destroy(new Error("Timeout SMTP")));
  const plainReader = new SmtpReader(plainSocket);
  await waitForConnect(plainSocket, "connect");
  await expect(plainReader, [220]);
  await command(plainSocket, plainReader, "EHLO pc-gamer.local", [250]);
  await command(plainSocket, plainReader, "STARTTLS", [220]);
  plainReader.dispose();

  const secureSocket = tls.connect({ socket: plainSocket, servername: host, rejectUnauthorized: true });
  await waitForConnect(secureSocket, "secureConnect");
  return { socket: secureSocket, reader: new SmtpReader(secureSocket), greeted: true };
}

export async function sendSmtpEmail(to: string, subject: string, message: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || "PC Gamer <no-reply@example.com>";

  if (!host || !user || !password) {
    if (process.env.NODE_ENV === "production") throw new Error("Configuração SMTP incompleta.");
    console.info(`[DEV] E-mail simulado para ${to}: ${subject}\n${message}`);
    return { simulated: true };
  }

  let socket: AnySocket | undefined;
  let reader: SmtpReader | undefined;
  try {
    const connection = await createSmtpConnection(host, port);
    socket = connection.socket;
    socket.setTimeout(15000, () => socket?.destroy(new Error("Tempo limite SMTP excedido.")));
    reader = connection.reader;
    if (port === 465) await expect(reader, [220]);
    await command(socket, reader, "EHLO pc-gamer.local", [250]);
    await command(socket, reader, "AUTH LOGIN", [334]);
    await command(socket, reader, Buffer.from(user).toString("base64"), [334]);
    await command(socket, reader, Buffer.from(password).toString("base64"), [235]);
    await command(socket, reader, `MAIL FROM:<${fromAddress(from)}>`, [250]);
    await command(socket, reader, `RCPT TO:<${to}>`, [250, 251]);
    await command(socket, reader, "DATA", [354]);
    const safeSubject = subject.replace(/[\r\n]/g, " ");
    const safeTo = to.replace(/[\r\n]/g, "");
    const body = [
      `From: ${from}`, `To: ${safeTo}`, `Subject: ${encodeHeader(safeSubject)}`,
      "MIME-Version: 1.0", 'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit", "", message,
    ].join("\r\n");
    socket.write(`${dotStuff(body)}\r\n.\r\n`);
    await expect(reader, [250]);
    await command(socket, reader, "QUIT", [221]);
    return { simulated: false };
  } finally {
    reader?.dispose();
    socket?.destroy();
  }
}

export async function sendOtpEmail(to: string, code: string) {
  return sendSmtpEmail(to, "Seu código de verificação - PC Gamer", [
    "Seu código de verificação é:", "", code, "",
    "Ele expira em 10 minutos e pode ser usado apenas uma vez.",
    "Se você não solicitou este código, ignore este e-mail.",
  ].join("\n"));
}

export async function sendPaymentConfirmationEmail(to: string, name: string, orderNumber: number, amountCents: number) {
  const amount = (amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return sendSmtpEmail(to, `Pagamento confirmado - Pedido #${orderNumber} - PC Gamer`, [
    `Olá, ${name}!`, "", "O seu pagamento foi confirmado pelo Mercado Pago.",
    `Pedido: #${orderNumber}`, `Valor: ${amount}`, "Status: Pago", "",
    "Obrigado pela compra!", "Equipe PC Gamer",
  ].join("\n"));
}
