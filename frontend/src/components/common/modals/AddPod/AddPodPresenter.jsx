import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Input, DatePicker, ConfigProvider, Button, TimePicker } from "antd";
import locale from "antd/locale/ko_KR";
import { useEffect, useRef, useState } from "react";
import KakaoMap from "./KakaoMap";
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TestComp from "./SelectTree"
import SizeComponent from "../../icon/SizeComponent";
const { TextArea } = Input;
export default function AddPodPresenter({
                                                 isOpen,
                                                 onClose,
                                                 form,
                                                 handleChange,
                                                 handleDescriptionChange,
                                                 handleCategory,
                                                 handleDateChange,
                                                 handleTimeChange,
                                                 handlePlaceChange,
                                                 handleAddressChange,
                                                 handleSubmit,
                                                 isDatePickerOpen,
                                                 setIsDatePickerOpen,
                                                 isTimePickerOpen,
                                                 setIsTimePickerOpen,
                                                 hasErrors,
                                                 errors
                                             }) {
    const dialogHeight = isDatePickerOpen||isTimePickerOpen ? "800px" : hasErrors ? "800px" : "700px";
    const [selectedPlace, setSelectedPlace] = useState(null); // {lat, lng, address}

    const [mapOpen, setMapOpen] = useState(false);
    const [select, setSelect] = useState();

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            slotProps={{
                paper: { style: { width: "480px", height: dialogHeight } }
            }}
        >
            <DialogTitle className="flex justify-start pl-[50px] pt-10 text-black text-[23px] font-semibold">
                새로운 Pod 생성
            </DialogTitle>

            <DialogContent className="p-6 flex flex-col justify-between h-full items-center">
                <div className="space-y-4 pt-3 w-full px-7">
                    {mapOpen && (
                        <Dialog
                        open={mapOpen}
                        onClose={() => setMapOpen(false)}
                        slotProps={{
                            paper: { style: { width: "480px", height: "600px" } },
                        }}
                        >
                        <DialogTitle className="flex justify-start pl-[50px] pt-10 text-black text-[23px] font-semibold">
                            지도에서 위치 선택
                        </DialogTitle>

                        <DialogContent className="p-6 flex flex-col justify-between h-full items-center">
                            <div className="w-full h-[400px]">
                            <KakaoMap
                                onSelect={setSelectedPlace}
                            />
                            </div>

                            <div className="mt-2 text-sm w-full">
                            {/* <div>위도: {selectedPlace?.lat}</div>
                            <div>경도: {selectedPlace?.lng}</div> */}
                            <div className="font-bold text-center">{selectedPlace?.address}</div>
                            </div>

                            <Button
                            type="primary"
                            size="large"
                            className="w-[120px] bg-[#4368BA] text-white text-[16px] font-bold rounded-lg mb-6"
                            onClick={() => {
                                if (selectedPlace?.address) {
                                    setSelectedPlace(selectedPlace);
                                    handlePlaceChange(selectedPlace);
                                }
                                setMapOpen(false);
                            }}
                            >
                            선택 완료
                            </Button>
                        </DialogContent>
                        </Dialog>
                    )}
                    {[
                        // { label: "카테고리", name: "podCategory", placeholder: "카테고리 선택", value: form.podCategory, error: errors.podCategory },
                        { label: "제목", name: "podTitle", placeholder: "Pod의 눈길을 끄는 제목을 입력하세요.", value: form.podTitle, error: errors.podTitle },
                        { label: "최소 인원", name: "minPeople", placeholder: "최소 인원 입력", value: form.minPeople, error: errors.minPeople },
                        { label: "최대 인원", name: "maxPeople", placeholder: "최대 인원 입력", value: form.maxPeople, error: errors.maxPeople },
                    ].map((field, index) => (
                        <div key={index} className="flex flex-col space-y-1">
                            <div className="flex flex-col items-center space-x-2 w-full">
                                <div className="text-black text-[16px] font-medium w-full">{field.label}</div>
                                <Input
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    status={field.error ? "error" : ""}
                                    className="h-[45px] text-[16px] flex-1"
                                />
                            </div>
                            {field.error && <p className="text-red-500 text-sm mt-1 w-full text-center">{field.error}</p>}
                        </div>
                    ))}
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-col items-center space-x-2 w-full">
                            <div className="text-black text-[16px] font-medium w-full">설명</div>
                            <TextArea placeholder="팟 설명을 작성해 주세요." allowClear onChange={handleDescriptionChange} value={form.podDescription} className={`${errors.podDescription?"border-1 border-[#EF4444]":""}`} />
                        </div>
                        {errors.podDescription && <p className="text-red-500 text-sm mt-1 w-full text-center">{errors.podDescription}</p>}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-col items-center space-x-2 w-full">
                            <div className="text-black text-[16px] font-medium w-full">카테고리</div>
                            <TestComp
                                name={"podCategory"}
                                value={form.category}
                                onChange={handleCategory}
                                placeholder={"카테고리를 입력하세요"}
                                status={errors.category ? "error" : ""}
                                className="h-[45px] text-[16px] flex-1"
                                />
                        </div>
                        {errors.category && <p className="text-red-500 text-sm mt-1 w-full text-center">{errors.category}</p>}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-col items-center space-x-2 w-full">
                            <div className="text-black text-[16px] font-medium w-full">날짜</div>
                            <div className="w-full">
                                <ConfigProvider locale={locale}>
                                    <DatePicker
                                        value={form.openDate}
                                        onChange={handleDateChange}
                                        format="YYYY-MM-DD"
                                        placeholder="날짜 선택"
                                        status={errors.openDate ? "error" : ""}
                                        className="h-[45px] w-full"
                                        getPopupContainer={(trigger) => trigger.parentElement}
                                        open={isDatePickerOpen}
                                        onOpenChange={(open) => setIsDatePickerOpen(open)}
                                        />
                                </ConfigProvider>
                            </div>
                        </div>
                        {errors.openDate && <p className="text-red-500 text-sm mt-1 w-full text-center">{errors.openDate}</p>}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-col items-center space-x-2 w-full">
                            <div className="text-black text-[16px] font-medium w-full">시간</div>
                            <div className="w-full">
                                <ConfigProvider locale={locale}>
                                    <TimePicker
                                        value={form.openTime}
                                        onChange={handleTimeChange}
                                        placeholder="시간 선택"
                                        status={errors.openTime ? "error" : ""}
                                        className="h-[45px] w-full"
                                        getPopupContainer={(trigger) => trigger.parentElement}
                                        open={isTimePickerOpen}
                                        onOpenChange={(open) => setIsTimePickerOpen(open)}
                                        />
                                </ConfigProvider>
                            </div>
                        </div>
                        {errors.openTime && <p className="text-red-500 text-sm mt-1 w-full text-center">{errors.openTime}</p>}
                    </div>
                    <div key={9} className="flex flex-col space-y-1">
                        <div className="flex flex-col items-center space-x-2 w-full">
                            <div className="text-black text-[16px] font-medium w-full">장소 선택</div>
                            <Input
                                name={"place"}
                                value={form.selectedPlace?.address}
                                onChange={handleAddressChange}
                                placeholder={"장소를 선택해주세요"}
                                status={errors.place ? "error" : ""}
                                className={`${errors.selectedPlace?"border-1 border-[#EF4444] h-[45px] text-[16px] flex-1":"h-[45px] text-[16px] flex-1"}`}
                                suffix={<SizeComponent Component={PlaceOutlinedIcon} fontSize={16} className={"text-[#BFBFBF]"} onClick={()=>{setMapOpen(true)}}/>}
                            />
                        </div>
                        {errors.selectedPlace && <p className="text-red-500 text-sm mt-1 w-full text-center">{errors.selectedPlace}</p>}
                    </div>

                </div>
                <Button
                    type="primary"
                    size="large"
                    className="w-[120px] bg-[#4368BA] text-white text-[16px] font-bold rounded-lg my-6"
                    onClick={handleSubmit}
                >
                    추가
                </Button>
            </DialogContent>
        </Dialog>
    );
}
