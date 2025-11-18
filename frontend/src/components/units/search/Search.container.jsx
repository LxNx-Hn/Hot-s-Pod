import SearchPresenter from "./Search.presenter";
import { useEffect, useState, useMemo } from "react";
import { usePodSearch } from "../../../queries/usePods";

export default function SearchContainer() {
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState("최신순");
  const [active, setActive] = useState(1);

  const handleChange = (event) => {
    setOrderBy(event.target.value);
  };

  const {
    data: podsData,
    isLoading: podsLoading,
    isError: podsError,
  } = usePodSearch({ query, limit: 100, offset: 0 });

  // onSearch는 굳이 안 써도 됨 (입력 바뀔 때마다 바로 검색하고 싶으면)
  const onSearch = () => {
    // 예: 나중에 "검색 버튼 눌렀을 때만" 보내고 싶을 때 debounce 등 넣을 수도 있음
  };
  useEffect(()=>{
    console.log(query)
  },[query])
  const sortedPods = useMemo(() => {
    if (!podsData) return [];

    const arr = [...podsData];

    if (orderBy === "최신순") {
        // created_at 최신순 (내림차순)
        arr.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    } else if (orderBy === "업데이트순") {
        // updated_at 최신순 (내림차순)
        arr.sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
    } else if (orderBy === "마감임박순") {
        // event_time이 가장 가까운 순서 (마감 임박)
        arr.sort(
            (a, b) => new Date(a.event_time) - new Date(b.event_time)
        );
    }

        return arr;
    }, [podsData, orderBy]);

  return (
    <SearchPresenter
      query={query}
      setQuery={setQuery}
      onSearch={onSearch}
      orderBy={orderBy}
      handleChange={handleChange}
      pods={sortedPods}
      active={active}
      setActive={setActive}
      podsLoading={podsLoading}
      podsError={podsError}
    />
  );
}
