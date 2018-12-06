import React from 'react';
import { connect } from 'react-redux';
import { List, Range } from 'immutable';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import isFuture from 'date-fns/is_future';
import isFriday from 'date-fns/is_friday';
import getYear from 'date-fns/get_year';

import AbsenceColorCodes from './AbsenceColorCodes';
import YearSelector from './YearSelector';
import FutureAbsence from './FutureAbsence';
import VacationInfo from './VacationInfo';

class AbsenceInfo extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      dates: [],
      holidayDays: {
        totAvailable: 0,
        available: 0,
        planned: 0,
        used: 0,
      }
    }
  }

  componentDidMount() {
    if (this.props.absence && this.props.holidayDays) {
      this.getAbsenceStrings();
      this.calculateHolidayDays();
    }
  }

  componentDidUpdate(prev) {
    if (this.props.absence !== prev.absence || this.props.year !== prev.year) {
      this.getAbsenceStrings();
      this.calculateHolidayDays();
    }
    if (this.props.holidayDays !== prev.holidayDays) {
      this.calculateHolidayDays();
    }
  }

  render() {
    return (
      <div className='info'>
        <div className='info-inner'>
          <h6 className='employee-container'>
            {this.props.currentEmployee ? this.props.currentEmployee.name.toUpperCase() : ''}
          </h6>
          <YearSelector
            year={this.props.year}
            selectPreviousYear={this.props.selectPreviousYear}
            selectNextYear={this.props.selectNextYear}
          />
          <div className='info-box'>
            <VacationInfo
              holidayDays={this.state.holidayDays}
            />
          </div>
          <div className='info-box'>
            <AbsenceColorCodes
              absenceReasonGroups={this.props.absenceReasonGroups}
              activeAbsenceReason={this.props.activeAbsenceReason}
            />
          </div>
          <div className='info-box'>
            <FutureAbsence
              dates={this.state.dates}
            />
          </div>
        </div>
      </div>
    );
  }

  calculateHolidayDays = () => {
    const plannedDays = this.calcPlannedDaysInYear(this.props.year);
    const totAvailable = this.calcTotalAvailableForYear();
    const used = this.calcUsedDays();
    this.setState({
      holidayDays: {
        used: used,
        planned: plannedDays,
        totAvailable: this.calcTotalAvailableForYear(),
        available: totAvailable - plannedDays - used,
      }
    });
  }

  calcPlannedDaysInYear = (year) => {
    return List(this.props.absence.valueSeq().flatten()
      .filter(x => isFuture(x.date) && x.reason === 'FER1000'
        && getYear(x.date) === year)).size;
  }

  calcTotalAvailableForYear = () => {
    let tot = this.props.holidayDays
      .reduce((acc, curr) => {
        if (curr.year === this.props.year) return acc + curr.earnt;
        else if (curr.year > this.props.year) return acc;
        else return acc + (curr.earnt - curr.spent);
      }, 0);

    const currentYear = getYear(new Date());
    if (currentYear < this.props.year) {
      const diff = this.props.year - currentYear;
      tot += (25 * diff);
      Range(1, diff + 1)
        .forEach(x => tot -= this.calcPlannedDaysInYear(this.props.year - x));
    }
    return tot;
  }

  calcUsedDays = () => {
    const tot = this.props.holidayDays.find(el => el.year === this.props.year);
    if (tot) {
      return tot.spent;
    }
    return 0;
  }

  getAbsenceStrings = () => {
    if (this.props.absence.size < 1) return;
    const dates = this.group(this.getFutureDates(this.props.absence.valueSeq().flatten()));
    this.setState({ dates: dates });
  }

  getFutureDates = (arr) => {
    const today = new Date();

    return arr.reduce((acc, curr) => {
      const diff = differenceInCalendarDays(today, curr.date);
      if (diff <= 0) {
        return { ...acc, [diff]: curr };
      }
      return acc;
    }, {});
  }

  group = (obj) => {
    const result = [];
    let curr = [];
    let expectedNumber = NaN;
    let expectedType = '';

    const keys = Object.keys(obj).map(key => Number(key)).sort((a, b) => b - a);

    keys.forEach(key => {
      const el = obj[key];
      if (!expectedNumber || (key === expectedNumber && el.reason === expectedType)) {
        curr.push(el.date);
      }
      else {
        result.push({ [expectedType]: curr });
        curr = [el.date];
      }
      expectedNumber = isFriday(el.date) ? key - 3 : key - 1;
      expectedType = el.reason;
    });
    if (curr.length > 0) {
      result.push({ [expectedType]: curr });
    }
    return result;
  }
};


const mapStateToProps = (state) => ({
  activeAbsenceReason: state.activeAbsenceReason
});

export default connect(mapStateToProps, {})(AbsenceInfo);
