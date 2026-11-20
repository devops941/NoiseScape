def test_health_check(client):
    """Test root healthcheck endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NoiseGuard" in data["service"]

