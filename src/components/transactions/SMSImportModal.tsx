import { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { parseSMS } from '@/services/sms-parser';
import { TransactionType, TransactionSource } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CreditCard, Landmark, Calendar, ShoppingCart, Check, AlertCircle } from 'lucide-react';

interface SMSImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SMSImportModal = ({ open, onOpenChange }: SMSImportModalProps) => {
    const { addTransaction } = useFinance();
    const [smsText, setSmsText] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (smsText.trim()) {
            const result = parseSMS(smsText);
            if (result.success && result.data) {
                setParsedData(result.data);
                setError(null);
            } else {
                setParsedData(null);
                setError(result.error || 'Could not parse SMS. Try another format.');
            }
        } else {
            setParsedData(null);
            setError(null);
        }
    }, [smsText]);

    const handleImport = () => {
        if (!parsedData) return;

        addTransaction({
            date: parsedData.date.split('T')[0],
            amount: parsedData.amount,
            category: parsedData.category || 'Other',
            merchant: parsedData.merchant,
            type: parsedData.type as TransactionType,
            source: 'sms' as TransactionSource,
            rawSms: smsText,
            parsedJson: parsedData.metadata,
        });

        toast.success('Transaction imported from SMS!');
        onOpenChange(false);
        setSmsText('');
        setParsedData(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import from SMS</DialogTitle>
                    <DialogDescription>
                        Paste your bank SMS here to automatically extract transaction details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sms-text">Bank SMS Text</Label>
                        <Textarea
                            id="sms-text"
                            placeholder="e.g., A/c XX1234 credited with INR 50,000.00 on 01-Jan-24..."
                            className="min-h-[100px] resize-none"
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                        />
                    </div>

                    {parsedData && (
                        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Landmark className="h-3.5 w-3.5" />
                                    {parsedData.metadata?.bankName || 'Detected Details'}
                                </span>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                    parsedData.type === 'income' ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                                )}>
                                    {parsedData.type}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold tracking-tight">₹{parsedData.amount.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <ShoppingCart className="h-4 w-4" />
                                        <span className="truncate flex-1 text-foreground font-medium">{parsedData.merchant}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-foreground font-medium">
                                            {new Date(parsedData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs text-muted-foreground">Category:</span>
                                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                        {parsedData.category || 'Other'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && smsText.trim() && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={!parsedData}
                        onClick={handleImport}
                        className="flex-1 sm:flex-none gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Import Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
