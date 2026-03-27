import requests
from app.core.constants import NOMINATIM_URL


def reverse_geocode(latitude, longitude):

    try:

        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "json"
        }

        headers = {
            "User-Agent": "claimsure-ai-interview-system"
        }

        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=headers,
            timeout=5
        )

        if response.status_code != 200:
            print("Reverse geocode failed:", response.status_code)
            return {"full_address": None}

        data = response.json()

        full_address = data.get("display_name")

        return {
            "full_address": full_address
        }

    except Exception as e:

        print("Reverse geocode error:", e)

        return {
            "full_address": None
        }