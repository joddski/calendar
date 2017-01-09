import { combineReducers } from 'redux';
import { List } from 'immutable';

import {
  SELECT_CURRENT_EMPLOYEE,
  SELECT_PREVIOUS_YEAR,
  SELECT_NEXT_YEAR,
  OPEN_ABSENCE_REASON_TOOL,
  CLOSE_ABSENCE_REASON_TOOL,
  SELECT_ABSENCE_REASON,
  LOAD_ABSENCE_REASONS,
  LOAD_HOLIDAYS,
  LOAD_EMPLOYEES,
  LOAD_STAFFING,
  LOAD_ABSENCE,
  ADD_ABSENCE,
  REMOVE_ABSENCE
} from '../actions';

import { getApiConfig } from '../epics';

const initialState = {
  open: false,
  active: false,
  value: null
};

export default combineReducers({
  currentEmployee: (state = null, action) => {
    switch (action.type) {
    case SELECT_CURRENT_EMPLOYEE:
      return action.id;
    case LOAD_EMPLOYEES:
      const employee = action.employees
        .find((x) => getApiConfig().userEmail === x.email);
      return (employee && employee.id) || null;
    default:
      return state;
    }
  },
  currentYear: (state = 2016, action) => {
    switch (action.type) {
    case SELECT_PREVIOUS_YEAR:
      return state - 1;
    case SELECT_NEXT_YEAR:
      return state + 1;
    default:
      return state;
    }
  },
  absenceReasonTool: (state = initialState, action) => {
    switch (action.type) {
    case OPEN_ABSENCE_REASON_TOOL:
      return { ...state, open: true, active: false };
    case SELECT_CURRENT_EMPLOYEE:
    case CLOSE_ABSENCE_REASON_TOOL:
      return { ...state, open: false, active: false };
    case SELECT_ABSENCE_REASON:
      return { ...state, value: action.value, open: false, active: true };
    default:
      return state;
    }
  },
  absenceReasons: (state = List(), action) => {
    switch (action.type) {
    case LOAD_ABSENCE_REASONS:
      return action.absenceReasons;
    default:
      return state;
    }
  },
  holidays: (state = List(), action) => {
    switch (action.type) {
    case LOAD_HOLIDAYS:
      return action.holidays;
    default:
      return state;
    }
  },
  employees: (state = List(), action) => {
    switch (action.type) {
    case LOAD_EMPLOYEES:
      return action.employees;
    default:
      return state;
    }
  },
  originalAbsence: (state = List(), action) => {
    switch (action.type) {
    case LOAD_STAFFING:
      return action.staffing;
    default:
      return state;
    }
  },
  absence: (state = List(), action) => {
    switch (action.type) {
    case LOAD_ABSENCE:
      return action.absence;
    case ADD_ABSENCE:
      const newAbsence = {
        employeeId: action.employeeId,
        date: action.date,
        reason: action.reason
      };
      const index = state.get(action.employeeId)
              .findIndex((x) => action.date.isSame(x.date));
      const updatedAbsence = index >= 0
              ? state.get(action.employeeId).update(index, () => newAbsence)
              : state.get(action.employeeId).push(newAbsence);
      return state.update(action.employeeId, () => updatedAbsence);
    case REMOVE_ABSENCE:
      const deleteIndex = state.get(action.employeeId)
        .findIndex((x) => action.date.isSame(x.date));
      const removedAbsence = deleteIndex >= 0
              ? state.get(action.employeeId).delete(deleteIndex)
              : state.get(action.employeeId);
      return state.update(action.employeeId, () => removedAbsence);
    default:
      return state;
    }
  }
});
