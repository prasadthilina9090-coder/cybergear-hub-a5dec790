import { useState, useMemo } from 'react';
import { Cpu, HardDrive, CircuitBoard, Zap, Box, Fan, Monitor, ShoppingCart, Check, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Layout from '@/components/layout/Layout';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import type { Product, PcPartType } from '@/types/database';
import { toast } from 'sonner';

interface BuildStep {
  type: PcPartType;
  label: string;
  icon: React.ElementType;
  description: string;
  required: boolean;
}

const buildSteps: BuildStep[] = [
  { type: 'cpu', label: 'Processor (CPU)', icon: Cpu, description: 'The brain of your PC', required: true },
  { type: 'motherboard', label: 'Motherboard', icon: CircuitBoard, description: 'Connects all components', required: true },
  { type: 'ram', label: 'Memory (RAM)', icon: Monitor, description: 'For multitasking', required: true },
  { type: 'gpu', label: 'Graphics Card', icon: Monitor, description: 'For gaming & visuals', required: false },
  { type: 'storage', label: 'Storage', icon: HardDrive, description: 'SSD or HDD', required: true },
  { type: 'psu', label: 'Power Supply', icon: Zap, description: 'Powers your system', required: true },
  { type: 'case', label: 'Case', icon: Box, description: 'Houses everything', required: true },
  { type: 'cooling', label: 'Cooling', icon: Fan, description: 'Keeps temps low', required: false },
];

export default function PCBuilder() {
  const { products, isLoading } = useProducts({ category: 'pc_parts' });
  const { addToCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedParts, setSelectedParts] = useState<Record<PcPartType, Product | null>>({
    cpu: null,
    gpu: null,
    ram: null,
    storage: null,
    motherboard: null,
    psu: null,
    case: null,
    cooling: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const partsForCurrentStep = useMemo(() => {
    const stepType = buildSteps[currentStep].type;
    return products.filter(p => p.pc_part_type === stepType && p.stock_quantity > 0);
  }, [products, currentStep]);

  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, part) => {
      if (part) {
        return sum + (part.sale_price || part.price);
      }
      return sum;
    }, 0);
  }, [selectedParts]);

  const completedSteps = useMemo(() => {
    return buildSteps.filter(step => selectedParts[step.type] !== null).length;
  }, [selectedParts]);

  const requiredComplete = useMemo(() => {
    return buildSteps
      .filter(step => step.required)
      .every(step => selectedParts[step.type] !== null);
  }, [selectedParts]);

  const handleSelectPart = (part: Product) => {
    const stepType = buildSteps[currentStep].type;
    setSelectedParts(prev => ({ ...prev, [stepType]: part }));
    setDialogOpen(false);
    
    if (currentStep < buildSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleRemovePart = (type: PcPartType) => {
    setSelectedParts(prev => ({ ...prev, [type]: null }));
  };

  const handleAddAllToCart = () => {
    const parts = Object.values(selectedParts).filter(Boolean) as Product[];
    if (parts.length === 0) {
      toast.error('Please select at least one part');
      return;
    }
    
    parts.forEach(part => addToCart(part, 1));
    toast.success(`Added ${parts.length} parts to cart`);
  };

  const handleReset = () => {
    setSelectedParts({
      cpu: null,
      gpu: null,
      ram: null,
      storage: null,
      motherboard: null,
      psu: null,
      case: null,
      cooling: null,
    });
    setCurrentStep(0);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Build Tool</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">PC Builder Wizard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build your dream PC step by step. Select compatible components and we'll ensure everything works together.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-medium">{completedSteps}/{buildSteps.length} components selected</span>
          </div>
          <Progress value={(completedSteps / buildSteps.length) * 100} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Select Components</CardTitle>
                <CardDescription>Click on each component to select a part</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {buildSteps.map((step, index) => {
                    const Icon = step.icon;
                    const selectedPart = selectedParts[step.type];
                    const isActive = currentStep === index;

                    return (
                      <Dialog key={step.type} open={dialogOpen && currentStep === index} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setCurrentStep(index);
                      }}>
                        <DialogTrigger asChild>
                          <button
                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                              selectedPart
                                ? 'border-cyber-green/50 bg-cyber-green/5'
                                : isActive
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border/50 bg-secondary/30 hover:border-border'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${selectedPart ? 'bg-cyber-green/20' : 'bg-secondary'}`}>
                                {selectedPart ? (
                                  <Check className="h-5 w-5 text-cyber-green" />
                                ) : (
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{step.label}</span>
                                  {step.required && !selectedPart && (
                                    <Badge variant="outline" className="text-xs py-0">Required</Badge>
                                  )}
                                </div>
                                {selectedPart ? (
                                  <div className="mt-1">
                                    <p className="text-xs text-muted-foreground truncate">{selectedPart.name}</p>
                                    <p className="text-sm text-primary font-semibold">
                                      ${(selectedPart.sale_price || selectedPart.price).toFixed(2)}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                )}
                              </div>
                              {selectedPart && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePart(step.type);
                                  }}
                                  className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-display flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              Select {step.label}
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            {isLoading ? (
                              <div className="p-8 text-center text-muted-foreground">Loading parts...</div>
                            ) : partsForCurrentStep.length === 0 ? (
                              <div className="p-8 text-center">
                                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No parts available for this category</p>
                              </div>
                            ) : (
                              <div className="space-y-3 p-1">
                                {partsForCurrentStep.map((part) => (
                                  <button
                                    key={part.id}
                                    onClick={() => handleSelectPart(part)}
                                    className="w-full p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-secondary/30 text-left transition-all"
                                  >
                                    <div className="flex gap-4">
                                      <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                        {part.image_url ? (
                                          <img src={part.image_url} alt={part.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Icon className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{part.name}</p>
                                        {part.brand && (
                                          <p className="text-xs text-primary font-mono">{part.brand}</p>
                                        )}
                                        {part.specs && Object.keys(part.specs).length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {Object.entries(part.specs).slice(0, 3).map(([key, value]) => (
                                              value && (
                                                <Badge key={key} variant="outline" className="text-xs py-0">
                                                  {value}
                                                </Badge>
                                              )
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="font-display font-bold text-primary">
                                          ${(part.sale_price || part.price).toFixed(2)}
                                        </p>
                                        {part.stock_quantity <= 10 && (
                                          <p className="text-xs text-cyber-orange">Low stock</p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="bg-card/50 border-border/50 sticky top-20">
              <CardHeader>
                <CardTitle className="font-display">Build Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Parts List */}
                <div className="space-y-2">
                  {buildSteps.map((step) => {
                    const part = selectedParts[step.type];
                    return (
                      <div key={step.type} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{step.label}</span>
                        <span className={part ? 'text-foreground' : 'text-muted-foreground/50'}>
                          {part ? `$${(part.sale_price || part.price).toFixed(2)}` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                {!requiredComplete && (
                  <div className="p-3 rounded-lg bg-cyber-orange/10 border border-cyber-orange/30">
                    <p className="text-xs text-cyber-orange flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Select all required components
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleAddAllToCart}
                    disabled={!requiredComplete}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add All to Cart
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
