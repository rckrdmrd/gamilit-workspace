import React from 'react';
import {
  PrivacySettingsForm,
  type PrivacyToggleItem,
  type PrivacyVisibilityOption,
} from '@shared/components/settings';
import type { SaveStatus } from '@shared/components/feedback/SaveButton';

/* ------------------------------------------------------------------ */
/*  Types kept for backward-compat with TeacherSettings parent page    */
/* ------------------------------------------------------------------ */

interface PrivacyState {
  profileVisibility: string;
  showContactInfo: boolean;
  allowStudentContact: boolean;
  allowParentContact: boolean;
  showActivity: boolean;
}

interface PrivacySettingsSectionProps {
  privacy: PrivacyState;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacyState>>;
  saveStatus: SaveStatus;
  handleSave: () => void;
}

/* ------------------------------------------------------------------ */
/*  Teacher-specific visibility options                                */
/* ------------------------------------------------------------------ */

const TEACHER_VISIBILITY_OPTIONS: PrivacyVisibilityOption[] = [
  { value: 'public', label: 'Publico (Todos)' },
  { value: 'school', label: 'Escuela (Solo mi institucion)' },
  { value: 'private', label: 'Privado (Solo yo)' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrivacySettingsSection({
  privacy,
  setPrivacy,
  saveStatus,
  handleSave,
}: PrivacySettingsSectionProps) {
  // Build toggle items from teacher privacy state
  const toggles: PrivacyToggleItem[] = [
    {
      key: 'showContactInfo',
      label: 'Mostrar Informacion de Contacto',
      description: 'Tu email sera visible para estudiantes y padres',
      value: privacy.showContactInfo,
    },
    {
      key: 'allowStudentContact',
      label: 'Permitir Contacto de Estudiantes',
      description: 'Los estudiantes pueden enviarte mensajes directos',
      value: privacy.allowStudentContact,
    },
    {
      key: 'allowParentContact',
      label: 'Permitir Contacto de Padres',
      description: 'Los padres/tutores pueden contactarte',
      value: privacy.allowParentContact,
    },
    {
      key: 'showActivity',
      label: 'Mostrar Actividad',
      description: 'Mostrar tu actividad reciente a otros profesores',
      value: privacy.showActivity,
    },
  ];

  const handleToggleChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PrivacySettingsForm
      title="Configuracion de Privacidad"
      profileVisibility={privacy.profileVisibility}
      onVisibilityChange={(val) => setPrivacy((prev) => ({ ...prev, profileVisibility: val }))}
      visibilityOptions={TEACHER_VISIBILITY_OPTIONS}
      toggles={toggles}
      onToggleChange={handleToggleChange}
      showPrivacyNotice
      privacyNoticeText="Tu informacion personal esta protegida segun las politicas de privacidad de la institucion. Los estudiantes y padres solo veran la informacion que permitas explicitamente."
      saveStatus={saveStatus}
      onSave={handleSave}
    />
  );
}
