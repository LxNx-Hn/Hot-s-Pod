import ConditionBar from "../../common/layout/conditions/conditionbar";

export default function PodListPresenter({ pods, loading, onOpenPodModal, onChatClick, onBackClick, filters, onFilterChange, onSearch }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    // 필터 설정
    const filterLabels = {
        podTitle: "POD 제목",
    };

    const filterOrderKeys = ["podTitle"];

    const filterOptions = {};

    const filterTypes = {
        podTitle: "text",
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F6F7F8] p-8">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">전체 POD 목록</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={onOpenPodModal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        POD 생성
                    </button>
                    <button 
                        onClick={onBackClick}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        홈으로
                    </button>
                </div>
            </div>

            {/* 필터 영역 추가 */}
            <div className="mb-6">
                <ConditionBar
                    title="POD 검색 및 필터"
                    conditions={filters}
                    setConditions={(newFilters) => {
                        Object.entries(newFilters).forEach(([key, value]) => {
                            onFilterChange(key, value);
                        });
                    }}
                    handleSearch={onSearch}
                    labels={filterLabels}
                    orderKeys={filterOrderKeys}
                    options={filterOptions}
                    types={filterTypes}
                />
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이벤트일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호스트</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pod.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pod.created_at ? new Date(pod.created_at).toLocaleDateString('ko-KR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pod.event_time ? new Date(pod.event_time).toLocaleDateString('ko-KR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {pod.host_username || `User #${pod.host_user_id}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => onChatClick(pod.pod_id)}
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
