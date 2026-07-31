import type { ClientCredential } from "@/lib/types/database";

export const demoCredentials: ClientCredential[] = [
  {
    id: "cred-1",
    client_id: "client-semper-fidelis",
    organization_id: "00000000-0000-0000-0000-000000000001",
    label: "Google Ads",
    category: "ads",
    username: "contato@semperfidelisfloorcare.com",
    password_plain: "Semper@Ads2025!",
    password_enc: "",
    url: "https://ads.google.com",
    notes: "Conta vinculada ao MCC da Elevra",
    created_by: "p-consultor-1",
    updated_by: null,
    created_at: "2025-11-05T10:00:00.000Z",
    updated_at: "2025-11-05T10:00:00.000Z",
  },
  {
    id: "cred-2",
    client_id: "client-semper-fidelis",
    organization_id: "00000000-0000-0000-0000-000000000001",
    label: "Meta Business Suite",
    category: "social_media",
    username: "michael.costa@semperfidelisfloorcare.com",
    password_plain: "M3ta#Semper!",
    password_enc: "",
    url: "https://business.facebook.com",
    notes: "Business Manager ID: 987654321",
    created_by: "p-consultor-1",
    updated_by: null,
    created_at: "2025-11-06T11:00:00.000Z",
    updated_at: "2025-11-06T11:00:00.000Z",
  },
  {
    id: "cred-3",
    client_id: "client-autoforce",
    organization_id: "00000000-0000-0000-0000-000000000001",
    label: "Google Analytics 4",
    category: "analytics",
    username: "marketing@autoforcegroup.com",
    password_plain: "AutoGA4#2025",
    password_enc: "",
    url: "https://analytics.google.com",
    notes: "Property ID: G-XXXXXXXXXX",
    created_by: "p-consultor-2",
    updated_by: null,
    created_at: "2025-06-20T14:00:00.000Z",
    updated_at: "2025-06-20T14:00:00.000Z",
  },
];

export function getCredentialsForClient(clientId: string): ClientCredential[] {
  return demoCredentials.filter((c) => c.client_id === clientId);
}
