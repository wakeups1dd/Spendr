import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { smsService } from '@/services/smsService';
import { ParsedTransactionQueue } from '@/types/finance';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Landmark, Calendar, ShoppingCart, Check, X, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SMSQueue = () => {
    const [items, setItems] = useState<ParsedTransactionQueue[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        const data = await smsService.getPendingTransactions();
        setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleApprove = async (id: string) => {
        const success = await smsService.approveQueuedTransaction(id);
        if (success) {
            toast.success('Transaction approved and added!');
            setItems(prev => prev.filter(item => item.id !== id));
        } else {
            toast.error('Failed to approve transaction');
        }
    };

    const handleReject = async (id: string) => {
        const success = await smsService.rejectQueuedTransaction(id);
        if (success) {
            toast.success('Transaction rejected');
            setItems(prev => prev.filter(item => item.id !== id));
        } else {
            toast.error('Failed to reject transaction');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground lg:text-3xl">SMS Approval Queue</h1>
                    <p className="mt-1 text-muted-foreground">Review and approve transactions parsed from your bank messages</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Fetching pending transactions...</p>
                    </div>
                ) : items.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                                <Info className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Queue is empty</h3>
                            <p className="max-w-xs text-sm text-muted-foreground mt-1">
                                New bank SMS messages will appear here for your review before being added to your records.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {items.map((item) => {
                            const suggested = item.suggestedTransaction;
                            const parsedJson = item.parsedJson as any;

                            return (
                                <Card key={item.id} className="overflow-hidden border-l-4 border-l-primary">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="flex-1 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Landmark className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {parsedJson?.bankName || 'Bank Transaction'}
                                                    </span>
                                                </div>
                                                <Badge variant={suggested?.type === 'income' ? 'secondary' : 'outline'} className={cn(
                                                    suggested?.type === 'income' ? "bg-income/10 text-income border-income/20" : "bg-expense/10 text-expense border-expense/20"
                                                )}>
                                                    {suggested?.type.toUpperCase()}
                                                </Badge>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold tracking-tight">₹{suggested?.amount.toLocaleString('en-IN')}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-muted-foreground">Merchant / Description</p>
                                                            <p className="text-sm font-medium truncate">{suggested?.merchant}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Date</p>
                                                            <p className="text-sm font-medium">
                                                                {suggested ? format(new Date(suggested.date), 'dd MMM yyyy') : 'Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground italic bg-secondary/30 p-3 rounded-lg">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                    <span>"{item.rawSms}"</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-secondary/20 p-6 flex lg:flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border min-w-[150px]">
                                            <Button
                                                onClick={() => handleApprove(item.id)}
                                                className="flex-1 gap-2"
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(item.id)}
                                                className="flex-1 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SMSQueue;
