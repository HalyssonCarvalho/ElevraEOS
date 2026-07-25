import type { BadgeTone } from "@/components/ui/Badge";
import type {
  CampaignStatus,
  ClientStatus,
  ContentStatus,
  ContentType,
  TaskPriority,
  TaskStatus,
} from "@/lib/types/database";

export const clientStatusLabels: Record<ClientStatus, { label: string; tone: BadgeTone }> = {
  ativo: { label: "Ativo", tone: "success" },
  pausado: { label: "Pausado", tone: "warning" },
  em_risco: { label: "Em risco", tone: "danger" },
  encerrado: { label: "Encerrado", tone: "neutral" },
};

export const taskStatusLabels: Record<TaskStatus, { label: string; tone: BadgeTone }> = {
  pendente: { label: "Pendente", tone: "neutral" },
  em_andamento: { label: "Em andamento", tone: "accent" },
  aguardando_cliente: { label: "Aguardando cliente", tone: "warning" },
  concluida: { label: "Concluída", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
};

export const taskPriorityLabels: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  baixa: { label: "Baixa", tone: "neutral" },
  media: { label: "Média", tone: "accent" },
  alta: { label: "Alta", tone: "warning" },
  urgente: { label: "Urgente", tone: "danger" },
};

export const contentStatusLabels: Record<ContentStatus, { label: string; tone: BadgeTone }> = {
  ideia: { label: "Ideia", tone: "neutral" },
  planejado: { label: "Planejado", tone: "neutral" },
  em_producao: { label: "Em produção", tone: "accent" },
  em_aprovacao: { label: "Em aprovação", tone: "warning" },
  programado: { label: "Programado", tone: "accent" },
  publicado: { label: "Publicado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "danger" },
};

export const contentTypeLabels: Record<ContentType, string> = {
  reels: "Reels",
  stories: "Stories",
  carrossel: "Carrossel",
  post_estatico: "Post estático",
  email: "E-mail",
  sms: "SMS",
  whatsapp: "WhatsApp",
  anuncio: "Anúncio",
  evento: "Evento",
  campanha_sazonal: "Campanha sazonal",
};

export const campaignStatusLabels: Record<CampaignStatus, { label: string; tone: BadgeTone }> = {
  planejada: { label: "Planejada", tone: "neutral" },
  ativa: { label: "Ativa", tone: "success" },
  pausada: { label: "Pausada", tone: "warning" },
  concluida: { label: "Concluída", tone: "accent" },
  cancelada: { label: "Cancelada", tone: "danger" },
};
