from pathlib import Path

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    project_name: str = "Invisible Insurance Bot"
    secret_key: str = "super-secret-change-me"
    access_token_expire_minutes: int = 60
    database_url: str = f"sqlite+aiosqlite:///{BASE_DIR / 'data' / 'clinic.db'}"
    provider_names: tuple[str, ...] = ("Blue Cross", "Aetna", "Cigna", "UnitedHealth", "Humana")
    frontend_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    )

    class Config:
        env_file = BASE_DIR / ".env"


settings = Settings()
