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
import { useQueryClient } from "@tanstack/react-query";


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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [profilePictureEnabled, setProfilePictureEnabled] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { data: podsData, isLoading: podLoading, isError: isPodError } = usePodMe(data?.user_id);
    const { data: myPodsData, isLoading: myPodsLoading, isError: isMyPodsError } = useUsersPod(data?.user_id);

    const handleOpenPodModal = () => {
            setIsPodModalOpen(true);
        };

    const handleClosePodModal = () => {
        setIsPodModalOpen(false);
    };

    const handleOpenEditModal = () => {
        setEditUsername(data?.username || "");
        setEditPhoneNumber(data?.phonenumber || "");
        setProfilePictureEnabled(data?.profile_picture_enabled ?? true);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editUsername,
                    phonenumber: editPhoneNumber,
                    profile_picture_enabled: profilePictureEnabled
                })
            });
            
            if (response.ok) {
                alert('프로필이 수정되었습니다.');
                window.location.reload();
            } else {
                throw new Error('프로필 수정에 실패했습니다.');
            }
        } catch (error) {
            alert('프로필 수정 중 오류가 발생했습니다: ' + error.message);
        }
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const handleSavePod = async (podData) => {
            try {
                await dispatch(createPod(podData)).unwrap();
                alert('POD이 생성되었습니다!');
                // React Query 캐시 무효화
                queryClient.invalidateQueries({ queryKey: ["pods"] });
                queryClient.invalidateQueries({ queryKey: ["podMember"] });
                setIsPodModalOpen(false);
            } catch (error) {
                alert('POD 생성에 실패했습니다: ' + error.message);
            }
        };
    const logOut = async() => {
        try {
            await LogOut();
            localStorage.removeItem('access_token');
            navigate("/login");
        } catch (error) {
            console.error('로그아웃 실패:', error);
            localStorage.removeItem('access_token');
            navigate("/login");
        }
    }
    
    const handleDeleteAccount = async() => {
        if (!confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            if (response.ok) {
                await LogOut();
                localStorage.removeItem('access_token');
                alert('회원 탈퇴가 완료되었습니다.');
                navigate("/login");
            } else {
                throw new Error('탈퇴 실패');
            }
        } catch (error) {
            console.error('회원 탈퇴 실패:', error);
            alert('회원 탈퇴에 실패했습니다.');
        }
    }
    
    const handleClickPod = async(pod_id) => {
        navigate(`/podDetail/${pod_id}`)
    }
    return(
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-row justify-center border-b-[#E9EBEE] border-b-[2px] p-6">
                <div className='text-xl font-bold'>마이 페이지</div>
            </div>
            <div className='flex flex-row w-full justify-center'>
                <img 
                    src={user?.profile_picture_enabled ? user?.profile_picture : 'https://via.placeholder.com/96'} 
                    className='w-24 h-24 rounded-full border-purple-600 border-[3px]'
                />
            </div>
            <div className='flex flex-row justify-center font-bold text-2xl'>
                {user?.username}
            </div>
            <div className='flex flex-row justify-center'>
                <button 
                    onClick={handleOpenEditModal}
                    className='px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors'
                >
                    프로필 수정
                </button>
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
                    <div className='flex flex-row justify-between text-[#666666] cursor-pointer mt-2' onClick={handleDeleteAccount}>
                        <div className='text-sm'>
                            회원 탈퇴
                        </div>
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
                        <div className='flex flex-row justify-between text-[#666666] cursor-pointer mt-2' onClick={handleDeleteAccount}>
                            <div className='text-sm'>
                                회원 탈퇴
                            </div>
                        </div>
                        
                    </div>
                </div>
            </CustomTabPanel>
            <AddPodContainer 
                isOpen={isPodModalOpen}
                onClose={handleClosePodModal}
                onSave={handleSavePod}
            />
            
            {/* 프로필 수정 모달 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">프로필 수정</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">닉네임</label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">전화번호</label>
                                <input
                                    type="text"
                                    value={editPhoneNumber}
                                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="010-1234-5678"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium">프로필 사진 표시</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profilePictureEnabled}
                                        onChange={(e) => setProfilePictureEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex flex-row gap-2 justify-end mt-4">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Footer active={active} setActive={setActive}/>
        </div>
    )
}