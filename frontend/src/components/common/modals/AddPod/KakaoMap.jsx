// KakaoMap.jsx
import { useEffect, useRef, useState } from "react";

export default function KakaoMap({ onSelect }) {
  const containerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // 최신 onSelect만 ref에 갱신 (리렌더될 때 effect 다시 돌지 않게)
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const initMap = (lat, lng, showMarker = true) => {
      if (!window.kakao || !containerRef.current) return;
      const { kakao } = window;

      kakao.maps.load(() => {
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(lat, lng),
          level: 3,
        });

        map.setDraggable(true);
        map.setZoomable(true);

        const geocoder = new kakao.maps.services.Geocoder();
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(lat, lng),
          map: showMarker ? map : null,
        });

        // ref에 저장하여 검색 기능에서 사용
        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        // 최초 현위치 마커 select 콜백
        if (showMarker && onSelectRef.current) {
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              const road = result[0].road_address?.address_name || "";
              const jibun = result[0].address?.address_name || "";
              const address = road || jibun;
              onSelectRef.current({ lat, lng, address });
            } else {
              onSelectRef.current({ lat, lng, address: "" });
            }
          });
        }

        kakao.maps.event.addListener(map, "click", function (mouseEvent) {
          const latlng = mouseEvent.latLng;
          marker.setPosition(latlng);
          marker.setMap(map);
          const lat = latlng.getLat();
          const lng = latlng.getLng();
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (!onSelectRef.current) return;
            if (status === kakao.maps.services.Status.OK) {
              const road = result[0].road_address?.address_name || "";
              const jibun = result[0].address?.address_name || "";
              const address = road || jibun;
              onSelectRef.current({ lat, lng, address });
            } else {
              onSelectRef.current({ lat, lng, address: "" });
            }
          });
        });
      });
    };

    const startMap = () => {
      // 현위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            initMap(lat, lng, true);
          },
          (error) => {
            alert("현위치 권한이 거부되어 서울로 표시됩니다.");
            initMap(37.5665, 126.9780, false); // 실패 시 서울, 마커 없음
          }
        );
      } else {
        alert("현위치 기능을 지원하지 않아 서울로 표시됩니다.");
        initMap(37.5665, 126.9780, false); // Geolocation 미지원 시 서울, 마커 없음
      }
    };

    // 이미 kakao가 로드돼 있으면 바로 초기화
    if (window.kakao && window.kakao.maps) {
      startMap();
    } else {
      // 아직이면 script load 기다렸다가 실행
      const script = document.querySelector(
        'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
      );
      if (!script) return;

      const onLoad = () => startMap();
      script.addEventListener("load", onLoad);

      return () => {
        script.removeEventListener("load", onLoad);
      };
    };
  }, []);

  // 검색 실행
  const handleSearch = () => {
    if (!searchKeyword.trim() || !window.kakao) return;

    const { kakao } = window;
    const places = new kakao.maps.services.Places();

    places.keywordSearch(searchKeyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(data.slice(0, 5)); // 최대 5개만
      } else {
        alert("검색 결과가 없습니다.");
        setSearchResults([]);
      }
    });
  };

  // 검색 결과 클릭 시 지도 이동 + 마커 표시
  const handleResultClick = (place) => {
    if (!mapRef.current || !markerRef.current || !geocoderRef.current) return;

    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const address = place.road_address_name || place.address_name;

    // 지도 이동
    const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(moveLatLon);

    // 마커 이동
    markerRef.current.setPosition(moveLatLon);
    markerRef.current.setMap(mapRef.current);

    // 부모로 전달
    if (onSelectRef.current) {
      onSelectRef.current({ lat, lng, address });
    }

    // 검색 결과 닫기
    setSearchResults([]);
    setSearchKeyword("");
  };

  // Enter 키로 검색
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 터치 디바이스에서만 touchAction 적용
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 검색 UI */}
      <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", zIndex: 10 }}>
        <div style={{ display: "flex", gap: "8px", backgroundColor: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소명, 주소 검색"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4368BA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            검색
          </button>
        </div>

        {/* 검색 결과 리스트 */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "8px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((place, idx) => (
              <div
                key={idx}
                onClick={() => handleResultClick(place)}
                style={{
                  padding: "12px",
                  borderBottom: idx < searchResults.length - 1 ? "1px solid #eee" : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
                  {place.place_name}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {place.road_address_name || place.address_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          ...(isTouchDevice ? { touchAction: "none" } : {}),
        }}
      />
    </div>
  );
}
