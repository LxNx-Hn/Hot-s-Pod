import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';


export default function HeaderLayout(props) {
    const navigate = useNavigate();
    const userName = useSelector((state) => state.user?.userName);
    
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="flex items-center justify-end px-6 pt-3 pb-3 w-full space-x-2 bg-white shadow-sm">

            <div>
                <IconButton onClick={() => navigate('/notify')}>
                    <NotificationsIcon style={{ fontSize: "27px" }} className="text-[#4C545B]" />
                </IconButton>
            </div>


            <div>
                {userName ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#212121] flex items-center justify-center rounded-full text-[white] text-[13px] weight-600 select-none cursor-pointer">
                            {userName.substring(0, 2)}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600">
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => navigate('/')}
                        className="text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800">
                        로그인
                    </button>
                )}
            </div>
        </div>
    );
}
