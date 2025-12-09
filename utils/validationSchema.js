const joi = require('joi');

// Validation schema untuk register
const registerSchema = joi.object({
    email: joi.string()
        .email()
        .required()
        .trim()
        .lowercase()
        .messages({
            'string.email': 'Email tidak valid',
            'any.required': 'Email wajib diisi',
            'string.empty': 'Email tidak boleh kosong'
        }),
    password: joi.string()
        .min(8)
        .max(50)
        .required()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.pattern.base': 'Password harus terdiri dari minimal 8 karakter dengan kombinasi: huruf besar, huruf kecil, angka, dan simbol (@$!%*?&)',
            'string.min': 'Password minimal 8 karakter',
            'string.max': 'Password maksimal 50 karakter',
            'any.required': 'Password wajib diisi',
            'string.empty': 'Password tidak boleh kosong'
        })
});

// Validation schema untuk login
const loginSchema = joi.object({
    email: joi.string()
        .email()
        .required()
        .trim()
        .lowercase()
        .messages({
            'string.email': 'Email tidak valid',
            'any.required': 'Email wajib diisi',
            'string.empty': 'Email tidak boleh kosong'
        }),
    password: joi.string()
        .required()
        .messages({
            'any.required': 'Password wajib diisi',
            'string.empty': 'Password tidak boleh kosong'
        })
});

// Validation schema untuk verify email
const verifyEmailSchema = joi.object({
    email: joi.string()
        .email()
        .required()
        .trim()
        .lowercase()
        .messages({
            'string.email': 'Email tidak valid',
            'any.required': 'Email wajib diisi',
            'string.empty': 'Email tidak boleh kosong'
        }),
    code: joi.string()
        .length(6)
        .regex(/^\d+$/)
        .required()
        .messages({
            'string.length': 'Kode OTP harus 6 digit',
            'string.pattern.base': 'Kode OTP hanya boleh angka',
            'any.required': 'Kode OTP wajib diisi',
            'string.empty': 'Kode OTP tidak boleh kosong'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    verifyEmailSchema
};
