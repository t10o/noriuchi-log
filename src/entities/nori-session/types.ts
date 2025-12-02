export type ParticipantView = {
  userId: string;
  name: string | null;
  email: string | null;
  avatar?: string | null;
  invested: number;
  payout: number;
};

export type NoriSessionView = {
  id: string;
  date: string; // ISO string
  machineName: string;
  location?: string | null;
  note?: string | null;
  totalInvest: number;
  totalPayout: number;
  net: number;
  perHead: number;
  createdById: string;
  participants: ParticipantView[];
};
