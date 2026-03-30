import React from 'react';

// Input filter patterns - prevent invalid characters from being typed
const inputFilters = {
  // Only letters and spaces (for names)
  name: /^[A-Za-z\s]*$/,
  // Only alphanumeric (for student ID like IT21508745)
  studentId: /^[A-Za-z0-9]*$/,
  // Only letters, numbers, @, and . (for email)
  email: /^[A-Za-z0-9@.]*$/,
};

// Filter input value based on pattern
const filterValue = (value, filterType) => {
  if (!filterType || !inputFilters[filterType]) return value;
  const pattern = inputFilters[filterType];
  // Filter out invalid characters
  return value.split('').filter((char) => pattern.test(char)).join('');
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get current time in HH:MM format
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder = '',
  required = false,
  min,
  max,
  minLength,
  maxLength,
  rows = 3,
  options = [],        // for select type
  disabled = false,
  inputFilter,         // 'name' | 'studentId' | 'email' - restricts allowed characters
  disablePastDates = false,  // for date inputs
  selectedDate,        // for time inputs - to disable past times if today
}) {
  const baseClass = `input-field ${error ? 'input-error' : ''}`;

  // Handle input with character filtering
  const handleFilteredChange = (e) => {
    let nextValue = e.target.value;

    if (typeof maxLength === 'number' && maxLength >= 0) {
      nextValue = nextValue.slice(0, maxLength);
    }

    if (inputFilter) {
      const filteredValue = filterValue(nextValue, inputFilter);
      // Create a new event-like object with filtered value
      const newEvent = {
        target: {
          name: e.target.name,
          value: filteredValue,
        },
      };
      onChange(newEvent);
    } else {
      const newEvent = {
        target: {
          name: e.target.name,
          value: nextValue,
        },
      };
      onChange(newEvent);
    }
  };

  // Prevent invalid key presses
  const handleKeyDown = (e) => {
    if (!inputFilter) return;

    // Allow control keys
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (controlKeys.includes(e.key)) return;

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) return;

    // Check if key matches the filter pattern
    const pattern = inputFilters[inputFilter];
    if (pattern && !pattern.test(e.key)) {
      e.preventDefault();
      return;
    }

    if (typeof maxLength === 'number' && maxLength >= 0 && value.length >= maxLength) {
      e.preventDefault();
    }
  };

  // Calculate min date for date inputs
  const getMinDate = () => {
    if (disablePastDates) {
      return getTodayDate();
    }
    return min;
  };

  // Calculate min time for time inputs (if today is selected)
  const getMinTime = () => {
    if (selectedDate === getTodayDate()) {
      return getCurrentTime();
    }
    return min;
  };

  const handleTimeChange = (e) => {
    if (selectedDate === getTodayDate()) {
      const currentTime = getCurrentTime();
      if (e.target.value && e.target.value < currentTime) {
        return;
      }
    }
    onChange(e);
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleFilteredChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          rows={rows}
          disabled={disabled}
          minLength={minLength}
          maxLength={maxLength}
          className={`${baseClass} resize-none`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseClass}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      );
    }

    // Date input with past dates disabled
    if (type === 'date') {
      return (
        <input
          id={name}
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          min={getMinDate()}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClass}
        />
      );
    }

    // Time input with past times disabled for today
    if (type === 'time') {
      return (
        <input
          id={name}
          type="time"
          name={name}
          value={value}
          onChange={handleTimeChange}
          required={required}
          min={getMinTime()}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClass}
        />
      );
    }

    return (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={handleFilteredChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        className={baseClass}
      />
    );
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-xs text-danger-500 font-gilroyMedium animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
