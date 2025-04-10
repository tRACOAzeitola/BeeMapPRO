import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/theme-context';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'demo@beemap.pro') {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/app/dashboard');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const pricingPlans = [
    {
      name: 'Essencial',
      price: '€29/mês',
      annualPrice: '€290/ano',
      features: [
        'Gestão de até 10 apiários e 50 colmeias',
        'Mapas interativos com indicadores',
        'Análise climática integrada',
        'Dashboard básico com métricas',
        'Suporte via e-mail'
      ]
    },
    {
      name: 'Pro',
      price: '€99/mês',
      annualPrice: '€990/ano',
      features: [
        'Gestão de até 50 apiários e 250 colmeias',
        'Mapeamento de flora melífera com IA',
        'Recomendações inteligentes',
        'Análise avançada de vegetação',
        'Gestão de inventário'
      ]
    },
    {
      name: 'Enterprise',
      price: '€299/mês',
      annualPrice: '€2.990/ano',
      features: [
        'Gestão ilimitada de apiários',
        'Integração IoT',
        'Análise preditiva com LSTMs',
        'API pública para integração',
        'Relatórios personalizados'
      ]
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Selecione Área',
      description: 'Escolha um local no mapa interativo ou insira coordenadas específicas para análise.'
    },
    {
      step: 2,
      title: 'Análise Automática',
      description: 'Nossa IA analisa imagens de satélite para identificar plantas melíferas e condições ideais.'
    },
    {
      step: 3,
      title: 'Resultados Detalhados',
      description: 'Receba um relatório completo com pontuação de adequação e previsões de produtividade.'
    },
    {
      step: 4,
      title: 'Tome Decisões',
      description: 'Use nossos insights para otimizar a colocação de colmeias e maximizar sua produção.'
    }
  ];

  const benefits = [
    {
      icon: '🌱',
      title: 'Análise de Vegetação',
      description: 'Identificação precisa de espécies melíferas como rosmaninho, eucalipto e tomilho através de imagens de satélite.'
    },
    {
      icon: '📊',
      title: 'Previsão de Produtividade',
      description: 'Estimativas de produção de mel baseadas em dados históricos e condições ambientais atuais.'
    },
    {
      icon: '🗺️',
      title: 'Mapas Interativos',
      description: 'Visualize facilmente as melhores áreas para colocação de colmeias em mapas interativos e detalhados.'
    },
    {
      icon: '🌤️',
      title: 'Dados Climáticos',
      description: 'Integração com informações meteorológicas para otimizar decisões de manejo e previsão de floradas.'
    },
    {
      icon: '📱',
      title: 'Acessível em Qualquer Dispositivo',
      description: 'Acesse suas análises em smartphones, tablets ou computadores, onde quer que esteja.'
    },
    {
      icon: '📈',
      title: 'Relatórios Detalhados',
      description: 'Receba relatórios completos sobre cada área analisada, incluindo recomendações práticas.'
    }
  ];

  const testimonials = [
    {
      quote: "O BeeMap transformou minha operação de apicultura. Consegui aumentar a produção de mel em 35% ao escolher melhores locais para minhas colmeias com base nas análises.",
      author: "António Silva",
      role: "Apicultor Profissional"
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-yellow-50'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm shadow-sm z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-yellow-600">BeeMap</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              {['Como Funciona', 'Benefícios', 'Preços', 'Sobre Nós'].map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${isDarkMode ? 'text-gray-300 hover:text-yellow-500' : 'text-gray-600 hover:text-yellow-600'} transition-colors`}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                >
                  {item}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                onClick={() => setShowLogin(true)}
              >
                Acessar Aplicação
              </motion.button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-yellow-500' : 'text-gray-600 hover:text-yellow-600'}`}
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pt-32 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            BeeMap - Tecnologia para Apicultura de Precisão
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Revolucionando a apicultura com tecnologia geoespacial e análise de dados
          </p>
        </div>
      </motion.section>

      {/* Login Form */}
      {showLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-xl max-w-md w-full`}
          >
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className={`block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="demo@beemap.pro"
                />
              </div>
              <div className="mb-6">
                <label className={`block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Entrar
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* How It Works Section */}
      <section id="como-funciona" className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefícios" className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Benefícios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="sobre-nós" className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pioneiros na Apicultura de Precisão</h2>
          <div className={`max-w-3xl mx-auto text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className="mb-8">
              A BeeMap nasceu da combinação entre paixão pela apicultura e expertise em tecnologias avançadas. Nossa equipe multidisciplinar reúne apicultores experientes, engenheiros ambientais, cientistas de dados e especialistas em geoespacial para criar soluções que transformam a forma como a apicultura é praticada.
            </p>
            <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nossa Missão</h3>
            <p>
              Democratizar o acesso à tecnologia de ponta para apicultores de todos os portes, promovendo práticas sustentáveis que beneficiam tanto os produtores quanto os ecossistemas naturais.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} rounded-lg shadow-lg p-6 border`}
            >
              <div className="text-4xl mb-4">🧠</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inteligência Artificial</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Utilizamos algoritmos avançados de aprendizado de máquina para analisar múltiplas camadas de dados geoespaciais, identificando padrões que o olho humano não consegue detectar.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className={`${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} rounded-lg shadow-lg p-6 border`}
            >
              <div className="text-4xl mb-4">🛰️</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Análise Geoespacial</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Integramos dados de satélite de última geração com resolução espacial e temporal superior, permitindo o monitoramento contínuo de floradas e condições climáticas.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className={`${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} rounded-lg shadow-lg p-6 border`}
            >
              <div className="text-4xl mb-4">📱</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tecnologia Acessível</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Desenvolvemos uma plataforma intuitiva que traduz dados complexos em informações práticas e acionáveis para apicultores de todos os níveis.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>O Que Dizem Nossos Usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <p className={`italic mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.author}</p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preços" className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nossos Planos</h2>
          
          {/* Free Trial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`${
              isDarkMode ? 'bg-gray-900' : 'bg-yellow-50'
            } rounded-lg shadow-xl p-8 text-center border ${
              isDarkMode ? 'border-yellow-500/20' : 'border-yellow-500/30'
            } mb-12`}
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Experimente Gratuitamente por 14 Dias
            </h2>
            <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Acesso completo ao plano "Pro" — experimente a IA e o mapeamento de flora sem compromisso.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-600 transition-colors shadow-lg"
              onClick={() => setShowLogin(true)}
            >
              Começar Teste Gratuito
            </motion.button>
            <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Não é necessário cartão de crédito
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`${
                  isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                } rounded-lg shadow-lg p-8 border`}
              >
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{plan.name}</h3>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-yellow-500 mb-1">{plan.price}</p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{plan.annualPrice}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg 
                        className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                  Começar Agora
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BeeMap</h3>
              <p className="text-gray-400">Tecnologia para Apicultura de Precisão</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Como Funciona</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Benefícios</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre Nós</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: contato@beemap.pro</li>
                <li className="text-gray-400">Telefone: +351 123 456 789</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 BeeMap. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 