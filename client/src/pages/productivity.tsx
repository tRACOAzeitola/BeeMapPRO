import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Productivity: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Dados de exemplo para o gráfico
  const data = [
    { month: 'Jan', production: 65 },
    { month: 'Fev', production: 59 },
    { month: 'Mar', production: 80 },
    { month: 'Abr', production: 81 },
    { month: 'Mai', production: 56 },
    { month: 'Jun', production: 55 },
    { month: 'Jul', production: 40 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Análise de Produtividade
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Acompanhe o desempenho da produção de mel ao longo do tempo
        </p>
      </motion.div>

      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Produção Mensal de Mel
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
              />
              <YAxis 
                stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
                label={{ 
                  value: 'Produção (kg)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: isDarkMode ? '#9CA3AF' : '#4B5563' }
                }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: isDarkMode ? '#F3F4F6' : '#111827' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="production" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Produção"
                dot={{ fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Produção Total
          </h3>
          <p className="text-3xl font-bold text-amber-500">436 kg</p>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Últimos 7 meses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Média Mensal
          </h3>
          <p className="text-3xl font-bold text-amber-500">62.3 kg</p>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Por mês
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Melhor Mês
          </h3>
          <p className="text-3xl font-bold text-amber-500">81 kg</p>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Abril 2024
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Productivity; 