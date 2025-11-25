import EditNote from '@mui/icons-material/EditNote';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import SizeComponent from "../../common/icon/SizeComponent";
import KakaoIcon from "../../../images/logo/kakao.svg";
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';

export default function LoginUI() {
    // 로그인 전 화면 (랜딩 페이지)
    return (
        <div className="flex flex-col w-full justify-center">
            <div className="flex flex-col justify-center bg-[#F6F7F8] pb-48">
                <div className="flex flex-row h-full gap-4 w-full flex-grow-0 px-4">
                    <SizeComponent Component={LocalFireDepartmentOutlinedIcon} className="text-[#FF7C1C] text-[3red]" fontSize={"3rem"} />
                    <div className="flex flex-col justify-center">
                        <span className="h-fit font-bold text-lg">Hotspod</span>
                    </div>
                </div>
                <div className="flex flex-col gap-4 min-h-fit bg-[radial-gradient(175.4%_138.8%_at_0%_1.22%,#DA6D25_19.71%,#174C53_70.67%)] py-32">
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold text-center text-[#FAFAFA]">
                            함께하고 싶은 모든 순간,
                        </div>
                        <div className="text-3xl font-bold text-center text-[#FAFAFA]">
                            Hotspod
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base text-center text-[#FAFAFA]">
                            Hotspod은 스터디, 취미, 택시 등 다양한 오프라인
                        </div>
                        <div className="text-base text-center text-[#FAFAFA]">
                            소모임을 위한 플랫폼입니다.
                        </div>
                    </div>
                    <div className="flex flex-row justify-center cursor-pointer" onClick={()=>{window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/oauth/kakao/login`, "_blank")}}>

                        <a 
                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/oauth/kakao/login`}
                            className="flex flex-row bg-[#FEE500] rounded-2xl px-6 py-3 w-fit cursor-pointer hover:bg-[#FDD835] transition-colors no-underline items-center gap-2"
                        >
                            <img src={KakaoIcon} className="w-8"/>
                            <div className="text-[#391B1B] font-bold">카카오로 3초만에 시작하기</div>
                        </a>
                    </div>
                </div>
                <div className="flex flex-col pt-16 pb-8 bg-[#F6F7F8] gap-4">
                    <div className="text-3xl font-bold text-center text-[#0A0A0A]">
                            Hotspod의 주요 기능
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base text-center text-[#5E5E5E]">
                            Hotspod은 여러분의 모임을
                        </div>
                        <div className="text-base text-center text-[#5E5E5E]">
                            더욱 쉽고 즐겁게 만들어줍니다.
                        </div>
                    </div>
                </div>
                <div className="flex flex-row w-full p-4 justify-center">
                    <div className="flex flex-col w-full max-w-md">
                        <div className="bg-[#FFFFFF] flex flex-col py-8 rounded-2xl">
                            <div className="flex flex-row justify-center pb-4">
                                <div className="flex flex-row justify-center rounded-full bg-[#FFE5D4] w-20 h-20">
                                    <div className="flex flex-col justify-center">
                                        <SizeComponent Component={EditNote} className="text-[#FF7C1C] text-[3red]" fontSize={"3rem"} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center font-bold">
                                간편한 모임 개설
                            </div>
                            <div className="text-center text-[#5E5E5E] text-xs">
                                원하는 모임을 누구나 쉽게 만들 수 있습니다.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row w-full p-4 justify-center">
                    <div className="flex flex-col w-full max-w-md">
                        <div className="bg-[#FFFFFF] flex flex-col py-8 rounded-2xl">
                            <div className="flex flex-row justify-center pb-4">
                                <div className="flex flex-row justify-center rounded-full bg-[#FFE5D4] w-20 h-20">
                                    <div className="flex flex-col justify-center">
                                        <SizeComponent Component={GroupsOutlinedIcon} className="text-[#FF7C1C] text-[3red]" fontSize={"3rem"} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center font-bold">
                                다양한 관심사 연결
                            </div>
                            <div className="text-center text-[#5E5E5E] text-xs">
                                스터디, 운동, 게임 등
                                다양한 카테고리의 모임에 참여해보세요.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row w-full p-4 justify-center">
                    <div className="flex flex-col w-full max-w-md">
                        <div className="bg-[#FFFFFF] flex flex-col py-8 rounded-2xl">
                            <div className="flex flex-row justify-center pb-4">
                                <div className="flex flex-row justify-center rounded-full bg-[#FFE5D4] w-20 h-20">
                                    <div className="flex flex-col justify-center">
                                        <SizeComponent Component={GppGoodOutlinedIcon} className="text-[#FF7C1C] text-[3red]" fontSize={"3rem"} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center font-bold">
                                신뢰 기반 커뮤니티
                            </div>
                            <div className="text-center text-[#5E5E5E] text-xs">
                                소셜 로그인을 통해 신뢰할 수 있는 사용자 환경을 제공합니다.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col"></div>
         </div>
    )
}