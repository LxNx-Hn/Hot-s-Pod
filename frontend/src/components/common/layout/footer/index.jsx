import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import SizeComponent from '../../icon/SizeComponent';
import { useNavigate } from 'react-router-dom'

export default function Footer({active,setActive}){
    const navigate = useNavigate();
    const pages = [
        {
            title:"홈",
            path:"/",
            icon: HomeOutlinedIcon
        },
        {
            title:"검색",
            path:"/search",
            icon: SearchOutlinedIcon
        },
        {
            title:"내 모임",
            path:"/myPods",
            icon: GroupsOutlinedIcon
        },
        {
            title:"마이 페이지",
            path:"/myPage",
            icon: PermIdentityOutlinedIcon
        }];

    return (
    <>
        <div className='h-20'></div>
        <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, paddingTop: 2, paddingBottom: 2 }} elevation={3}>
        <BottomNavigation
            showLabels
            value={active}
            onChange={(event, newValue) => {
                if(newValue!=active)
                {
                    setActive(newValue);
                    // console.log(`move to ${pages[newValue].path}`)
                    navigate(pages[newValue].path)
                }
            }}
        >
            {pages.map((page, index) => (
            <BottomNavigationAction
                key={page.path}
                label={page.title}
                icon={
                <SizeComponent
                    Component={page.icon}
                    className={`text-[3rem] ${
                    active == index ? "text-[#FF7C1C]" : "text-[#888888]"
                    } ${index}`}
                    fontSize="3rem"
                />
                }
                sx={{
                    "& .Mui-selected": {
                    color: "#FF7C1C",
                    },
                }}
            />
            ))}
        </BottomNavigation>
        </Paper>
    </>
  );
}