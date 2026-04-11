import { useEffect, useRef, useState } from 'react';

const PlacesAutocomplete = ({
  value,
  onChange,
  placeholder = 'Location',
  className = '',
  icon,
  onKeyDown,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');
  const skipSync = useRef(false);

  // Sync parent value -> local (only when parent changes externally, e.g. clear)
  useEffect(() => {
    if (!skipSync.current) {
      setLocalValue(value || '');
      if (inputRef.current) inputRef.current.value = value || '';
    }
    skipSync.current = false;
  }, [value]);

  // Load Google Maps script if not already loaded
  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['name', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place) return;

        let city = place.name || '';
        const components = place.address_components || [];
        for (const c of components) {
          if (c.types.includes('locality')) {
            city = c.long_name;
            break;
          }
        }

        skipSync.current = true;
        setLocalValue(city);
        onChange(city);
      });

      autocompleteRef.current = autocomplete;
    };

    // Poll until google is available
    const waitForGoogle = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
      } else {
        setTimeout(waitForGoogle, 300);
      }
    };
    waitForGoogle();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
    // Don't call onChange on every keystroke — only on place selection or blur
  };

  const handleBlur = () => {
    // Sync whatever the user typed (or what Google set) back to parent
    const val = inputRef.current?.value || '';
    if (val !== value) {
      skipSync.current = true;
      onChange(val);
    }
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed and the pac-container is visible, let Google handle it
    if (e.key === 'Enter') {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && pacContainer.style.display !== 'none' && pacContainer.querySelectorAll('.pac-item').length > 0) {
        e.preventDefault();
        return;
      }
      // Otherwise sync value and pass through
      const val = inputRef.current?.value || '';
      if (val !== value) {
        skipSync.current = true;
        onChange(val);
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {icon}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
        autoComplete="off"
      />
    </div>
  );
};

export default PlacesAutocomplete;
