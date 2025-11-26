export default function Calendar() {
    const today = new Date(); // 현재 날짜 가져오기
    const year = today.getFullYear(); // 현재 연도
    const month = today.getMonth() + 1; // 현재 월 (0부터 시작하므로 1을 더함)
    const daysInMonth = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날
    const startDay = new Date(year, month - 1, 1).getDay(); // 해당 월의 1일의 요일
    const weeks = []; // 주 배열

    // 빈 공간을 추가하여 첫 주의 시작 요일을 맞춤
    let week = Array(startDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day); // 현재 날짜 추가

        // 주가 7일이 되면 새로운 주를 시작
        if (week.length === 7) {
            weeks.push(week);
            week = []; // 새로운 주를 위한 초기화
        }
    }

    // 마지막 주가 7일이 안 될 경우 추가
    if (week.length > 0) {
        weeks.push(week);
    }

    return (
        <div>
            <div className="flex">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={index}
                         className="w-[85px] text-center pb-2 text-[#717171] border-b-[1px] border-[#D4D4D4]">{day}</div>
                ))}
            </div>
            {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex">
                    {week.map((day, dayIndex) => (
                        <div key={dayIndex}
                             className="w-[85px] h-[75px] mt-[8px] text-center text-[#717171] border-b-[1px] border-[#D4D4D4]">
                            {day !== null ? day : ''}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}