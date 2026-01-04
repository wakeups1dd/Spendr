// SMS Service - Handles SMS parsing and transaction queue operations
import { supabase } from '@/lib/supabase';
import { ParsedTransaction, ParsedTransactionQueue, SmsSyncSettings } from '@/types/finance';
import { Transaction } from '@/types/finance';

export interface ParseSMSResponse {
  success: boolean;
  data?: ParsedTransaction;
  error?: string;
}

export interface SyncTransactionResponse {
  success: boolean;
  data?: {
    transactionId?: string;
    queueId?: string;
    isDuplicate?: boolean;
  };
  error?: string;
}

class SMSService {
  /**
   * Parse SMS text using the Edge Function
   */
  async parseSMS(smsText: string, phoneNumber?: string): Promise<ParseSMSResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.functions.invoke('parse-sms', {
        body: {
          smsText,
          phoneNumber,
          userId: user.id,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return data as ParseSMSResponse;
    } catch (error) {
      console.error('Error parsing SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync a parsed transaction to the database or queue
   */
  async syncTransaction(
    parsedTransaction: ParsedTransaction,
    autoApprove: boolean = false
  ): Promise<SyncTransactionResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.functions.invoke('sync-transaction', {
        body: {
          userId: user.id,
          parsedTransaction,
          autoApprove,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return data as SyncTransactionResponse;
    } catch (error) {
      console.error('Error syncing transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get SMS sync settings for the current user
   */
  async getSyncSettings(): Promise<SmsSyncSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('sms_sync_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        phoneNumber: data.phone_number,
        bankName: data.bank_name,
        isActive: data.is_active,
        lastSyncAt: data.last_sync_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching sync settings:', error);
      return null;
    }
  }

  /**
   * Update SMS sync settings
   */
  async updateSyncSettings(settings: Partial<Omit<SmsSyncSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('sms_sync_settings')
        .upsert({
          user_id: user.id,
          phone_number: settings.phoneNumber,
          bank_name: settings.bankName,
          is_active: settings.isActive,
          last_sync_at: settings.lastSyncAt,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating sync settings:', error);
      return false;
    }
  }

  /**
   * Get pending transactions from the queue
   */
  async getPendingTransactions(): Promise<ParsedTransactionQueue[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('parsed_transactions_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        rawSms: item.raw_sms,
        parsedJson: item.parsed_json,
        confidenceScore: item.confidence_score,
        status: item.status,
        suggestedTransaction: item.suggested_transaction,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }
  }

  /**
   * Get all queued transactions (all statuses)
   */
  async getAllQueuedTransactions(): Promise<ParsedTransactionQueue[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('parsed_transactions_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        rawSms: item.raw_sms,
        parsedJson: item.parsed_json,
        confidenceScore: item.confidence_score,
        status: item.status,
        suggestedTransaction: item.suggested_transaction,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching queued transactions:', error);
      return [];
    }
  }

  /**
   * Approve a queued transaction and add it to transactions table
   */
  async approveQueuedTransaction(
    queueId: string,
    transaction?: Partial<Transaction>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the queued transaction
      const { data: queueItem, error: queueError } = await supabase
        .from('parsed_transactions_queue')
        .select('*')
        .eq('id', queueId)
        .eq('user_id', user.id)
        .single();

      if (queueError || !queueItem) {
        throw new Error('Queue item not found');
      }

      const suggested = queueItem.suggested_transaction as any;
      const finalTransaction = transaction || suggested;

      // Insert into transactions table
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: finalTransaction.amount,
          type: finalTransaction.type,
          category: finalTransaction.category || 'Other',
          merchant: finalTransaction.merchant,
          date: finalTransaction.date,
          notes: finalTransaction.notes,
          source: 'sms',
          raw_sms: queueItem.raw_sms,
          parsed_json: queueItem.parsed_json,
        });

      if (insertError) throw insertError;

      // Update queue item status
      const { error: updateError } = await supabase
        .from('parsed_transactions_queue')
        .update({ status: 'approved' })
        .eq('id', queueId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error approving queued transaction:', error);
      return false;
    }
  }

  /**
   * Reject a queued transaction
   */
  async rejectQueuedTransaction(queueId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('parsed_transactions_queue')
        .update({ status: 'rejected' })
        .eq('id', queueId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting queued transaction:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();


