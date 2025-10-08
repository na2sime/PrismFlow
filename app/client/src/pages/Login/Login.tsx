import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import ThemeLayout from '../../components/ThemeLayout/ThemeLayout';
import { useTheme } from '../../contexts/ThemeContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(email, password, twoFactorCode || undefined);

      if (response.success) {
        if (response.data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
        } else {
          // Save tokens and user data
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeLayout>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {t('auth.loginTitle')}
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>{t('auth.loginSubtitle')}</p>
          </div>

          <div
            className="backdrop-blur-md rounded-2xl p-8 shadow-xl border"
            style={{
              background: theme.colors.glassBackground,
              borderColor: theme.colors.glassBorder,
            }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg text-sm border"
                style={{
                  backgroundColor: `${theme.colors.error}15`,
                  borderColor: `${theme.colors.error}40`,
                  color: theme.colors.error,
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!requiresTwoFactor ? (
                <>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {t('common.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition"
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        color: theme.colors.textPrimary,
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {t('common.password')}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition"
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        color: theme.colors.textPrimary,
                      }}
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {t('auth.twoFactorCode')}
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition text-center text-2xl tracking-widest"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.surfaceBorder,
                      color: theme.colors.textPrimary,
                    }}
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = theme.colors.accentHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.accent;
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.connecting')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('auth.login')}
                  </>
                )}
              </button>

              {requiresTwoFactor && (
                <button
                  type="button"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setTwoFactorCode('');
                  }}
                  className="w-full text-sm transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  {t('common.back')}
                </button>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </ThemeLayout>
  );
};

export default Login;
