// // imports
// import React, { useState } from 'react';
// import styled from 'styled-components';

// const Filter = () => {
//   const [filters, setFilters] = useState({
//     semester: [],
//     period: [],
//     block: [],
//     level: [],
//     fieldOfStudy: [],
//     examination: [],
//     location: [],
//   });

//   const handleCheckboxChange = (category, value) => {
//     const updatedFilters = { ...filters };
//     if (updatedFilters[category].includes(value)) {
//       updatedFilters[category] = updatedFilters[category].filter(
//         (item) => item !== value
//       );
//     } else {
//       updatedFilters[category].push(value);
//     }
//     setFilters(updatedFilters);
//   };

//   const resetFilters = () => {
//     setFilters({
//       semester: [],
//       period: [],
//       block: [],
//       level: [],
//       fieldOfStudy: [],
//       examination: [],
//       location: [],
//     });
//   };

//   return (
//     <Panel>
//       <Category>
//         <CategoryName>Semester</CategoryName>
//         {['Semester 7', 'Semester 8', 'Semester 9'].map((semester) => (
//           <CheckboxLabel key={semester}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.semester.includes(semester)}
//               onChange={() => handleCheckboxChange('semester', semester)}
//             />
//             {semester}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Period</CategoryName>
//         {['Period 1', 'Period 2'].map((period) => (
//           <CheckboxLabel key={period}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.period.includes(period)}
//               onChange={() => handleCheckboxChange('period', period)}
//             />
//             {period}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Block</CategoryName>
//         {['Block 1', 'Block 2', 'Block 3', 'Block 4'].map((block) => (
//           <CheckboxLabel key={block}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.block.includes(block)}
//               onChange={() => handleCheckboxChange('block', block)}
//             />
//             {block}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Level</CategoryName>
//         {['Basic Level', 'Advanced Level'].map((level) => (
//           <CheckboxLabel key={level}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.level.includes(level)}
//               onChange={() => handleCheckboxChange('level', level)}
//             />
//             {level}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Field of Study</CategoryName>
//         {['Media Technology', 'Computer Science'].map((fieldOfStudy) => (
//           <CheckboxLabel key={fieldOfStudy}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.fieldOfStudy.includes(fieldOfStudy)}
//               onChange={() =>
//                 handleCheckboxChange('fieldOfStudy', fieldOfStudy)
//               }
//             />
//             {fieldOfStudy}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Examination</CategoryName>
//         {['Exam', 'Laboration', 'Project'].map((examination) => (
//           <CheckboxLabel key={examination}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.examination.includes(examination)}
//               onChange={() => handleCheckboxChange('examination', examination)}
//             />
//             {examination}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <Category>
//         <CategoryName>Location</CategoryName>
//         {['Norrköping', 'Linköping'].map((location) => (
//           <CheckboxLabel key={location}>
//             <Checkbox
//               type="checkbox"
//               checked={filters.location.includes(location)}
//               onChange={() => handleCheckboxChange('location', location)}
//             />
//             {location}
//           </CheckboxLabel>
//         ))}
//       </Category>

//       <ResetButton onClick={resetFilters}>Reset Filter</ResetButton>
//     </Panel>
//   );
// };

// const Panel = styled.div`
//   display: flex;
//   width: 220px;
//   padding: 18px 28px;
//   flex-direction: column;
//   align-items: flex-start;
//   gap: 24px;

//   border-radius: 8px;
//   background: var(--White, #fff);

//   /* Box shadow */
//   box-shadow: var(--box-shadow);
// `;

// const Category = styled.div`
//   /* Your styles here */
// `;

// const CategoryName = styled.div`
//   color: var(--Black, #1c1c1c);

//   /* H2 */
//   font-family: Poppins;
//   font-size: 16px;
//   font-style: normal;
//   font-weight: 600;
//   line-height: normal;
// `;

// const CheckboxLabel = styled.label`
//   /* Your styles here */
//   display: block;
// `;

// const Checkbox = styled.input`
//   /* Your styles here */
// `;

// const ResetButton = styled.button`
//   color: var(--mainColor);
//   font-size: 16px;
// `;

// export default Filter;

import React, { useState } from 'react';
import styled from 'styled-components';

const Filter = ({ filterType, filterValues, handleFilterChange }) => {
  return (
    <div>
      {filterValues.map((value) => (
        <label key={value} htmlFor={value}>
          <input
            type="checkbox"
            onChange={(event) => handleFilterChange(event)} // Pass the event to the handler
            value={value}
            id={value}
          />
          <span>{value}</span>
        </label>
      ))}
    </div>
  );
};

export default Filter;
