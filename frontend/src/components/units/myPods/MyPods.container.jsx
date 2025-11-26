import MyPodsPresenter from "./MyPods.presenter";
import { usePodMe } from "../../../queries/usePodMembers";
import { useMe } from "../../../queries/useMe";
import { useEffect, useState } from "react";
export default function MyPodsContainer(){

    const { data:userData, isLoading:isUserLoading, isError:isUserError } = useMe();
    const { data:podsData, isLoading:isPodsLoading, isError:isPodsError } = usePodMe(userData?userData.user_id:null);
    const [query,setQuery] = useState("");
    const [orderBy,setOrderBy] = useState("최신순");
    const handleOrderBy = (e) => {setOrderBy(e.target.value);}
    const onPodClick = () => {};
    useEffect(()=>{console.log(podsData);},[podsData]);

    return (<MyPodsPresenter query={query} setQuery={setQuery} orderBy={orderBy} setOrderBy={handleOrderBy} onPodClick={onPodClick} pods={podsData?podsData:[]}/>)
}