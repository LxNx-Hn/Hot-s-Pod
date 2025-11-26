import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPods, createPod } from "@redux/slices/podSlice";
import PodListPresenter from "./PodList.presenter";
import AddPodContainer from "../../common/modals/AddPod/AddPodContainer";

export default function PodListContainer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pods, loading } = useSelector((state) => state.pods);
    const [isPodModalOpen, setIsPodModalOpen] = useState(false);
    
    // 필터 상태
    const [filters, setFilters] = useState({
        podTitle: "",
    });

    useEffect(() => {
        dispatch(fetchPods());
    }, [dispatch]);

    const handleOpenPodModal = () => {
        setIsPodModalOpen(true);
    };

    const handleClosePodModal = () => {
        setIsPodModalOpen(false);
    };

    const handleSavePod = async (podData) => {
        try {
            await dispatch(createPod(podData)).unwrap();
            alert('POD가 생성되었습니다!');
            dispatch(fetchPods());
        } catch (error) {
            alert('POD 생성에 실패했습니다: ' + error.message);
        }
    };

    const handleChatClick = (podId) => {
        navigate(`/chat/${podId}`);
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        // 필터 적용하여 재조회
        dispatch(fetchPods());
    };

    // 필터링된 POD 목록
    const filteredPods = pods.filter(pod => {
        const titleMatch = !filters.podTitle || pod.title?.includes(filters.podTitle);
        return titleMatch;
    });

    return (
        <>
            <PodListPresenter
                pods={filteredPods}
                loading={loading}
                onOpenPodModal={handleOpenPodModal}
                onChatClick={handleChatClick}
                onBackClick={handleBackClick}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />
            <AddPodContainer 
                isOpen={isPodModalOpen}
                onClose={handleClosePodModal}
                onSave={handleSavePod}
            />
        </>
    );
}
