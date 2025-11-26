import SearchPresenter from "./Search.presenter";
import { useEffect, useState, useMemo } from "react";
import { usePodSearch, usePods } from "../../../queries/usePods";
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
  const [isRAGGenerating, setIsRAGGenerating] = useState(false);
  
  const onSendRAG = async() => {
    if(RAGquery==="")
      return;
    // Use functional updates to avoid stale-state and duplicate entries
    setRAGMessages((prev) => [...prev, { llm_answer: 'me', content: RAGquery }]);
    try{
      setIsRAGGenerating(true);
      const response = await fetchRAG({
        user_id: data?.user_id,
        query: RAGquery,
      });
      setRAGMessages((prev) => [...prev, response]);
    }catch(e){
      console.error('RAG error', e);
      setRAGMessages((prev) => [...prev, { llm_answer: 'error', content: 'RAG 요청 중 오류가 발생했습니다.' }]);
    }finally{
      setIsRAGGenerating(false);
    }
  };

  const handleChange = (event) => {
    setOrderBy(event.target.value);
  };
  useEffect(()=>{
    console.log(RAGMessages);
  },[RAGMessages])


  // 검색어가 없을 때 전체 팟 목록을 가져옴
  const {
    data: allPodsData,
    isLoading: allPodsLoading,
    isError: allPodsError,
  } = usePods({ limit: 100, offset: 0 });

  // 검색어가 있을 때만 검색 API 사용
  const {
    data: podsData,
    isLoading: podsLoading,
    isError: podsError,
  } = usePodSearch({ query, limit: 100, offset: 0 });

  const onSearch = () => {
    // refetch();
  };
  useEffect(()=>{
    console.log(query)
  },[query])
  // 검색어가 있으면 검색 결과, 없으면 전체 목록
  const sortedPods = useMemo(() => {
    const podsList = query.trim().length > 0 ? podsData : allPodsData;
    if (!podsList) return [];
    const arr = [...podsList];
    if (orderBy === "최신순") {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (orderBy === "업데이트순") {
      arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (orderBy === "마감임박순") {
      arr.sort((a, b) => new Date(a.event_time) - new Date(b.event_time));
    }
    return arr;
  }, [query, podsData, allPodsData, orderBy]);

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
      isRAGGenerating={isRAGGenerating}
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
