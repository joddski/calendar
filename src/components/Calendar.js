import React from 'react';
import { Map, List, Range } from 'immutable';
import moment from 'moment';
import classNames from 'classnames';

const daysOfWeek = List(['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø']);
const isWeekend = (day) => day === 'lø' || day === 'sø';

const getDayText = (startOfMonth, daysInMonth, x, y) => {
  const day = x + y * 7 - startOfMonth + 1;
  return (day > 0 && day <= daysInMonth) ? day.toString() : '';
};

const Calendar = (props) => {
  const events = props.events || List();
  const startOfMonth = moment(props.year + '-' + props.month, 'YYYY-M');
  const dayOfWeek = startOfMonth.isoWeekday() - 1;
  const daysInMonth = startOfMonth.daysInMonth();
  const days = <tr>{daysOfWeek.map((x) => <th key={x}>{x}</th>)}</tr>;
  const dates = Range(0, 6).map((x) =>
    <tr key={x}>
      { daysOfWeek.map((y) => {
          const dayText =
            getDayText(dayOfWeek, daysInMonth, daysOfWeek.indexOf(y), x);
          const day = dayText && moment(props.year + '-' +
                                        props.month + '-' +
                                        dayText, 'YYYY-M-D');
          const dayEvents = events.filter((x) => x.date.isSame(day));
          const holiday = dayEvents.some((x) => x.eventClassName === 'holiday');
          const dayEventClassNames = Map(dayEvents
            .map((x) => [`event-${x.eventClassName}`, true]))
            .toObject();
          const editable = dayText
                        && !isWeekend(y)
                        && !holiday
                        && props.editMode;
          const dayClassNames = classNames({
            ...dayEventClassNames,
            'disabled': !dayText,
            'weekend': isWeekend(y),
            'edit-mode': editable
          });
          return (
            <td
              key={y}
              className={dayClassNames}
              onClick={() => editable && props.onSubmit(day)}
            >
              <div title={dayEvents.map((x) => x.event).join()}>{dayText}</div>
            </td>
          );
        })
      }
    </tr>
  );
  return (
    <div
      id={`${props.year}-${props.month}`}
      style={{ display: 'inline-block' }}
    >
      <h5
        className='month-header'
        onClick={() => {
          props.onSetCurrentYearMonth(props.year, startOfMonth.month() + 1);
        }}
      >
        {`${moment.months()[startOfMonth.month()]}`}
      </h5>
      <table
        className={classNames({
          calendar: true,
          'edit-mode': props.editMode
        })}
      >
        <thead>{days}</thead>
        <tbody>{dates}</tbody>
      </table>
    </div>
  );
};

export default Calendar;
