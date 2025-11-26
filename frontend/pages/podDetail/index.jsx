// frontend/src/pages/chat/index.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatMessages, sendChatMessage } from "@redux/slices/chatSlice";
import { useMe } from "../../src/queries/useMe"; // 로그인 사용자 정보 (쿠키 기반)
import { useMessage } from "../../src/queries/useMessage";
import { usePodDetail } from "../../src/queries/usePods";
import { joinPod } from "../../src/queries/usePodJoin";
import { leavePod } from "../../src/queries/usePodLeave";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SizeComponent from "../../src/components/common/icon/SizeComponent";
import { createComment } from "@redux/slices/commentSlice.js";

const getIndentClass = (level) => {
  if (level === 0) return "";
  if (level === 1) return "pl-4";
  if (level === 2) return "pl-8";
  return "pl-12"; // 3단계 이상은 고정
};
import { toSeoulDate, formatSeoul } from "../../src/utils/time";

const time_delta_string = (string_time) => {
  const createdAt = toSeoulDate(string_time);
  const now = new Date();

    const timeDelta = (now.getTime() - createdAt.getTime())/1000;

    const year_second = 3600*24*30*365;
    const month_second = 3600*24*30;
    const day_second = 3600*24;
    const hour_second = 3600;
    const minute_second = 60;
    if(timeDelta > year_second)
      return `${Math.floor(timeDelta/year_second)}년 전`;
    if(timeDelta > month_second)
      return `${Math.floor(timeDelta/month_second)}개월 전`;
    if(timeDelta > day_second)
      return `${Math.floor(timeDelta/day_second)}일 전`;
    if(timeDelta > hour_second)
      return `${Math.floor(timeDelta/hour_second)}시간 전`;
    if(timeDelta > minute_second)
      return `${Math.floor(timeDelta/minute_second)}분 전`;
    else
      return `${Math.floor(timeDelta)}초 전`; 
  }
