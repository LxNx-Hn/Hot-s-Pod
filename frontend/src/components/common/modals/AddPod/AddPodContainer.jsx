import { useState } from "react";
import AddPodPresenter from "./AddPodPresenter";
import { useMe } from "../../../../queries/useMe"; // 로그인 사용자 정보 (쿠키 기반)

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
    });

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        setForm({ ...form, selectedPlace: data });
    }
    const handleAddressChange = (data) => {
        if(typeof data !=="SyntheticBaseEvent")
            setForm({...form, selectedPlace: {...form.selectedPlace, address:data.target.value}});
        else
            setForm({...form, selectedPlace: {...form.selectedPlace, address:data}});
    }

    const validateForm = () => {
        let newErrors = {};
        if (!form.podTitle.trim()) newErrors.podTitle = "제목을 입력하세요.";
        if (!form.podDescription.trim()) newErrors.podDescription = "설명을 입력하세요.";
        if (!form.openDate) newErrors.openDate = "모임날짜를 선택하세요.";
        if (!form.openTime) newErrors.openTime = "모임시간을 선택하세요.";
        if (!form.selectedPlace) newErrors.selectedPlace = "장소를 선택하세요.";
        if (!form.category) newErrors.category = "카테고리를 선택하세요.";
        setErrors(newErrors);
        setHasErrors(Object.keys(newErrors).length > 0);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const temp = {
            host_user_id:me.user_id,
            event_time:form.openDate.toISOString().split("T")[0]+"T"+form.openTime.toDate().toString().split(' ')[4],
            place: form.selectedPlace.address,
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