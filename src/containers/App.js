import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getYear from 'date-fns/get_year';
import IconButton from 'material-ui/IconButton';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: 'museo-sans'
});

import {
  fetchAbsenceReasons, fetchEmployees, fetchHolidays, fetchAbsence,
  updateAbsence
} from '../epics';

import {
  selectCurrentEmployee, setCurrentYear,
  selectPreviousYear, selectNextYear,
  addAbsence, removeAbsence
} from '../actions';

import {
  currentEmployee, currentEvents
} from '../selectors';

import Header from '../components/Header';
import AbsenceInfo from '../components/AbsenceInfo';
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
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div id='outer'>
          <Header
            year={this.props.currentYear}
            absenceReasons={this.props.absenceReasons}
            absence={this.props.currentEmployee ?
              this.props.absence.get(this.props.currentEmployee.id, Map()) : undefined}
          />
          <div id='container'>
            <div className='employee-container'>
              {this.props.currentEmployee ? this.props.currentEmployee.name : ''}
            </div>
            <div id='main'>
              <AbsenceInfo
                currentEmployee={this.props.currentEmployee}
                year={this.props.currentYear}
                absence={this.props.currentEmployee ?
                  this.props.absence.get(this.props.currentEmployee.id, Map()) : undefined}
              />
              <div className='year-selector'>
                <IconButton
                  iconClassName='material-icons'
                  onClick={() => this.props.selectPreviousYear()}
                  iconStyle={{ fontSize: 12, color: '#3c1345' }}
                >
                  arrow_back
              </IconButton>
                <h1 className={'year-selector-text'}>
                  {this.props.currentYear.toString()}
                </h1>
                <IconButton
                  iconClassName='material-icons'
                  onClick={() => this.props.selectNextYear(1)}
                  iconStyle={{ fontSize: 12, color: '#3c1345' }}
                >
                  arrow_forward
              </IconButton>
              </div>
              <Calendar
                openLayover={this.openLayover}
                closeLayover={this.closeLayover}
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
            <div className={this.state.selectDatesMode ? 'overlay' : ''} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  currentEmployee: currentEmployee(state),
  currentYear: state.currentYear,
  employees: state.employees,
  absenceReasons: state.absenceReasons,
  originalAbsence: state.originalAbsence,
  absence: state.absence,
  currentEvents: currentEvents(state)
});

const mapDispatchToProps = {
  selectCurrentEmployee,
  setCurrentYear,
  selectPreviousYear,
  selectNextYear,
  addAbsence,
  removeAbsence,
  fetchAbsenceReasons,
  fetchHolidays,
  fetchEmployees,
  fetchAbsence,
  updateAbsence
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
