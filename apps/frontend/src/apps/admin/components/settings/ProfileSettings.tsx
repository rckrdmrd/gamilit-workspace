import React, { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { profileAPI } from '@/services/api/profileAPI';
import { toast } from 'react-hot-toast';
import { useApiError } from '@shared/hooks';
import { Camera, Save, Loader2, Check, Key, Eye, EyeOff } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const { handleError } = useApiError();

    const [profile, setProfile] = useState({
        displayName: user?.displayName || user?.email?.split('@')[0] || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        bio: '', // Admins might not need bio but we keep for consistency
        avatar: user?.avatar_url || '',
    });

    const [account, setAccount] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isUploading, setIsUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = async () => {
        if (!user?.id) return;

        if (!profile.displayName.trim()) {
            toast.error('El nombre a mostrar es requerido');
            return;
        }

        setSaveStatus('saving');
        try {
            await profileAPI.updateProfile(user.id, {
                display_name: profile.displayName.trim(),
                first_name: profile.firstName.trim(),
                last_name: profile.lastName.trim(),
                bio: profile.bio.trim(),
                avatar_url: profile.avatar,
            });
            setSaveStatus('saved');
            toast.success('Perfil actualizado correctamente');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            handleError(err, 'Error al guardar perfil');
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande (Máx 2MB)');
            return;
        }

        setIsUploading(true);
        try {
            const result = await profileAPI.uploadAvatar(user.id, file);
            setProfile({ ...profile, avatar: result.avatarUrl });
            toast.success('Avatar actualizado');
        } catch (err) {
            handleError(err, 'Error al subir avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!user?.id) return;
        if (account.newPassword !== account.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (account.newPassword.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setSaveStatus('saving');
        try {
            await profileAPI.updatePassword(user.id, {
                current_password: account.currentPassword,
                new_password: account.newPassword,
            });
            toast.success('Contraseña actualizada');
            setAccount({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            handleError(err, 'Error al cambiar contraseña');
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <DetectiveCard>
                <h2 className="mb-4 text-xl font-bold text-detective-text">Información Pública</h2>
                <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-detective-orange to-detective-gold shadow-lg">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {profile.displayName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <label
                                className={cn(
                                    'absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-detective-orange text-white shadow-md transition-transform hover:scale-110',
                                    isUploading && 'cursor-not-allowed opacity-70'
                                )}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-detective-text">Tu Foto de Perfil</h3>
                            <p className="text-sm text-detective-text-secondary">
                                Esta foto será visible para otros administradores y profesores.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-detective-text">Nombre a Mostrar</label>
                            <input
                                value={profile.displayName}
                                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-detective-text">Email</label>
                            <input
                                value={user?.email || ''}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-detective-border bg-detective-bg-secondary px-4 py-2 text-detective-text-secondary"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-detective-text">Nombre</label>
                            <input
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-detective-text">Apellido</label>
                            <input
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saveStatus === 'saving'}
                            className="flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:opacity-50"
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : saveStatus === 'saved' ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    ¡Guardado!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DetectiveCard>

            <DetectiveCard>
                <h2 className="mb-4 text-xl font-bold text-detective-text">Seguridad de la Cuenta</h2>
                <div className="max-w-md space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-detective-text">Contraseña Actual</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={account.currentPassword}
                                onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                                className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 pr-10 text-detective-text focus:border-detective-orange focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-detective-text-secondary hover:text-detective-text"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-detective-text">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={account.newPassword}
                            onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                            className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-detective-text">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={account.confirmPassword}
                            onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                            className="w-full rounded-lg border border-detective-border bg-detective-card px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handlePasswordChange}
                        disabled={!account.currentPassword || !account.newPassword || saveStatus === 'saving'}
                        className="flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-6 py-2 font-medium text-detective-text transition-colors hover:bg-detective-border disabled:opacity-50"
                    >
                        <Key className="h-4 w-4" />
                        Actualizar Contraseña
                    </button>
                </div>
            </DetectiveCard>
        </div>
    );
};
