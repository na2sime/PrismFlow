import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Shield, Camera, X, Palette } from 'lucide-react';
import { apiService } from '../../services/api';
import ProfilePictureCrop from '../../components/ProfilePictureCrop/ProfilePictureCrop';
import { useTheme } from '../../contexts/ThemeContext';
import { themes, ThemeType } from '../../themes';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  twoFactorEnabled: boolean;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, themeType, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | '2fa' | 'appearance'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 2FA state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      const userData = response.data.user;
      setProfile(userData);
      setProfileForm({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      setIs2FAEnabled(userData.twoFactorEnabled);

      // Update localStorage and notify other components
      localStorage.setItem('user', JSON.stringify(userData));
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('settings.invalidImageType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('settings.imageTooLarge'));
      return;
    }

    // Open crop modal
    setCropImageFile(file);
    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImage: string) => {
    try {
      await apiService.uploadProfilePicture(croppedImage);
      setSuccess(t('settings.profilePictureUpdated'));
      setCropImageFile(null);
      await loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload profile picture');
    }
  };

  const handleCropCancel = () => {
    setCropImageFile(null);
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await apiService.deleteProfilePicture();
      setSuccess(t('settings.profilePictureDeleted'));
      await loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete profile picture');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await apiService.updateProfile(profileForm);
      setSuccess(t('settings.profileUpdated'));
      await loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t('settings.passwordsDoNotMatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError(t('settings.passwordTooShort'));
      return;
    }

    try {
      await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess(t('settings.passwordChanged'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleSetup2FA = async () => {
    try {
      setError(null);
      const response = await apiService.setup2FA();
      setQrCode(response.data.qrCode);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to setup 2FA');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await apiService.verify2FA(twoFactorToken);
      setSuccess(t('settings.2faEnabled'));
      setQrCode(null);
      setTwoFactorToken('');
      setIs2FAEnabled(true);
      await loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify 2FA');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await apiService.disable2FA(twoFactorToken);
      setSuccess(t('settings.2faDisabled'));
      setTwoFactorToken('');
      setIs2FAEnabled(false);
      await loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disable 2FA');
    }
  };

  if (loading) {
    return (
      <ThemeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: theme.colors.accent, borderTopColor: 'transparent' }}
            ></div>
            <p style={{ color: theme.colors.textSecondary }}>{t('common.loading')}</p>
          </div>
        </div>
      </ThemeLayout>
    );
  }

  return (
    <ThemeLayout className="p-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: theme.colors.textPrimary }}>{t('settings.title')}</h1>

      {error && (
        <div
          className="mb-4 p-4 border rounded-lg flex items-center justify-between"
          style={{
            backgroundColor: `${theme.colors.error}10`,
            borderColor: theme.colors.error,
            color: theme.colors.error,
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ color: theme.colors.error }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div
          className="mb-4 p-4 border rounded-lg flex items-center justify-between"
          style={{
            backgroundColor: `${theme.colors.success}10`,
            borderColor: theme.colors.success,
            color: theme.colors.success,
          }}
        >
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            style={{ color: theme.colors.success }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* Tabs */}
        <div className="border-b" style={{ borderColor: theme.colors.surfaceBorder }}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-6 py-4 font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'profile' ? `2px solid ${theme.colors.accent}` : 'none',
                color: activeTab === 'profile' ? theme.colors.accent : theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'profile') {
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'profile') {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              <User size={20} />
              {t('settings.profileTab')}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className="flex items-center gap-2 px-6 py-4 font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'security' ? `2px solid ${theme.colors.accent}` : 'none',
                color: activeTab === 'security' ? theme.colors.accent : theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'security') {
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'security') {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              <Lock size={20} />
              {t('settings.securityTab')}
            </button>
            <button
              onClick={() => setActiveTab('2fa')}
              className="flex items-center gap-2 px-6 py-4 font-medium transition-colors"
              style={{
                borderBottom: activeTab === '2fa' ? `2px solid ${theme.colors.accent}` : 'none',
                color: activeTab === '2fa' ? theme.colors.accent : theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== '2fa') {
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== '2fa') {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              <Shield size={20} />
              {t('settings.2faTab')}
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className="flex items-center gap-2 px-6 py-4 font-medium transition-colors"
              style={{
                borderBottom: activeTab === 'appearance' ? `2px solid ${theme.colors.accent}` : 'none',
                color: activeTab === 'appearance' ? theme.colors.accent : theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'appearance') {
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'appearance') {
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
            >
              <Palette size={20} />
              {t('settings.appearanceTab')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Picture */}
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>{t('settings.profilePicture')}</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.profilePicture ? (
                      <img
                        src={`${API_BASE_URL}/${profile.profilePicture}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2"
                        style={{ borderColor: theme.colors.surfaceBorder }}
                        onError={(e) => {
                          console.error('Image load error:', e);
                          console.log('Attempted URL:', `${API_BASE_URL}/${profile.profilePicture}`);
                        }}
                      />
                    ) : (
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.surfaceHover }}
                      >
                        <User size={48} style={{ color: theme.colors.textTertiary }} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label
                      className="px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                      style={{ backgroundColor: theme.colors.accent, color: theme.colors.primary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Camera size={18} />
                      {t('settings.uploadPicture')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                    </label>
                    {profile?.profilePicture && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: theme.colors.error, color: theme.colors.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {t('settings.deletePicture')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>{t('settings.profileInformation')}</h2>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    {t('settings.email')}
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                    style={{
                      borderColor: theme.colors.surfaceBorder,
                      backgroundColor: theme.colors.surfaceHover,
                      color: theme.colors.textTertiary
                    }}
                  />
                  <p className="mt-1 text-sm" style={{ color: theme.colors.textTertiary }}>{t('settings.emailCannotBeChanged')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    {t('settings.username')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      borderColor: theme.colors.surfaceBorder,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.textPrimary
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                      {t('settings.firstName')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        borderColor: theme.colors.surfaceBorder,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                      {t('settings.lastName')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        borderColor: theme.colors.surfaceBorder,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {t('settings.saveChanges')}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>{t('settings.changePassword')}</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: theme.colors.surfaceBorder,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textPrimary
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: theme.colors.surfaceBorder,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textPrimary
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                  {t('settings.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: theme.colors.surfaceBorder,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textPrimary
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {t('settings.updatePassword')}
              </button>
            </form>
          )}

          {/* 2FA Tab */}
          {activeTab === '2fa' && (
            <div className="space-y-6 max-w-md">
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>{t('settings.twoFactorAuth')}</h2>

              {!is2FAEnabled ? (
                <>
                  <p style={{ color: theme.colors.textSecondary }}>{t('settings.2faDescription')}</p>

                  {!qrCode ? (
                    <button
                      onClick={handleSetup2FA}
                      className="px-6 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: theme.colors.accent, color: theme.colors.primary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {t('settings.enable2fa')}
                    </button>
                  ) : (
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.surfaceHover }}>
                        <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>{t('settings.scanQRCode')}</p>
                        <img src={qrCode} alt="QR Code" className="mx-auto" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                          {t('settings.verificationCode')}
                        </label>
                        <input
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                          style={{
                            borderColor: theme.colors.surfaceBorder,
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.textPrimary
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.colors.accent, color: theme.colors.primary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          {t('settings.verify')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQrCode(null);
                            setTwoFactorToken('');
                          }}
                          className="px-6 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: theme.colors.surfaceHover, color: theme.colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={handleDisable2FA} className="space-y-4">
                  <div className="p-4 border rounded-lg" style={{ backgroundColor: `${theme.colors.success}10`, borderColor: theme.colors.success }}>
                    <p style={{ color: theme.colors.success }}>{t('settings.2faCurrentlyEnabled')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                      {t('settings.verificationCode')}
                    </label>
                    <input
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        borderColor: theme.colors.surfaceBorder,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = `2px solid ${theme.colors.accent}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.colors.error, color: theme.colors.primary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {t('settings.disable2fa')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>{t('settings.theme')}</h2>
                <p className="mb-6" style={{ color: theme.colors.textSecondary }}>{t('settings.themeDescription')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
                    const themeConfig = themes[themeKey];
                    const isSelected = themeType === themeKey;

                    return (
                      <button
                        key={themeKey}
                        onClick={async () => {
                          try {
                            await setTheme(themeKey);
                            setSuccess(t('settings.themeUpdated'));
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (error) {
                            setError('Failed to update theme');
                            setTimeout(() => setError(null), 3000);
                          }
                        }}
                        className="relative p-6 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: isSelected ? theme.colors.accent : theme.colors.surfaceBorder,
                          backgroundColor: theme.colors.surface,
                          boxShadow: isSelected ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = theme.colors.textTertiary;
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = theme.colors.surfaceBorder;
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {/* Theme Preview */}
                        <div className="mb-4">
                          <div
                            className="h-24 rounded-lg mb-3"
                            style={{
                              background: themeConfig.colors.gradient,
                            }}
                          />
                          <div className="flex gap-2 justify-center">
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: themeConfig.colors.accent }}
                            />
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: themeConfig.colors.success }}
                            />
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: themeConfig.colors.warning }}
                            />
                          </div>
                        </div>

                        {/* Theme Name */}
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                          {t(`settings.theme${themeConfig.name.replace(/ /g, '')}`)}
                        </p>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.accent }}
                          >
                            <svg
                              className="w-4 h-4"
                              style={{ color: theme.colors.primary }}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Crop Modal */}
      {cropImageFile && (
        <ProfilePictureCrop
          imageFile={cropImageFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </ThemeLayout>
  );
};

export default Settings;
