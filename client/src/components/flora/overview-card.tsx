import React from 'react';

interface OverviewCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}

/**
 * Componente de card para exibir métricas na visão geral
 * com design minimalista inspirado na estética Apple
 */
const OverviewCard: React.FC<OverviewCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  trend, 
  trendValue, 
  color 
}) => {
  // Renderizar o ícone apropriado baseado na propriedade icon
  const renderIcon = () => {
    const iconColor = color || '#0071e3';
    
    switch(icon) {
      case '🏡':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill={iconColor}/>
          </svg>
        );
      case '🐝':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.36 10.27L15.07 6.01C15.86 5.1 16.22 4.37 15.87 3.91C15.36 3.22 13.73 3.42 12.24 4.4C11.93 4.23 11.59 4.1 11.24 4.01C10.38 3.82 9.54 3.91 8.86 4.22C7.39 3.3 5.85 3.13 5.36 3.8C4.97 4.33 5.47 5.22 6.4 6.16L2.18 10.27C1.46 10.97 1.33 12.18 1.92 13.11L2.53 14.1C3.11 15.03 4.3 15.32 5.03 14.75L6.3 13.77C6.64 13.5 6.87 13.14 6.97 12.73L8.89 13.68C8.75 14.61 8.92 15.6 9.4 16.47C10.04 17.59 11.13 18.35 12.36 18.58L13.5 19.87C13.94 20.39 14.7 20.39 15.14 19.87L16.28 18.58C17.51 18.35 18.6 17.59 19.24 16.47C19.72 15.6 19.89 14.61 19.75 13.68L21.67 12.73C21.77 13.14 22 13.5 22.34 13.77L23.61 14.75C24.33 15.32 25.53 15.03 26.11 14.1L26.71 13.11C27.31 12.18 27.19 10.98 26.46 10.27L19.36 10.27ZM13.45 16.38C13.11 16.43 12.76 16.43 12.42 16.38C11.64 16.27 10.96 15.86 10.53 15.24C9.9 14.36 9.88 13.25 10.37 12.45L12.43 13.6L14.49 12.45C14.98 13.25 14.96 14.36 14.34 15.24C13.91 15.86 13.23 16.27 12.45 16.38L13.45 16.38Z" fill={iconColor}/>
          </svg>
        );
      case '📊':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 9.2H8V19H5V9.2ZM10.6 5H13.4V19H10.6V5ZM16.2 13H19V19H16.2V13Z" fill={iconColor}/>
          </svg>
        );
      case '🍯':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.79 8L14.5 7.11C14.27 7.04 14.03 7 13.79 7H10.21C9.97 7 9.73 7.04 9.5 7.11L10.21 8H13.79ZM10.94 9H13.06L13.45 8.5H10.55L10.94 9ZM17.96 11C18.5 12.81 19 15.2 19 17C19 19.76 17.76 21 15 21H9C6.24 21 5 19.76 5 17C5 15.2 5.5 12.81 6.04 11H17.96ZM20.16 9H3.84C4.45 7.84 5.43 7 6.56 7H7.5L9 4H15L16.5 7H17.44C18.56 7 19.55 7.84 20.16 9Z" fill={iconColor}/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Determinar ícone de tendência
  const getTrendIcon = () => {
    if (!trend) return null;
    
    return trend === 'up' ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14L12 9L17 14H7Z" fill="currentColor"/>
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
      </svg>
    );
  };

  // Determinar classe de cor da tendência
  const getTrendClass = () => {
    if (!trend) return '';
    return trend === 'up' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  };
  
  // Definir cor de borda do cartão
  const cardStyle = {
    borderTop: `3px solid ${color || '#0071e3'}`
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4" style={cardStyle}>
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          {renderIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">{value}</span>
            {unit && <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{unit}</span>}
          </div>
          {trend && trendValue && (
            <div className={`mt-1 flex items-center ${getTrendClass()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewCard; 