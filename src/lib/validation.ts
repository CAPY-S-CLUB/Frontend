import { z } from 'zod'
import DOMPurify from 'dompurify'
import { useState, useCallback } from 'react'

// Tipos de validação
export enum ValidationType {
  EMAIL = 'email',
  STELLAR_ADDRESS = 'stellar_address',
  STELLAR_SECRET = 'stellar_secret',
  AMOUNT = 'amount',
  TEXT = 'text',
  URL = 'url',
  PHONE = 'phone',
  PASSWORD = 'password',
  USERNAME = 'username',
  CONTRACT_ID = 'contract_id'
}

// Regex patterns para validação
const VALIDATION_PATTERNS = {
  [ValidationType.EMAIL]: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  [ValidationType.STELLAR_ADDRESS]: /^G[A-Z0-9]{55}$/,
  [ValidationType.STELLAR_SECRET]: /^S[A-Z0-9]{55}$/,
  [ValidationType.AMOUNT]: /^\d+(\.\d{1,7})?$/,
  [ValidationType.URL]: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  [ValidationType.PHONE]: /^\+?[1-9]\d{1,14}$/,
  [ValidationType.USERNAME]: /^[a-zA-Z0-9_-]{3,20}$/,
  [ValidationType.CONTRACT_ID]: /^C[A-Z0-9]{55}$/
}

// Schemas Zod para validação estruturada
export const ValidationSchemas = {
  // Schema para dados de usuário
  user: z.object({
    name: z.string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(50, 'Nome deve ter no máximo 50 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    email: z.string()
      .email('Email inválido')
      .max(100, 'Email deve ter no máximo 100 caracteres'),
    username: z.string()
      .min(3, 'Username deve ter pelo menos 3 caracteres')
      .max(20, 'Username deve ter no máximo 20 caracteres')
      .regex(VALIDATION_PATTERNS[ValidationType.USERNAME], 'Username deve conter apenas letras, números, _ e -'),
    phone: z.string()
      .optional()
      .refine(val => !val || VALIDATION_PATTERNS[ValidationType.PHONE].test(val), {
        message: 'Telefone inválido'
      })
  }),

  // Schema para dados de carteira Stellar
  stellarWallet: z.object({
    publicKey: z.string()
      .regex(VALIDATION_PATTERNS[ValidationType.STELLAR_ADDRESS], 'Endereço Stellar inválido'),
    secretKey: z.string()
      .optional()
      .refine(val => !val || VALIDATION_PATTERNS[ValidationType.STELLAR_SECRET].test(val), {
        message: 'Chave secreta Stellar inválida'
      })
  }),

  // Schema para transações
  transaction: z.object({
    amount: z.string()
      .regex(VALIDATION_PATTERNS[ValidationType.AMOUNT], 'Valor inválido')
      .refine(val => parseFloat(val) > 0, 'Valor deve ser maior que zero')
      .refine(val => parseFloat(val) <= 1000000, 'Valor muito alto'),
    destination: z.string()
      .regex(VALIDATION_PATTERNS[ValidationType.STELLAR_ADDRESS], 'Endereço de destino inválido'),
    memo: z.string()
      .max(28, 'Memo deve ter no máximo 28 caracteres')
      .optional()
  }),

  // Schema para contratos
  contract: z.object({
    contractId: z.string()
      .regex(VALIDATION_PATTERNS[ValidationType.CONTRACT_ID], 'ID do contrato inválido'),
    functionName: z.string()
      .min(1, 'Nome da função é obrigatório')
      .max(50, 'Nome da função deve ter no máximo 50 caracteres')
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Nome da função inválido'),
    parameters: z.array(z.any()).optional()
  }),

  // Schema para formulário de membership
  membership: z.object({
    name: z.string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    description: z.string()
      .min(10, 'Descrição deve ter pelo menos 10 caracteres')
      .max(500, 'Descrição deve ter no máximo 500 caracteres'),
    category: z.string()
      .min(1, 'Categoria é obrigatória'),
    price: z.string()
      .regex(VALIDATION_PATTERNS[ValidationType.AMOUNT], 'Preço inválido')
      .refine(val => parseFloat(val) >= 0, 'Preço deve ser maior ou igual a zero'),
    imageUrl: z.string()
      .url('URL da imagem inválida')
      .optional()
  }),

  // Schema para badges
  badge: z.object({
    name: z.string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(50, 'Nome deve ter no máximo 50 caracteres'),
    description: z.string()
      .min(5, 'Descrição deve ter pelo menos 5 caracteres')
      .max(200, 'Descrição deve ter no máximo 200 caracteres'),
    criteria: z.string()
      .min(10, 'Critérios devem ter pelo menos 10 caracteres')
      .max(300, 'Critérios devem ter no máximo 300 caracteres'),
    iconUrl: z.string()
      .url('URL do ícone inválida')
      .optional()
  })
}

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  sanitizedData?: any
}

