import { api } from './api';

/**
 * 전체 POD 조회
 */
export async function fetchAllPods() {
    const response = await api.get(`/pod/`);
    return response.data;
}


/**
 * 사용자 POD 조회
 * @param page 페이지 번호 (기본값: 0)
 * @param size 페이지 크기 (기본값: 8)
 */
 export async function fetchUserPods(
    page = 0,
    size = 8,
    currentPeopleMin = 0,
    currentPeopleMax= 5000000,
    totalPeopleMin = 0,
    totalPeopleMax = 5000000,
    podTitle,
    status
) {
    let url = '/user/me/pod?page=' + page + '&size=' + size;
    url += `&currentPeopleMin=${currentPeopleMin}`;
    url += `&currentPeopleMax=${currentPeopleMax}`;
    url += `&totalPeopleMin=${totalPeopleMin}`;
    url += `&totalPeopleMax=${totalPeopleMax}`;
    if(podTitle !== "전체" && podTitle !== undefined)
        url += `&podTitle=${podTitle}`;
    if(status === "대기")
        url += `&status=SUSPENDED`;
    else if(status === "모집마감")
        url += `&status=INACTIVE`;
    else if(status === "모집중")
        url += `&status=ACTIVE`;
    const response = await api.get(url);
    return response.data;
}

/**
 * POD 멤버 조회
 * @param podId POD ID
 * @param page 페이지 번호 (기본값: 0)
 * @param size 페이지 크기 (기본값: 10)
 */
 export async function fetchPodMembers(podId, page = 0, size = 10) {
    const response = await api.get('/pod/member', {
        params: { podId, page, size }
    });
    return response.data;
}