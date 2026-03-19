declare namespace google.maps {
  namespace places {
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(event: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }
    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
    }
    interface PlaceResult {
      name?: string;
      formatted_address?: string;
      geometry?: {
        location: {
          lat(): number;
          lng(): number;
        };
      };
      place_id?: string;
    }
  }
  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
}

interface Window {
  google?: typeof google;
}
