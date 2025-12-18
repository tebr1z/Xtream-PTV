import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BugReportButton = () => {
  const navigate = useNavigate();
  const params = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();
  const lang = params.lang || i18n.language?.split('-')[0] || 'az';

  const handleClick = () => {
    // Support sayfasına yönlendir ve kategori olarak "Bug Report" seçili olsun
    navigate(`/${lang}/support?category=bug_report`);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
      aria-label="Bug Report"
      title={i18n.t('bugReport.report') || 'Bug Report'}
    >
      <span className="material-symbols-outlined text-lg">bug_report</span>
      <span className="font-medium text-sm hidden sm:inline">
        {i18n.t('bugReport.report') || 'Bug Report'}
      </span>
    </button>
  );
};

export default BugReportButton;

