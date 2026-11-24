import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import SessionLocal
from app.api.v1.stations import list_stations, get_station, update_station
from app.schemas.station import StationUpdate
from app.models.station import Station, ZoneType, StationStatus
from fastapi import HTTPException
from pydantic import ValidationError

def test_station_edit_end_to_end():
    db = SessionLocal()
    print("=" * 70)
    print(" NOISESCAPE - STATION DATA EDIT VERIFICATION TEST SUITE")
    print("=" * 70)

    try:
        # 1. Fetch initial stations
        stations = list_stations(db=db)
        assert len(stations) > 0, "No stations found in DB"
        target_station = stations[0]
        original_name = target_station.name
        original_zone = target_station.zone
        original_lat = target_station.latitude
        original_lng = target_station.longitude
        original_status = target_station.status
        original_desc = target_station.description

        print(f"[OK] 1. Initial Station: ID #{target_station.id} - '{original_name}' ({original_zone})")

        # 2. Test valid update: Change name, zone, status, coordinates, description
        new_name = f"{original_name} [Updated]"
        update_payload = StationUpdate(
            name=new_name,
            zone=ZoneType.COMMERCIAL,
            status=StationStatus.MAINTENANCE,
            latitude=9.9200,
            longitude=78.1150,
            description="Updated via Edit Station feature test"
        )

        updated = update_station(station_id=target_station.id, station_in=update_payload, db=db)
        assert updated.id == target_station.id, "Station ID must not change!"
        assert updated.name == new_name, f"Expected name '{new_name}', got '{updated.name}'"
        assert updated.zone == ZoneType.COMMERCIAL, f"Expected zone COMMERCIAL, got '{updated.zone}'"
        assert updated.status == StationStatus.MAINTENANCE, f"Expected status MAINTENANCE, got '{updated.status}'"
        assert abs(updated.latitude - 9.9200) < 1e-4, f"Latitude update failed: {updated.latitude}"
        assert abs(updated.longitude - 78.1150) < 1e-4, f"Longitude update failed: {updated.longitude}"
        print(f"[OK] 2. Successful Update: Station #{updated.id} successfully updated to '{updated.name}', Status: {updated.status}")

        # 3. Verify persistence from fresh DB query
        persisted = get_station(station_id=target_station.id, db=db)
        assert persisted.name == new_name, "Data not persisted in database!"
        assert persisted.status == StationStatus.MAINTENANCE
        print(f"[OK] 3. Database Persistence Verified: Re-queried DB record confirms '{persisted.name}'")

        # 4. Verify other stations remained unchanged
        other_stations = [s for s in list_stations(db=db) if s.id != target_station.id]
        for s in other_stations:
            assert "[Updated]" not in s.name, f"Other station #{s.id} was corrupted!"
        print(f"[OK] 4. Isolation Check: All {len(other_stations)} other stations remain untouched")

        # 5. Validation Test: Duplicate station name error (expect 400)
        if len(other_stations) > 0:
            existing_other_name = other_stations[0].name
            duplicate_payload = StationUpdate(name=existing_other_name)
            try:
                update_station(station_id=target_station.id, station_in=duplicate_payload, db=db)
                assert False, "Duplicate name should have raised HTTPException 400!"
            except HTTPException as e:
                assert e.status_code == 400, f"Expected 400, got {e.status_code}"
                print(f"[OK] 5. Duplicate Name Rejection: Correctly raised HTTP 400 - '{e.detail}'")

        # 6. Validation Test: Non-existent station ID (expect 404)
        non_existent_payload = StationUpdate(name="Ghost Station")
        try:
            update_station(station_id=999999, station_in=non_existent_payload, db=db)
            assert False, "Non-existent station should have raised HTTPException 404!"
        except HTTPException as e:
            assert e.status_code == 404, f"Expected 404, got {e.status_code}"
            print(f"[OK] 6. Non-Existent Station Check: Correctly raised HTTP 404 - '{e.detail}'")

        # 7. Validation Test: Invalid Latitude (out of range > 90)
        try:
            StationUpdate(latitude=125.0)
            assert False, "Latitude > 90 should have raised ValidationError!"
        except ValidationError:
            print("[OK] 7. Invalid Latitude Check: Pydantic correctly rejected latitude=125.0 (> 90)")

        # 8. Validation Test: Invalid Longitude (out of range > 180)
        try:
            StationUpdate(longitude=200.0)
            assert False, "Longitude > 180 should have raised ValidationError!"
        except ValidationError:
            print("[OK] 8. Invalid Longitude Check: Pydantic correctly rejected longitude=200.0 (> 180)")

        # 9. Validation Test: Empty string name
        try:
            StationUpdate(name="")
            assert False, "Empty name should have raised ValidationError!"
        except ValidationError:
            print("[OK] 9. Empty Name Check: Pydantic correctly rejected empty string min_length=1")

        # 10. Restore original station values
        restore_payload = StationUpdate(
            name=original_name,
            zone=original_zone,
            status=original_status,
            latitude=original_lat,
            longitude=original_lng,
            description=original_desc
        )
        restored = update_station(station_id=target_station.id, station_in=restore_payload, db=db)
        assert restored.name == original_name
        assert restored.status == original_status
        print(f"[OK] 10. Cleanup & Restore: Station #{target_station.id} restored back to '{original_name}'")

        print("=" * 70)
        print(" ALL 10 EDIT MONITORING STATION VERIFICATION TESTS PASSED 100%!")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    test_station_edit_end_to_end()
