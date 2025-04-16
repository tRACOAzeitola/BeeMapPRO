"""
Modelos de machine learning para análise de adequação apícola.
Versão demonstrativa com dados simulados.
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Any
import pickle
import os
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ApiaryPotentialModel:
    """
    Modelo para predição de potencial apícola de uma área geográfica.
    
    Esta é uma implementação demonstrativa que utiliza RandomForest
    para prever adequação de uma área para apicultura.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'ndvi', 'evi', 'forest_pct', 'shrubland_pct', 'grassland_pct',
            'cropland_pct', 'urban_pct', 'water_pct', 'elevation', 'slope',
            'temp_avg', 'rainfall_mm', 'wind_speed', 'water_distance_km'
        ]
        self.model_path = os.path.join(os.path.dirname(__file__), 'saved_models/apiary_model.pkl')
        
        # Carregar modelo se existir, ou treinar um novo
        if os.path.exists(self.model_path):
            try:
                self._load_model()
                logger.info("Modelo carregado do arquivo.")
            except Exception as e:
                logger.error(f"Erro ao carregar modelo: {e}")
                self._train_demo_model()
        else:
            logger.info("Treinando modelo demonstrativo.")
            self._train_demo_model()
    
    def _generate_dummy_data(self, n_samples: int = 100) -> Tuple[np.ndarray, np.ndarray]:
        """
        Gera dados simulados para demonstração.
        
        Neste exemplo, estamos criando regras simples que aproximam 
        como diferentes fatores podem influenciar na adequação apícola.
        """
        X = np.random.rand(n_samples, len(self.feature_names))
        # Renomear colunas para facilitar entendimento
        df_features = {name: X[:, i] for i, name in enumerate(self.feature_names)}
        
        # Calcular pontuação baseada em regras lógicas
        # (Estas regras são simplificações para demonstração)
        
        # NDVI e EVI contribuem positivamente
        veg_score = (df_features['ndvi'] * 30) + (df_features['evi'] * 20)
        
        # Floresta e vegetação arbustiva são positivas
        land_score = (df_features['forest_pct'] * 15) + (df_features['shrubland_pct'] * 25) + \
                     (df_features['grassland_pct'] * 10) - (df_features['urban_pct'] * 40)
        
        # Temperatura ideal em torno de 0.5 (normalizado)
        temp_score = 20 - (np.abs(df_features['temp_avg'] - 0.5) * 30)
        
        # Distância da água (menor é melhor)
        water_score = 25 * (1 - df_features['water_distance_km'])
        
        # Combinar fatores
        y = veg_score + land_score + temp_score + water_score
        
        # Normalizar para 0-100 e adicionar ruído
        y = np.clip(y, 0, 100) + np.random.normal(0, 5, n_samples)
        y = np.clip(y, 0, 100)
        
        return X, y
    
    def _train_demo_model(self):
        """Treina um modelo de demonstração com dados simulados"""
        logger.info("Gerando dados de treinamento demonstrativos...")
        X_train, y_train = self._generate_dummy_data(n_samples=500)
        
        # Normalizar características
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Treinar modelo
        logger.info("Treinando modelo RandomForest...")
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Salvar modelo
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self._save_model()
        
        # Avaliar no conjunto de treinamento
        train_score = self.model.score(X_train_scaled, y_train)
        logger.info(f"R² no conjunto de treinamento: {train_score:.4f}")
        
    def _save_model(self):
        """Salva o modelo treinado em disco"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'timestamp': datetime.now().isoformat()
        }
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Modelo salvo em {self.model_path}")
    
    def _load_model(self):
        """Carrega o modelo salvo do disco"""
        with open(self.model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        
        logger.info(f"Modelo carregado. Criado em: {model_data.get('timestamp', 'desconhecido')}")
    
    def predict(self, features: Dict[str, float]) -> float:
        """
        Prevê o potencial apícola com base nas características fornecidas.
        
        Args:
            features: Dicionário de características.
                      Deve incluir todas as features necessárias.
                      
        Returns:
            Pontuação de adequação apícola de 0 a 100.
        """
        if not self.model:
            raise ValueError("Modelo não treinado. Execute _train_demo_model() primeiro.")
        
        # Extrair características na ordem correta
        X = np.array([[features.get(name, 0.0) for name in self.feature_names]])
        
        # Normalizar
        X_scaled = self.scaler.transform(X)
        
        # Prever
        score = self.model.predict(X_scaled)[0]
        
        # Garantir que esteja no intervalo 0-100
        return float(np.clip(score, 0, 100))
    
    def get_feature_importances(self) -> Dict[str, float]:
        """Retorna a importância relativa de cada característica no modelo"""
        if not self.model:
            raise ValueError("Modelo não treinado.")
            
        importances = self.model.feature_importances_
        return {name: float(importance) for name, importance in zip(self.feature_names, importances)}
    
    def explain_prediction(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Fornece uma explicação da predição, destacando os fatores mais importantes.
        
        Args:
            features: Características usadas para predição
            
        Returns:
            Dicionário contendo explicação e detalhe dos fatores
        """
        score = self.predict(features)
        importances = self.get_feature_importances()
        
        # Ordenar características por importância
        sorted_features = sorted(
            [(name, features.get(name, 0.0), importances[name]) 
             for name in self.feature_names],
            key=lambda x: x[2],
            reverse=True
        )
        
        # Gerar explicação
        top_factors = []
        for name, value, importance in sorted_features[:5]:  # Top 5 fatores
            if name == 'ndvi' and value > 0.6:
                factor = "Alta densidade de vegetação é muito favorável"
            elif name == 'water_distance_km' and value < 0.3:
                factor = "Proximidade de fontes de água é positiva"
            elif name == 'urban_pct' and value > 0.4:
                factor = "Alta urbanização reduz o potencial apícola"
            elif name == 'forest_pct' and value > 0.5:
                factor = "Boa cobertura florestal aumenta potencial de néctar"
            elif 'temp_avg' in name:
                factor = "Temperatura está em faixa adequada" if 0.4 <= value <= 0.6 else "Temperatura não está na faixa ideal"
            else:
                factor = f"{name.replace('_', ' ').title()} tem impacto significativo"
                
            top_factors.append({
                "factor": factor,
                "feature": name,
                "value": value,
                "importance": float(importance)
            })
            
        return {
            "score": float(score),
            "explanation": self._generate_text_explanation(score),
            "top_factors": top_factors
        }
        
    def _generate_text_explanation(self, score: float) -> str:
        """Gera uma explicação textual baseada na pontuação"""
        if score >= 85:
            return "Área excelente para apicultura, com condições ideais para alta produção de mel."
        elif score >= 70:
            return "Boa área para apicultura, com condições favoráveis na maioria dos aspectos."
        elif score >= 50:
            return "Área moderadamente adequada, com algumas limitações que podem ser gerenciadas."
        elif score >= 30:
            return "Área com limitações significativas para apicultura, produção pode ser abaixo da média."
        else:
            return "Área pouco adequada para apicultura, com múltiplos fatores desfavoráveis."

