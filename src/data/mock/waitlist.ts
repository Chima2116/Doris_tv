import type { WaitlistEntry } from "@/data/types";

const w = (id: number, name: string, email: string, registeredAt: string, status: WaitlistEntry["status"], interest: WaitlistEntry["interest"], memberId?: string): WaitlistEntry => ({
  id: `w_${String(id).padStart(2, "0")}`,
  name,
  email,
  registeredAt,
  status,
  interest,
  memberId,
});

/** Seed waitlist. Entries become "linked" once the person creates an account with the same email. */
export const WAITLIST: WaitlistEntry[] = [
  w(1, "Adaeze Nwosu", "adaeze.nwosu@example.com", "2026-09-30T10:00:00Z", "linked", "reader", "m_demo_member"),
  w(2, "Amina Diallo", "amina.diallo@example.com", "2026-10-13T14:20:00Z", "linked", "filmmaker", "m_demo_waitlisted"),
  w(3, "Ngozi Ihejirika", "ngozi.ihejirika@example.com", "2026-09-19T09:30:00Z", "linked", "filmmaker", "m_demo_filmmaker"),
  w(4, "Kola Fashola", "kola.fashola@example.com", "2026-09-11T08:00:00Z", "linked", "writer", "m_demo_moderator"),
  w(5, "Kofi Asante", "kofi.asante@example.com", "2026-10-02T16:45:00Z", "linked", "writer", "m_kofi"),
  w(6, "Zainab Abubakar", "zainab.abubakar@example.com", "2026-09-17T11:10:00Z", "linked", "filmmaker", "m_zainab"),
  w(7, "Fatou Sy", "fatou.sy@example.com", "2026-10-06T13:00:00Z", "linked", "filmmaker", "m_fatou"),
  w(8, "Obinna Ogu", "obinna.ogu@example.com", "2026-09-09T17:30:00Z", "linked", "writer", "m_obinna"),
  w(9, "Tolu Akinlade", "tolu.akinlade@example.com", "2026-09-04T12:00:00Z", "linked", "writer", "m_tolu"),
  w(10, "Kwame Tetteh", "kwame.tetteh@example.com", "2026-11-01T09:00:00Z", "registered", "reader"),
  w(11, "Lindiwe Mokoena", "lindiwe.mokoena@example.com", "2026-11-03T15:20:00Z", "registered", "filmmaker"),
  w(12, "Yosef Alemu", "yosef.alemu@example.com", "2026-11-04T10:10:00Z", "registered", "reader"),
  w(13, "Chiamaka Eze", "chiamaka.eze@example.com", "2026-11-05T18:40:00Z", "invited", "writer"),
  w(14, "Mamadou Keita", "mamadou.keita@example.com", "2026-11-05T07:55:00Z", "registered", "filmmaker"),
  w(15, "Grace Wambui", "grace.wambui@example.com", "2026-11-06T11:30:00Z", "invited", "reader"),
  w(16, "Samuel Okoro", "samuel.okoro@example.com", "2026-11-07T20:15:00Z", "registered", "other"),
  w(17, "Aïcha Traoré", "aicha.traore@example.com", "2026-11-07T09:05:00Z", "registered", "filmmaker"),
  w(18, "Joseph Banda", "joseph.banda@example.com", "2026-11-08T14:00:00Z", "registered", "reader"),
  w(19, "Nomvula Khumalo", "nomvula.khumalo@example.com", "2026-11-09T08:25:00Z", "invited", "writer"),
  w(20, "Ibrahim Sesay", "ibrahim.sesay@example.com", "2026-11-09T19:45:00Z", "registered", "reader"),
  w(21, "Hanna Gebre", "hanna.gebre@example.com", "2026-11-10T10:30:00Z", "registered", "filmmaker"),
  w(22, "Peter Njoroge", "peter.njoroge@example.com", "2026-11-10T16:50:00Z", "registered", "other"),
  w(23, "Awa Ndiaye", "awa.ndiaye@example.com", "2026-11-11T07:15:00Z", "registered", "reader"),
  w(24, "Tendai Moyo", "tendai.moyo@example.com", "2026-11-11T09:40:00Z", "registered", "filmmaker"),
];
