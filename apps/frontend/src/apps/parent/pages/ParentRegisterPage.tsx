/**
 * ParentRegisterPage
 *
 * EXT-011 Parent Portal - Registration Page
 *
 * @description Registration page for parent portal.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useParentStore } from '@/features/parent/store/parentStore';
import { RelationshipType } from '@/features/parent/types/parent.types';
import { Eye, EyeOff, Mail, Lock, User, Phone, Users, AlertCircle, Check } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  { value: RelationshipType.FATHER, label: 'Padre' },
  { value: RelationshipType.MOTHER, label: 'Madre' },
  { value: RelationshipType.GUARDIAN, label: 'Tutor Legal' },
  { value: RelationshipType.GRANDPARENT, label: 'Abuelo/a' },
  { value: RelationshipType.OTHER, label: 'Otro' },
];

export const ParentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useParentStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    relationshipType: RelationshipType.FATHER,
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.includes('@')) {
      errors.email = 'Email invalido';
    }

    if (formData.password.length < 8) {
      errors.password = 'La contrasena debe tener minimo 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Debe contener mayuscula, minuscula y numero';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contrasenas no coinciden';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los terminos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        relationshipType: formData.relationshipType,
      });
      navigate('/parent/dashboard');
    } catch {
      // Error is handled by store
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative inline-block p-3 bg-white/10 backdrop-blur-sm rounded-full mb-3"
            >
              <span className="text-4xl">👨‍👩‍👧‍👦</span>
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-1">
              Crear Cuenta de Padre
            </h1>
            <p className="text-indigo-100 text-sm">
              Registrate para seguir el progreso de tus hijos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Juan"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Perez"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+52 555 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Relationship Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relacion con el estudiante
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.relationshipType}
                  onChange={(e) => handleChange('relationshipType', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                >
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrasena
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="********"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="********"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => handleChange('acceptTerms', !formData.acceptTerms)}
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                  formData.acceptTerms
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {formData.acceptTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-sm text-gray-600">
                Acepto los{' '}
                <a href="/terms" className="text-indigo-600 hover:underline">
                  terminos y condiciones
                </a>{' '}
                y la{' '}
                <a href="/privacy" className="text-indigo-600 hover:underline">
                  politica de privacidad
                </a>
              </p>
            </div>
            {validationErrors.acceptTerms && (
              <p className="text-xs text-red-500">{validationErrors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-700">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/parent/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Inicia sesion
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParentRegisterPage;
