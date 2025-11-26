import { api } from "../api/api";
export async function leavePod(user_id,pod_id) {
    const { data } = await api.delete(`/pod-members/${pod_id}/${user_id}`);
    return data;
}