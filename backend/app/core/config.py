from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    app_name: str = "UrbanRoots API"
    environment: str = "development"
    debug: bool = True
    database_url: str 

    # ---------------- EMAIL ---------------- #
    mail_username: str
    mail_password: str
    mail_from: str
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False

    # ---------------- AUTH ---------------- #
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # ---------------- CORS ---------------- #
    frontend_url: str = "http://localhost:3001"
    allowed_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3001,"
        "http://127.0.0.1:3001"
    )

    # ---------------- CONFIG ---------------- #
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # ---------------- HELPERS ---------------- #
    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
