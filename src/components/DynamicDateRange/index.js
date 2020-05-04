import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from '../Calendar';
import { rangeShape } from '../DayCell';
import { findNextRangeIndex, generateStyles } from '../../utils';
import { isBefore, differenceInCalendarDays, addDays, min, isWithinInterval, max, format } from 'date-fns';
import classnames from 'classnames';
import coreStyles from '../../styles';
import { withTranslation } from 'react-i18next';
// import i18n from '../../locale/i18n';

class DynamicDateRange extends Component {
  constructor(props, context) {
    super(props, context);
    this.defaultRange = {
      startDate: new Date(),
      endDate: new Date(),
      key: `default`,
      color: '#3d91ff',
    };
    const ranges = props.ranges ? [...props.ranges, this.defaultRange] : this.defaultRange;
    this.state = {
      focusedRange: props.initialFocusedRange || [findNextRangeIndex(ranges, ranges.length - 2), 0],
      preview: null,
      ranges,
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
    this.defaultRangeColor = props.defaultRangeColor || '#3d91ff';
    //     "#3d91ff"
    // 1: "#3ecf8e"
    // 2: "#fed14c"
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   if (prevState.ranges.length !== nextProps.ranges.length) {
  //     return { ranges: nextProps.ranges };
  //   }
  //   return;
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.ranges.length !== this.props.length) {
  //     // alert('yehasss');
  //     console.log(prevProps.ranges.length !== this.props.ranges.length);
  //     this.setState({ ranges: this.props.ranges });
  //   }
  // }
  calcNewSelection = (value, isSingleValue = true) => {
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const { onRangeAdded, maxDate, moveRangeOnFirstSelection, disabledDates } = this.props;
    const { ranges } = this.state;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    // if (!selectedRange || !onChange) return {};
    if (!selectedRange || !onRangeAdded) return {};

    let { startDate, endDate } = selectedRange;
    if (!endDate) endDate = new Date(startDate);
    let nextFocusRange;
    if (!isSingleValue) {
      startDate = value.startDate;
      endDate = value.endDate;
    } else if (focusedRange[1] === 0) {
      // startDate selection
      const dayOffset = differenceInCalendarDays(endDate, startDate);
      startDate = value;
      endDate = moveRangeOnFirstSelection ? addDays(value, dayOffset) : value;
      if (maxDate) endDate = min([endDate, maxDate]);
      nextFocusRange = [focusedRange[0], 1];
    } else {
      endDate = value;
    }

    // reverse dates if startDate before endDate
    let isStartDateSelected = focusedRange[1] === 0;
    if (isBefore(endDate, startDate)) {
      isStartDateSelected = !isStartDateSelected;
      [startDate, endDate] = [endDate, startDate];
    }

    const inValidDatesWithinRange = disabledDates.filter(disabledDate =>
      isWithinInterval(disabledDate, {
        start: startDate,
        end: endDate,
      })
    );

    if (inValidDatesWithinRange.length > 0) {
      if (isStartDateSelected) {
        startDate = addDays(max(inValidDatesWithinRange), 1);
      } else {
        endDate = addDays(min(inValidDatesWithinRange), -1);
      }
    }

    if (!nextFocusRange) {
      // const nextFocusRangeIndex = findNextRangeIndex(this.state.ranges, focusedRange[0]);
      nextFocusRange = [ranges.length - 1, 0];
    }
    console.log('DateRange - calcNewSelection - nextFocusedRange: ', nextFocusRange);
    return {
      wasValid: !(inValidDatesWithinRange.length > 0),
      range: { startDate, endDate },
      nextFocusRange: nextFocusRange,
    };
  };
  // setSelection = (value, isSingleValue) => {
  //   console.log('DateRange - setSelection: ' + value);
  //   const { onChange, ranges, onRangeFocusChange } = this.props;
  //   const focusedRange = this.props.focusedRange || this.state.focusedRange;
  //   const focusedRangeIndex = focusedRange[0];
  //   const selectedRange = ranges[focusedRangeIndex];
  //   if (!selectedRange) return;
  //   const newSelection = this.calcNewSelection(value, isSingleValue);
  //   onChange({
  //     [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
  //       ...selectedRange,
  //       ...newSelection.range
  //     }
  //   });
  //   this.setState({
  //     focusedRange: newSelection.nextFocusRange,
  //     preview: null
  //   });
  //   onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
  // };
  setSelection = (value, isSingleValue) => {
    // console.log('DateRange - setSelection: ' + value);
    const { onRangeAdded, onRangeFocusChange } = this.props;
    const { ranges } = this.state;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange) return;
    const newSelection = this.calcNewSelection(value, isSingleValue);
    // const newRange = {
    //   [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
    //     ...selectedRange,
    //     ...newSelection.range,
    //   },
    // };
    const newRange = {
      ...selectedRange,
      ...newSelection.range,
    };
    console.log('DateRange - setSelection - newRange: ', newRange);

    // focusedRange[1] === 1 means dateEnd selected
    // if (focusedRange[1] === 1) {
    //   onRangeAdded(newRange);
    //   this.addNewDefaultRange(newRange, newSelection.nextFocusRange);
    // }
    this.setState(
      {
        focusedRange: newSelection.nextFocusRange,
        preview: null,
        ranges: this.replaceRange(newRange, newSelection.nextFocusRange),
      },
      () => {
        if (focusedRange[1] === 1) {
          // focusedRange[1] === 1 means dateEnd selected
          onRangeAdded(newRange);
          this.addNewDefaultRange();
        }
        console.log('after replaceRange', this.state.ranges);
      }
    );
    onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
  };

  replaceRange = (range, focusedRange) => {
    const { ranges } = this.state;
    return ranges.map((r, i) => {
      if (r.key === range.key) {
        if (focusedRange[1] === 1) {
          range.key = `range${ranges.length + 1}`;
        }
        return range;
      }
      return r;
    });
  };

  addNewDefaultRange = () => {
    // Adds de newRange and another defaultRange
    const { ranges } = this.state;
    ranges.push({
      startDate: new Date(),
      endDate: new Date(),
      key: `default`,
      color: '#3d91ff',
    });
    this.setState(
      {
        ranges,
        focusedRange: [ranges.length - 1, 0],
      }
      // ,() => console.log('addNewDefaultRange', this.state.ranges)
    );
  };

  handleRangeFocusChange = focusedRange => {
    this.setState({ focusedRange });
    this.props.onRangeFocusChange && this.props.onRangeFocusChange(focusedRange);
  };

  updatePreview = val => {
    if (!val) {
      this.setState({ preview: null });
      return;
    }
    const { rangeColors } = this.props;
    const { ranges } = this.state;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const color = ranges[focusedRange[0]].color || rangeColors[focusedRange[0]] || color;
    this.setState({ preview: { ...val.range, color } });
  };

  onRangeSelect = range => {
    const { t } = this.props;
    const dateStart = format(range.startDate, 'dd/MM/yyyy');
    const dateEnd = format(range.endDate, 'dd/MM/yyyy');
    if (window.confirm(t('deleteRangeConfirm', { dateStart, dateEnd }))) {
      this.deleteRange(range);
    }
  };

  deleteRange = rangeToDelete => {
    const { onRangeDeleted } = this.props;
    const newRanges = this.state.ranges.filter(range => range.key !== rangeToDelete.key);
    this.setState(
      {
        ranges: newRanges,
        focusedRange: [newRanges.length - 1, 0],
      },
      () => onRangeDeleted && onRangeDeleted(newRanges, rangeToDelete)
    );
  };

  render() {
    return (
      <Calendar
        focusedRange={this.state.focusedRange}
        onRangeFocusChange={this.handleRangeFocusChange}
        preview={this.state.preview}
        onPreviewChange={value => {
          this.updatePreview(value ? this.calcNewSelection(value) : null);
        }}
        {...this.props}
        displayMode='dateRange'
        className={classnames(this.styles.dateRangeWrapper, this.props.className)}
        onChange={this.setSelection}
        updateRange={val => this.setSelection(val, false)}
        ref={target => {
          this.calendar = target;
        }}
        onRangeSelect={this.onRangeSelect}
        ranges={this.state.ranges}
      />
    );
  }
}

DynamicDateRange.defaultProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
};

DynamicDateRange.propTypes = {
  ...Calendar.propTypes,
  onChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  className: PropTypes.string,
  ranges: PropTypes.arrayOf(rangeShape),
  moveRangeOnFirstSelection: PropTypes.bool,
};

export default withTranslation('translations')(DynamicDateRange);
