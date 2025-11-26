import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import SizeComponent from "../../common/icon/SizeComponent";
import Footer from "../../common/layout/footer/index.jsx"
import { useMe } from "../../../../src/queries/useMe.js";
import { useDispatch } from "react-redux";
import AddPodContainer from "../../common/modals/AddPod/AddPodContainer.jsx";
import { usePodMe, useUsersPod } from '../../../queries/usePodMembers.js';
import { LogOut } from '../../../api/logout.js';
import { createPod, fetchPods } from "@redux/slices/podSlice.js";
import { imageData } from "../../../data/categories.js";


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
function Card({title,description,peoples,image,onClick}){
    return (
        <div className='flex flex-row justify-between rounded-xl shadow-lg p-4 cursor-pointer' onClick={onClick}>
            <div className='flex flex-col gap-1'>
                <div className='text-lg font-bold'>{title}</div>
                <div className='text-sm'>{description}</div>
                <div className='text-sm text-[#888888]'>참여 인원: {peoples}</div>
            </div>
            <div className='flex flex-col justify-center'>
                <img className='h-24 rounded-t-lg w-36' src={image}/>
            </div>
        </div>
    )
}

export default function MyPageUI() {
    const [value, setValue] = useState(0);
    const [active, setActive] = useState(3);
    const { data, isLoading, isError } = useMe();
    const [user,setUser] = useState(data);
    const [isPodModalOpen, setIsPodModalOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: podsData, isLoading: podLoading, isError: isPodError } = usePodMe(data?.user_id);
    const { data: myPodsData, isLoading: myPodsLoading, isError: isMyPodsError } = useUsersPod(data?.user_id);

    const handleOpenPodModal = () => {
            setIsPodModalOpen(true);
        };

    const handleClosePodModal = () => {
        setIsPodModalOpen(false);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const handleSavePod = async (podData) => {
            try {
                await dispatch(createPod(podData)).unwrap();
                alert('POD이 생성되었습니다!');
                dispatch(fetchPods());
            } catch (error) {
                alert('POD 생성에 실패했습니다: ' + error.message);
            }
        };
    const logOut = async() => {
        await LogOut();
        navigate("/login");
    }
    const handleClickPod = async(pod_id) => {
        navigate(`/podDetail/${pod_id}`)
    }
    return(
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-row justify-between border-b-[#E9EBEE] border-b-[2px] p-6">
                <div></div>
                <div className='text-xl font-bold'>마이 페이지</div>
                <SizeComponent Component={SettingsIcon} className={"cursor-pointer"}/>
            </div>
            <div className='flex flex-row w-full justify-center'>
                <img src={user?.profile_picture} className='w-24 h-24 rounded-full border-purple-600 border-[3px]'/>
            </div>
            <div className='flex flex-row justify-center font-bold text-2xl'>
                {user?.username}
            </div>
            <div className='px-4'>
                <div className='w-full rounded-full bg-purple-600 py-2 text-center text-[#FFFFFF] font-semibold cursor-pointer'>
                    프로필 수정
                </div>
            </div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} 
                    aria-label="basic tabs example"
                    variant="fullWidth"
                    textColor="secondary"
                    indicatorColor="secondary">
                    <Tab label="My Pods" style={{'text-transform': 'none'}}/>
                    <Tab label="Joined Pods" style={{'text-transform': 'none'}}/>
                </Tabs>
            </Box>
            
            <CustomTabPanel value={value} index={0}>
                {myPodsData?myPodsData.map((value)=>{
                        return (<Card
                        key={value.pod_id}
                        title={value.title}
                        description={value.content}
                        peoples={`${value.current_member}/${value.max_peoples}`}
                        image={imageData[value?.category_ids?.[0] ?? 0]}
                        onClick={()=>{handleClickPod(value.pod_id);}}
                    />)
                    }):<div className='py-4 border-b-[2px] border-b-[#EEEEEE]'>
                        <div className='flex flex-col bg-[#F9FAFB] py-4 rounded-xl cursor-pointer'>
                            <div className='flex flex-row justify-center'>
                                <SizeComponent Component={AddCircleOutlineIcon} className={"text-[#9CA3AF]"} fontSize={48}/>                        
                            </div>
                            <div className='flex flex-col gap-5 text-[#888888]' onClick={handleOpenPodModal}>
                                <div className='text-center'>아직 참여한 Pod이 없어요.</div>
                                <div className='text-center'>새로운 Pod을 만들어 모임을 시작해보세요!</div>
                                <div className='flex flex-row w-full justify-center'>
                                    <div className='text-black font-bold bg-[#FFC107] text-center py-2 px-8 rounded-full'>새로운 Pod 만들기</div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {podsData?<div className='flex flex-row w-full justify-center py-2 mt-4'>
                                    <div className='text-black font-bold bg-[#FFC107] text-center py-2 px-8 rounded-full cursor-pointer' onClick={handleOpenPodModal}>새로운 Pod 만들기</div>
                                </div>:<></>}
                <div className='flex flex-col gap-4 p-4'>
                    {/* <div className='flex flex-row justify-between'>
                        <div className='text-xl font-semibold'>
                            계정 설정
                        </div>
                        <KeyboardArrowRightIcon/>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <div className='text-xl font-semibold'>
                            알림 설정
                        </div>
                        <KeyboardArrowRightIcon/>
                    </div> */}
                    <div className='flex flex-row justify-between text-[#EF3737] cursor-pointer' onClick={logOut}>
                        <div className='text-xl font-semibold'>
                            로그아웃
                        </div>
                        <LogoutIcon/>
                    </div>
                        
                </div>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <div className='flex flex-col gap-2'>
                    {podsData?podsData.map((value)=>{
                        return (<Card
                        key={value.pod_id}
                        title={value.title}
                        description={value.content}
                        peoples={`${value.current_member}/${value.max_peoples}`}
                        image={imageData[value?.category_ids?.[0] ?? 0]}
                        onClick={()=>{handleClickPod(value.pod_id);}}
                    />)
                    }):<div className='py-4 border-b-[2px] border-b-[#EEEEEE]'>
                        <div className='flex flex-col bg-[#F9FAFB] py-4 rounded-xl cursor-pointer'>
                            <div className='flex flex-row justify-center'>
                                <SizeComponent Component={AddCircleOutlineIcon} className={"text-[#9CA3AF]"} fontSize={48}/>                        
                            </div>
                            <div className='flex flex-col gap-5 text-[#888888]' onClick={handleOpenPodModal}>
                                <div className='text-center'>아직 생성한 Pod이 없어요.</div>
                                <div className='text-center'>새로운 Pod을 만들어 모임을 시작해보세요!</div>
                                <div className='flex flex-row w-full justify-center'>
                                    <div className='text-black font-bold bg-[#FFC107] text-center py-2 px-8 rounded-full'>새로운 Pod 만들기</div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {podsData?<div className='flex flex-row w-full justify-center py-2 mt-4'>
                                    <div className='text-black font-bold bg-[#FFC107] text-center py-2 px-8 rounded-full cursor-pointer' onClick={handleOpenPodModal}>새로운 Pod 만들기</div>
                                </div>:<></>}
                    
                    <div className='flex flex-col gap-4 p-4'>
                        {/* <div className='flex flex-row justify-between'>
                            <div className='text-xl font-semibold'>
                                계정 설정
                            </div>
                            <KeyboardArrowRightIcon/>
                        </div>
                        <div className='flex flex-row justify-between'>
                            <div className='text-xl font-semibold'>
                                알림 설정
                            </div>
                            <KeyboardArrowRightIcon/>
                        </div> */}
                        <div className='flex flex-row justify-between text-[#EF3737] cursor-pointer' onClick={logOut}>
                            <div className='text-xl font-semibold'>
                                로그아웃
                            </div>
                            <LogoutIcon/>
                        </div>
                        
                    </div>
                </div>
            </CustomTabPanel>
            <AddPodContainer 
                isOpen={isPodModalOpen}
                onClose={handleClosePodModal}
                onSave={handleSavePod}
            />
            <Footer active={active} setActive={setActive}/>
        </div>
    )
}