# Exemplo de uso
if __name__ == "__main__":
    model = ApiaryPotentialModel()
    
    # Características de exemplo (valores normalizados entre 0-1)
    test_features = {
        'ndvi': 0.72,              # Bom índice de vegetação
        'evi': 0.68,               # Bom índice de vegetação melhorado
        'forest_pct': 0.35,        # 35% de floresta
        'shrubland_pct': 0.40,     # 40% de vegetação arbustiva
        'grassland_pct': 0.15,     # 15% de pastagem
        'cropland_pct': 0.05,      # 5% de agricultura
        'urban_pct': 0.02,         # 2% de área urbana
        'water_pct': 0.03,         # 3% de água
        'elevation': 0.45,         # Elevação média
        'slope': 0.30,             # Inclinação moderada
        'temp_avg': 0.50,          # Temperatura ideal
        'rainfall_mm': 0.65,       # Boa precipitação
        'wind_speed': 0.25,        # Vento moderado
        'water_distance_km': 0.15  # Próximo a água
    }
    
    # Obter previsão
    result = model.explain_prediction(test_features)
    
    # Imprimir resultado
    print(f"Pontuação de adequação apícola: {result['score']:.1f}/100")
    print(f"Explicação: {result['explanation']}")
    print("\nFatores principais:")
    for factor in result['top_factors']:
        print(f"- {factor['factor']} (importância: {factor['importance']:.3f})") 