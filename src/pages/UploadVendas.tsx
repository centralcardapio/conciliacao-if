import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'validating' | 'completed' | 'error';

interface UploadStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ValidationResult {
  total: number;
  valid: number;
  errors: number;
  warnings: number;
}

const UploadVendas: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [steps, setSteps] = useState<UploadStep[]>([
    { id: 'upload', label: 'Upload do arquivo', status: 'pending' },
    { id: 'reading', label: 'Leitura da planilha', status: 'pending' },
    { id: 'validation', label: 'Validação dos dados', status: 'pending' },
    { id: 'processing', label: 'Processamento', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, newStatus: UploadStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: newStatus } : step
    ));
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setValidationResult(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));
  };

  const simulateProcessing = async () => {
    // Step 1: Upload
    updateStepStatus('upload', 'in_progress');
    setStatus('uploading');
    for (let i = 0; i <= 25; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setProgress(i);
    }
    updateStepStatus('upload', 'completed');

    // Step 2: Reading
    updateStepStatus('reading', 'in_progress');
    setStatus('processing');
    for (let i = 26; i <= 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 40));
      setProgress(i);
    }
    updateStepStatus('reading', 'completed');

    // Step 3: Validation
    updateStepStatus('validation', 'in_progress');
    setStatus('validating');
    for (let i = 51; i <= 80; i++) {
      await new Promise(resolve => setTimeout(resolve, 35));
      setProgress(i);
    }
    updateStepStatus('validation', 'completed');

    // Step 4: Processing
    updateStepStatus('processing', 'in_progress');
    for (let i = 81; i <= 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 25));
      setProgress(i);
    }
    updateStepStatus('processing', 'completed');

    // Simulated validation results
    setValidationResult({
      total: 1250,
      valid: 1180,
      errors: 45,
      warnings: 25,
    });

    setStatus('completed');
    toast.success('Planilha processada com sucesso!');
  };

  const handleFile = useCallback(async (uploadedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(uploadedFile.type) && 
        !uploadedFile.name.endsWith('.xlsx') && 
        !uploadedFile.name.endsWith('.xls') && 
        !uploadedFile.name.endsWith('.csv')) {
      toast.error('Formato inválido. Use arquivos .xlsx, .xls ou .csv');
      return;
    }

    setFile(uploadedFile);
    await simulateProcessing();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const getStatusBadge = (stepStatus: UploadStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Upload className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload de Vendas</h1>
          <p className="text-muted-foreground">Importe planilhas de vendas para processamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Arquivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'idle' ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center w-full h-64 
                  border-2 border-dashed rounded-lg cursor-pointer
                  transition-all duration-200
                  ${isDragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-12 h-12 mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mb-2 text-lg font-medium text-foreground">
                    {isDragOver ? 'Solte o arquivo aqui' : 'Arraste uma planilha aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: .xlsx, .xls, .csv
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInput}
                />
              </label>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-10 h-10 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{file?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file && (file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {status === 'completed' && (
                    <Button variant="ghost" size="icon" onClick={resetUpload}>
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Validation Results */}
                {validationResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-foreground">{validationResult.total}</p>
                      <p className="text-sm text-muted-foreground">Total de linhas</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{validationResult.valid}</p>
                      <p className="text-sm text-muted-foreground">Válidos</p>
                    </div>
                    <div className="p-4 bg-destructive/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-destructive">{validationResult.errors}</p>
                      <p className="text-sm text-muted-foreground">Erros</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{validationResult.warnings}</p>
                      <p className="text-sm text-muted-foreground">Avisos</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {status === 'completed' && (
                  <div className="flex gap-3">
                    <Button onClick={resetUpload} variant="outline" className="flex-1">
                      Novo Upload
                    </Button>
                    <Button className="flex-1">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Confirmar Importação
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Etapas do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  {getStatusBadge(step.status)}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.status === 'completed' ? 'text-foreground' : 
                      step.status === 'in_progress' ? 'text-primary' : 
                      'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {step.status === 'completed' && (
                    <Badge variant="secondary" className="text-green-600 bg-green-500/10">
                      Concluído
                    </Badge>
                  )}
                  {step.status === 'in_progress' && (
                    <Badge variant="secondary" className="text-primary bg-primary/10">
                      Em andamento
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {status === 'completed' && (
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Processamento concluído!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Arquivo processado e validado com sucesso.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadVendas;