const CommentItem = ({ comment, setSelectedCommentId, level = 0, selectedId = null }) => {
  const indentClass = getIndentClass(level);

  return (
    <div
      className={`flex flex-col gap-2 w-full ${indentClass}`}
    >
      
      <div className={`flex flex-col p-2 bg-white rounded-md w-full gap-2 border-2 ${selectedId==comment.comment_id?"border-blue-500":"border-transparent"}`} onClick={()=>{setSelectedCommentId(comment.comment_id)}}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            <img
              src={comment.profile_picture}
              className="w-8 h-8 rounded-full"
            />
            <div className="font-bold flex flex-col justify-center">{comment.username}</div>
          </div>
          <div className="text-xs text-[#888888]">
            {time_delta_string(comment.created_at)}
          </div>
        </div>
        <p className="w-full">{comment.content}</p>
      </div>
      {/* 자식 댓글들 */}
      {comment.children?.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.comment_id}
              comment={child}
              setSelectedCommentId={setSelectedCommentId}
              level={level + 1}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default function ChatPage() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 로그인 사용자
  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const [ podIdState, setPodIdState] = useState(podId?podId:null)
  const { data: podDetail, isLoading: podDetailLoading, isError: podDetailError, refetch: refetchPodDetail} = usePodDetail(podIdState);
  const { data: messages, isLoading: messageLoading, isError: isMessageError, refetch: refetchMessages } = useMessage(podIdState);

  const [commentText, setCommentText] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [isMyPod, setIsMyPod] = useState(false);
  const [isChatOpened, setIsChatOpened] = useState(false);
  const handleSelectedCommentId = (comment_id) => {
    if(selectedCommentId==comment_id)
      setSelectedCommentId(null);
    else
      setSelectedCommentId(comment_id);
  }
  // 로컬 상태
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [wsMessages, setWsMessages] = useState([]);
  const [allMessages, setAllMessages] = useState(messages)
  const [isSendingComment, setIsSendingComment] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // 스크롤 최하단
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const isInMe = () => {
    if(!podDetail)
      return false;
    for(let i = 0 ; i < podDetail.members.length ; i++)
    {
      if(podDetail.members[i].user_id == me.user_id)
        return true;
    }
    return false;
  }
  useEffect(() => {
    scrollToBottom();
    console.log(messages);
    console.log(wsMessages);
  }, [messages, wsMessages]);
  useEffect(()=>{
    setIsMyPod(isInMe());
  },[podDetail,podDetail?.members,me])

  // WebSocket URL (http→ws, https→wss)
  const wsUrl = useMemo(() => {
    if (!podId) return null;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    // 백엔드 호스트가 프론트와 다른 경우 직접 지정 가능:
    // const host = "localhost:8000";
    const host = window.location.hostname + (window.location.port ? `:${window.location.port}` : "");
    // 만약 백엔드가 8000 포트라면 아래 한 줄로 호스트를 고정하세요:
    // const host = "localhost:8000";
    return `${proto}://${host.replace(/:\d+$/, "")}:8000/ws/chat/${podId}`;
  }, [podId]);
  const buildCommentTree = (comments) => {
    const map = new Map();
    comments.forEach(c => {
      map.set(c.comment_id, { ...c, children: [] });
    });

    const roots = [];

    map.forEach(node => {
      if (node.parent_comment_id == null) {
        roots.push(node);
      } else {
        const parent = map.get(node.parent_comment_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // 부모 못 찾으면 그냥 루트 취급
          roots.push(node);
        }
      }
    });

    return roots;
  }
  const [current_comments, setCurrentComments] = useState([]);

  // podDetail 이 바뀔 때마다 한 번 동기화
  useEffect(() => {
    setCurrentComments(podDetail?.comments ?? []);
  }, [podDetail?.comments]);

  const commentTree = useMemo(
    () => buildCommentTree(current_comments),
    [current_comments]
  );

  // 초기 로드 + WS 연결
  useEffect(() => {
    if (!podId) return;

    // 1) REST로 기존 메시지 로드 (Axios withCredentials로 쿠키 자동전송 가정)
    dispatch(fetchChatMessages(podId));

    // 2) WebSocket 연결
    if (!wsUrl) return;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected:", wsUrl);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 백엔드 형식에 맞춰 정규화
        const normalized = {
          ...data,
          content: data.content ?? data.message,
          time: data.time ?? data.timestamp ?? Date.now(),
        };
        setWsMessages((prev) => [...prev, normalized]);
      } catch (e) {
        console.error("WS message parse error:", e);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      try {
        ws.current?.close();
      } catch {}
    };
  }, [podId, dispatch, wsUrl]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSendingMessage(true);
    try {
      // 1) WebSocket 우선
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type:"user",
            pod_id: parseInt(podId, 10),
            content: messageText,
            user_id: me?.user_id ?? 0, // 로그인 유저 ID
          })
        );
      } else {
        // 2) WS가 닫혀 있으면 REST fallback
        await dispatch(
          sendChatMessage({
            type: "user",
            pod_id: parseInt(podId, 10),
            user_id: me?.user_id ?? 0,
            content: messageText,
          })
        ).unwrap();
      }
      setMessageText("");
      refetchMessages();
    } catch (error) {
      alert("메시지 전송 실패: " + (error?.message || "unknown error"));
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Enter 전송
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const addLocalComment = (content, parentCommentId = null) => {
    const now = new Date().toISOString();

    const newComment = {
      comment_id: Date.now(),        // 임시 ID (백엔드에서 받은 걸 쓰는 게 베스트)
      user_id: me.id,                // 로그인 유저 정보
      username: me.username,
      profile_picture: me.profile_picture,
      content,
      created_at: new Date().toISOString(),
      parent_comment_id: parentCommentId,
    };

    setCurrentComments((prev) => [...prev, newComment]);
  };
  // 댓글 작성
  const handleSendComment = async () => {
    try {
        if (!me || !me.user_id) {
          alert('로그인이 필요합니다.');
          return;
        }

        // parent_comment_id가 현재 로컬 comment 목록에 존재하는지 확인
        const parentId = current_comments.some(c => c.comment_id === selectedCommentId)
          ? selectedCommentId
          : null;

        setIsSendingComment(true);
        await dispatch(createComment({
          pod_id: parseInt(podId, 10),
          user_id: me.user_id,
          content: commentText,
          parent_comment_id: parentId,
        })).unwrap();

        // 서버 상태를 신뢰하기 위해 상세를 다시 조회합니다 (중복 로컬 삽입 방지)
        await refetchPodDetail();
        setCommentText("");
        setIsSendingComment(false);
    } catch (error) {
        setIsSendingComment(false);
        alert('댓글 생성에 실패했습니다: ' + error.message);
    }
    
  };

  // Enter 댓글 작성
  const handleKeyDownComment = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const zeroPadding = (number) => {
    if(number<10)
      return `0${number}`
    return `${number}`
  }
  const date_toString = (date) => {
    const newDate = toSeoulDate(date);
    const weekDays = ["일","월","화","수","목","금","토"];
    //요일 .getDay -> 0~6 > 일 ~ 토
    var result = formatSeoul(newDate, { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return result;
  }
  const joinPodFunc = async() => {
    try{
      if(me)
      {
        await joinPod({"user_id":me.user_id,"pod_id":podId,"amount":1,"place_start":"","place_end":""});
        refetchPodDetail();
      }
    }
    catch(e)
    {
      alert("팟 참여에 실패했습니다.")
    }
  }
  const leavePodFunc = async() => {
    try{
      if(me) {
        await leavePod(me.user_id,podId);
        refetchPodDetail();
      }
    }
    catch(e)
    {
      alert("팟 나가기 실패")
    }
  }
  

  // 로그인 체크 (라우트 가드가 이미 있다면 생략 가능)
  if (meLoading || messageLoading || podDetailLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  if (meError) {
    // 인증 실패 시 로그인 페이지로
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 p-3">
      {/* 헤더 */}
      <div className="flex flex-row justify-between items-center p-4 shadow-sm">
          <SizeComponent Component={ArrowBackIcon} onClick={() => navigate(-1)} className={"cursor-pointer"}/>
        <div className="flex flex-row gap-3">
          <div className="text-xl font-bold">POD 상세 정보</div>
          <div className="flex flex-col justify-center text-[#000000]">#{podId}</div>
        </div>
        <div></div>
      </div>
      <div className="flex flex-col gap-8 py-8">
        <div className="text-3xl font-black">{podDetail.title}</div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <SizeComponent Component={PlaceOutlinedIcon} fontSize={48} className={"bg-[#C9E6F5] text-[#00A2EC] p-1 rounded-lg"}/>
            <div className="flex flex-col justify-center font-semibold">{podDetail.place_detail}{podDetail.place && ` (${podDetail.place})`}</div>
          </div>
          <div className="flex flex-row gap-2">
            <SizeComponent Component={AccessTimeOutlinedIcon} fontSize={48} className={"bg-[#C9E6F5] text-[#00A2EC] p-1 rounded-lg"}/>
            <div className="flex flex-col justify-center font-semibold">{date_toString(podDetail.event_time)}</div>
          </div>
          <div className="flex flex-row gap-2">
            <SizeComponent Component={PeopleAltOutlinedIcon} fontSize={48} className={"bg-[#C9E6F5] text-[#00A2EC] p-1 rounded-lg"}/>
            <div className="flex flex-col justify-center font-semibold">{podDetail.current_member}/{podDetail.max_peoples}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col bg-white p-3 rounded-xl gap-2">
            <div className="font-bold text-xl">설명</div>
            <p>{podDetail.content}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-xl">참여자({podDetail.current_member})</div>
            <div className="flex flex-row ml-3">
              {podDetail.members.length==0?<></>:podDetail.members.map((value,index)=>{
                return (<img key={value.user_id} className={`w-8 h-8 rounded-full border-2 border-white relative -ml-3 z-[${podDetail.members.length-index}0]`} src={value.profile_picture} />)
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full pb-8">
            <div className="font-bold text-xl">댓글</div>
            <div className="flex flex-col w-full gap-2">
              
                {commentTree.length === 0 ? (
                  <div className="w-full text-center">댓글이 없습니다.</div>
                ) : (
                  commentTree.map((comment) => (
                    <CommentItem key={comment.comment_id} comment={comment} setSelectedCommentId={handleSelectedCommentId} selectedId={selectedCommentId} />
                  ))
                )}
              
            </div>
          </div>
        </div>
      </div>
      {/* 채팅 메시지 영역 (참여자만 접근 가능) */}
      <div className={`fixed left-0 top-0 bg-black bg-opacity-50 w-full h-full ${(isChatOpened && isMyPod)?"":"hidden"}`}>
        
        <div className="flex flex-col justify-between h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[...(messages?messages:[]), ...(wsMessages?wsMessages:[])].length === 0 ? (
              <div className="text-center text-gray-500 mt-10">첫 메시지를 보내보세요!</div>
            ) : (
              [...(messages?messages:[]), ...(wsMessages?wsMessages:[])].map((msg, idx) => (
                <div key={idx} className="flex flex-col">
                  {msg.type=="system"?<div className={`flex flex-row w-full`}>
                    <div className="w-full text-center flex flex-row justify-center">
                      <div className="flex flex-col">
                        <div className="bg-white rounded-lg px-4 py-1 shadow-sm text-xs text-gray-500 mb-1">
                          {msg.time
                              ? formatSeoul(msg.time)
                              : (msg.timestamp ? formatSeoul(msg.timestamp) : "방금")}
                        </div>
                        <div className="flex flex-row w-ful justify-center">
                          <div className="bg-white rounded-lg px-2 py-1 shadow-sm w-fit text-sm whitespace-pre-wrap break-words">
                            {msg.content ?? msg.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>:<div className={`flex flex-row w-full justify-${msg.user_id==me.user_id?'end':'start'}`}>
                    <div className="bg-white rounded-lg p-3 shadow-sm max-w-md">
                      <div className="text-xs text-gray-500 mb-1">
                        {msg.username ?? "-"} · {" "}
                        {msg.time ? formatSeoul(msg.time) : (msg.timestamp ? formatSeoul(msg.timestamp) : "방금")}
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {msg.content ?? msg.message}
                      </div>
                    </div>
                  </div>}
                  
                </div>
              ))
            )}
            {/* <div ref={messagesEndRef} /> */}
          </div>
          <div className="p-4 shadow-lg">
            <div className="flex flex-row gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onSubmit={(e) => {
                  console.log("전송 ",e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={isSendingMessage?"전송 중...":"메시지를 입력하세요..."}
                disabled={isSendingMessage}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isSendingMessage? 'bg-gray-100 cursor-not-allowed': ''}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSendingMessage}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm ${isSendingMessage? 'opacity-60 cursor-not-allowed': ''}`}
              >
                전송
              </button>
              <button className="p-2 px-4 bg-red-500 text-white rounded-lg transition-colors text-sm" onClick={()=>{setIsChatOpened(false)}}>X</button>
            </div>
          </div>

        </div>
      </div>
      
      {/* 입력 영역 */}
      <div className="w-full">
        <div className="flex flex-row gap-2 w-full">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onSubmit={(e) => {console.log("전송 ",e.target.value);}}
            onKeyDown={handleKeyDownComment}
                placeholder={isSendingComment?"댓글 전송 중...":"댓글을 입력하세요..."}
                disabled={isSendingComment}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSendingComment? 'bg-gray-100 cursor-not-allowed': ''}`}
          />
          <div className="flex flex-col justify-center">
            <SizeComponent Component={KeyboardArrowUpIcon} onClick={handleSendComment} className={` bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors ${isSendingComment? 'opacity-60 cursor-not-allowed': ''}`} fontSize={32}/>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col justify-center py-4">
        <div className="flex flex-row w-full gap-2">
          {isMyPod?<div
              className="flex flex-row w-3/4 justify-center bg-red-500 font-bold text-white py-2 rounded-xl cursor-pointer"
              onClick={leavePodFunc}
          >
            나가기
          </div>:<div
              className="flex flex-row w-3/4 justify-center bg-blue-500 font-bold text-white py-2 rounded-xl cursor-pointer"
              onClick={joinPodFunc}
          >
            참여하기
          </div>}
          {isMyPod && (
            <div className="w-1/4 flex flex-col justify-center bg-blue-500 font-bold text-white py-2 rounded-xl cursor-pointer text-center" onClick={()=>{setIsChatOpened(true)}}>채팅 열기</div>
          )}
        </div>
        
      </div>

      
    </div>
  );
}
