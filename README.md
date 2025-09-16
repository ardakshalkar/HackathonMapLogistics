# Yandex Maps Path Component

A React component that displays a path between two locations using Yandex Maps API.

## Features

- 🗺️ Interactive map with Yandex Maps integration
- 🛣️ Route visualization between two points
- 📍 Customizable start and end markers
- 📱 Responsive design
- ⚙️ Configurable map settings
- 🎯 Support for custom coordinates
- 🚀 Easy to integrate

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Get a Yandex Maps API key from [Yandex Developer Console](https://developer.tech.yandex.ru/)
4. Replace `YOUR_API_KEY` in `public/index.html` with your actual API key

## Usage

### Basic Usage

```jsx
import YandexMapPath from './components/YandexMapPath';

function MyComponent() {
  const startLocation = {
    lat: 55.7558,
    lng: 37.6176,
    name: 'Moscow, Russia'
  };

  const endLocation = {
    lat: 59.9311,
    lng: 30.3609,
    name: 'St. Petersburg, Russia'
  };

  return (
    <YandexMapPath
      startLocation={startLocation}
      endLocation={endLocation}
      width="100%"
      height="400px"
    />
  );
}
```

### Advanced Usage

```jsx
import YandexMapPath from './components/YandexMapPath';

function MyComponent() {
  const handleMapReady = (map) => {
    console.log('Map is ready:', map);
  };

  const handleRouteReady = (route) => {
    console.log('Route is ready:', route);
  };

  return (
    <YandexMapPath
      startLocation={startLocation}
      endLocation={endLocation}
      width="100%"
      height="500px"
      zoom={8}
      onMapReady={handleMapReady}
      onRouteReady={handleRouteReady}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startLocation` | `Object` | Required | Starting location with `lat`, `lng`, and optional `name` |
| `endLocation` | `Object` | Required | Ending location with `lat`, `lng`, and optional `name` |
| `width` | `String` | `'100%'` | Map width (CSS value) |
| `height` | `String` | `'400px'` | Map height (CSS value) |
| `zoom` | `Number` | `10` | Initial zoom level |
| `onMapReady` | `Function` | `() => {}` | Callback when map is initialized |
| `onRouteReady` | `Function` | `() => {}` | Callback when route is calculated |

## Location Object Format

```javascript
{
  lat: 55.7558,        // Latitude (required)
  lng: 37.6176,        // Longitude (required)
  name: 'Moscow, Russia' // Display name (optional)
}
```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## API Key Setup

1. Visit [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Create a new project
3. Generate an API key for JavaScript API
4. Replace `YOUR_API_KEY` in `public/index.html`:
   ```html
   <script src="https://api-maps.yandex.ru/2.1/?apikey=YOUR_ACTUAL_API_KEY&lang=en_US" type="text/javascript"></script>
   ```

## Customization

### Styling

The component includes CSS classes for customization:

- `.yandex-map-container` - Main container
- `.yandex-map` - Map element
- `.map-loading` - Loading state
- `.map-error` - Error state

### Route Options

The component uses Yandex Maps MultiRoute with the following default settings:

- Routing mode: `'auto'` (can be changed to `'walking'`, `'driving'`, or `'transit'`)
- Route stroke width: 4px
- Route stroke color: `#666666`
- Active route stroke width: 6px
- Active route stroke color: `#003dff`

## Error Handling

The component handles various error scenarios:

- Yandex Maps API loading failures
- Invalid coordinates
- Route calculation errors
- Network connectivity issues

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18.2.0+
- Yandex Maps API 2.1+

## License

MIT License - feel free to use this component in your projects!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

If you encounter any issues or have questions, please create an issue in the repository.
