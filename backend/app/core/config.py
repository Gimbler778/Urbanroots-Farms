from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # Application
    app_name: str = "UrbanRoots API"
    environment: str = "development"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./urbanroots.db"
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS (will be parsed as comma-separated string from .env)
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )
    
    def get_allowed_origins(self) -> List[str]:
        """Parse allowed origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
