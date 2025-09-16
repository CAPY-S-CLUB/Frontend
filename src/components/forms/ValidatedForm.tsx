'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { z } from 'zod'
import { FormValidator, DataSanitizer, ValidationResult, useFormValidation } from '@/lib/validation'
import { useOptimizedForm } from '@/hooks/usePerformanceOptimization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Tipos de campo
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'stellar-address' | 'amount'

// Interface para configuração de campo
export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  sanitizer?: (value: any) => any
  validator?: (value: any) => { isValid: boolean; error?: string }
  helperText?: string
  autoComplete?: string
}

// Props do componente ValidatedForm
export interface ValidatedFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>
  fields: FieldConfig[]
  initialValues?: Partial<T>
  onSubmit: (values: T) => Promise<void> | void
  onValidationChange?: (isValid: boolean, errors: Record<string, string[]>) => void
  submitText?: string
  resetText?: string
  showReset?: boolean
  className?: string
  disabled?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
}

// Componente de campo individual
const FormField: React.FC<{
  config: FieldConfig
  value: any
  error?: string[]
  touched?: boolean
  onChange: (name: string, value: any) => void
  onBlur: (name: string) => void
  disabled?: boolean
}> = ({ config, value, error, touched, onChange, onBlur, disabled }) => {
  const hasError = touched && error && error.length > 0
  const isValid = touched && !hasError && value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue = e.target.value
    
    // Aplicar sanitização se configurada
    if (config.sanitizer) {
      newValue = config.sanitizer(newValue)
    }
    
    // Sanitização automática por tipo
    switch (config.type) {
      case 'email':
        newValue = DataSanitizer.sanitizeEmail(newValue)
        break
      case 'amount':
        newValue = DataSanitizer.sanitizeAmount(newValue)
        break
      case 'stellar-address':
        newValue = DataSanitizer.sanitizeStellarAddress(newValue)
        break
      default:
        newValue = DataSanitizer.sanitizeString(newValue, { maxLength: 1000 })
    }
    
    onChange(config.name, newValue)
  }

  const handleBlur = () => {
    onBlur(config.name)
  }

  const renderInput = () => {
    const baseProps = {
      id: config.name,
      name: config.name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      disabled: disabled || config.disabled,
      placeholder: config.placeholder,
      autoComplete: config.autoComplete,
      className: cn(
        'transition-colors',
        hasError && 'border-red-500 focus:border-red-500',
        isValid && 'border-green-500 focus:border-green-500'
      )
    }

    switch (config.type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={4}
            className={cn(baseProps.className, 'resize-none')}
          />
        )
      
      case 'select':
        return (
          <select
            {...baseProps}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              baseProps.className
            )}
          >
            <option value="">Selecione...</option>
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'password':
        return (
          <Input
            {...baseProps}
            type="password"
          />
        )
      
      case 'number':
      case 'amount':
        return (
          <Input
            {...baseProps}
            type="number"
            step={config.type === 'amount' ? '0.0000001' : '1'}
            min="0"
          />
        )
      
      default:
        return (
          <Input
            {...baseProps}
            type={config.type === 'email' ? 'email' : 'text'}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={config.name}
        className={cn(
          'text-sm font-medium',
          hasError && 'text-red-600',
          isValid && 'text-green-600'
        )}
      >
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
        {isValid && <CheckCircle2 className="inline w-4 h-4 ml-1 text-green-600" />}
      </Label>
      
      <div className="relative">
        {renderInput()}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
        )}
      </div>
      
      {config.helperText && !hasError && (
        <p className="text-xs text-muted-foreground">
          {config.helperText}
        </p>
      )}
      
      {hasError && (
        <div className="space-y-1">
          {error.map((err, index) => (
            <p key={index} className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente principal ValidatedForm
export function ValidatedForm<T extends Record<string, any>>({
  schema,
  fields,
  initialValues = {},
  onSubmit,
  onValidationChange,
  submitText = 'Enviar',
  resetText = 'Limpar',
  showReset = true,
  className,
  disabled = false,
  autoSave = false,
  autoSaveDelay = 2000
}: ValidatedFormProps<T>) {
  const {
    errors,
    touched,
    validateField,
    validateAll,
    markTouched,
    clearErrors,
    hasErrors
  } = useFormValidation(schema)

  const {
    values,
    isSubmitting,
    setValue,
    handleSubmit,
    reset
  } = useOptimizedForm({
    initialValues: initialValues as T,
    validationSchema: (values: T) => {
      const result = validateAll(values)
      return result.errors
    },
    onSubmit
  })

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return

    const timer = setTimeout(async () => {
      if (Object.keys(values).length > 0 && !hasErrors) {
        setAutoSaveStatus('saving')
        try {
          // Simular auto-save (implementar conforme necessário)
          await new Promise(resolve => setTimeout(resolve, 500))
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        } catch (error) {
          setAutoSaveStatus('error')
          setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
      }
    }, autoSaveDelay)

    return () => clearTimeout(timer)
  }, [values, hasErrors, autoSave, autoSaveDelay])

  // Notificar mudanças de validação
  useEffect(() => {
    if (onValidationChange) {
      const isValid = !hasErrors && Object.keys(touched).length > 0
      onValidationChange(isValid, errors)
    }
  }, [hasErrors, errors, touched, onValidationChange])

  const handleFieldChange = useCallback((name: string, value: any) => {
    setValue(name as keyof T, value)
    validateField(name, value)
  }, [setValue, validateField])

  const handleFieldBlur = useCallback((name: string) => {
    markTouched(name)
  }, [markTouched])

  const handleReset = useCallback(() => {
    reset()
    clearErrors()
  }, [reset, clearErrors])

  const isFormValid = !hasErrors && Object.keys(touched).length > 0

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Auto-save status */}
      {autoSave && autoSaveStatus !== 'idle' && (
        <Alert className={cn(
          'mb-4',
          autoSaveStatus === 'saved' && 'border-green-200 bg-green-50',
          autoSaveStatus === 'error' && 'border-red-200 bg-red-50'
        )}>
          <AlertDescription className="flex items-center gap-2">
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando automaticamente...
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Salvo automaticamente
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                Erro ao salvar automaticamente
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Campos do formulário */}
      <div className="grid gap-6">
        {fields.map(field => (
          <FormField
            key={field.name}
            config={field}
            value={values[field.name as keyof T]}
            error={errors[field.name]}
            touched={touched[field.name]}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={disabled || isSubmitting || !isFormValid}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            submitText
          )}
        </Button>
        
        {showReset && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={disabled || isSubmitting}
          >
            {resetText}
          </Button>
        )}
      </div>

      {/* Indicador de status do formulário */}
      <div className="text-sm text-muted-foreground">
        {Object.keys(touched).length === 0 && (
          <p>Preencha os campos para validar o formulário</p>
        )}
        {Object.keys(touched).length > 0 && hasErrors && (
          <p className="text-red-600">Corrija os erros antes de enviar</p>
        )}
        {isFormValid && (
          <p className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Formulário válido e pronto para envio
          </p>
        )}
      </div>
    </form>
  )
}

// Componente para formulários específicos de blockchain
export interface BlockchainFormProps {
  type: 'transaction' | 'membership' | 'badge' | 'wallet'
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  disabled?: boolean
}

export function BlockchainForm({ type, onSubmit, initialData, disabled }: BlockchainFormProps) {
  const getFormConfig = () => {
    switch (type) {
      case 'transaction':
        return {
          schema: z.object({
            amount: z.string().min(1, 'Valor é obrigatório'),
            destination: z.string().min(1, 'Destino é obrigatório'),
            memo: z.string().optional()
          }),
          fields: [
            {
              name: 'amount',
              label: 'Valor',
              type: 'amount' as FieldType,
              required: true,
              placeholder: '0.0000000',
              helperText: 'Valor em XLM (máximo 7 casas decimais)'
            },
            {
              name: 'destination',
              label: 'Endereço de Destino',
              type: 'stellar-address' as FieldType,
              required: true,
              placeholder: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
              helperText: 'Endereço Stellar válido (começa com G)'
            },
            {
              name: 'memo',
              label: 'Memo (Opcional)',
              type: 'text' as FieldType,
              placeholder: 'Memo da transação',
              helperText: 'Máximo 28 caracteres'
            }
          ]
        }
      
      case 'membership':
        return {
          schema: z.object({
            name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
            description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
            category: z.string().min(1, 'Categoria é obrigatória'),
            price: z.string().min(1, 'Preço é obrigatório')
          }),
          fields: [
            {
              name: 'name',
              label: 'Nome da Membership',
              type: 'text' as FieldType,
              required: true,
              placeholder: 'Nome da membership'
            },
            {
              name: 'description',
              label: 'Descrição',
              type: 'textarea' as FieldType,
              required: true,
              placeholder: 'Descreva os benefícios da membership'
            },
            {
              name: 'category',
              label: 'Categoria',
              type: 'select' as FieldType,
              required: true,
              options: [
                { value: 'premium', label: 'Premium' },
                { value: 'vip', label: 'VIP' },
                { value: 'exclusive', label: 'Exclusiva' }
              ]
            },
            {
              name: 'price',
              label: 'Preço (XLM)',
              type: 'amount' as FieldType,
              required: true,
              placeholder: '0.0000000'
            }
          ]
        }
      
      default:
        throw new Error(`Tipo de formulário não suportado: ${type}`)
    }
  }

  const config = getFormConfig()

  return (
    <ValidatedForm
      schema={config.schema}
      fields={config.fields}
      initialValues={initialData}
      onSubmit={onSubmit}
      disabled={disabled}
      autoSave={true}
    />
  )
}