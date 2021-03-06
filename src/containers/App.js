import React from 'react';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getYear from 'date-fns/get_year';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: 'museo-sans'
});

import {
  fetchAbsenceReasons, fetchEmployees, fetchHolidays, fetchAbsence,
  updateAbsence, fetchHolidayDays, fetchAbsenceSpent
} from '../epics';

import {
  selectCurrentEmployee, setCurrentYear,
  addAbsence, removeAbsence
} from '../actions';

import {
  currentEmployee, loggedInEmployee, currentEvents, plannableAbsenceReasons
} from '../selectors';

import AbsenceInfo from './AbsenceInfo';
import Calendar from '../components/Calendar';

class App extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      selectDatesMode: false,
    }
  }

  componentWillMount() {
    this.props.fetchHolidays();
    this.props.fetchEmployees();
    this.props.fetchAbsenceReasons();
    this.props.fetchAbsence();
    this.props.fetchHolidayDays();
    this.props.fetchAbsenceSpent();

    const now = new Date();
    this.props.setCurrentYear(getYear(now));
  }

  handleSetEmployee = ({ value }) => {
    this.props.selectCurrentEmployee(value);
  }

  openLayover = () => {
    this.setState({ selectDatesMode: true });
  }

  closeLayover = () => {
    this.setState({ selectDatesMode: false });
  }

  render() {

    if (!this.props.currentEmployee) {
      return null;
    }

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div id='container'>
          <div id='main'>
            <AbsenceInfo
              currentEmployee={this.props.currentEmployee}
              absence={this.props.absence.get(this.props.currentEmployee.id, Map())}
              holidayDays={this.props.holidayDays.get(this.props.currentEmployee.id, List())}
            />
            <Calendar
              openLayover={this.openLayover}
              closeLayover={this.closeLayover}
              editable={this.props.loggedInEmployee === this.props.currentEmployee || this.props.loggedInEmployee.isAdmin}
              currentEmployee={this.props.currentEmployee}
              absence={this.props.absence}
              originalAbsence={this.props.originalAbsence}
              updateAbsence={this.props.updateAbsence}
              year={this.props.currentYear}
              absenceReasons={this.props.absenceReasons}
              addAbsence={this.props.addAbsence}
              removeAbsence={this.props.removeAbsence}
              currentEvents={this.props.currentEvents}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  loggedInEmployee: loggedInEmployee(state),
  currentEmployee: currentEmployee(state),
  currentYear: state.currentYear,
  employees: state.employees,
  absenceReasons: plannableAbsenceReasons(state),
  originalAbsence: state.originalAbsence,
  absence: state.absence,
  currentEvents: currentEvents(state),
  holidayDays: state.holidayDays
});

const mapDispatchToProps = {
  selectCurrentEmployee,
  setCurrentYear,
  addAbsence,
  removeAbsence,
  fetchAbsenceReasons,
  fetchHolidays,
  fetchEmployees,
  fetchAbsence,
  updateAbsence,
  fetchHolidayDays,
  fetchAbsenceSpent
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
