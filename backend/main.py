from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar aplicação FastAPI
app = FastAPI(
    title="BeeMap API",
    description="API para análise geoespacial e IA para apicultura de precisão",
    version="0.1.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, limitar para domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar rotas
from api.routes import apiary_routes, analysis_routes, vegetation_routes

# Registrar rotas
app.include_router(apiary_routes.router)
app.include_router(analysis_routes.router)
app.include_router(vegetation_routes.router)

@app.get("/")
async def root():
    return {
        "message": "BeeMap API - Revolucionando a apicultura através de dados geoespaciais e IA",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 