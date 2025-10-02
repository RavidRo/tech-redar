from pydantic import Field, MongoDsn
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Server config settings."""

    mongo_uri: MongoDsn = Field(validation_alias="MONGO_URI")


SETTINGS = Settings()  # type: ignore[call-arg, unused-ignore] # I am having trouble getting this to work on VSCode
