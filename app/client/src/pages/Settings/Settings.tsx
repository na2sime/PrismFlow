import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Shield, Camera, X, Palette } from 'lucide-react';
import { apiService } from '../../services/api';
import ProfilePictureCrop from '../../components/ProfilePictureCrop/ProfilePictureCrop';
import { useTheme } from '../../contexts/ThemeContext';
import { themes, ThemeType } from '../../themes';

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
  const { themeType, setTheme } = useTheme();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">{t('settings.title')}</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <User size={20} />
              {t('settings.profileTab')}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Lock size={20} />
              {t('settings.securityTab')}
            </button>
            <button
              onClick={() => setActiveTab('2fa')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === '2fa'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Shield size={20} />
              {t('settings.2faTab')}
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'appearance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
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
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('settings.profilePicture')}</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.profilePicture ? (
                      <img
                        src={`${API_BASE_URL}/${profile.profilePicture}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          console.log('Attempted URL:', `${API_BASE_URL}/${profile.profilePicture}`);
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={48} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors flex items-center gap-2">
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
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        {t('settings.deletePicture')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-800">{t('settings.profileInformation')}</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('settings.email')}
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-slate-500">{t('settings.emailCannotBeChanged')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('settings.username')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('settings.firstName')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('settings.lastName')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('settings.saveChanges')}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <h2 className="text-xl font-semibold text-slate-800">{t('settings.changePassword')}</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('settings.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('settings.updatePassword')}
              </button>
            </form>
          )}

          {/* 2FA Tab */}
          {activeTab === '2fa' && (
            <div className="space-y-6 max-w-md">
              <h2 className="text-xl font-semibold text-slate-800">{t('settings.twoFactorAuth')}</h2>

              {!is2FAEnabled ? (
                <>
                  <p className="text-slate-600">{t('settings.2faDescription')}</p>

                  {!qrCode ? (
                    <button
                      onClick={handleSetup2FA}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {t('settings.enable2fa')}
                    </button>
                  ) : (
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-4">{t('settings.scanQRCode')}</p>
                        <img src={qrCode} alt="QR Code" className="mx-auto" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('settings.verificationCode')}
                        </label>
                        <input
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {t('settings.verify')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQrCode(null);
                            setTwoFactorToken('');
                          }}
                          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={handleDisable2FA} className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">{t('settings.2faCurrentlyEnabled')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('settings.verificationCode')}
                    </label>
                    <input
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('settings.theme')}</h2>
                <p className="text-slate-600 mb-6">{t('settings.themeDescription')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(Object.keys(themes) as ThemeType[]).map((theme) => {
                    const themeConfig = themes[theme];
                    const isSelected = themeType === theme;

                    return (
                      <button
                        key={theme}
                        onClick={async () => {
                          try {
                            await setTheme(theme);
                            setSuccess(t('settings.themeUpdated'));
                            setTimeout(() => setSuccess(null), 3000);
                          } catch (error) {
                            setError('Failed to update theme');
                            setTimeout(() => setError(null), 3000);
                          }
                        }}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 shadow-lg scale-105'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
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
                        <p className="font-semibold text-slate-900">
                          {t(`settings.theme${themeConfig.name.replace(/ /g, '')}`)}
                        </p>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
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
    </div>
  );
};

export default Settings;
