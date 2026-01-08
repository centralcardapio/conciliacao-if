import React, { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, FileCheck, CloudUpload, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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

  const getStepIcon = (stepStatus: UploadStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          </div>
        );
    }
  };

  return (
    <Layout title="Upload de Vendas">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Upload de Vendas</h1>
              <p className="text-muted-foreground mt-1">
                Importe planilhas de vendas para processamento e validação automática.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-border bg-foreground/5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-foreground" />
                <h2 className="font-semibold text-foreground">Arquivo</h2>
              </div>
            </div>
            
            <div className="p-6">
              {status === 'idle' ? (
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative flex flex-col items-center justify-center w-full min-h-[280px]
                    border-2 border-dashed rounded-xl cursor-pointer
                    transition-all duration-300
                    ${isDragOver 
                      ? 'border-foreground bg-foreground/5 scale-[1.01]' 
                      : 'border-border hover:border-foreground/40 hover:bg-secondary/30'
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                      ${isDragOver ? 'bg-foreground/10' : 'bg-secondary'}
                    `}>
                      <CloudUpload className={`w-10 h-10 transition-colors ${isDragOver ? 'text-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {isDragOver ? 'Solte o arquivo aqui' : 'Arraste uma planilha'}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      ou clique para selecionar do computador
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
                        <File className="w-3 h-3" />
                        .xlsx
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
                        <File className="w-3 h-3" />
                        .xls
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full">
                        <File className="w-3 h-3" />
                        .csv
                      </span>
                    </div>
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
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file && (file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {status === 'completed' && (
                      <button 
                        onClick={resetUpload}
                        className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso geral</span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Validation Results */}
                  {validationResult && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 bg-secondary/50 rounded-xl text-center border border-border">
                        <p className="text-2xl font-bold text-foreground">{validationResult.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total de linhas</p>
                      </div>
                      <div className="p-4 bg-green-500/5 rounded-xl text-center border border-green-500/20">
                        <p className="text-2xl font-bold text-green-600">{validationResult.valid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Válidos</p>
                      </div>
                      <div className="p-4 bg-destructive/5 rounded-xl text-center border border-destructive/20">
                        <p className="text-2xl font-bold text-destructive">{validationResult.errors}</p>
                        <p className="text-xs text-muted-foreground mt-1">Erros</p>
                      </div>
                      <div className="p-4 bg-yellow-500/5 rounded-xl text-center border border-yellow-500/20">
                        <p className="text-2xl font-bold text-yellow-600">{validationResult.warnings}</p>
                        <p className="text-xs text-muted-foreground mt-1">Avisos</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {status === 'completed' && (
                    <div className="flex gap-3 pt-2">
                      <button onClick={resetUpload} className="btn-secondary flex-1">
                        Novo Upload
                      </button>
                      <button className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        Confirmar Importação
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Steps Panel */}
          <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-border bg-foreground/5">
              <h2 className="font-semibold text-foreground">Etapas do Processamento</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4">
                    {getStepIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        step.status === 'completed' ? 'text-foreground' : 
                        step.status === 'in_progress' ? 'text-foreground' : 
                        'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      {step.status === 'completed' && (
                        <p className="text-xs text-green-600">Concluído</p>
                      )}
                      {step.status === 'in_progress' && (
                        <p className="text-xs text-primary">Em andamento...</p>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute left-[39px] top-12 w-0.5 h-4 bg-border" />
                    )}
                  </div>
                ))}
              </div>

              {status === 'completed' && (
                <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Processamento concluído!</p>
                      <p className="text-xs text-muted-foreground">Arquivo validado com sucesso</p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'idle' && (
                <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center">
                    Aguardando arquivo para iniciar o processamento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadVendas;
