import SearchPresenter from "./Search.presenter";
import { useEffect, useState, useMemo } from "react";
import { usePodSearch } from "../../../queries/usePods";
import { fetchRAG } from "../../../queries/useRAG";
import { useMe } from "../../../queries/useMe";
import { useNavigate } from "react-router-dom";

export default function SearchContainer() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMe();
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState("최신순");
  const [active, setActive] = useState(1);
  const [isRAGOpened, setIsRAGOpened] = useState(false);
  const [RAGquery, setRAGquery] = useState("");
  const [RAGMessages,setRAGMessages] = useState([]);
  
  const onSendRAG = async() => {
    if(RAGquery==="")
      return;
    setRAGMessages([...RAGMessages,{llm_answer:'me',content:RAGquery}])
    const response = await fetchRAG({
            user_id:data.user_id,
            query:RAGquery
        });
    setRAGMessages([...RAGMessages,{llm_answer:'me',content:RAGquery},response]);
  };

  const handleChange = (event) => {
    setOrderBy(event.target.value);
  };
  useEffect(()=>{
    console.log(RAGMessages);
  },[RAGMessages])

  const {
    data: podsData,
    isLoading: podsLoading,
    isError: podsError,
    // refetch
  } = usePodSearch({ query, limit: 100, offset: 0 });

  const onSearch = () => {
    // refetch();
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
      isRAGOpened={isRAGOpened}
      setIsRAGOpened={setIsRAGOpened}
      RAGquery={RAGquery}
      setRAGquery={setRAGquery}
      onSendRAG={onSendRAG}
      RAGMessages={RAGMessages}
      setRAGMessages={setRAGMessages}
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