// Classe principal de validação
export class FormValidator {
  // Validar usando schema Zod
  static validateWithSchema<T>(
    data: unknown,
    schema: z.ZodSchema<T>
  ): ValidationResult {
    try {
      const sanitizedData = schema.parse(data)
      return {
        isValid: true,
        errors: {},
        sanitizedData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {}
        
        error.issues.forEach((err: any) => {
          const path = err.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })
        
        return {
          isValid: false,
          errors
        }
      }
      
      return {
        isValid: false,
        errors: { general: ['Erro de validação desconhecido'] }
      }
    }
  }

  // Validar campo individual
  static validateField(
    value: string,
    type: ValidationType,
    options: {
      required?: boolean
      minLength?: number
      maxLength?: number
      customPattern?: RegExp
      customValidator?: (value: string) => boolean
    } = {}
  ): { isValid: boolean; error?: string } {
    const {
      required = false,
      minLength,
      maxLength,
      customPattern,
      customValidator
    } = options

    // Verificar se é obrigatório
    if (required && (!value || value.trim().length === 0)) {
      return { isValid: false, error: 'Campo obrigatório' }
    }

    // Se não é obrigatório e está vazio, é válido
    if (!required && (!value || value.trim().length === 0)) {
      return { isValid: true }
    }

    // Verificar comprimento mínimo
    if (minLength && value.length < minLength) {
      return {
        isValid: false,
        error: `Deve ter pelo menos ${minLength} caracteres`
      }
    }

    // Verificar comprimento máximo
    if (maxLength && value.length > maxLength) {
      return {
        isValid: false,
        error: `Deve ter no máximo ${maxLength} caracteres`
      }
    }

    // Verificar pattern personalizado
    if (customPattern && !customPattern.test(value)) {
      return { isValid: false, error: 'Formato inválido' }
    }

    // Verificar pattern do tipo
    const pattern = VALIDATION_PATTERNS[type as keyof typeof VALIDATION_PATTERNS]
    if (pattern && !pattern.test(value)) {
      return { isValid: false, error: this.getErrorMessage(type) }
    }

    // Validador personalizado
    if (customValidator && !customValidator(value)) {
      return { isValid: false, error: 'Valor inválido' }
    }

    return { isValid: true }
  }

  // Obter mensagem de erro para tipo
  private static getErrorMessage(type: ValidationType): string {
    const messages = {
      [ValidationType.EMAIL]: 'Email inválido',
      [ValidationType.STELLAR_ADDRESS]: 'Endereço Stellar inválido',
      [ValidationType.STELLAR_SECRET]: 'Chave secreta Stellar inválida',
      [ValidationType.AMOUNT]: 'Valor inválido',
      [ValidationType.URL]: 'URL inválida',
      [ValidationType.PHONE]: 'Telefone inválido',
      [ValidationType.PASSWORD]: 'Senha inválida',
      [ValidationType.USERNAME]: 'Username inválido',
      [ValidationType.CONTRACT_ID]: 'ID do contrato inválido',
      [ValidationType.TEXT]: 'Texto inválido'
    }
    
    return messages[type] || 'Formato inválido'
  }

  // Validar múltiplos campos
  static validateFields(
    fields: Record<string, {
      value: string
      type: ValidationType
      options?: Parameters<typeof FormValidator.validateField>[2]
    }>
  ): ValidationResult {
    const errors: Record<string, string[]> = {}
    let isValid = true

    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      const result = this.validateField(
        fieldConfig.value,
        fieldConfig.type,
        fieldConfig.options
      )
      
      if (!result.isValid && result.error) {
        errors[fieldName] = [result.error]
        isValid = false
      }
    })

    return { isValid, errors }
  }
}

