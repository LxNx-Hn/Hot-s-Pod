import SizeComponent from "../../common/icon/SizeComponent";
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import Footer from "../../common/layout/footer/index.jsx"
import { imageData } from "../../../data/categories.js";
import { toSeoulDate } from "../../../utils/time.js";
export default function MainUI({categories, selectedCategory, setSelectedCategory, orderBy, handleChange, pods, onOpenPodModal, onPodClick, isGenerating = false}) {
    const navigate = useNavigate();
    const [active, setActive] = useState(0);
    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F6F7F8] min-w-96">
            <div className="fixed bottom-28 right-10 w-10 h-10 rounded-full bg-[#FF7A5A] cursor-pointer" onClick={()=>{onOpenPodModal()}}>
                <div className='h-full w-full flex flex-col justify-center'>
                    <div className='w-full flex flex-row justify-center text-[#FFFFFF] font-bold text-xl pb-1'>
                        +
                    </div>
                </div>
            </div>
            {/* 헤더 */}
            <div className="flex flex-row justify-between p-4 bg-white shadow-sm">
                <div className="flex flex-row gap-4 justify-center cursor-pointer" onClick={()=>{navigate("/");}}>
                    <SizeComponent Component={LocalFireDepartmentOutlinedIcon} className="text-[#FF7C1C] text-[3red]" fontSize={"3rem"} />
                    <span className="font-bold text-xl flex flex-col justify-center">Hotspod</span>
                </div>
                <div className="flex flex-col justify-center px-2">
                    <div className='flex flex-row gap-4'>
                        <SizeComponent Component={NotificationsNoneIcon} fontSize={"2rem"}/>
                        <SizeComponent Component={PermIdentityOutlinedIcon} fontSize={"2rem"} className={"cursor-pointer"} onClick={()=>{navigate("/myPage");}}/>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="flex flex-col p-8 gap-8">
                
                <div className='flex flex-row w-full justify-center text-2xl font-bold min-w-80'>함께할 즐거움을 찾아보세요!</div>
                <div className="flex flex-row justify-end w-full">
                    <div className='w-32'>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 100 }}>
                            <InputLabel id="demo-simple-select-label"></InputLabel>
                            <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={orderBy}
                                    label="orderBy"
                                    onChange={handleChange}
                                    disableUnderline
                                    align="center"
                                >
                                <MenuItem value={"최신순"}>최신순</MenuItem>
                                <MenuItem value={"업데이트순"}>업데이트순</MenuItem>
                                <MenuItem value={"마감임박순"}>마감임박순</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
                {/* POD 목록 */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-4">
                        {pods&&pods.map((pod) => {
                            const daysLeft = Math.ceil((toSeoulDate(pod.event_time) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                            <div 
                                key={pod.pod_id} 
                                onClick={() => onPodClick && onPodClick(pod.pod_id)}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer w-40"
                            >
                                <img className='h-24 rounded-t-lg w-full' src={imageData[pod?.category_ids?.[0] ?? 0]}/>
                                <div className='flex flex-col gap-1 p-3'>
                                    <div className="font-bold text-lg truncate">{pod.title}</div>
                                    <div className="text-[#888888] text-xs">{pod.content}</div>
                                    <div className='flex flex-row justify-between'>
                                        <div className="text-[#888888] text-xs">모집중 ({pod.current_member}/{pod.max_peoples})명</div>
                                        {daysLeft === 0 ? (
                                            <div className='text-[#FDC862] text-xs font-semibold'>오늘 마감</div>
                                        ) : daysLeft < 0 ? (
                                            <div className='text-gray-500 text-xs font-semibold'>마감됨</div>
                                        ) : (
                                            <div className='text-[#FDC862] text-xs font-semibold'>D-{daysLeft}</div>
                                        )}
                                    </div>
                                    <div className='flex flex-row gap-1'>
                                        <SizeComponent Component={PlaceOutlinedIcon} fontSize={16}/>
                                        <div className="text-xs text-gray-400">{pod.place_detail}{pod.place && ` (${pod.place})`}</div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
            <Footer active={active} setActive={setActive}/>
        </div>
    );
    
    
}