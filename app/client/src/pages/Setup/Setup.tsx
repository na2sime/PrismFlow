import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, CheckCircle, ArrowRight, ArrowLeft, Languages } from 'lucide-react';

interface AdminUserData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface ProjectData {
  name: string;
  description: string;
  templateId: string;
}

const Setup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  const [adminData, setAdminData] = useState<AdminUserData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    templateId: '',
  });

  const steps = [
    {
      id: 1,
      title: t('setup.step1.title'),
      description: t('setup.step1.description'),
      icon: <User className="w-6 h-6" />,
    },
    {
      id: 2,
      title: t('setup.step2.title'),
      description: t('setup.step2.description'),
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      id: 3,
      title: t('setup.step3.title'),
      description: t('setup.step3.description'),
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiService.getProjectTemplates();
      if (response.success) {
        setTemplates(response.data.templates);
        if (response.data.templates.length > 0) {
          setProjectData((prev) => ({
            ...prev,
            templateId: response.data.templates[0].id,
          }));
        }
      }
    } catch (err: any) {
      console.error('Error loading templates:', err);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminData.password !== adminData.confirmPassword) {
      setError(t('setup.step1.passwordMismatch'));
      return;
    }

    if (adminData.password.length < 6) {
      setError(t('setup.step1.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createAdminUser({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
      });

      if (response.success) {
        setAdminUserId(response.data.user.id);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('setup.step1.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const selectedTemplate = templates.find((t) => t.id === projectData.templateId);
      const response = await apiService.createFirstProject(
        {
          name: projectData.name,
          description: projectData.description,
          settings: selectedTemplate?.settings,
        },
        adminUserId
      );

      if (response.success) {
        setCurrentStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('setup.step2.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      await apiService.completeSetup();

      // Auto-login with the admin credentials
      const loginResponse = await apiService.login(adminData.email, adminData.password);

      if (loginResponse.success && !loginResponse.data.requiresTwoFactor) {
        localStorage.setItem('accessToken', loginResponse.data.accessToken);
        localStorage.setItem('refreshToken', loginResponse.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

        // Force a full page reload to refresh setup status
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('setup.step3.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {t('setup.welcome')}
          </h1>
          <p className="text-lg text-slate-600">{t('setup.subtitle')}</p>
        </motion.div>

        {/* Progress Steps - Only show when not on language selection (step 0) */}
        {currentStep > 0 && (
        <div className="flex items-center justify-between mb-12 relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {step.icon}
                </div>
                <h3
                  className={`text-sm font-semibold transition-colors ${
                    currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 text-center mt-1">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 relative -mt-16">
                  <div
                    className={`absolute inset-0 bg-blue-500 transition-all duration-500 ${
                      currentStep > step.id ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step Forms */}
        <div className="glass rounded-2xl p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <Languages className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose your language</h2>
                <p className="text-slate-600 mb-8">Select your preferred language for the setup</p>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => {
                      i18n.changeLanguage('fr');
                      setCurrentStep(1);
                    }}
                    className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="text-4xl mb-2">🇫🇷</div>
                    <div className="font-semibold text-slate-900">Français</div>
                  </button>

                  <button
                    onClick={() => {
                      i18n.changeLanguage('en');
                      setCurrentStep(1);
                    }}
                    className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="text-4xl mb-2">🇬🇧</div>
                    <div className="font-semibold text-slate-900">English</div>
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleAdminSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('common.firstName')}
                    </label>
                    <input
                      type="text"
                      value={adminData.firstName}
                      onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('common.lastName')}
                    </label>
                    <input
                      type="text"
                      value={adminData.lastName}
                      onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('common.username')}
                  </label>
                  <input
                    type="text"
                    value={adminData.username}
                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('common.email')}</label>
                  <input
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('common.password')}
                    </label>
                    <input
                      type="password"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('setup.step1.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      value={adminData.confirmPassword}
                      onChange={(e) =>
                        setAdminData({ ...adminData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.creating') : t('common.continue')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.form>
            )}

            {currentStep === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleProjectSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('setup.step2.projectName')}
                  </label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    placeholder={t('setup.step2.projectNamePlaceholder')}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('common.description')} ({t('common.optional')})
                  </label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    placeholder={t('setup.step2.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    {t('setup.step2.chooseTemplate')}
                  </label>
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setProjectData({ ...projectData, templateId: template.id })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          projectData.templateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="font-semibold text-slate-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                        {template.columns && (
                          <div className="flex gap-2 flex-wrap">
                            {template.columns.map((col: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: col.color }}
                              >
                                {col.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-lg border-2 border-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('common.creating') : t('common.continue')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.form>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('setup.step3.congratulations')}</h2>
                <p className="text-slate-600 mb-8">
                  {t('setup.step3.workspaceReady')}
                </p>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('setup.step3.finalizing') : t('setup.step3.accessPrismFlow')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Setup;