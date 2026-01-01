// Supabase Edge Function: parse-sms
// Parses SMS text and extracts transaction information

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import type { ParsedTransaction } from "./parser.ts";

interface ParseSMSRequest {
  smsText: string;
  phoneNumber?: string;
  userId: string;
}

interface ParseResponse {
  success: boolean;
  data?: ParsedTransaction;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { smsText, phoneNumber, userId }: ParseSMSRequest = await req.json();

    // Validate input
    if (!smsText || !smsText.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "SMS text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID mismatch" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use the SMS parser
    const { parseSMS } = await import("./parser.ts");
    const parsedTransaction = parseSMS(smsText);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedTransaction,
      } as ParseResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error parsing SMS:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as ParseResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


