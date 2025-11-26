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
                    <div className="flex flex-col bg-white rounded-xl p-4 ">
                    {podData.content}
                    </div>
                </div>
            )
        else if(podData.total_found == 0)
        {
            return (
            <div className="flex flex-row justify-start bg-white rounded-xl p-4 w-fit max-w-48">
                <div className="flex flex-col gap-2">
                    {podData.llm_answer}
                </div>
            </div>)
        }
        else
        {
            return (
            <div className="flex flex-row justify-start bg-white rounded-xl p-4 w-fit max-w-48">
                <div className="flex flex-col gap-2">
                당신이 찾은 팟은
                {podData.retrieved_pods.map((pod)=>{
                    return (<div className="cursor-pointer bg-red-400 hover:bg-red-500 rounded-lg" onClick={()=>{navigate(`/podDetail/${pod.pod_id}`)}}>{pod.title}</div>)
                })}
                입니다!
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
            <div className={`fixed right-4 bottom-4 z-10 cursor-pointer p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors ${isRAGOpened?"hidden":""}`} onClick={()=>{setIsRAGOpened(true)}}>
                <SizeComponent Component={ChatIcon} onClick={()=>{setIsRAGOpened(false)}} className=" " fontSize={32}/>
            </div>
            <div className={`fixed right-4 bottom-4 z-10 border-2 border-gray-400 rounded-xl py-4 bg-slate-500 opacity-80 ${isRAGOpened ? '' : 'hidden'}`}>
                <div className="flex flex-col h-full justify-between gap-2 px-2">
                    <div className="flex flex-row justify-between w-full">
                        <div className="font-bold border-b-gray-200 text-2xl">RAG ChatBot</div>
                        <div className="rounded-full bg-red-500 cursor-pointer text-white font-bold px-3 flex items-center justify-center" onClick={()=>setIsRAGOpened(false)}>X</div>
                    </div>

                    <div className="flex flex-col h-80 overflow-auto gap-4">
                        {RAGMessages?.map((value, i) => (
                            <PodCard key={i} podData={value} />
                        ))}
                    </div>

                    <div className="flex flex-row w-full gap-2 items-center">
                        <input
                            type="text"
                            value={RAGquery}
                            onChange={(e) => setRAGquery(e.target.value)}
                            onKeyDown={(e)=>{if (e.key === "Enter" && !e.shiftKey) {e.preventDefault(); onSendRAG(); setRAGquery("") }}}
                            placeholder={isRAGGenerating ? "생성 중... 잠시만 기다려주세요." : "챗봇에게 무엇이든 물어보세요."}
                            disabled={isRAGGenerating}
                            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRAGGenerating ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />

                        <div className="flex flex-col justify-center">
                            <SizeComponent
                                Component={KeyboardArrowUpIcon}
                                onClick={() => { onSendRAG(); setRAGquery(""); }}
                                className={`cursor-pointer bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors ${isRAGGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                                fontSize={32}
                            />
                        </div>

                        {isRAGGenerating && (
                            <div className="flex items-center pl-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer active={active} setActive={setActive}/>
        </div>)
}
