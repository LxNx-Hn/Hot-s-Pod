import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import GroupsIcon from "@mui/icons-material/Groups";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {ArrowBackIos} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function SideBarLayout() {
    const [isBudgetMenuOpen, setBudgetMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentUrl = location.pathname;
    const [isSidebarFolded, setIsSidebarFolded] = useState(false);

    const menuBaseClass = "flex items-center cursor-pointer space-x-3 rounded-md py-2 px-3.5 hover:bg-white hover:bg-opacity-25 w-full h-10";
    const textBaseClass = "select-none weight-700 text-[#FDFDFD]";

    return (
        <div className="flex flex-col justify-between h-full bg-gradient-to-b from-[#4A96EC] via-[#4A96EC] to-[#237BE6]"
                style={{width: isSidebarFolded ? "70px" : "230px"}}>
            <div className="flex flex-col"
                 style={{padding: isSidebarFolded ? "30px 10px 20px 10px"
                         : "30px 20px 20px 20px"}}>

                <div onClick={() => { navigate("/"); setBudgetMenuOpen(false); }}
                      className="cursor-pointer min-h-[54px]">
                    <h1 className="text-white weight-700 text-[17px]"
                        style={{fontSize: isSidebarFolded ? "10px" : "18px",
                            paddingLeft: isSidebarFolded ? "2px" : "10px"
                        }}>
                        Hot's Pod<br/>POD 관리 시스템
                    </h1>
                </div>

                <div className="flex flex-col space-y-3 pt-10">
                    <div onClick={() => { navigate("/pods"); setBudgetMenuOpen(false); }}
                          className={`${menuBaseClass} ${currentUrl.startsWith("/pods") ? "bg-white text-[#106BDB]" : "text-white"}`}
                          style={{color: currentUrl.startsWith("/pods") ? "#106BDB" : "", backgroundColor: currentUrl === "/pods" ? "white" : "",}}>
                        <ArticleIcon fontSize="small" />
                        {!isSidebarFolded && (
                            <span className={textBaseClass} style={{color: currentUrl.startsWith("/pods") ? "#106BDB" : "",}}>
                                POD 목록
                            </span>
                        )}
                    </div>

                    <div onClick={() => { navigate("/"); setBudgetMenuOpen(false); }}
                          className={`${menuBaseClass} ${currentUrl === "/" ? "bg-white text-[#106BDB]" : "text-white"}`}
                          style={{color: currentUrl === "/" ? "#106BDB" : "", backgroundColor: currentUrl === "/" ? "white" : "",}}>
                        <GroupsIcon fontSize="small" />
                        {!isSidebarFolded && (
                            <span className={textBaseClass}
                                  style={{color: currentUrl === "/" ? "#106BDB" : "",}}>
                                대시보드
                            </span>
                        )}
                    </div>

                    <div onClick={() => { navigate("/chat/1"); setBudgetMenuOpen(false); }}
                          className={`${menuBaseClass} ${currentUrl.startsWith("/chat") ? "bg-white text-[#106BDB]" : "text-white"}`}
                          style={{color: currentUrl.startsWith("/chat") ? "#106BDB" : "", backgroundColor: currentUrl.startsWith("/chat") ? "white" : "",}}>
                        <CreditCardIcon fontSize="small" />
                        {!isSidebarFolded && (
                            <span className={textBaseClass}
                                  style={{color: currentUrl.startsWith("/chat") ? "#106BDB" : "",}}>
                                채팅
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="cursor-pointer px-4 py-6"
                 onClick={() => setIsSidebarFolded(!isSidebarFolded)}>
                <div className="w-8 h-8 flex justify-center items-center rounded-[50%] bg-[#569CEF]">
                    <ArrowBackIos className="text-[#DFE5EC]"
                                  fontSize="small"
                                  style={{transform: isSidebarFolded ? "rotate(180deg)" : "", marginRight: isSidebarFolded ? "7px" : "-7px",}}/>
                </div>
            </div>
        </div>
    );
}