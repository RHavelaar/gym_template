import type { ContactInquiryStatus, ContactInquiryTopic, ContactInquiry } from "@/types/database";
import { getGymConfig } from "@/config";
import { DEMO_GYM_ID } from "@/lib/demo-data";
import { hasSupabase } from "@/lib/env";
import { getGymIdBySlug } from "@/lib/profiles";
import { createServiceClient } from "@/lib/supabase/server";

export type CreateContactInquiryInput = {
  gymId: string;
  profileId?: string | null;
  name: string;
  email: string;
  phone?: string;
  topic: ContactInquiryTopic;
  message: string;
};

const demoInquiries: ContactInquiry[] = [];

export const createContactInquiry = async (input: CreateContactInquiryInput): Promise<ContactInquiry> => {
  if (!hasSupabase) {
    const inquiry: ContactInquiry = {
      id: `inquiry-${Date.now()}`,
      gym_id: input.gymId,
      profile_id: input.profileId ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      topic: input.topic,
      message: input.message,
      status: "new",
      read_at: null,
      email_sent_at: null,
      email_error: null,
      created_at: new Date().toISOString(),
    };
    demoInquiries.unshift(inquiry);
    return inquiry;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .insert({
      gym_id: input.gymId,
      profile_id: input.profileId ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      topic: input.topic,
      message: input.message,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save contact message");
  }

  return data as ContactInquiry;
};

export const markContactInquiryEmailResult = async (
  inquiryId: string,
  result: { sent: boolean; error?: string },
): Promise<void> => {
  if (!hasSupabase) {
    const row = demoInquiries.find((item) => item.id === inquiryId);
    if (!row) return;
    if (result.sent) {
      row.email_sent_at = new Date().toISOString();
      row.email_error = null;
    } else if (result.error) {
      row.email_error = result.error;
    }
    return;
  }

  const supabase = createServiceClient();
  await supabase
    .from("contact_inquiries")
    .update({
      email_sent_at: result.sent ? new Date().toISOString() : null,
      email_error: result.error ?? null,
    })
    .eq("id", inquiryId);
};

export const listContactInquiriesForGym = async (gymId: string): Promise<ContactInquiry[]> => {
  if (!hasSupabase) {
    return demoInquiries.filter((item) => item.gym_id === gymId);
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data ?? []) as ContactInquiry[];
};

export const markContactInquiryRead = async (inquiryId: string, gymId: string): Promise<void> => {
  if (!hasSupabase) {
    const row = demoInquiries.find((item) => item.id === inquiryId && item.gym_id === gymId);
    if (row) {
      row.status = "read";
      row.read_at = new Date().toISOString();
    }
    return;
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("contact_inquiries")
    .update({ status: "read" as ContactInquiryStatus, read_at: new Date().toISOString() })
    .eq("id", inquiryId)
    .eq("gym_id", gymId);

  if (error) throw new Error(error.message);
};

export const countNewContactInquiries = async (gymId: string): Promise<number> => {
  const rows = await listContactInquiriesForGym(gymId);
  return rows.filter((row) => row.status === "new").length;
};

export const resolveCurrentGymId = async (): Promise<string> => {
  if (!hasSupabase) return DEMO_GYM_ID;
  const slug = getGymConfig().slug;
  const gymId = await getGymIdBySlug(slug);
  if (!gymId) throw new Error("Gym not found");
  return gymId;
};
