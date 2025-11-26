import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPods } from "../../redux/slices/podSlice";

export default function PodList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pods, loading } = useSelector((state) => state.pods);

    useEffect(() => {
        dispatch(fetchPods());
    }, [dispatch]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Loading...</div>
        </div>
    );

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F6F7F8] p-8">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">전체 POD 목록</h1>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    홈으로
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">개설일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마감일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최소/최대 인원</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">채팅</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pods.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    등록된 POD가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            pods.map((pod, index) => (
                                <tr key={pod.pod_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pod.pod_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pod.open_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pod.expire_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pod.min_people} / {pod.max_people}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => navigate(`/chat/${pod.pod_id}`)}
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                        >
                                            채팅
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
