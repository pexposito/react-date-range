This component extends all the props of **[DateRange](#daterange)** component. In addition to those props, it has the following props:

| Prop Name          | Type     |
| ------------------ | -------- |
| **onRangeAdded**   | function |
| **onRangeDeleted** | function |

This component allows to add ranges to calendar dynamically. To add a new range, select the first and the last day for a range. To delete a range, select any day within a range. Drag and drop selection for ranges of the DateRange component is deactivated for this purposes.

#### Example: With three months view

```jsx inside Markdown
import { useState } from 'react';
import { addDays } from 'date-fns';
const [state, setState] = useState([
  {
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    key: 'selection1',
    color: '#3d91ff',
  },
]);

const onRangeAdded = newRange => {
  const newRanges = state;
  newRange.key = `selection${state.length + 1}`;
  newRanges.push(newRange);
  setState(newRanges);
};

const onRangeDeleted = (newRanges, rangeDeleted) => {
  setState(newRanges);
};

<DynamicDateRange
  editableDateInputs={true}
  onRangeAdded={onRangeAdded}
  onRangeDeleted={onRangeDeleted}
  moveRangeOnFirstSelection={false}
  ranges={state}
  direction='horizontal'
  months={3}
  showDateDisplay={false}
/>;
```