// Classe para sanitização de dados
export class DataSanitizer {
  // Sanitizar string removendo caracteres perigosos
  static sanitizeString(input: string, options: {
    allowHtml?: boolean
    maxLength?: number
    removeSpecialChars?: boolean
  } = {}): string {
    const { allowHtml = false, maxLength, removeSpecialChars = false } = options
    
    let sanitized = input.trim()
    
    // Remover HTML se não permitido
    if (!allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] })
    } else {
      sanitized = DOMPurify.sanitize(sanitized)
    }
    
    // Remover caracteres especiais se solicitado
    if (removeSpecialChars) {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '')
    }
    
    // Limitar comprimento
    if (maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }
    
    return sanitized
  }

  // Sanitizar email
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  // Sanitizar valor monetário
  static sanitizeAmount(amount: string): string {
    // Remover caracteres não numéricos exceto ponto
    const cleaned = amount.replace(/[^0-9.]/g, '')
    
    // Garantir apenas um ponto decimal
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limitar casas decimais
    if (parts.length === 2 && parts[1].length > 7) {
      parts[1] = parts[1].substring(0, 7)
    }
    
    return parts.join('.')
  }

  // Sanitizar endereço Stellar
  static sanitizeStellarAddress(address: string): string {
    return address.toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
  }

  // Sanitizar objeto completo
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    sanitizers: Partial<Record<keyof T, (value: any) => any>>
  ): T {
    const sanitized = { ...obj } as any
    
    Object.entries(sanitizers).forEach(([key, sanitizer]) => {
      if (sanitizer && sanitized[key] !== undefined) {
        sanitized[key] = sanitizer(sanitized[key])
      }
    })
    
    return sanitized
  }
}

// Hook para validação em tempo real
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>
) {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  const validateField = useCallback((name: string, value: any) => {
    try {
      // Validar apenas o campo específico
      const fieldSchema = (schema as any).shape?.[name]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: error.issues.map((err: any) => err.message)
        }))
      }
    }
  }, [schema])
  
  const validateAll = useCallback((data: T): ValidationResult => {
    return FormValidator.validateWithSchema(data, schema)
  }, [schema])
  
  const markTouched = useCallback((name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }))
  }, [])
  
  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])
  
  return {
    errors,
    touched,
    validateField,
    validateAll,
    markTouched,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  }
}

// Utilitários de validação específicos para blockchain
export const BlockchainValidators = {
  // Validar endereço Stellar
  isValidStellarAddress: (address: string): boolean => {
    return VALIDATION_PATTERNS[ValidationType.STELLAR_ADDRESS].test(address)
  },
  
  // Validar chave secreta Stellar
  isValidStellarSecret: (secret: string): boolean => {
    return VALIDATION_PATTERNS[ValidationType.STELLAR_SECRET].test(secret)
  },
  
  // Validar ID de contrato
  isValidContractId: (contractId: string): boolean => {
    return VALIDATION_PATTERNS[ValidationType.CONTRACT_ID].test(contractId)
  },
  
  // Validar valor monetário
  isValidAmount: (amount: string): boolean => {
    if (!VALIDATION_PATTERNS[ValidationType.AMOUNT].test(amount)) {
      return false
    }
    
    const numValue = parseFloat(amount)
    return numValue > 0 && numValue <= 1000000
  },
  
  // Validar parâmetros de função de contrato
  validateContractParams: (params: any[]): ValidationResult => {
    const errors: Record<string, string[]> = {}
    let isValid = true
    
    params.forEach((param, index) => {
      if (param === null || param === undefined) {
        errors[`param_${index}`] = ['Parâmetro não pode ser nulo']
        isValid = false
      }
      
      // Validações específicas por tipo
      if (typeof param === 'string' && param.length > 1000) {
        errors[`param_${index}`] = ['Parâmetro muito longo']
        isValid = false
      }
    })
    
    return { isValid, errors }
  }
}