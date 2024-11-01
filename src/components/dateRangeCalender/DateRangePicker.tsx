import React, { useState } from "react";
import "./calendar.css"; 

interface DateRangePickerProps {
  onChange: ([dateRange, weekendDates]: [string[], string[]]) => void;
  predefinedRanges?: { label: string; daysOffset: number }[];
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const Calendar: React.FC<{
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDateClick: (date: Date) => void;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  isWeekend: (date: Date) => boolean;
}> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  onDateClick,
  selectedStart,
  selectedEnd,
  isWeekend,
}) => {
  const days = getCalendarDays(month, year);

  const handleMonthSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(Number(event.target.value));
  };

  const handleYearSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onYearChange(Number(event.target.value));
  };

  return (
    <div className="calendar">
      <div className="month-year-select">
        <select value={month} onChange={handleMonthSelect} className="dropdown">
          {monthNames.map((name, index) => (
            <option key={index} value={index}>{name}</option>
          ))}
        </select>
        <select value={year} onChange={handleYearSelect} className="dropdown">
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={year - 5 + i}>{year - 5 + i}</option>
          ))}
        </select>
      </div>
      <div className="days-grid">
        {weekDays.map((day) => (
          <div className="day-header" key={day}>
            {day}
          </div>
        ))}
        {days.map(({ date, isCurrentMonth }) => (
          <CalendarDay
            key={date.toString()}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isSelected={isSelected(selectedStart, selectedEnd, date) || false}
            isInRange={isInRange(selectedStart, selectedEnd, date)}
            isDisabled={!isCurrentMonth || isWeekend(date)}
            onDateClick={() => onDateClick(date)}
          />
        ))}
      </div>
    </div>
  );
};

const CalendarDay: React.FC<{
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  onDateClick: () => void;
}> = ({ date, isCurrentMonth, isSelected, isInRange, isDisabled, onDateClick }) => (
  <button
    onClick={!isDisabled ? onDateClick : undefined}
    className={`date-button ${isCurrentMonth ? "" : "other-month"} ${
      isSelected ? "selected" : ""
    } ${isInRange ? "in-range" : ""}`}
    disabled={isDisabled}
  >
    {date.getDate()}
  </button>
);

const isSelected = (
  selectedStart: Date | null,
  selectedEnd: Date | null,
  date: Date
) => {
  return (
    (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
    (selectedEnd && date.toDateString() === selectedEnd.toDateString())
  );
};

const isInRange = (
  selectedStart: Date | null,
  selectedEnd: Date | null,
  date: Date
) => {
  if (!selectedStart || !selectedEnd) return false;
  return (
    date > (selectedStart < selectedEnd ? selectedStart : selectedEnd) &&
    date < (selectedStart < selectedEnd ? selectedEnd : selectedStart)
  );
};

const getCalendarDays = (month: number, year: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDateOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDateOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  return Array.from({ length: 42 }, (_, i) => {
    const currentMonthDate = new Date(year, month, i - startDay + 1);
    return {
      date: currentMonthDate,
      isCurrentMonth: i >= startDay && i < startDay + daysInMonth,
    };
  });
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  predefinedRanges = [
    { label: "Last 7 Days", daysOffset: -7 },
    { label: "Next 7 Days", daysOffset: 7 },
  ],
}) => {
  const today = new Date();
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      setSelectedEnd(date);
    }
  };

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      const allDates = getDaysInRange(selectedStart, selectedEnd);

      const dateRange = [formatDate(selectedStart), formatDate(selectedEnd)];
      const weekendDates = allDates.filter(isWeekend).map(formatDate);

      onChange([dateRange, weekendDates]);

      setIsCalendarOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handlePredefinedRange = (daysOffset: number) => {
    const start = new Date(today);
    start.setDate(today.getDate() + daysOffset);

    setSelectedStart(daysOffset < 0 ? start : today);
    setSelectedEnd(daysOffset < 0 ? today : start);
  };

  return (
    <div className="date-range-picker">
      <div className="input-container">
        <input
          type="text"
          readOnly
          value={
            selectedStart && selectedEnd
              ? `${formatDate(selectedStart)} ~ ${formatDate(selectedEnd)}`
              : "Select date range"
          }
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="date-input"
        />
        <button
          style={{
            opacity: selectedStart && selectedEnd ? 1 : 0,
          }}
          className="clear-button"
          onClick={handleClear}
        >
          &times;
        </button>
      </div>
      {isCalendarOpen && (
        <div className="calendar-container">
          <Calendar
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onDateClick={handleDateClick}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            isWeekend={isWeekend}
          />
          <div className="calendar-footer">
            <div className="predefined-ranges">
              {predefinedRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePredefinedRange(range.daysOffset)}
                  className="btn secondary-btn"
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button onClick={handleApply} className="apply-button">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const getDaysInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const rangeStart = new Date(Math.min(startDate.getTime(), endDate.getTime()));
  const rangeEnd = new Date(Math.max(startDate.getTime(), endDate.getTime()));

  let currentDate = new Date(rangeStart);
  while (currentDate <= rangeEnd) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export default DateRangePicker;
