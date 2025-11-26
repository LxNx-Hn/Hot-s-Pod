import SizeComponent from "../../common/icon/SizeComponent";
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../common/layout/footer/index.jsx"
import { imageData } from "../../../data/categories.js";


import { toSeoulDate } from "../../../utils/time";

export default function SearchPresenter({ query, setQuery, onSearch,
    isRAGOpened,
    setIsRAGOpened,
    RAGquery,
    setRAGquery,
    onSendRAG,
    isRAGGenerating,
    RAGMessages,
    setRAGMessages, orderBy , handleChange, pods, active, setActive }) {
    const navigate = useNavigate();
    useEffect(()=>{
        console.log(RAGMessages);
    },[RAGMessages])
    const PodCard = ({podData}) => {
        if(podData.llm_answer === "me")
            return (
                <div className="flex flex-row justify-end w-full">
                    <div className="flex flex-col bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-xs shadow-md">
                        <div className="text-sm">{podData.content}</div>
                    </div>
                </div>
            )
        else if(podData.total_found == 0)
        {
            return (
            <div className="flex flex-row justify-start w-full">
                <div className="flex flex-col bg-white rounded-2xl rounded-tl-sm p-4 max-w-xs shadow-md border border-gray-200">
                    <div className="text-sm text-gray-700 break-words">
                        {podData.llm_answer}
                    </div>
                </div>
            </div>)
        }
        else
        {
            return (
            <div className="flex flex-row justify-start w-full">
                <div className="flex flex-col bg-white rounded-2xl rounded-tl-sm p-4 max-w-md shadow-lg border border-gray-200">
                    {/* LLM 답변 표시 */}
                    <div className="text-sm text-gray-700 mb-3 break-words leading-relaxed">
                        {podData.llm_answer}
                    </div>
                    
                    {/* 팟 목록 */}
                    {podData.retrieved_pods && Array.isArray(podData.retrieved_pods) && podData.retrieved_pods.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-200">
                            <div className="font-semibold text-xs text-gray-500 uppercase tracking-wide">🔍 관련 팟 ({podData.retrieved_pods.length})</div>
                            <div className="flex flex-col gap-2">
                                {podData.retrieved_pods.map((pod, idx)=>{
                                    return (
                                        <div 
                                            key={idx} 
                                            className="group cursor-pointer bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-3 transition-all duration-200 border border-orange-200 hover:border-orange-300 hover:shadow-md"
                                            onClick={(e)=>{
                                                e.stopPropagation();
                                                navigate(`/podDetail/${pod.pod_id}`);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-sm text-gray-800 group-hover:text-orange-700 transition-colors">
                                                    {pod.title}
                                                </div>
                                                <div className="text-orange-500 group-hover:text-orange-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {pod.place && (
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {pod.place}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>)
        }
    }
    return (<div className="flex flex-col w-full min-h-screen bg-[#F6F7F8] min-w-96">
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
                <div className='flex flex-row w-full justify-center'>
                    <div className='flex flex-row w-full max-w-fit justify-center bg-[#FFFFFF] p-2 rounded-lg min-w-96'>
                        <div className='flex flex-col justify-center p-2'>
                            <SearchOutlinedIcon/>
                        </div>
                        <input type='text' placeholder='관심사, 지역, 키워드로 검색해보세요.' className='min-w-80 p-2' value={query} onChange={(e)=>{setQuery(e.target.value)}}/>
                    </div>
                </div>
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
                        {pods&&pods.map((pod, idx) => (
                            <div 
                                key={idx} 
                                onClick={(e) => {console.log(pods[idx].pod_id);
                                    navigate(`/podDetail/${pods[idx].pod_id}`)
                                }}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer w-40"
                            >
                                <img className='h-24 rounded-t-lg w-full' src={imageData[pod&&pod.category_ids?pod.category_ids[0]:0]}/>
                                <div className='flex flex-col gap-1 p-3'>
                                    <div className="font-bold text-lg truncate">{pod.title}</div>
                                    <div className="text-[#888888] text-xs">{pod.content}</div>
                                    <div className='flex flex-row justify-between'>
                                        <div className="text-[#888888] text-xs">모집중 ({pod.current_member}/{pod.max_peoples})명</div>
                                        {Math.ceil((toSeoulDate(pod.event_time) - new Date()) / (1000 * 60 * 60 * 24))==0?
                                        <div className='text-[#FDC862] text-xs font-semibold'>오늘 마감</div>:
                                        <div className='text-[#FDC862] text-xs font-semibold'>D{Math.ceil((toSeoulDate(pod.event_time) - new Date()) / (1000 * 60 * 60 * 24))}</div>
                                        }
                                    </div>
                                    <div className='flex flex-row gap-1'>
                                        <SizeComponent Component={PlaceOutlinedIcon} fontSize={16}/>
                                        <div className="text-xs text-gray-400">{pod.place}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`fixed right-4 bottom-4 z-50 cursor-pointer p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl ${isRAGOpened?"hidden":""}`} onClick={()=>{setIsRAGOpened(true)}}>
                <SizeComponent Component={ChatIcon} className="" fontSize={32}/>
            </div>
            <div className={`fixed right-4 bottom-4 z-50 w-96 rounded-2xl shadow-2xl bg-white backdrop-blur-sm ${isRAGOpened ? '' : 'hidden'}`}>
                <div className="flex flex-col h-[500px]">
                    {/* 헤더 */}
                    <div className="flex flex-row justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <SizeComponent Component={ChatIcon} className="text-white" fontSize={24}/>
                            <div className="font-bold text-white text-lg">AI 챗봇</div>
                        </div>
                        <button 
                            className="rounded-full bg-white/20 hover:bg-white/30 cursor-pointer text-white font-bold w-8 h-8 flex items-center justify-center transition-colors" 
                            onClick={()=>setIsRAGOpened(false)}
                        >
                            ×
                        </button>
                    </div>

                    {/* 메시지 영역 */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                        {RAGMessages?.length === 0 && (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">👋</div>
                                    <div>무엇이든 물어보세요!</div>
                                </div>
                            </div>
                        )}
                        {RAGMessages?.map((value, i) => (
                            <PodCard key={i} podData={value} />
                        ))}
                    </div>

                    {/* 입력 영역 */}
                    <div className="flex flex-row p-3 gap-2 items-center bg-white border-t border-gray-200 rounded-b-2xl">
                        <input
                            type="text"
                            value={RAGquery}
                            onChange={(e) => setRAGquery(e.target.value)}
                            onKeyDown={(e)=>{if (e.key === "Enter" && !e.shiftKey) {e.preventDefault(); onSendRAG(); setRAGquery("") }}}
                            placeholder={isRAGGenerating ? "생성 중..." : "팟을 찾아볼까요?"}
                            disabled={isRAGGenerating}
                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm ${isRAGGenerating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        />

                        <button
                            onClick={() => { if(!isRAGGenerating) { onSendRAG(); setRAGquery(""); } }}
                            disabled={isRAGGenerating}
                            className={`p-2 rounded-full transition-all duration-200 ${isRAGGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'}`}
                        >
                            {isRAGGenerating ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <Footer active={active} setActive={setActive}/>
        </div>)
}
