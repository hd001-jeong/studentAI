from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

GOOGLE_CREDENTIALS = (
    BASE_DIR
    / "credentials"
    / "google-service-account.json"
)

GOOGLE_SHEET_ID = (
    "13mBNO4GeIPNQwswa-XRTff_jtqMMSZazETYLn_GRmhQ"
)

GOOGLE_WORKSHEET = "시트1"