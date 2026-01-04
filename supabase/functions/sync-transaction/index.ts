// Supabase Edge Function: sync-transaction
// Syncs a parsed transaction to the transactions table or queue

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SyncTransactionRequest {
  userId: string;
  parsedTransaction: {
    amount: number;
    type: "income" | "expense";
    merchant: string;
    date: string;
    category?: string;
    confidence: number;
    rawSms: string;
    metadata?: Record<string, unknown>;
  };
  autoApprove?: boolean; // If true, add directly to transactions; if false, add to queue
}

interface SyncResponse {
  success: boolean;
  data?: {
    transactionId?: string;
    queueId?: string;
    isDuplicate?: boolean;
  };
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
    const {
      userId,
      parsedTransaction,
      autoApprove = false,
    }: SyncTransactionRequest = await req.json();

    // Validate input
    if (!parsedTransaction || !parsedTransaction.amount || !parsedTransaction.type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid transaction data",
        }),
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

    // Check for duplicates (same amount, merchant, and date within 24 hours)
    const transactionDate = new Date(parsedTransaction.date);
    const dayBefore = new Date(transactionDate);
    dayBefore.setHours(dayBefore.getHours() - 24);
    const dayAfter = new Date(transactionDate);
    dayAfter.setHours(dayAfter.getHours() + 24);

    const { data: existingTransactions, error: duplicateCheckError } =
      await supabase
        .from("transactions")
        .select("id, amount, merchant, date")
        .eq("user_id", userId)
        .eq("amount", parsedTransaction.amount)
        .eq("merchant", parsedTransaction.merchant)
        .gte("date", dayBefore.toISOString())
        .lte("date", dayAfter.toISOString())
        .limit(1);

    if (duplicateCheckError) {
      console.error("Error checking duplicates:", duplicateCheckError);
    }

    const isDuplicate = existingTransactions && existingTransactions.length > 0;

    if (isDuplicate && !autoApprove) {
      // Add to queue with duplicate status
      const { data: queueData, error: queueError } = await supabase
        .from("parsed_transactions_queue")
        .insert({
          user_id: userId,
          raw_sms: parsedTransaction.rawSms,
          parsed_json: parsedTransaction.metadata || {},
          confidence_score: parsedTransaction.confidence,
          status: "duplicate",
          suggested_transaction: {
            amount: parsedTransaction.amount,
            type: parsedTransaction.type,
            merchant: parsedTransaction.merchant,
            date: parsedTransaction.date,
            category: parsedTransaction.category,
          },
        })
        .select()
        .single();

      if (queueError) {
        throw queueError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            queueId: queueData.id,
            isDuplicate: true,
          },
        } as SyncResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (autoApprove && !isDuplicate) {
      // Add directly to transactions table
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: parsedTransaction.amount,
          type: parsedTransaction.type,
          category: parsedTransaction.category || "Other",
          merchant: parsedTransaction.merchant,
          date: parsedTransaction.date,
          source: "sms",
          raw_sms: parsedTransaction.rawSms,
          parsed_json: parsedTransaction.metadata || {},
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            transactionId: transactionData.id,
            isDuplicate: false,
          },
        } as SyncResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Add to queue for manual review
      const { data: queueData, error: queueError } = await supabase
        .from("parsed_transactions_queue")
        .insert({
          user_id: userId,
          raw_sms: parsedTransaction.rawSms,
          parsed_json: parsedTransaction.metadata || {},
          confidence_score: parsedTransaction.confidence,
          status: "pending",
          suggested_transaction: {
            amount: parsedTransaction.amount,
            type: parsedTransaction.type,
            merchant: parsedTransaction.merchant,
            date: parsedTransaction.date,
            category: parsedTransaction.category,
          },
        })
        .select()
        .single();

      if (queueError) {
        throw queueError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            queueId: queueData.id,
            isDuplicate: false,
          },
        } as SyncResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error syncing transaction:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as SyncResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


