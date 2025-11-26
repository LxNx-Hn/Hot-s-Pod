import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainUI from "./Main.presenter.jsx";
import AddPodContainer from "../../common/modals/AddPod/AddPodContainer.jsx";
import { useDispatch } from "react-redux";
import { createPod, fetchPods } from "@redux/slices/podSlice.js";
import { useMe } from "../../../queries/useMe.js";
import { usePods } from "../../../queries/usePods.js";
import { useQueryClient } from "@tanstack/react-query";


export default function Main() {
    const categories = ["전체","스터디","취미,여가","운동"];
    const [selectedCategory,setSelectedCategory] = useState(0); 
    const [isPodModalOpen, setIsPodModalOpen] = useState(false);
    const { data, isLoading, isError } = useMe();
    const [limit,setLimit] = useState(100);
    const [offset,setOffset] = useState(0);
    const { data:podsData, isLoading:isPodsLoading, isError:isPodsError } = usePods({limit,offset});
    const [orderBy, setOrderBy] = useState("최신순");
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const handleOpenPodModal = () => {
        setIsPodModalOpen(true);
    };

    const handleClosePodModal = () => {
        setIsPodModalOpen(false);
    };

    const [isGenerating, setIsGenerating] = useState(false);

    const handleSavePod = async (podData) => {
        try {
            setIsGenerating(true);
            await dispatch(createPod(podData)).unwrap();
            alert('POD이 생성되었습니다!');
            // React Query 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ["pods"] });
            handleClosePodModal();
        } catch (error) {
            alert('POD 생성에 실패했습니다: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleViewAllPods = () => {
        navigate('/pods');
    };

    const handlePodClick = (podId) => {
        navigate(`/podDetail/${podId}`);
    };

    const handleChange = (event) => {
        setOrderBy(event.target.value);
    }

    const [pods,setPods] = useState([]);
    useEffect(()=>{
        if (podsData && Array.isArray(podsData)) {
            setPods(podsData);
        }
    },[podsData]);
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
        <>
            <MainUI 
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                orderBy={orderBy}
                handleChange={handleChange}
                pods={sortedPods}
                onOpenPodModal={handleOpenPodModal}
                onPodClick={handlePodClick}
                isGenerating={isGenerating}
            />
            <AddPodContainer 
                isOpen={isPodModalOpen}
                onClose={handleClosePodModal}
                onSave={handleSavePod}
            />
        </>
    );
}