from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from typing import Optional, List, Literal
import ipaddress


# ============================================
# IP ADDRESS
# ============================================

class IPAddress(BaseModel):
    model_config = ConfigDict(extra="forbid")

    address: str = Field(min_length=1)
    prefix_length: int = Field(ge=0, le=128)

    @field_validator("address")
    @classmethod
    def validate_ip_address(cls, value):
        try:
            ipaddress.ip_address(value)
        except ValueError:
            raise ValueError(f"Invalid IP address: {value}")

        return value


# ============================================
# INTERFACE
# ============================================

class Interface(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    name: str = Field(min_length=1)

    enabled: bool

    description: Optional[str] = None

    ip_addresses: Optional[List[IPAddress]] = None


# ============================================
# METADATA
# ============================================

class Metadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vendor: Optional[str] = Field(default=None, min_length=1)
    platform: Optional[str] = Field(default=None, min_length=1)


# ============================================
# SECURITY RULE
# ============================================

class SecurityRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)

    action: Literal["allow", "deny"]

    protocol: Literal["tcp", "udp", "icmp"]

    source: str = Field(min_length=1)

    destination: str = Field(min_length=1)

    destination_port: Optional[int] = Field(
        default=None,
        ge=1,
        le=65535
    )

    enabled: bool


# ============================================
# DEVICE
# ============================================

class Device(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)

    hostname: str = Field(min_length=1)

    metadata: Optional[Metadata] = None

    interfaces: List[Interface]

    security_policies: List[SecurityRule]

    routing: Optional[dict] = None


# ============================================
# ROOT CDM
# ============================================

class NetworkSecurityCDM(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str

    device: Optional[Device] = None
    devices: Optional[List[Device]] = None

    @model_validator(mode="after")
    def validate_devices(self):
        if self.device is None and not self.devices:
            raise ValueError("At least one device is required")

        return self

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, value):
        import re

        if not re.fullmatch(r"\d+\.\d+\.\d+", value):
            raise ValueError(
                "schema_version must follow semantic version format "
                "(example: 1.0.0)"
            )

        return value


import json
from pydantic import ValidationError

# Import your Pydantic model

def validate_json_file(file_path: str):

    # -----------------------------------------
    # STEP 1: Read JSON file
    # -----------------------------------------
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            cdm_dict = json.load(file)

    except json.JSONDecodeError as e:
        return {
            "valid": False,
            "errors": [f"Invalid JSON: {e}"]
        }

    except FileNotFoundError:
        return {
            "valid": False,
            "errors": [f"File not found: {file_path}"]
        }

    # -----------------------------------------
    # STEP 2: Make sure JSON became a dictionary
    # -----------------------------------------
    if not isinstance(cdm_dict, dict):
        return {
            "valid": False,
            "errors": ["JSON root must be an object/dictionary."]
        }

    # -----------------------------------------
    # STEP 3: Pass dictionary to Pydantic
    # -----------------------------------------
    try:

        validated_cdm = NetworkSecurityCDM.model_validate(cdm_dict)

        return {
            "valid": True,
            "cdm": validated_cdm.model_dump(),
            "errors": []
        }

    except ValidationError as e:

        return {
            "valid": False,
            "cdm": None,
            "errors": e.errors()
        }


# =============================================
# TEST
# =============================================


if __name__ == "__main__":
    result = validate_json_file(
        r"C:\Users\SRIJIV DEBNATH\OneDrive\HackHeritage4.0\GATE-2\Datasets\arista_invalid.json"
    )
    print(result)