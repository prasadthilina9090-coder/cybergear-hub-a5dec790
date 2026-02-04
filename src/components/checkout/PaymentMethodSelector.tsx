import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banknote, Building2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentMethodSelectorProps {
  paymentMethod: 'cash_on_delivery' | 'bank_transfer';
  onPaymentMethodChange: (method: 'cash_on_delivery' | 'bank_transfer') => void;
  paymentSlipUrl: string | null;
  onPaymentSlipUpload: (url: string) => void;
  userId: string;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  paymentSlipUrl,
  onPaymentSlipUpload,
  userId,
}: PaymentMethodSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image (JPEG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-slips')
        .getPublicUrl(fileName);

      onPaymentSlipUpload(fileName);
      toast.success('Payment slip uploaded successfully!');
    } catch (error) {
      console.error('Error uploading payment slip:', error);
      toast.error('Failed to upload payment slip. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Banknote className="h-5 w-5 text-primary" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => onPaymentMethodChange(value as 'cash_on_delivery' | 'bank_transfer')}
          className="space-y-4"
        >
          {/* Cash on Delivery */}
          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="cash_on_delivery" className="text-base font-medium cursor-pointer">
                Cash on Delivery
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pay when your order is delivered to your doorstep
              </p>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="bank_transfer" className="text-base font-medium cursor-pointer">
                Bank Transfer
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer payment directly to our bank account
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Bank Transfer Details */}
        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              <h4 className="font-semibold">Bank Account Details</h4>
            </div>
            
            <div className="grid gap-4">
              {/* BOC Bank */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h5 className="font-semibold text-foreground">BOC BANK</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Account Number:</span> <span className="font-mono font-medium">5858773</span></p>
                  <p><span className="text-muted-foreground">Branch:</span> SEWAGAMA</p>
                </div>
              </div>

              {/* Commercial Bank */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h5 className="font-semibold text-foreground">COMMERCIAL BANK</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Account Number:</span> <span className="font-mono font-medium">8019568054</span></p>
                  <p><span className="text-muted-foreground">Branch:</span> Kaduruwela</p>
                </div>
              </div>
            </div>

            {/* Payment Slip Upload Section */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" />
                <h4 className="font-semibold">Upload Payment Slip</h4>
              </div>

              <div className="p-4 rounded-lg bg-accent/30 border border-accent">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-accent-foreground space-y-2">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Transfer the total amount to one of the bank accounts above</li>
                      <li>Take a screenshot or photo of your payment confirmation/slip</li>
                      <li>Upload the payment slip below</li>
                      <li>Your order will be processed once we verify the payment</li>
                    </ol>
                  </div>
                </div>
              </div>

              {paymentSlipUrl ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Payment slip uploaded successfully!</p>
                    <p className="text-xs text-muted-foreground">Your payment will be verified after order placement</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="payment-slip" className="text-sm">
                    Upload your payment slip (JPEG, PNG, WebP, or PDF - Max 5MB)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="payment-slip"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
