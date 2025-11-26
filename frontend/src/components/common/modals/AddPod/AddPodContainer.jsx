import { useState } from "react";
import AddPodPresenter from "./AddPodPresenter";
import { useMe } from "../../../../queries/useMe"; // 로그인 사용자 정보 (쿠키 기반)
import dayjs from "dayjs";

export default function AddPodContainer({ isOpen, onClose, onSave }) {
    const { data: me, isLoading: meLoading, isError: meError } = useMe();
    const [form, setForm] = useState({
        category: null,
        podTitle: "",
        podDescription: "",
        minPeople: 0,
        maxPeople: 100,
        openDate: null,
        openTime: null,
        selectedPlace: null,
        placeDetail: "",
    });

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // 숫자 필드는 정수로 변환
        const parsedValue = (name === 'minPeople' || name === 'maxPeople') ? parseInt(value, 10) || 0 : value;
        setForm({ ...form, [name]: parsedValue });
    };

    const handleCategory = (value) => {
        setForm({...form, category: value})
    }

    const handleDescriptionChange = (e) => {
        setForm({ ...form, podDescription: e.target.value });
    }

    const handleDateChange = (date) => {
        setForm({ ...form, openDate: date });
    };
    const handleTimeChange = (time) => {
        setForm({ ...form, openTime: time });
    }

    const handlePlaceChange = (data) => {
        if (data?.address) {
            setForm({ ...form, selectedPlace: { ...form.selectedPlace, address: data.address, lat: data.lat, lng: data.lng } });
        }
    }
    const handleAddressChange = (e) => {
        const address = e.target.value;
        setForm({...form, selectedPlace: { ...form.selectedPlace, address: address }});
    }
    const handlePlaceDetailChange = (e) => {
        setForm({...form, placeDetail: e.target.value});
    }

    const validateForm = () => {
        let newErrors = {};
        
        if (!form.podTitle.trim()) newErrors.podTitle = "제목을 입력하세요.";
        if (!form.podDescription.trim()) newErrors.podDescription = "설명을 입력하세요.";
        if (!form.openDate) newErrors.openDate = "모임날짜를 선택하세요.";
        if (!form.openTime) newErrors.openTime = "모임시간을 선택하세요.";
        
        // Dayjs를 사용한 간단한 시간 검증
        if (form.openDate && form.openTime) {
            const eventDateTime = dayjs(`${form.openDate.format('YYYY-MM-DD')} ${form.openTime.format('HH:mm')}`);
            if (eventDateTime.isBefore(dayjs())) {
                newErrors.openDateTime = "과거 시간은 선택할 수 없습니다.";
            }
        }
        
        // 인원 수 검증
        if (form.minPeople < 0) newErrors.minPeople = "최소 인원은 0 이상이어야 합니다.";
        if (form.maxPeople < form.minPeople) newErrors.maxPeople = "최대 인원은 최소 인원보다 커야 합니다.";
        if (form.maxPeople <= 0) newErrors.maxPeople = "최대 인원은 1명 이상이어야 합니다.";
        
        if (!form.placeDetail || !form.placeDetail.trim()) newErrors.placeDetail = "건물명/장소명을 입력하세요.";
        if (!form.category || form.category==0) newErrors.category = "카테고리를 선택하세요.";
        setErrors(newErrors);
        setHasErrors(Object.keys(newErrors).length > 0);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const timeStr = form.openTime.format('HH:mm');
        const temp = {
            host_user_id:me.user_id,
            event_time:form.openDate.toISOString().split("T")[0]+"T"+timeStr,
            place: form.selectedPlace?.address || null,
            place_detail: form.placeDetail,
            title: form.podTitle,
            content: form.podDescription,
            min_peoples: form.minPeople,
            max_peoples: form.maxPeople,
            category_ids: [form.category]
        };
        onSave(temp)
        onClose();
        setHasErrors(false);
    };

    return (
        <AddPodPresenter
            isOpen={isOpen}
            onClose={onClose}
            form={form}
            handleChange={handleChange}
            handleDescriptionChange={handleDescriptionChange}
            handleCategory={handleCategory}
            handleDateChange={handleDateChange}
            handleTimeChange={handleTimeChange}
            handlePlaceChange={handlePlaceChange}
            handleAddressChange={handleAddressChange}
            handlePlaceDetailChange={handlePlaceDetailChange}
            handleSubmit={handleSubmit}
            isDatePickerOpen={isDatePickerOpen}
            setIsDatePickerOpen={setIsDatePickerOpen}
            isTimePickerOpen={isTimePickerOpen}
            setIsTimePickerOpen={setIsTimePickerOpen}
            hasErrors={hasErrors}
            errors={errors}
        />
    );
}