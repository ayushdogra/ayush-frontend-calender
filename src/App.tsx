import React, { useState } from "react";
import DateRangePicker from "./components/dateRangeCalender/DateRangePicker";

const App: React.FC = () => {
  const [range, setRange] = useState<string[]>([]);
  const [weekends, setWeekends] = useState<string[]>([]);

  const handleDateRangeChange = ([dateRange, weekendDates]: [
    string[],
    string[]
  ]) => {
    setRange(dateRange);
    setWeekends(weekendDates);
  };

  return (
    <div className="marginTop-32">
      <DateRangePicker onChange={handleDateRangeChange} />
      {range.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Selected Range:</h3>
          <p>{range.join(", ")}</p>
        </div>
      )}

      {weekends.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Weekend Dates:</h3>
          <p>{weekends.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default App;
