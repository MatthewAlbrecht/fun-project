import React, { useMemo } from "react";
import "./App.css";
import useRequest from "./useRequest";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function App() {
  const { data, loading, error } = useRequest();
  const [filters, setFilters] = React.useState({});

  function handleFilterChange(key, value) {
    setFilters(prevState => ({
      ...prevState,
      [key]: value
    }));
  }

  // filter the data based on the filters
  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.filter(item => {
      return (
        (!filters.year || filters.year === item.year) &&
        (!filters.quarter || filters.quarter === item.quarter) &&
        (!filters.homeOwnership ||
          filters.homeOwnership === item.homeOwnership) &&
        (!filters.term || filters.term === item.term) &&
        item.grade
      );
    });
  }, [data, filters]);

  // group the data by grade
  const groupedData = useMemo(() => {
    if (!filteredData) {
      return [];
    }
    return filteredData.reduce((acc, item) => {
      if (!acc[item.grade]) {
        acc[item.grade] = [];
      }
      acc[item.grade].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  // aggregate balance for each group
  const aggregatedData = useMemo(() => {
    if (!groupedData) {
      return [];
    }
    return Object.entries(groupedData).reduce((acc, [key, items]) => {
      const balance = items.reduce((acc, item) => {
        return acc + Number(item.currentBalance);
      }, 0);
      acc[key] = balance;
      return acc;
    }, {});
  }, [groupedData]);

  if (loading) {
    return <div className="App">Loading...</div>;
  }
  if (error) {
    return <div className="App">Something went wrong</div>;
  }
  if (!data || !data.length) {
    return <div className="App">No data</div>;
  }

  const { years, quarters, homeOwnerships, terms } = getFilterOptions(data);

  return (
    <div className="App">
      <div className="px-4 sm:px-6 lg:px-8">
        {filteredData.length ? (
          <GradeTable gradeData={aggregatedData} />
        ) : (
          <div className="text-center">No data</div>
        )}
        <div className="mt-8">
          <form className="">
            <div className="flex space-x-6 justify-center">
              <Select
                label="Year"
                options={years}
                value={filters.year || ""}
                onChange={value => handleFilterChange("year", value)}
              />
              <Select
                label="Quarter"
                options={quarters}
                value={filters.quarter || ""}
                onChange={value => handleFilterChange("quarter", value)}
              />
              <Select
                label="Home Ownership"
                options={homeOwnerships}
                value={filters.homeOwnership || ""}
                onChange={value => handleFilterChange("homeOwnership", value)}
              />
              <Select
                label="Term"
                options={terms}
                value={filters.term || ""}
                onChange={value => handleFilterChange("term", value)}
              />
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="reset"
                className="flex items-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm font-medium leading-4 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setFilters({})}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
        {filteredData.length > 0 && (
          <div className="flex mt-20 justify-center">
            <GradeBarChart gradeData={aggregatedData} />
          </div>
        )}
      </div>
    </div>
  );
}

function GradeTable({ gradeData }) {
  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(gradeData).map(grade => (
                    <th
                      key={grade}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Grade {grade}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  {Object.values(gradeData).map(balance => (
                    <td
                      key={balance}
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-left"
                    >
                      ${balance.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradeBarChart({ gradeData }) {
  const transformedData = Object.entries(gradeData).map(([key, value]) => ({
    grade: `Grade ${key}`,
    balance: value.toFixed(2)
  }));

  return (
    <BarChart width={730} height={250} data={transformedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="grade" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="balance" fill="#8884d8" />
    </BarChart>
  );
}

function Select({ options, label, value, onChange }) {
  function handleChange(event) {
    onChange(event.target.value);
  }
  return (
    <div className="flex flex-col items-start">
      <label>{label}</label>
      <select
        className="border border-gray-300 rounded-md p-2 min-w-[200px]"
        value={value}
        onChange={handleChange}
      >
        <option value="">All</option>
        {options.map(option => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function getFilterOptions(data) {
  return {
    years: getDedupedOptions(data, "year"),
    quarters: getDedupedOptions(data, "quarter"),
    homeOwnerships: getDedupedOptions(data, "homeOwnership"),
    terms: getDedupedOptions(data, "term")
  };
}

function getDedupedOptions(data, key) {
  return [...new Set(data.map(item => item[key]).filter(item => item))].sort();
}

export default App;
